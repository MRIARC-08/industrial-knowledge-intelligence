# Backend API Documentation

**Version:** 0.1.0  
**Base URL:** `http://localhost:8000` (Development)  
**Authentication:** API Key (X-API-Key header)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Response Format](#response-format)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
   - [Query System](#query-system)
   - [Analytics](#analytics)
   - [Equipment](#equipment)
   - [Compliance](#compliance)
   - [Documents](#documents)
   - [System Health](#system-health)
   - [Audio Transcription](#audio-transcription)

---

## Authentication

All API endpoints (except `/health`) require authentication via API Key.

### Header Format
```http
X-API-Key: your-api-key-here
```

### Getting Your API Key
Set the `API_KEY` environment variable in your `.env` file:
```bash
API_KEY=your-secret-key-here
```

### Example Request
```bash
curl -X GET "http://localhost:8000/api/v1/equipment/list" \
  -H "X-API-Key: your-api-key-here"
```

### Error Responses
- **401 Unauthorized** - Missing or invalid API key
- **403 Forbidden** - API key validation failed

---

## Rate Limiting

Rate limits are enforced per IP address:

| Endpoint | Rate Limit |
|----------|------------|
| `/health` | 60 requests/minute |
| `/api/v1/query` | 10,000 requests/minute |
| `/api/v1/documents/upload` | 5 requests/minute |
| Other endpoints | No explicit limit |

### Rate Limit Response
```json
{
  "detail": "Rate limit exceeded: 10000 per 1 minute"
}
```

---

## Response Format

All successful API responses return JSON with appropriate HTTP status codes.

### Success Response (200 OK)
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

### Error Response (4xx/5xx)
```json
{
  "detail": "Error message describing what went wrong"
}
```

---

## Error Handling

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 401 | Unauthorized - Missing/invalid API key |
| 403 | Forbidden - API key validation failed |
| 404 | Not Found - Resource doesn't exist |
| 422 | Validation Error - Invalid request parameters |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |

### Validation Error Example
```json
{
  "detail": [
    {
      "loc": ["body", "query"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## API Endpoints

### Query System

#### POST /api/v1/query
Query the AI system for equipment information, maintenance procedures, or compliance data.

**Request Body:**
```json
{
  "query": "What are the first checks for high vibration on P-101A?",
  "user_id": "user123",
  "user_role": "engineer",
  "equipment_context": "P-101A"
}
```

**Request Fields:**
- `query` (string, required): The question or query (3-500 characters)
- `user_id` (string, required): User identifier (max 100 characters)
- `user_role` (string, optional): User role - `engineer`, `technician`, or `manager` (default: `engineer`)
- `equipment_context` (string, optional): Equipment tag for context

**Response:**
```json
{
  "answer": "For high vibration on P-101A, first check: 1. Bearing condition...",
  "confidence": 0.94,
  "sources": [
    {
      "doc_id": "P-101A_Manual.pdf",
      "chunk_text": "Bearing inspection procedure...",
      "score": 0.89,
      "equipment_tags": ["P-101A"]
    }
  ],
  "response_time_ms": 1250
}
```

**Response Fields:**
- `answer` (string): The AI-generated answer
- `confidence` (float): Confidence score (0.0-1.0)
- `sources` (array): Source documents used for the answer
  - `doc_id` (string): Document identifier
  - `chunk_text` (string): First 200 characters of relevant text
  - `score` (float): Relevance score
  - `equipment_tags` (array): Related equipment tags
- `response_time_ms` (integer): Response time in milliseconds

**Caching:**
- Responses are cached for 1 hour
- Cache key is based on MD5 hash of query text

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the torque specification for P-101A bolts?",
    "user_id": "john.doe",
    "user_role": "engineer"
  }'
```

---

### Analytics

#### GET /api/v1/analytics/kpis
Get key performance indicators for the dashboard.

**Response:**
```json
{
  "annual_savings": 2500000.0,
  "time_reduction": 65.0,
  "system_accuracy": 94.5,
  "active_users": 127
}
```

**Response Fields:**
- `annual_savings` (float): Annual savings in USD
- `time_reduction` (float): Time reduction percentage
- `system_accuracy` (float): System accuracy percentage (0-100)
- `active_users` (integer): Number of active users

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/analytics/kpis" \
  -H "X-API-Key: your-api-key"
```

---

#### GET /api/v1/analytics/query-trends
Get query trends over time for analytics charts.

**Query Parameters:**
- `start_date` (datetime, optional): Start date (ISO 8601 format)
- `end_date` (datetime, optional): End date (ISO 8601 format)
- Default: Last 7 days if not specified

**Response:**
```json
{
  "data": [
    {
      "date": "2024-07-01T00:00:00",
      "count": 50
    },
    {
      "date": "2024-07-02T00:00:00",
      "count": 65
    }
  ],
  "total_queries": 350
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/analytics/query-trends?start_date=2024-07-01T00:00:00&end_date=2024-07-14T23:59:59" \
  -H "X-API-Key: your-api-key"
```

---

#### GET /api/v1/analytics/agent-performance
Get performance metrics for each AI agent type.

**Response:**
```json
{
  "agents": [
    {
      "agent_type": "copilot",
      "accuracy": 94.5,
      "avg_response_time": 1.2,
      "total_queries": 1543
    },
    {
      "agent_type": "maintenance_rca",
      "accuracy": 92.3,
      "avg_response_time": 2.1,
      "total_queries": 872
    }
  ]
}
```

**Agent Types:**
- `copilot` - General operational queries
- `maintenance_rca` - Root cause analysis
- `compliance` - Compliance and regulation queries
- `lessons_learned` - Historical lessons and best practices

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/analytics/agent-performance" \
  -H "X-API-Key: your-api-key"
```

---

#### GET /api/v1/analytics/activity-feed
Get recent activity feed showing latest user actions.

**Response:**
```json
{
  "events": [
    {
      "id": "evt_0",
      "timestamp": "2024-07-14T10:30:00",
      "user": "user_0",
      "action": "query",
      "details": "Query about equipment P-100"
    }
  ]
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/analytics/activity-feed" \
  -H "X-API-Key: your-api-key"
```

---

#### GET /api/v1/analytics/roi
Calculate ROI based on team parameters.

**Query Parameters (all required):**
- `team_size` (integer): Number of team members (> 0)
- `avg_salary` (float): Average annual salary in USD (> 0)
- `downtime_incidents` (integer): Number of downtime incidents (>= 0)

**Response:**
```json
{
  "annual_savings": 2500000.0,
  "time_saved_hours": 4800.0,
  "cost_per_query": 520.83,
  "roi_percentage": 900.0,
  "break_even_months": 1.2,
  "team_size": 10,
  "avg_salary": 95000.0,
  "downtime_incidents": 5
}
```

**Calculation Assumptions:**
- Average time saved per query: 2 hours
- Average queries per user per month: 20
- Cost per hour of downtime: $10,000
- System annual cost (for ROI): $250,000

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/analytics/roi?team_size=10&avg_salary=95000&downtime_incidents=5" \
  -H "X-API-Key: your-api-key"
```

---

#### GET /api/v1/analytics/top-equipment
Get top queried equipment ranked by query count.

**Query Parameters:**
- `limit` (integer, optional): Number of results (1-50, default: 10)

**Response:**
```json
{
  "equipment": [
    {
      "equipment_tag": "P-100A",
      "equipment_name": "Pump 100A",
      "query_count": 500
    },
    {
      "equipment_tag": "P-101A",
      "equipment_name": "Pump 101A",
      "query_count": 470
    }
  ]
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/analytics/top-equipment?limit=5" \
  -H "X-API-Key: your-api-key"
```

---

### Equipment

#### GET /api/v1/equipment/list
Get list of all equipment from the knowledge graph.

**Response:**
```json
{
  "equipment": [
    {
      "tag": "P-101A",
      "name": "Main Feed Pump A",
      "type": "Centrifugal Pump",
      "status": "operational",
      "failures": 3,
      "last_failure": "2024-01-15T00:00:00",
      "max_temp": 85.5,
      "max_pressure": 150.0,
      "max_flow": 500.0
    }
  ],
  "total": 1
}
```

**Status Values:**
- `operational` - Normal operation
- `warning` - Requires attention
- `critical` - Critical issue

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/equipment/list" \
  -H "X-API-Key: your-api-key"
```

---

#### GET /api/v1/equipment/{tag}/history
Get detailed failure history for specific equipment.

**Path Parameters:**
- `tag` (string, required): Equipment tag identifier (e.g., "P-101A")

**Response:**
```json
{
  "equipment": {
    "tag": "P-101A",
    "name": "Main Feed Pump A",
    "type": "Centrifugal Pump",
    "status": "operational",
    "failures": 3,
    "last_failure": "2024-01-15T00:00:00",
    "max_temp": 85.5,
    "max_pressure": 150.0,
    "max_flow": 500.0
  },
  "failures": [
    {
      "id": "f1",
      "date": "2024-01-15T00:00:00",
      "symptoms": "High vibration, unusual noise",
      "root_cause": "Bearing wear",
      "action": "Replaced bearing, realigned shaft"
    }
  ],
  "documents": [
    {
      "doc_id": "WO-2024-0115",
      "title": "Work Order - Bearing Replacement",
      "doc_type": "work_order",
      "date": "2024-01-15T00:00:00"
    }
  ]
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/equipment/P-101A/history" \
  -H "X-API-Key: your-api-key"
```

**Error Response (404):**
```json
{
  "detail": "Equipment P-999X not found"
}
```

---

### Compliance

#### GET /api/v1/compliance/gaps
Get compliance gaps with severity and status.

**Query Parameters:**
- `severity` (string, optional): Filter by severity (`high`, `medium`, `low`)
- `status` (string, optional): Filter by status (`open`, `resolved`)

**Response:**
```json
{
  "gaps": [
    {
      "id": "gap-001",
      "severity": "high",
      "regulation": "OSHA 1910.119",
      "clause": "Process Safety Management",
      "description": "Missing pressure relief valve inspection records",
      "equipment": "V-301, V-302",
      "status": "open"
    }
  ],
  "total": 1,
  "by_severity": {
    "high": 3,
    "medium": 2,
    "low": 1
  }
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/compliance/gaps?severity=high&status=open" \
  -H "X-API-Key: your-api-key"
```

---

#### GET /api/v1/compliance/certificates
Get certificate expiry data and status.

**Response:**
```json
{
  "certificates": [
    {
      "id": "cert-001",
      "name": "Pressure Vessel Inspection Certificate",
      "equipment": "V-301",
      "standard": "ASME BPVC Section VIII",
      "expiry": "2024-07-29T00:00:00",
      "status": "expiring_soon"
    }
  ],
  "total": 1,
  "expiring_soon": 1
}
```

**Status Values:**
- `valid` - Certificate is valid (more than 30 days)
- `expiring_soon` - Expiring within 30 days
- `expired` - Certificate has expired

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/compliance/certificates" \
  -H "X-API-Key: your-api-key"
```

---

### Documents

#### GET /api/v1/documents/list
Get list of all ingested documents.

**Response:**
```json
{
  "documents": [
    {
      "id": "doc-001",
      "name": "P-101A_Maintenance_Manual.pdf",
      "type": "Maintenance Manual",
      "upload_date": "2024-06-14T00:00:00",
      "status": "completed"
    }
  ],
  "total": 1
}
```

**Status Values:**
- `processing` - Document is being processed
- `completed` - Processing completed successfully
- `failed` - Processing failed

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/documents/list" \
  -H "X-API-Key: your-api-key"
```

---

#### POST /api/v1/documents/upload
Upload a new document for processing.

**Request:**
- Content-Type: `multipart/form-data`
- File field: `file`
- Supported formats: PDF

**Response:**
```json
{
  "id": "doc-20240714103000",
  "name": "New_Manual.pdf",
  "status": "processing",
  "message": "Document uploaded successfully and is being processed"
}
```

**Processing Steps:**
1. PDF text extraction
2. Named Entity Recognition (NER) for equipment tags
3. Semantic chunking
4. Vector embedding and storage
5. Knowledge graph update

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/documents/upload" \
  -H "X-API-Key: your-api-key" \
  -F "file=@/path/to/document.pdf"
```

---

### System Health

#### GET /api/v1/system/health
Get comprehensive system health status.

**Response:**
```json
{
  "overall_status": "healthy",
  "services": [
    {
      "name": "FastAPI",
      "status": "healthy",
      "response_time": 5.2,
      "details": "All endpoints operational"
    },
    {
      "name": "Neo4j",
      "status": "healthy",
      "response_time": 12.8,
      "details": "Knowledge graph connected"
    },
    {
      "name": "Qdrant",
      "status": "healthy",
      "response_time": 8.4,
      "details": "Vector database operational"
    },
    {
      "name": "PostgreSQL",
      "status": "healthy",
      "response_time": 7.1,
      "details": "Database connected"
    },
    {
      "name": "Redis",
      "status": "healthy",
      "response_time": 2.3,
      "details": "Cache operational"
    }
  ],
  "metrics": {
    "queries_per_min": 45.3,
    "avg_response": 1250.0,
    "cache_hit_rate": 78.5,
    "error_rate": 1.2,
    "documents": 1543,
    "graph_nodes": 8721,
    "vector_embeddings": 45892
  },
  "timestamp": "2024-07-14T10:30:00"
}
```

**Overall Status:**
- `healthy` - All services operational
- `degraded` - 1-2 services down
- `down` - 3+ services down

**Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/system/health" \
  -H "X-API-Key: your-api-key"
```

---

### Audio Transcription

#### POST /api/v1/transcribe
Transcribe audio to text using OpenAI Whisper API.

**Request:**
- Content-Type: `multipart/form-data`
- File field: `file`
- Supported formats: `.wav`, `.mp3`, `.m4a`, `.mp4`, `.webm`

**Response:**
```json
{
  "text": "What are the first checks for high vibration on P-101A?"
}
```

**Features:**
- Automatic fallback if Whisper API fails
- Used by mobile app for voice queries
- Graceful error handling

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/transcribe" \
  -H "X-API-Key: your-api-key" \
  -F "file=@/path/to/audio.m4a"
```

---

## CORS Configuration

The API supports Cross-Origin Resource Sharing (CORS) for frontend applications.

**Allowed Origins:**
- Set via `ALLOWED_ORIGINS` environment variable (comma-separated)
- Example: `http://localhost:3000,http://localhost:8081`
- In debug mode, all origins are allowed

**CORS Headers:**
- Credentials: Allowed
- Methods: All HTTP methods
- Headers: All headers (including X-API-Key)

---

## Environment Variables

Required environment variables for backend configuration:

```bash
# API Security
API_KEY=your-secret-api-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-qdrant-key  # Optional

# Knowledge Graph
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-neo4j-password

# Cache
REDIS_URL=redis://localhost:6379

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
DEBUG=false

# Project
PROJECT_NAME="Industrial Knowledge Intelligence"
```

---

## WebSocket Support

**Coming Soon** - Real-time updates for:
- Live equipment metrics
- System health changes
- Document processing status
- Query notifications

---

## Testing the API

### Using cURL
```bash
# Test health endpoint (no auth required)
curl http://localhost:8000/health

# Test authenticated endpoint
curl -X GET "http://localhost:8000/api/v1/equipment/list" \
  -H "X-API-Key: your-api-key"

# Test query endpoint
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"query": "Test query", "user_id": "test_user"}'
```

### Using JavaScript (Fetch API)
```javascript
const API_URL = 'http://localhost:8000';
const API_KEY = 'your-api-key';

async function querySystem(query) {
  const response = await fetch(`${API_URL}/api/v1/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({
      query: query,
      user_id: 'frontend_user',
      user_role: 'engineer'
    })
  });
  
  return await response.json();
}
```

### Using Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'X-API-Key': 'your-api-key'
  }
});

// Get equipment list
const equipment = await api.get('/api/v1/equipment/list');

// Query system
const result = await api.post('/api/v1/query', {
  query: 'What is the torque spec for P-101A?',
  user_id: 'user123',
  user_role: 'engineer'
});
```

---

## Support

For questions or issues:
- Check the [Architecture Documentation](architecture.md)
- Review the [Implementation Guide](implementation.md)
- Contact the backend team

---

**Last Updated:** July 14, 2024
