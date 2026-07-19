# 📊 Analytics & KPI Test Data

**Platform:** Industrial Knowledge Intelligence Platform  
**Document Type:** Analytics Test Data & ROI Baselines  
**Purpose:** Validate analytics endpoints, ROI calculations, and dashboard data

---

## 📈 KPI Baseline Values (Expected from API)

```json
{
  "annual_savings": 24000000,
  "time_reduction": 95.2,
  "system_accuracy": 91.7,
  "active_users": 127
}
```

| KPI | Value | Unit | Notes |
|-----|-------|------|-------|
| Annual Savings | ₹2.4 Crore (2,400,000) | INR/year | Based on 127 users × 20 queries/month × 2 hrs saved per query |
| Time Reduction | 95.2% | Percent | Traditional: 47 min avg → AI: ~2.3 min avg |
| System Accuracy | 91.7% | Percent | Benchmark score on 50-question test suite |
| Active Users | 127 | Count | Field technicians + Engineers + Managers |

---

## 💰 ROI Calculator Test Scenarios

### Scenario A: Small Team (BRC Instrumentation Department)

```
Inputs:
  team_size: 15
  avg_salary: 750000  (₹7.5L per year)
  downtime_incidents: 3

Expected Output (approximate):
  annual_savings: ~1,400,000 (₹14L)
  time_saved_hours: ~7,200
  roi_percentage: ~460%
  break_even_months: ~3 months
```

### Scenario B: Medium Team (BRC Maintenance Division)

```
Inputs:
  team_size: 50
  avg_salary: 850000  (₹8.5L per year)
  downtime_incidents: 8

Expected Output (approximate):
  annual_savings: ~4,800,000 (₹48L)
  time_saved_hours: ~24,000
  roi_percentage: ~820%
  break_even_months: ~1.5 months
```

### Scenario C: Large Plant (BRC Full Plant 127 Users)

```
Inputs:
  team_size: 127
  avg_salary: 920000  (₹9.2L per year)
  downtime_incidents: 12

Expected Output (approximate):
  annual_savings: ~24,000,000 (₹2.4 Crore)
  time_saved_hours: ~60,960
  roi_percentage: ~9500%
  break_even_months: ~1.2 months
```

### ROI Calculation Formula Verification

```python
# Verify the backend uses these calculation assumptions:
avg_time_saved_per_query_hours = 2.0          # hours saved per AI query vs manual search
queries_per_user_per_month = 20               # typical usage
downtime_cost_per_incident_usd = 10000        # $10,000/incident (USD reference)
system_annual_cost_usd = 250000               # annual system cost (USD reference)

# For Indian context (adjust exchange rate as needed)
downtime_cost_per_incident_inr = 1800000      # ₹18 lakhs per incident
system_annual_cost_inr = 2500000              # ₹25 lakhs/year

def verify_roi(team_size, avg_salary, downtime_incidents):
    time_savings_hours = team_size * queries_per_user_per_month * 12 * avg_time_saved_per_query_hours
    hourly_rate = avg_salary / 2080  # 2080 working hours/year
    salary_savings = time_savings_hours * hourly_rate
    downtime_savings = downtime_incidents * downtime_cost_per_incident_inr
    annual_savings = salary_savings + downtime_savings
    roi_percentage = ((annual_savings - system_annual_cost_inr) / system_annual_cost_inr) * 100
    break_even_months = system_annual_cost_inr / (annual_savings / 12)
    return annual_savings, roi_percentage, break_even_months
```

---

## 📅 Query Trends — Test Data (7-Day Default)

Expected data structure from `/api/v1/analytics/query-trends`:

```json
{
  "data": [
    {"date": "2026-07-13T00:00:00", "count": 45},
    {"date": "2026-07-14T00:00:00", "count": 68},
    {"date": "2026-07-15T00:00:00", "count": 72},
    {"date": "2026-07-16T00:00:00", "count": 91},
    {"date": "2026-07-17T00:00:00", "count": 84},
    {"date": "2026-07-18T00:00:00", "count": 55},
    {"date": "2026-07-19T00:00:00", "count": 38}
  ],
  "total_queries": 453
}
```

**Test Assertions:**
- Exactly 7 data points for default (no date range)
- Dates are consecutive (no gaps)
- All counts are non-negative integers
- total_queries equals sum of all daily counts: 45+68+72+91+84+55+38 = 453
- Dates are in ISO 8601 format

---

