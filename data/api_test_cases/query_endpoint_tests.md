# 🔌 API Test Cases — All Endpoints

**Platform:** Industrial Knowledge Intelligence Platform  
**Base URL:** http://localhost:8000  
**Auth:** X-API-Key header  
**Test Suite Version:** v2.0 Corporate

---

## 🔐 Authentication Tests

### AUTH-001: Valid API Key — Should Succeed

```bash
curl -X GET "http://localhost:8000/api/v1/equipment/list" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 200 OK
Expected Body: {"equipment": [...], "total": <number>}
```

### AUTH-002: Missing API Key — Should Return 401

```bash
curl -X GET "http://localhost:8000/api/v1/equipment/list"

Expected Status: 401 Unauthorized
Expected Body: {"detail": "Missing API key"}
```

### AUTH-003: Invalid API Key — Should Return 401

```bash
curl -X GET "http://localhost:8000/api/v1/equipment/list" \
  -H "X-API-Key: invalid-key-12345"

Expected Status: 401 Unauthorized
Expected Body: {"detail": "Invalid API key"}
```

### AUTH-004: Health Endpoint — No Auth Required

```bash
curl -X GET "http://localhost:8000/health"

Expected Status: 200 OK
Expected Body: {"status": "healthy"} or similar
Note: /health should NOT require X-API-Key
```

---

## 🤖 POST /api/v1/query — Test Cases

### QRY-001: Valid Query — Engineer Role

```bash
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "X-API-Key: test-api-key-2026" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the vibration alarm setpoint for P-101A?",
    "user_id": "eng_001",
    "user_role": "engineer",
    "equipment_context": "P-101A"
  }'

Expected Status: 200 OK
Expected Fields: answer (string), confidence (0.0-1.0), sources (array), response_time_ms (integer)
Expected Answer contains: "7.1 mm/s" 
Expected Confidence: >0.85
Expected Sources: At least 1 source with doc_id and score
```

### QRY-002: Valid Query — Technician Role

```bash
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "X-API-Key: test-api-key-2026" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What PPE do I need for pump inspection?",
    "user_id": "tech_042",
    "user_role": "technician"
  }'

Expected Status: 200 OK
Expected Answer contains: Safety helmet, safety shoes, gloves, safety glasses
Expected Confidence: >0.80
```

### QRY-003: Valid Query — Manager Role

```bash
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "X-API-Key: test-api-key-2026" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the current safety compliance status of the plant?",
    "user_id": "mgr_001",
    "user_role": "manager"
  }'

Expected Status: 200 OK
Expected Answer: Should summarize compliance gaps and overall %
Expected Confidence: >0.75
```

### QRY-004: Query Too Short — Should Return 422

```bash
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "X-API-Key: test-api-key-2026" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Hi",
    "user_id": "test_user"
  }'

Expected Status: 422 Unprocessable Entity
Expected Body: validation error (query min length: 3 characters)
Note: "Hi" is 2 chars — below 3 char minimum
```

### QRY-005: Query Too Long — Should Return 422

```bash
LONG_QUERY=$(python3 -c "print('x' * 501)")
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "X-API-Key: test-api-key-2026" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$LONG_QUERY\", \"user_id\": \"test_user\"}"

Expected Status: 422 Unprocessable Entity
Expected Body: validation error (query max length: 500 characters)
```

### QRY-006: Missing Required Field (query) — Should Return 422

```bash
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "X-API-Key: test-api-key-2026" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user"
  }'

Expected Status: 422 Unprocessable Entity
Expected Body: {"detail": [{"loc": ["body", "query"], "msg": "field required"}]}
```

### QRY-007: Missing Required Field (user_id) — Should Return 422

```bash
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "X-API-Key: test-api-key-2026" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the operating pressure of P-101A?"
  }'

Expected Status: 422 Unprocessable Entity
```

### QRY-008: Invalid user_role Enum — Should Return 422

```bash
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "X-API-Key: test-api-key-2026" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is P-101A rated flow?",
    "user_id": "test_user",
    "user_role": "admin"
  }'

Expected Status: 422 Unprocessable Entity
Note: "admin" is not a valid role (engineer|technician|manager only)
```

### QRY-009: Cache Behavior — Second Identical Query Faster

