"""
Analytics API Routes

This module provides analytics endpoints for the dashboard:
- KPIs: Annual savings, time reduction, system accuracy, active users
- Query Trends: Time-series data for analytics charts
- Agent Performance: Metrics for each AI agent type
- Activity Feed: Recent user actions and system events
- ROI Calculator: Financial return on investment calculations
- Top Equipment: Most frequently queried equipment

All endpoints return mock data currently - ready for database integration.

Author: Industrial Knowledge Intelligence Team
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List, Dict, Any
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

router = APIRouter(prefix="/analytics", tags=["analytics"])


# Response Models
class KPIResponse(BaseModel):
    annual_savings: float = Field(..., description="Annual savings in USD")
    time_reduction: float = Field(..., description="Time reduction percentage")
    system_accuracy: float = Field(..., description="System accuracy percentage")
    active_users: int = Field(..., description="Number of active users")


class QueryTrendPoint(BaseModel):
    date: datetime
    count: int


class QueryTrendsResponse(BaseModel):
    data: List[QueryTrendPoint]
    total_queries: int


class AgentPerformance(BaseModel):
    agent_type: str
    accuracy: float
    avg_response_time: float
    total_queries: int


class AgentPerformanceResponse(BaseModel):
    agents: List[AgentPerformance]


class ActivityEvent(BaseModel):
    id: str
    timestamp: datetime
    user: str
    action: str
    details: str


class ActivityFeedResponse(BaseModel):
    events: List[ActivityEvent]


class ROIResponse(BaseModel):
    annual_savings: float
    time_saved_hours: float
    cost_per_query: float
    roi_percentage: float
    break_even_months: float
    team_size: int
    avg_salary: float
    downtime_incidents: int


class TopEquipmentItem(BaseModel):
    equipment_tag: str
    equipment_name: str
    query_count: int


class TopEquipmentResponse(BaseModel):
    equipment: List[TopEquipmentItem]


# Endpoints
@router.get("/kpis", response_model=KPIResponse)
async def get_kpis():
    """
    Get key performance indicators (KPIs)
    Returns annual savings, time reduction, system accuracy, and active users
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT COUNT(*) FROM equipment")
        equipment_count = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM failures")
        failures_count = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM users")
        active_users = cur.fetchone()[0]
        
        cur.close()
        conn.close()
        
        # Calculate dynamic KPIs based on database volume
        annual_savings = (equipment_count * 25000.0) - (failures_count * 5000.0)
        
        return KPIResponse(
            annual_savings=annual_savings if annual_savings > 0 else 1000000.0,
            time_reduction=65.0,
            system_accuracy=94.5,
            active_users=active_users
        )
    except Exception as e:
        logger.error(f"Error fetching KPIs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/query-trends", response_model=QueryTrendsResponse)
async def get_query_trends(
    start_date: Optional[datetime] = Query(None, description="Start date for trends"),
    end_date: Optional[datetime] = Query(None, description="End date for trends")
):
    """
    Get query trends over time
    Returns time-series data of query counts
    """
    try:
        # Set default date range if not provided (last 7 days)
        if not end_date:
            end_date = datetime.now()
        if not start_date:
            start_date = end_date - timedelta(days=7)
        
        # Using placeholder generated data for trends until AI activity logging is implemented in the DB
        data = []
        current_date = start_date
        while current_date <= end_date:
            data.append(QueryTrendPoint(
                date=current_date,
                count=50  # Mock count
            ))
            current_date += timedelta(days=1)
        
        return QueryTrendsResponse(
            data=data,
            total_queries=len(data) * 50
        )
    except Exception as e:
        logger.error(f"Error fetching query trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/agent-performance", response_model=AgentPerformanceResponse)
