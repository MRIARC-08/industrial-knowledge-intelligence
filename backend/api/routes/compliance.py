"""
Compliance API Routes

This module provides compliance management endpoints:
- Compliance Gaps: Regulatory compliance issues with severity levels
- Certificates: Certificate expiry tracking and status

Compliance gap severity levels:
- high: Critical compliance issues requiring immediate attention
- medium: Important issues requiring action
- low: Minor issues for improvement

Certificate status values:
- valid: Certificate is valid (more than 30 days remaining)
- expiring_soon: Expiring within 30 days
- expired: Certificate has expired

Supports common industrial standards:
- OSHA (Occupational Safety and Health Administration)
- API (American Petroleum Institute)
- ASME (American Society of Mechanical Engineers)
- ISO (International Organization for Standardization)

Author: Industrial Knowledge Intelligence Team
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import logging
import psycopg2
import psycopg2.extras
import sys
import os

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

router = APIRouter(prefix="/compliance", tags=["compliance"])


# Response Models
class ComplianceGap(BaseModel):
    id: str = Field(..., description="Gap ID")
    severity: str = Field(..., description="Severity: high, medium, or low")
    regulation: str = Field(..., description="Regulation name")
    clause: str = Field(..., description="Regulation clause")
    description: str = Field(..., description="Gap description")
    equipment: str = Field(..., description="Affected equipment")
    status: str = Field(..., description="Status: open or resolved")


class ComplianceGapsResponse(BaseModel):
    gaps: List[ComplianceGap]
    total: int
    by_severity: dict = Field(..., description="Count by severity")


class Certificate(BaseModel):
    id: str = Field(..., description="Certificate ID")
    name: str = Field(..., description="Certificate name")
    equipment: str = Field(..., description="Related equipment")
    standard: str = Field(..., description="Standard/certification body")
    expiry: datetime = Field(..., description="Expiry date")
    status: str = Field(..., description="Status: valid, expiring_soon, or expired")


class CertificatesResponse(BaseModel):
    certificates: List[Certificate]
    total: int
    expiring_soon: int


# Endpoints
@router.get("/gaps", response_model=ComplianceGapsResponse)
async def get_compliance_gaps(
    severity: Optional[str] = Query(None, description="Filter by severity: high, medium, low"),
    status: Optional[str] = Query(None, description="Filter by status: open, resolved")
):
    """
    Get compliance gaps
    Returns all compliance gaps with severity and status
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # Build query
        query = "SELECT * FROM compliance_gaps WHERE 1=1"
        params = []
        if severity:
            query += " AND LOWER(severity) = %s"
            params.append(severity.lower())
        if status:
            query += " AND LOWER(status) = %s"
            params.append(status.lower())
            
        cur.execute(query, tuple(params))
        rows = cur.fetchall()
        
        # Get counts by severity
        cur.execute("SELECT severity, COUNT(*) as count FROM compliance_gaps GROUP BY severity")
        severity_counts = {r['severity'].lower(): r['count'] for r in cur.fetchall()}
        
        by_severity = {
            "high": severity_counts.get("high", 0),
            "medium": severity_counts.get("medium", 0),
            "low": severity_counts.get("low", 0)
        }
        
        gaps = []
        for r in rows:
            gaps.append(ComplianceGap(
                id=str(r['id']),
                severity=r['severity'],
                regulation=r['regulation'],
                clause="",
                description=r['description'],
                equipment=r['equipment_tag'],
                status=r['status']
            ))
            
        cur.close()
        conn.close()
        
        return ComplianceGapsResponse(
            gaps=gaps,
            total=len(gaps),
            by_severity=by_severity
        )
    except Exception as e:
        logger.error(f"Error fetching compliance gaps: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/certificates", response_model=CertificatesResponse)
async def get_certificates():
    """
    Get certificate expiry data
    Returns all certificates with expiry dates and status
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cur.execute("SELECT * FROM certificates")
        rows = cur.fetchall()
        
        certificates = []
        expiring_soon_count = 0
        
        for r in rows:
            certificates.append(Certificate(
                id=str(r['id']),
                name=r['name'],
                equipment=r['equipment_tag'],
                standard="",
                expiry=r['expiry'],
                status=r['status']
            ))
            if r['status'] == 'expiring_soon':
                expiring_soon_count += 1
                
        cur.close()
        conn.close()
        
        return CertificatesResponse(
            certificates=certificates,
            total=len(certificates),
            expiring_soon=expiring_soon_count
        )
    except Exception as e:
        logger.error(f"Error fetching certificates: {e}")
        raise HTTPException(status_code=500, detail=str(e))