```bash
# First request (cache miss)
time curl -X POST "http://localhost:8000/api/v1/query" \
  -H "X-API-Key: test-api-key-2026" \
  -H "Content-Type: application/json" \
  -d '{"query": "What is P-101A bearing temperature alarm?", "user_id": "cache_test"}'

# Second request immediately after (cache hit)
time curl -X POST "http://localhost:8000/api/v1/query" \
  -H "X-API-Key: test-api-key-2026" \
  -H "Content-Type: application/json" \
  -d '{"query": "What is P-101A bearing temperature alarm?", "user_id": "cache_test"}'

Expected: Second request should be significantly faster (cache hit < 50ms)
```

### QRY-010: SQL Injection Attempt — Should Handle Gracefully

```bash
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "X-API-Key: test-api-key-2026" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT * FROM users; DROP TABLE equipment; --",
    "user_id": "test_user"
  }'

Expected Status: 200 OK (query is treated as natural language text, not SQL)
Expected: AI responds to query as text question about database tables
Note: System must NOT execute this as SQL
```

### QRY-011: XSS Injection Attempt — Should Sanitize

```bash
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "X-API-Key: test-api-key-2026" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "<script>alert(\"xss\")</script> What is pump pressure?",
    "user_id": "test_user"
  }'

Expected Status: 200 OK
Expected: Response does not contain the <script> tag in any context
Note: Input should be treated as plain text
```

---

## 🏭 GET /api/v1/equipment/list

### EQ-001: List All Equipment

```bash
curl -X GET "http://localhost:8000/api/v1/equipment/list" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 200 OK
Expected Fields: equipment (array), total (integer)
Expected: total > 0 (at least 24 pumps loaded)
Each equipment item: tag, name, type, status, failures, last_failure, max_temp, max_pressure, max_flow
```

### EQ-002: Equipment Status Values Valid

```bash
# Validate status values
curl -X GET "http://localhost:8000/api/v1/equipment/list" \
  -H "X-API-Key: test-api-key-2026" | \
  python3 -c "import json,sys; data=json.load(sys.stdin); 
              statuses = set(e['status'] for e in data['equipment']); 
              assert statuses.issubset({'operational','warning','critical'}), f'Invalid status: {statuses}'"

Expected: All status values must be one of: operational, warning, critical
```

### EQ-003: Equipment History — Valid Tag

```bash
curl -X GET "http://localhost:8000/api/v1/equipment/P-101A/history" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 200 OK
Expected Fields: equipment (object), failures (array), documents (array)
Expected: equipment.tag == "P-101A"
Expected: failures array contains at least 3 records (2018, 2023, 2026 failures)
```

### EQ-004: Equipment History — Non-Existent Tag

```bash
curl -X GET "http://localhost:8000/api/v1/equipment/P-999X/history" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 404 Not Found
Expected Body: {"detail": "Equipment P-999X not found"}
```

### EQ-005: Equipment History — SQL Injection in Tag

```bash
curl -X GET "http://localhost:8000/api/v1/equipment/P-101A%3BDROP-TABLE/history" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 404 Not Found (tag not in database)
Note: URL-encoded special characters should not execute any code
```

---

## 📊 Analytics Endpoint Tests

### ANA-001: KPIs Endpoint

```bash
curl -X GET "http://localhost:8000/api/v1/analytics/kpis" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 200 OK
Expected Fields: annual_savings (float), time_reduction (float), system_accuracy (float), active_users (integer)
Expected Ranges:
  annual_savings: > 0
  time_reduction: 0–100 (percentage)
  system_accuracy: 0–100 (percentage)
  active_users: >= 0
```

### ANA-002: Query Trends — Default (Last 7 Days)

```bash
curl -X GET "http://localhost:8000/api/v1/analytics/query-trends" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 200 OK
Expected Fields: data (array of {date, count}), total_queries (integer)
Expected: data array has 7 items (7 days)
Expected: Each date is valid ISO 8601 format
```

### ANA-003: Query Trends — Custom Date Range

```bash
curl -X GET "http://localhost:8000/api/v1/analytics/query-trends?start_date=2026-07-01T00:00:00&end_date=2026-07-15T23:59:59" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 200 OK
Expected: data array spans July 1–15 (15 data points)
```

### ANA-004: Query Trends — Invalid Date Format

```bash
curl -X GET "http://localhost:8000/api/v1/analytics/query-trends?start_date=not-a-date" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 422 Unprocessable Entity
```

