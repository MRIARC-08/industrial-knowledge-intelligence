from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel, Field
import logging
import psycopg2
import psycopg2.extras
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/personnel", tags=["personnel"])

def get_db_connection():
    return psycopg2.connect(
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        dbname=settings.POSTGRES_DB,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD
    )

class PersonnelItem(BaseModel):
    emp_id: str
    full_name: str
    role: str
    discipline: str
    reports_to: Optional[str]
    phone: str
    email: str

class PersonnelResponse(BaseModel):
    personnel: List[PersonnelItem]
    total: int

@router.get("/list", response_model=PersonnelResponse)
async def get_personnel_list():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cur.execute("SELECT * FROM personnel ORDER BY role")
        rows = cur.fetchall()
        
        personnel = []
        for r in rows:
            personnel.append(PersonnelItem(
                emp_id=r['emp_id'],
                full_name=r['full_name'],
                role=r['role'] or "",
                discipline=r['discipline'] or "",
                reports_to=r['reports_to'],
                phone=r['phone'] or "",
                email=r['email'] or ""
            ))
            
        cur.close()
        conn.close()
        
        return PersonnelResponse(personnel=personnel, total=len(personnel))
    except Exception as e:
        logger.error(f"Error fetching personnel list: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{emp_id}", response_model=PersonnelItem)
async def get_personnel_details(emp_id: str):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cur.execute("SELECT * FROM personnel WHERE emp_id = %s", (emp_id,))
        row = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if not row:
            raise HTTPException(status_code=404, detail="Personnel not found")
            
        return PersonnelItem(
            emp_id=row['emp_id'],
            full_name=row['full_name'],
            role=row['role'] or "",
            discipline=row['discipline'] or "",
            reports_to=row['reports_to'],
            phone=row['phone'] or "",
            email=row['email'] or ""
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching personnel details: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