## 🤖 Agent Performance — Expected Baseline

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
    },
    {
      "agent_type": "compliance",
      "accuracy": 96.1,
      "avg_response_time": 1.8,
      "total_queries": 541
    },
    {
      "agent_type": "lessons_learned",
      "accuracy": 88.7,
      "avg_response_time": 2.4,
      "total_queries": 312
    }
  ]
}
```

**Test Assertions:**
- All 4 agent types present: copilot, maintenance_rca, compliance, lessons_learned
- Accuracy values between 0 and 100
- avg_response_time > 0 (in seconds)
- total_queries >= 0
- Copilot has highest query count (most used agent)

---

## 🏭 Top Equipment — Expected Results

Expected query ranking (based on simulated usage):

| Rank | Equipment Tag | Equipment Name | Expected Query Count |
|------|-------------|---------------|---------------------|
| 1 | P-101A | Crude Charge Pump A | ~500 |
| 2 | C-102A | FCC Wet Gas Compressor A | ~470 |
| 3 | V-301 | HDS HP Separator | ~390 |
| 4 | P-201B | FCC Feed Pump B | ~380 |
| 5 | C-101A | H₂ Recycle Compressor A | ~350 |
| 6 | V-401 | FCC Reactor | ~320 |
| 7 | P-202A | FCC Slurry Recirc Pump A | ~280 |
| 8 | TK-103 | Crude Oil Tank C | ~240 |
| 9 | E-201A | HDS Feed-Effluent HX A | ~210 |
| 10 | P-402A | BFW Pump A | ~180 |

**Rationale:** Equipment queried most = equipment with most failures/issues + highest criticality

---

## 📊 Activity Feed — Expected Format

```json
{
  "events": [
    {
      "id": "evt_001",
      "timestamp": "2026-07-19T17:45:00",
      "user": "eng_001",
      "action": "query",
      "details": "Query about vibration on P-201B"
    },
    {
      "id": "evt_002",
      "timestamp": "2026-07-19T17:30:00",
      "user": "tech_042",
      "action": "document_upload",
      "details": "Uploaded: P-201B_Bearing_Inspection_Report.pdf"
    },
    {
      "id": "evt_003",
      "timestamp": "2026-07-19T17:15:00",
      "user": "mgr_001",
      "action": "query",
      "details": "Query about compliance gaps status"
    }
  ]
}
```

**Test Assertions:**
- Events array not empty
- Each event has: id, timestamp, user, action, details
- Timestamps are ISO 8601 format
- Events are sorted by timestamp (most recent first)

---

## 🩺 System Health — Expected Healthy State

```json
{
  "overall_status": "healthy",
  "services": [
    {"name": "FastAPI", "status": "healthy", "response_time": 5.2, "details": "All endpoints operational"},
    {"name": "Neo4j", "status": "healthy", "response_time": 12.8, "details": "Knowledge graph connected"},
    {"name": "Qdrant", "status": "healthy", "response_time": 8.4, "details": "Vector database operational"},
    {"name": "PostgreSQL", "status": "healthy", "response_time": 7.1, "details": "Database connected"},
    {"name": "Redis", "status": "healthy", "response_time": 2.3, "details": "Cache operational"}
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
  "timestamp": "2026-07-19T18:00:00"
}
```

**Degraded State Triggers:**
- 1–2 services down → overall_status = "degraded"
- 3+ services down → overall_status = "down"

**Performance Benchmarks:**
- Redis response: <10ms (target <5ms)
- Neo4j response: <50ms (target <20ms)
- Qdrant response: <30ms (target <15ms)
- PostgreSQL response: <30ms (target <15ms)

---

## 🔧 Performance Load Test Scenarios

### Scenario 1: Baseline (10 concurrent users)

```javascript
// k6 configuration for BRC baseline test
export let options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '60s', target: 10 },  // Stay at 10 for 1 min
    { duration: '10s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],  // 95% under 3s
    http_req_failed: ['rate<0.01'],     // Error rate < 1%
  },
};
```

### Scenario 2: Normal Load (100 concurrent users)

```javascript
export let options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],  // 95% under 5s
    http_req_failed: ['rate<0.02'],     // Error rate < 2%
  },
};
```

### Scenario 3: Peak Load (1000 concurrent users)

```javascript
export let options = {
  stages: [
    { duration: '2m', target: 500 },
    { duration: '1m', target: 1000 },
    { duration: '5m', target: 1000 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<10000'], // 95% under 10s at peak
    http_req_failed: ['rate<0.05'],      // Error rate < 5%
  },
};
```

### Expected Throughput by Endpoint

| Endpoint | Target RPS | Max Acceptable Latency (P95) |
|----------|-----------|------------------------------|
| GET /health | 500 | <50ms |
| POST /query (cache hit) | 200 | <100ms |
| POST /query (cache miss) | 20 | <5000ms |
| GET /equipment/list | 100 | <500ms |
| GET /analytics/kpis | 50 | <500ms |
| POST /documents/upload | 2 | <10000ms (background processing) |