async def get_agent_performance():
    """
    Get agent performance metrics
    Returns accuracy and response time for each agent type
    """
    try:
        # Using placeholder generated data for agent performance until AI activity logging is implemented
        agents = [
            AgentPerformance(
                agent_type="copilot",
                accuracy=94.5,
                avg_response_time=1.2,
                total_queries=1543
            ),
            AgentPerformance(
                agent_type="maintenance_rca",
                accuracy=92.3,
                avg_response_time=2.1,
                total_queries=872
            ),
            AgentPerformance(
                agent_type="compliance",
                accuracy=96.1,
                avg_response_time=1.5,
                total_queries=456
            ),
            AgentPerformance(
                agent_type="lessons_learned",
                accuracy=91.8,
                avg_response_time=1.8,
                total_queries=328
            )
        ]
        
        return AgentPerformanceResponse(agents=agents)
    except Exception as e:
        logger.error(f"Error fetching agent performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/activity-feed", response_model=ActivityFeedResponse)
async def get_activity_feed():
    """
    Get recent activity feed
    Returns the 10 most recent activity events
    """
    try:
        # Using placeholder generated data for activity feed until user actions are logged to DB
        now = datetime.now()
        events = [
            ActivityEvent(
                id=f"evt_{i}",
                timestamp=now - timedelta(minutes=i*5),
                user=f"user_{i}",
                action="query",
                details=f"Query about equipment P-{100+i}"
            )
            for i in range(10)
        ]
        
        return ActivityFeedResponse(events=events)
    except Exception as e:
        logger.error(f"Error fetching activity feed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/roi", response_model=ROIResponse)
async def calculate_roi(
    team_size: int = Query(..., description="Team size", gt=0),
    avg_salary: float = Query(..., description="Average salary in USD", gt=0),
    downtime_incidents: int = Query(..., description="Number of downtime incidents", ge=0)
):
    """
    Calculate ROI metrics
    Returns calculated ROI based on team size, average salary, and downtime incidents
    """
    try:
        # ROI calculation logic
        # Assumptions:
        # - Average time saved per query: 2 hours
        # - Average queries per user per month: 20
        # - Cost per hour of downtime: $10,000
        
        avg_queries_per_user_per_month = 20
        time_saved_per_query_hours = 2.0
        cost_per_downtime_hour = 10000.0
        
        # Calculate time saved
        monthly_queries = team_size * avg_queries_per_user_per_month
        annual_queries = monthly_queries * 12
        time_saved_hours = annual_queries * time_saved_per_query_hours
        
        # Calculate cost savings from time saved
        hourly_rate = avg_salary / 2080  # Assuming 2080 working hours per year
        time_savings_value = time_saved_hours * hourly_rate
        
        # Calculate downtime savings
        downtime_savings = downtime_incidents * 8 * cost_per_downtime_hour  # Assume 8 hours per incident
        
        # Total annual savings
        annual_savings = time_savings_value + downtime_savings
        
        # Calculate cost per query
        cost_per_query = annual_savings / annual_queries if annual_queries > 0 else 0
        
        # Assume system cost (for ROI calculation)
        system_annual_cost = 250000.0  # Mock system cost
        roi_percentage = ((annual_savings - system_annual_cost) / system_annual_cost) * 100 if system_annual_cost > 0 else 0
        break_even_months = (system_annual_cost / (annual_savings / 12)) if annual_savings > 0 else 0
        
        return ROIResponse(
            annual_savings=annual_savings,
            time_saved_hours=time_saved_hours,
            cost_per_query=cost_per_query,
            roi_percentage=roi_percentage,
            break_even_months=break_even_months,
            team_size=team_size,
            avg_salary=avg_salary,
            downtime_incidents=downtime_incidents
        )
    except Exception as e:
        logger.error(f"Error calculating ROI: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/top-equipment", response_model=TopEquipmentResponse)
async def get_top_equipment(
    limit: int = Query(10, description="Number of top equipment to return", gt=0, le=50)
):
    """
    Get top queried equipment
    Returns equipment ranked by query count
    """
    try:
        # Using placeholder generated data for metrics until maintenance log tables are added
        equipment = [
            TopEquipmentItem(
                equipment_tag=f"P-{100+i}A",
                equipment_name=f"Pump {100+i}A",
                query_count=500 - (i * 30)
            )
            for i in range(min(limit, 10))
        ]
        
        return TopEquipmentResponse(equipment=equipment)
    except Exception as e:
        logger.error(f"Error fetching top equipment: {e}")
        raise HTTPException(status_code=500, detail=str(e))
