import os
import re
import json
import psycopg2
from psycopg2.extras import Json
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data')

def connect_db():
    return psycopg2.connect(
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        dbname=settings.POSTGRES_DB,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD
    )

def parse_markdown_table(lines, start_idx):
    headers = [h.strip() for h in lines[start_idx].split('|')[1:-1]]
    rows = []
    
    idx = start_idx + 2 # Skip headers and separator
    while idx < len(lines):
        line = lines[idx].strip()
        if not line or not line.startswith('|'):
            break
            
        values = [v.strip() for v in line.split('|')[1:-1]]
        if len(values) == len(headers):
            row_dict = dict(zip(headers, values))
            rows.append(row_dict)
        idx += 1
        
    return headers, rows

def ingest_equipment(conn):
    equipment_dir = os.path.join(DATA_DIR, 'equipment')
    if not os.path.exists(equipment_dir):
        print(f"Equipment dir not found: {equipment_dir}")
        return
        
    cur = conn.cursor()
    count = 0
    
    for filename in os.listdir(equipment_dir):
        if not filename.endswith('.md'):
            continue
            
        filepath = os.path.join(equipment_dir, filename)
        with open(filepath, 'r') as f:
            lines = f.readlines()
            
        eq_type = filename.replace('.md', '').capitalize()
        
        for i, line in enumerate(lines):
            if line.strip().startswith('| Tag') and i + 1 < len(lines) and '---' in lines[i+1]:
                headers, rows = parse_markdown_table(lines, i)
                
                for row in rows:
                    tag = row.get('Tag') or row.get('Equipment Tag')
                    name = row.get('Name', 'Unknown')
                    status = row.get('Status', 'Operational').lower()
                    type_val = row.get('Type', eq_type)
                    
                    if not tag:
                        continue
                        
                    # upsert
                    try:
                        cur.execute("""
                            INSERT INTO equipment (tag, name, equipment_type, status, properties)
                            VALUES (%s, %s, %s, %s, %s)
                            ON CONFLICT (tag) DO UPDATE 
                            SET name = EXCLUDED.name, equipment_type = EXCLUDED.equipment_type, status = EXCLUDED.status, properties = EXCLUDED.properties
                        """, (tag, name, type_val, status, Json(row)))
                        count += 1
                    except Exception as e:
                        print(f"Error inserting equipment {tag}: {e}")
                        conn.rollback()
                        
    conn.commit()
    print(f"Ingested {count} equipment records.")

def ingest_failures(conn):
    history_dir = os.path.join(DATA_DIR, 'failure_history')
    if not os.path.exists(history_dir):
        print("Failure history dir not found.")
        return
        
    cur = conn.cursor()
    count = 0
    
    for filename in os.listdir(history_dir):
        if not filename.endswith('.md'):
            continue
            
        with open(os.path.join(history_dir, filename), 'r') as f:
            lines = f.readlines()
            
        for i, line in enumerate(lines):
            if line.strip().startswith('| Failure ID') and i + 1 < len(lines) and '---' in lines[i+1]:
                headers, rows = parse_markdown_table(lines, i)
                
                for row in rows:
                    fid = row.get('Failure ID')
                    tag = row.get('Equipment')
                    date_val = row.get('Date')
                    symptoms = row.get('Symptoms', '')
                    root_cause = row.get('Root Cause', '')
                    
                    if not fid or not tag:
                        continue
                        
                    # ensure timestamp parsing (simple mapping, assuming YYYY-MM-DD)
                    date_str = date_val if date_val else '2020-01-01'
                    
                    try:
                        cur.execute("""
                            INSERT INTO failures (id, equipment_tag, date, symptoms, root_cause, action)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            ON CONFLICT (id) DO NOTHING
                        """, (fid, tag, f"{date_str} 00:00:00", symptoms, root_cause, row.get('Failure Mode', '')))
                        count += 1
                    except Exception as e:
                        # Some foreign key errors might occur if equipment isn't present
                        # We just skip or warn
                        # print(f"Error inserting failure {fid}: {e}")
                        pass
                        conn.rollback()
                        
    conn.commit()
    print(f"Ingested {count} failure records.")

if __name__ == "__main__":
    conn = connect_db()
    ingest_equipment(conn)
    ingest_failures(conn)
    conn.close()
    print("Ingestion complete.")