### ANA-005: Agent Performance

```bash
curl -X GET "http://localhost:8000/api/v1/analytics/agent-performance" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 200 OK
Expected Fields: agents (array)
Expected Agent Types: copilot, maintenance_rca, compliance, lessons_learned (all 4 present)
Expected Each Agent: agent_type, accuracy (0-100), avg_response_time (float), total_queries (int)
```

### ANA-006: ROI Calculator — Valid Inputs

```bash
curl -X GET "http://localhost:8000/api/v1/analytics/roi?team_size=50&avg_salary=850000&downtime_incidents=8" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 200 OK
Expected Fields: annual_savings, time_saved_hours, cost_per_query, roi_percentage, break_even_months, team_size, avg_salary, downtime_incidents
Expected: All numerical values > 0
Expected: team_size == 50, avg_salary == 850000, downtime_incidents == 8 (echoed back)
```

### ANA-007: ROI Calculator — Zero Team Size (Invalid)

```bash
curl -X GET "http://localhost:8000/api/v1/analytics/roi?team_size=0&avg_salary=850000&downtime_incidents=5" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 422 Unprocessable Entity
Note: team_size must be > 0
```

### ANA-008: ROI Calculator — Negative Salary (Invalid)

```bash
curl -X GET "http://localhost:8000/api/v1/analytics/roi?team_size=10&avg_salary=-100&downtime_incidents=5" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 422 Unprocessable Entity
Note: avg_salary must be > 0
```

### ANA-009: Top Equipment — Default Limit

```bash
curl -X GET "http://localhost:8000/api/v1/analytics/top-equipment" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 200 OK
Expected: equipment array with max 10 items (default limit)
Expected Each: equipment_tag, equipment_name, query_count
Expected: Sorted by query_count descending
```

### ANA-010: Top Equipment — Custom Limit

```bash
curl -X GET "http://localhost:8000/api/v1/analytics/top-equipment?limit=5" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 200 OK
Expected: equipment array with max 5 items
```

### ANA-011: Top Equipment — Limit Out of Range

```bash
curl -X GET "http://localhost:8000/api/v1/analytics/top-equipment?limit=100" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 422 Unprocessable Entity
Note: limit must be 1–50
```

---

## 📋 Compliance Endpoint Tests

### COM-001: Compliance Gaps — All Gaps

```bash
curl -X GET "http://localhost:8000/api/v1/compliance/gaps" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 200 OK
Expected Fields: gaps (array), total (integer), by_severity (object with high/medium/low counts)
Expected: total > 0 (at least 4 gaps from our database)
Expected Severity Values: high, medium, low only
Expected Status Values: open, resolved only
```

### COM-002: Compliance Gaps — Filter by High Severity

```bash
curl -X GET "http://localhost:8000/api/v1/compliance/gaps?severity=high" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 200 OK
Expected: All returned gaps have severity == "high"
Expected: At least 2 items (GAP-2026-001, GAP-2026-002 are both HIGH)
```

### COM-003: Compliance Gaps — Filter by Open Status

```bash
curl -X GET "http://localhost:8000/api/v1/compliance/gaps?status=open" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 200 OK
Expected: All returned gaps have status == "open"
```

### COM-004: Compliance Gaps — Invalid Severity Filter

```bash
curl -X GET "http://localhost:8000/api/v1/compliance/gaps?severity=critical" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 422 Unprocessable Entity
Note: "critical" is not a valid severity (only high/medium/low)
```

### COM-005: Certificates — List All

```bash
curl -X GET "http://localhost:8000/api/v1/compliance/certificates" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 200 OK
Expected Fields: certificates (array), total (integer), expiring_soon (integer)
Expected: V-102 certificate present with status "expiring_soon"
Expected Status Values: valid, expiring_soon, expired
Expected: expiring_soon count matches count of items with status "expiring_soon"
```

---

## 📄 Document Endpoint Tests

### DOC-001: Document List

```bash
curl -X GET "http://localhost:8000/api/v1/documents/list" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 200 OK
Expected Fields: documents (array), total (integer)
Expected Status Values: processing, completed, failed
```

### DOC-002: Valid PDF Upload

