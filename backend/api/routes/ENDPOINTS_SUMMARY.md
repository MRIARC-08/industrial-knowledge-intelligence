# API Endpoints Summary

This document provides an overview of all API endpoints created for the Dashboard Completion feature.

## Base URL
All endpoints are prefixed with `/api/v1`

---

## Analytics Router (`/api/v1/analytics`)

### GET `/api/v1/analytics/kpis`
**Description:** Get key performance indicators (KPIs)  
**Response:** Annual savings, time reduction, system accuracy, and active users  
**Requirements:** 13.1

### GET `/api/v1/analytics/query-trends`
**Description:** Get query trends over time  
**Query Parameters:**
- `start_date` (optional): Start date for trends
- `end_date` (optional): End date for trends
**Response:** Time-series data of query counts  
**Requirements:** 13.2

### GET `/api/v1/analytics/agent-performance`
**Description:** Get agent performance metrics  
**Response:** Accuracy and response time for each agent type  
**Requirements:** 13.3

### GET `/api/v1/analytics/activity-feed`
**Description:** Get recent activity feed  
**Response:** The 10 most recent activity events  
**Requirements:** 13.4

### GET `/api/v1/analytics/roi`
**Description:** Calculate ROI metrics  
**Query Parameters:**
- `team_size` (required): Team size
- `avg_salary` (required): Average salary in USD
- `downtime_incidents` (required): Number of downtime incidents
**Response:** Calculated ROI based on parameters  
**Requirements:** 13.5

### GET `/api/v1/analytics/top-equipment`
**Description:** Get top queried equipment  
**Query Parameters:**
- `limit` (optional, default=10): Number of top equipment to return
**Response:** Equipment ranked by query count  
**Requirements:** 13.11

---

## Equipment Router (`/api/v1/equipment`)

### GET `/api/v1/equipment/list`
**Description:** Get list of all equipment  
**Response:** All equipment from the knowledge graph  
**Requirements:** 13.6

### GET `/api/v1/equipment/{tag}/history`
**Description:** Get equipment failure history  
**Path Parameters:**
- `tag` (required): Equipment tag identifier
**Response:** Equipment details, failure events, and related documents  
**Requirements:** 13.6

---

## Compliance Router (`/api/v1/compliance`)

### GET `/api/v1/compliance/gaps`
**Description:** Get compliance gaps  
**Query Parameters:**
- `severity` (optional): Filter by severity (high, medium, low)
- `status` (optional): Filter by status (open, resolved)
**Response:** All compliance gaps with severity and status  
**Requirements:** 13.7

### GET `/api/v1/compliance/certificates`
**Description:** Get certificate expiry data  
**Response:** All certificates with expiry dates and status  
**Requirements:** 13.8

---

## Documents Router (`/api/v1/documents`)

### GET `/api/v1/documents/list`
**Description:** Get list of all documents  
**Response:** All ingested documents with metadata  
**Requirements:** 13.9

### POST `/api/v1/documents/upload`
**Description:** Upload a new document  
**Request Body:** multipart/form-data file upload  
**Response:** Upload status and document ID  
**Requirements:** 13.9

---

## System Router (`/api/v1/system`)

### GET `/api/v1/system/health`
**Description:** Get system health status  
**Response:** Health status for all backend services and performance metrics  
**Requirements:** 13.10

---

## Response Models

All endpoints return structured JSON responses with appropriate Pydantic models:

- **KPIResponse**: Annual savings, time reduction, system accuracy, active users
- **QueryTrendsResponse**: Time-series data points with dates and counts
- **AgentPerformanceResponse**: Agent-specific accuracy and response times
- **ActivityFeedResponse**: List of recent activity events
- **ROIResponse**: Calculated ROI metrics
- **TopEquipmentResponse**: Top queried equipment list
- **EquipmentListResponse**: List of all equipment
- **EquipmentHistoryResponse**: Equipment details with failure history
- **ComplianceGapsResponse**: List of compliance gaps
- **CertificatesResponse**: List of certificates with expiry information
- **DocumentListResponse**: List of all documents
- **DocumentUploadResponse**: Upload status
- **SystemHealthResponse**: Overall system health and service statuses

---

## CORS Configuration

CORS is configured in `main.py` to allow:
- Origins: Configurable via `ALLOWED_ORIGINS` environment variable
- Credentials: Enabled
- Methods: GET, POST
- Headers: Content-Type, X-API-Key

---

## Authentication

All endpoints (except `/health`) require API key authentication via the `X-API-Key` header.

---

## Next Steps

1. Implement actual data retrieval from databases (Neo4j, PostgreSQL, Qdrant)
2. Add WebSocket endpoint for real-time updates
3. Add unit tests for all endpoints
4. Add integration tests with database mocks
5. Update frontend to consume these endpoints
