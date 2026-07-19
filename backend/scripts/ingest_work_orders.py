import os
import re
import psycopg2
from datetime import datetime

# Setup paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), 'data')

def parse_markdown_table(filepath):
    lines = []
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    tables = []
    current_table = []
    headers = []
    in_table = False
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.startswith('|'):
            if not in_table:
                # new table
                in_table = True
                headers = [h.strip() for h in line.split('|')[1:-1]]
            elif line.startswith('|-') or line.startswith('|:-'):
                continue # divider
            else:
                row = [c.strip() for c in line.split('|')[1:-1]]
                if len(row) == len(headers):
                    record = dict(zip(headers, row))
                    current_table.append(record)
        else:
            if in_table:
                tables.append(current_table)
                current_table = []
                in_table = False
                
    if in_table:
        tables.append(current_table)
        
    # flatten tables
    return [r for t in tables for r in t]

def ingest_work_orders():
    print("Ingesting Work Orders...")
    import sys
    sys.path.append(BASE_DIR)
    from config import settings
    
    conn = psycopg2.connect(
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        dbname=settings.POSTGRES_DB,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD
    )
    cur = conn.cursor()
    
    # 1. PM
    pm_path = os.path.join(DATA_DIR, 'work_orders', 'preventive_maintenance.md')
    pms = parse_markdown_table(pm_path)
    for pm in pms:
        wo_id = pm.get('PM Task', '')
        desc = f"Scope: {pm.get('Equipment Scope', '')} | Freq: {pm.get('Frequency', '')}"
        type_ = 'PM'
        
        # parse duration
        dur_str = pm.get('Duration (hrs)', '')
        dur_val = None
        m = re.search(r'([0-9.]+)', dur_str)
        if m:
            dur_val = float(m.group(1))
            
        # parse lead emp_id from "Mech Rotating Team (Lead: **Ravi Shankar Kumar**)"
        # We don't have the exact emp_id in PMs usually, just name. But we can leave lead_emp_id NULL or map to a generic one, or extract name.
        # Let's map lead_emp_id to None for PMs, or try to find it. 
        # Actually in CM we have "(MECH-001)" so let's check PM
        lead_emp_id = None
        
        # date
        dt_str = pm.get('Latest Completion', '')
        dt_val = None
        if dt_str and dt_str != 'N/A':
            try:
                dt_val = datetime.strptime(dt_str, '%Y-%m-%d')
            except:
                pass
                
        if wo_id:
            cur.execute("""
                INSERT INTO work_orders (wo_id, equipment_tag, type, lead_emp_id, date_executed, duration_hours, description)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (wo_id, None, type_, lead_emp_id, dt_val, dur_val, desc))
            
    # 2. CM
    cm_path = os.path.join(DATA_DIR, 'work_orders', 'corrective_maintenance.md')
    cms = parse_markdown_table(cm_path)
    for cm in cms:
        wo_id = cm.get('WO Number', '')
        eq_tag = cm.get('Equipment', '').split('/')[0].strip() # Handle E-201A/B
        desc = cm.get('Description', '')
        type_ = 'CM'
        
        # Parse emp_id from "**Ravi Shankar Kumar** (MECH-001)"
        assigned = cm.get('Assigned To', '')
        lead_emp_id = None
        m = re.search(r'\(([^)]+)\)', assigned)
        if m:
            lead_emp_id = m.group(1)
            
        # date
        dt_str = cm.get('Raised Date', '')
        dt_val = None
        if dt_str:
            try:
                dt_val = datetime.strptime(dt_str, '%Y-%m-%d')
            except:
                pass
                
        if wo_id:
            cur.execute("""
                INSERT INTO work_orders (wo_id, equipment_tag, type, lead_emp_id, date_executed, duration_hours, description)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (wo_id, eq_tag, type_, lead_emp_id, dt_val, None, desc))
            
    conn.commit()
    cur.close()
    conn.close()
    print("Work orders ingested successfully!")

if __name__ == '__main__':
    ingest_work_orders()