```bash
curl -X POST "http://localhost:8000/api/v1/documents/upload" \
  -H "X-API-Key: test-api-key-2026" \
  -F "file=@/path/to/test_document.pdf"

Expected Status: 200 OK
Expected Fields: id (string), name (string), status ("processing"), message (string)
Expected: status == "processing" (background processing)
```

### DOC-003: Upload Non-PDF File — Should Handle

```bash
curl -X POST "http://localhost:8000/api/v1/documents/upload" \
  -H "X-API-Key: test-api-key-2026" \
  -F "file=@/path/to/test_file.txt"

Expected: Either 422 (unsupported type) or accept and attempt processing
Note: API docs say only PDF supported — non-PDF should return error
```

### DOC-004: Rate Limiting on Upload Endpoint

```bash
# Send 6 upload requests rapidly (limit is 5/minute)
for i in {1..6}; do
  curl -X POST "http://localhost:8000/api/v1/documents/upload" \
    -H "X-API-Key: test-api-key-2026" \
    -F "file=@/path/to/test_document.pdf"
done

Expected: First 5 requests: 200 OK
Expected: 6th request: 429 Too Many Requests
Expected Body: {"detail": "Rate limit exceeded: 5 per 1 minute"}
```

---

## 🩺 System Health Tests

### SYS-001: System Health Check

```bash
curl -X GET "http://localhost:8000/api/v1/system/health" \
  -H "X-API-Key: test-api-key-2026"

Expected Status: 200 OK
Expected Fields: overall_status, services (array), metrics (object), timestamp
Expected Overall Status: healthy | degraded | down
Expected Services: FastAPI, Neo4j, Qdrant, PostgreSQL, Redis (all 5 present)
Each Service: name, status, response_time (ms), details
Metrics: queries_per_min, avg_response, cache_hit_rate, error_rate, documents, graph_nodes, vector_embeddings
```

### SYS-002: Verify Timestamp Format

```bash
curl -X GET "http://localhost:8000/api/v1/system/health" \
  -H "X-API-Key: test-api-key-2026" | \
  python3 -c "import json,sys,datetime; 
              data=json.load(sys.stdin); 
              ts = data['timestamp']; 
              datetime.datetime.fromisoformat(ts.replace('Z','+00:00')); 
              print('Timestamp valid:', ts)"

Expected: Timestamp is valid ISO 8601 format
```

---

## 🔊 Audio Transcription Tests

### TRN-001: Valid WAV File Transcription

```bash
curl -X POST "http://localhost:8000/api/v1/transcribe" \
  -H "X-API-Key: test-api-key-2026" \
  -F "file=@test_audio_pump_query.wav"

Expected Status: 200 OK
Expected Fields: text (string)
Expected: text is non-empty and contains transcribed speech
```

### TRN-002: Unsupported Format — Should Return Error

```bash
curl -X POST "http://localhost:8000/api/v1/transcribe" \
  -H "X-API-Key: test-api-key-2026" \
  -F "file=@test_file.pdf"

Expected: Error response (either 400 or 422) indicating unsupported format
Supported: .wav, .mp3, .m4a, .mp4, .webm
```

---

## 📊 API Test Coverage Summary

| Endpoint | Total Tests | Happy Path | Error Cases | Security |
|----------|-------------|-----------|------------|---------|
| Authentication | 4 | 2 | 2 | 1 |
| POST /query | 11 | 3 | 6 | 2 |
| GET /equipment/list | 2 | 2 | 0 | 0 |
| GET /equipment/{tag}/history | 3 | 1 | 1 | 1 |
| GET /analytics/kpis | 1 | 1 | 0 | 0 |
| GET /analytics/query-trends | 3 | 2 | 1 | 0 |
| GET /analytics/agent-performance | 1 | 1 | 0 | 0 |
| GET /analytics/roi | 3 | 1 | 2 | 0 |
| GET /analytics/top-equipment | 3 | 2 | 1 | 0 |
| GET /compliance/gaps | 4 | 2 | 1 | 0 |
| GET /compliance/certificates | 1 | 1 | 0 | 0 |
| GET /documents/list | 1 | 1 | 0 | 0 |
| POST /documents/upload | 3 | 1 | 1 | 1 |
| GET /system/health | 2 | 2 | 0 | 0 |
| POST /transcribe | 2 | 1 | 1 | 0 |
| **TOTAL** | **44** | **23** | **16** | **5** |
