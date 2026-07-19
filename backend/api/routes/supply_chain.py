from fastapi import APIRouter, HTTPException
from typing import List, Optional, Any
from pydantic import BaseModel
import logging
import psycopg2
import psycopg2.extras
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/supply-chain", tags=["supply-chain"])

def get_db_connection():
    return psycopg2.connect(
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        dbname=settings.POSTGRES_DB,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD
    )

class PurchaseOrderItem(BaseModel):
    po_number: str
    supplier_name: str
    order_date: Optional[datetime]
    status: str
    items: Any

class SupplyChainResponse(BaseModel):
    purchase_orders: List[PurchaseOrderItem]
    total: int

@router.get("/purchase-orders", response_model=SupplyChainResponse)
async def get_purchase_orders():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cur.execute("SELECT * FROM purchase_orders ORDER BY order_date DESC")
        rows = cur.fetchall()
        
        pos = []
        for r in rows:
            pos.append(PurchaseOrderItem(
                po_number=r['po_number'],
                supplier_name=r['supplier_name'] or "",
                order_date=r['order_date'],
                status=r['status'] or "",
                items=r['items']
            ))
            
        cur.close()
        conn.close()
        
        return SupplyChainResponse(purchase_orders=pos, total=len(pos))
    except Exception as e:
        logger.error(f"Error fetching purchase orders: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
