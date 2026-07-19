"""
Equipment API Routes

This module provides equipment-related endpoints:
- Equipment List: All equipment from the knowledge graph with status
- Equipment History: Detailed failure history and related documents for specific equipment

Equipment status values:
- operational: Normal operation
- warning: Requires attention
- critical: Critical issue requiring immediate action

Data is retrieved from Neo4j knowledge graph which maintains:
- Equipment nodes with properties (tag, name, type, status)
- Failure event relationships
- Document reference relationships

Author: Industrial Knowledge Intelligence Team
"""
from fastapi import APIRouter, HTTPException, Path
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
import logging
import psycopg2
import psycopg2.extras
import sys
import os

# Add root to path for config
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import settings

def get_db_connection():
    return psycopg2.connect(
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        dbname=settings.POSTGRES_DB,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD
    )

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/equipment", tags=["equipment"])


# Response Models
class EquipmentItem(BaseModel):
    tag: str = Field(..., description="Equipment tag identifier")
    name: str = Field(..., description="Equipment name")
    type: str = Field(..., description="Equipment type")
    status: str = Field(..., description="Equipment status: operational, warning, or critical")
    failures: int = Field(..., description="Total number of failures")
    last_failure: Optional[datetime] = Field(None, description="Date of last failure")
    max_temp: Optional[float] = Field(None, description="Maximum temperature")
    max_pressure: Optional[float] = Field(None, description="Maximum pressure")
    max_flow: Optional[float] = Field(None, description="Maximum flow rate")
    properties: Optional[Any] = Field(None, description="Dynamic properties from ingestion")


class EquipmentListResponse(BaseModel):
    equipment: List[EquipmentItem]
    total: int


class FailureEvent(BaseModel):
    id: str = Field(..., description="Failure event ID")
    date: Optional[datetime] = Field(None, description="Failure date")
    symptoms: str = Field(..., description="Failure symptoms")
    root_cause: str = Field(..., description="Root cause of failure")
    action: str = Field(..., description="Corrective action taken")


class EquipmentHistoryResponse(BaseModel):
    equipment: EquipmentItem
    failures: List[FailureEvent]
    documents: List[Dict[str, Any]]


# Endpoints
@router.get("/list", response_model=EquipmentListResponse)
async def get_equipment_list():
    """
    Get list of all equipment
    Returns all equipment from the knowledge graph
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cur.execute("""
            WITH eq_history AS (
                SELECT equipment_tag, date FROM failures
                UNION ALL
                SELECT equipment_tag, date_executed as date FROM work_orders
            )
            SELECT e.*, 
                   COUNT(h.equipment_tag) as failures_count, 
                   MAX(h.date) as last_failure_date
            FROM equipment e
            LEFT JOIN eq_history h ON e.tag = h.equipment_tag
            GROUP BY e.tag
        """)
        
        rows = cur.fetchall()
        
        equipment = []
        for r in rows:
            equipment.append(EquipmentItem(
                tag=r['tag'],
                name=r['name'],
                type=r['equipment_type'],
                status=r['status'],
                failures=r['failures_count'],
                last_failure=r['last_failure_date'],
                max_temp=r['max_temp'],
                max_pressure=r['max_pressure'],
                max_flow=r['max_flow'],
                properties=r['properties']
            ))
            
        cur.close()
        conn.close()
        
        return EquipmentListResponse(equipment=equipment, total=len(equipment))
    except Exception as e:
        logger.error(f"Error retrieving equipment: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{tag}/history", response_model=EquipmentHistoryResponse)
async def get_equipment_history(
    tag: str = Path(..., description="Equipment tag identifier")
):
    """
    Get equipment failure history
    Returns equipment details, failure events, and related documents
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cur.execute("""
            WITH eq_history AS (
                SELECT equipment_tag, date FROM failures
                UNION ALL
                SELECT equipment_tag, date_executed as date FROM work_orders
            )
            SELECT e.*,
                COUNT(h.equipment_tag) as failures_count,
                MAX(h.date) as last_failure_date
            FROM equipment e
            LEFT JOIN eq_history h ON e.tag = h.equipment_tag
            WHERE e.tag = %s
            GROUP BY e.tag
        """, (tag,))
        
        eq_row = cur.fetchone()
        if not eq_row:
            cur.close()
            conn.close()
            raise HTTPException(status_code=404, detail=f"Equipment {tag} not found")
            
        equipment = EquipmentItem(
            tag=eq_row['tag'],
            name=eq_row['name'],
            type=eq_row['equipment_type'],
            status=eq_row['status'],
            failures=eq_row['failures_count'],
            last_failure=eq_row['last_failure_date'],
            max_temp=eq_row['max_temp'],
            max_pressure=eq_row['max_pressure'],
            max_flow=eq_row['max_flow'],
            properties=eq_row['properties']
        )
        
        # Get failures and work orders
        cur.execute("""
            SELECT id::text, date, symptoms, root_cause, action
            FROM failures
            WHERE equipment_tag = %s
            UNION ALL
            SELECT wo_id::text as id, date_executed as date, description as symptoms, 'Maintenance (' || type || ')' as root_cause, 'Completed' as action
            FROM work_orders
            WHERE equipment_tag = %s
            ORDER BY date DESC NULLS LAST
        """, (tag, tag))
        
        failure_rows = cur.fetchall()
        failures = []
        for f in failure_rows:
            failures.append(FailureEvent(
                id=str(f['id']),
                date=f['date'],
                symptoms=f['symptoms'] or "",
                root_cause=f['root_cause'] or "",
                action=f['action'] or ""
            ))
            
        cur.close()
        conn.close()
        
        return EquipmentHistoryResponse(
            equipment=equipment,
            failures=failures,
            documents=[]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching equipment history for {tag}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
