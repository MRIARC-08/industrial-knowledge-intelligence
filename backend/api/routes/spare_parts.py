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

router = APIRouter(prefix="/spare-parts", tags=["spare-parts"])

def get_db_connection():
    return psycopg2.connect(
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        dbname=settings.POSTGRES_DB,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD
    )

class SparePartItem(BaseModel):
    part_number: str
    name: str
    category: str
    stock_quantity: int
    reorder_level: Optional[int]
    price: float
    supplier: Optional[str]

class SparePartsResponse(BaseModel):
    parts: List[SparePartItem]
    total: int

@router.get("/inventory", response_model=SparePartsResponse)
async def get_inventory():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cur.execute("SELECT * FROM spare_parts ORDER BY part_number")
        rows = cur.fetchall()
        
        parts = []
        for r in rows:
            parts.append(SparePartItem(
                part_number=r['part_number'],
                name=r['name'] or "",
                category=r['category'] or "",
                stock_quantity=r['stock_quantity'] or 0,
                reorder_level=r['reorder_level'],
                price=float(r['price'] or 0.0),
                supplier=r['supplier']
            ))
            
        cur.close()
        conn.close()
        
        return SparePartsResponse(parts=parts, total=len(parts))
    except Exception as e:
        logger.error(f"Error fetching spare parts: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
