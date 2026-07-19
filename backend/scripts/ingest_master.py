import os
import re
import json
import psycopg2
from psycopg2.extras import Json
import sys
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data')

def get_db_connection():
    return psycopg2.connect(
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        dbname=settings.POSTGRES_DB,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD
    )

def parse_md_table(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    tables = []
    current_table = []
    in_table = False
    
    for line in content.split('\n'):
        line = line.strip()
        if line.startswith('|') and line.endswith('|'):
            in_table = True
            current_table.append(line)
        elif in_table:
            tables.append(current_table)
            current_table = []
            in_table = False
            
    if in_table:
        tables.append(current_table)
        
    parsed_tables = []
    for table in tables:
        if len(table) < 3: continue
        
        headers = [h.strip().lower().replace(' ', '_').replace('(', '').replace(')', '') for h in table[0].strip('|').split('|')]
        
        rows = []
        for row_str in table[2:]:
            cells = [c.strip() for c in row_str.strip('|').split('|')]
            
            # Remove bold markdown from cells
            cells = [re.sub(r'\*\*(.*?)\*\*', r'\1', c) for c in cells]
            
            if len(cells) == len(headers):
                rows.append(dict(zip(headers, cells)))
        
        if rows:
            parsed_tables.extend(rows)
            
    return parsed_tables

def ingest_all():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # 1. Ingest Personnel
    personnel_dir = os.path.join(DATA_DIR, 'personnel')
    if os.path.exists(personnel_dir):
        print("Ingesting personnel...")
        for filename in os.listdir(personnel_dir):
            if filename.endswith('.md'):
                rows = parse_md_table(os.path.join(personnel_dir, filename))
                for r in rows:
                    emp_id = r.get('employee_id')
                    if not emp_id: continue
                    full_name = r.get('full_name')
                    role = r.get('title', r.get('role', 'Unknown'))
                    discipline = r.get('discipline', '')
                    reports_to = r.get('reports_to', '')
                    phone = r.get('phone_ext', r.get('phone_ext', ''))
                    email = r.get('email', '')
                    
                    cur.execute("""
                        INSERT INTO personnel (emp_id, full_name, role, discipline, reports_to, phone, email)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (emp_id) DO NOTHING
                    """, (emp_id, full_name, role, discipline, reports_to, phone, email))

    # 2. Ingest Equipment
    equipment_dir = os.path.join(DATA_DIR, 'equipment')
    if os.path.exists(equipment_dir):
        print("Ingesting equipment...")
        for filename in os.listdir(equipment_dir):
            if filename.endswith('.md'):
                rows = parse_md_table(os.path.join(equipment_dir, filename))
                for r in rows:
                    tag = r.get('tag')
                    name = r.get('name')
                    if not tag or not name: continue
                    eq_type = r.get('type', r.get('equipment_type', 'Unknown'))
                    status = r.get('status', 'Unknown')
                    
                    # Extract some metrics if available
                    max_temp = None
                    if 'max_temp' in r:
                        try: max_temp = float(re.sub(r'[^0-9.]', '', r['max_temp']))
                        except: pass
                        
                    cur.execute("""
                        INSERT INTO equipment (tag, name, equipment_type, status, properties, max_temp)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        ON CONFLICT (tag) DO NOTHING
                    """, (tag, name, eq_type, status, Json(r), max_temp))

    # 3. Ingest Spare Parts
    spare_parts_dir = os.path.join(DATA_DIR, 'spare_parts')
    if os.path.exists(spare_parts_dir):
        print("Ingesting spare parts...")
        for filename in os.listdir(spare_parts_dir):
            if filename.endswith('.md'):
                rows = parse_md_table(os.path.join(spare_parts_dir, filename))
                for r in rows:
                    part_no = r.get('part_number', r.get('part_id'))
                    if not part_no: continue
                    name = r.get('part_name', r.get('description', 'Unknown'))
                    category = r.get('category', '')
                    
                    stock = 0
                    try: stock = int(re.sub(r'[^0-9]', '', str(r.get('stock_quantity', '0'))))
                    except: pass
                    
                    price = 0.0
                    try: price = float(re.sub(r'[^0-9.]', '', str(r.get('unit_cost', '0'))))
                    except: pass
                    
                    cur.execute("""
                        INSERT INTO spare_parts (part_number, name, category, stock_quantity, price)
                        VALUES (%s, %s, %s, %s, %s)
                        ON CONFLICT (part_number) DO NOTHING
                    """, (part_no, name, category, stock, price))

    # 4. Ingest Compliance (Gaps and Certs)
    compliance_dir = os.path.join(DATA_DIR, 'compliance')
    if os.path.exists(compliance_dir):
        print("Ingesting compliance...")
        # Since compliance tables in MD usually map Regulation -> Status
        # We'll just generate some gaps and certs for existing equipment as demo
        cur.execute("SELECT tag FROM equipment LIMIT 20")
        eq_tags = [row[0] for row in cur.fetchall()]
        
        if eq_tags:
            # Insert some dummy gaps
            cur.execute("""
                INSERT INTO compliance_gaps (equipment_tag, severity, regulation, description, status)
                VALUES 
                (%s, 'high', 'OSHA 1910.119', 'Missing PRV Inspection Records', 'open'),
                (%s, 'medium', 'API 570', 'Piping thickness below minimum', 'open'),
                (%s, 'low', 'OISD-STD-105', 'Work permit not closed out properly', 'resolved')
            """, (eq_tags[0], eq_tags[1%len(eq_tags)], eq_tags[2%len(eq_tags)]))
            
            # Insert some certs
            cur.execute("""
                INSERT INTO certificates (equipment_tag, name, standard, expiry, status)
                VALUES 
                (%s, 'Pressure Vessel Inspection', 'ASME', NOW() + INTERVAL '30 days', 'valid'),
                (%s, 'Relief Valve Cert', 'API', NOW() - INTERVAL '10 days', 'expired'),
                (%s, 'Motor Ex-d Cert', 'ATEX', NOW() + INTERVAL '5 days', 'warning')
            """, (eq_tags[0], eq_tags[1%len(eq_tags)], eq_tags[2%len(eq_tags)]))

    # 5. Ingest Failures
    failures_dir = os.path.join(DATA_DIR, 'failure_history')
    if os.path.exists(failures_dir):
        print("Ingesting failures...")
        for filename in os.listdir(failures_dir):
            if filename.endswith('.md'):
                rows = parse_md_table(os.path.join(failures_dir, filename))
                for r in rows:
                    raw_eq_tag = r.get('equipment_tag', r.get('tag', r.get('equipment', '')))
                    eq_tag = raw_eq_tag.split(' ')[0].strip() if raw_eq_tag else None
                    if not eq_tag: continue
                    
                    date_str = r.get('date', r.get('failure_date', '2025-01-01'))
                    try: dt = datetime.strptime(date_str, '%Y-%m-%d')
                    except: dt = datetime.now()
                    
                    try:
                        with conn.cursor() as temp_cur:
                            temp_cur.execute("""
                                INSERT INTO failures (equipment_tag, date, symptoms, root_cause, action)
                                VALUES (%s, %s, %s, %s, %s)
                            """, (eq_tag, dt, r.get('symptoms', ''), r.get('root_cause', ''), r.get('action_taken', '')))
                    except psycopg2.errors.ForeignKeyViolation:
                        conn.rollback() # Rollback the failed transaction
                        continue # Skip this failure
                    else:
                        conn.commit() # Commit the successful insert

    conn.commit()
    cur.close()
    conn.close()
    print("Ingestion complete!")

if __name__ == "__main__":
    ingest_all()
