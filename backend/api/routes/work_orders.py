from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel, Field
import logging
import psycopg2
import psycopg2.extras
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/work-orders", tags=["work-orders"])

def get_db_connection():
    return psycopg2.connect(
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        dbname=settings.POSTGRES_DB,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD
    )

class WorkOrderItem(BaseModel):
    wo_id: str
    equipment_tag: str
    type: str
    lead_emp_id: Optional[str]
    date_executed: Optional[datetime]
    duration_hours: Optional[float]
    description: str

class WorkOrderResponse(BaseModel):
    work_orders: List[WorkOrderItem]
    total: int

@router.get("/list", response_model=WorkOrderResponse)
async def get_work_orders():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cur.execute("SELECT * FROM work_orders ORDER BY date_executed DESC")
        rows = cur.fetchall()
        
        work_orders = []
        for r in rows:
            work_orders.append(WorkOrderItem(
                wo_id=r['wo_id'],
                equipment_tag=r['equipment_tag'] or "",
                type=r['type'] or "",
                lead_emp_id=r['lead_emp_id'],
                date_executed=r['date_executed'],
                duration_hours=r['duration_hours'],
                description=r['description'] or ""
            ))
            
        cur.close()
        conn.close()
        
        return WorkOrderResponse(work_orders=work_orders, total=len(work_orders))
    except Exception as e:
        logger.error(f"Error fetching work orders: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
