# 🏭 Industrial Knowledge Intelligence Platform — Corporate Test Database

**Version:** 2.0 Corporate  
**Created:** July 2026  
**Purpose:** Comprehensive testing database for all platform layers  
**Scope:** Enterprise-grade, multi-site, multi-discipline industrial knowledge  

---

## 📁 Database Directory Structure

```
data/
├── README.md                          ← You are here
│
├── equipment/                         ← Equipment master registry
│   ├── pumps.md                       ← Centrifugal & reciprocating pumps
│   ├── compressors.md                 ← Compressor fleet
│   ├── heat_exchangers.md             ← Heat exchange equipment
│   ├── vessels_tanks.md               ← Pressure vessels & storage tanks
│   ├── rotating_machinery.md          ← Turbines, fans, agitators
│   └── instrumentation.md             ← Sensors, transmitters, analyzers
│
├── work_orders/                       ← Maintenance work orders
│   ├── corrective_maintenance.md      ← Emergency & corrective WOs
│   ├── preventive_maintenance.md      ← Scheduled PM work orders
│   ├── predictive_maintenance.md      ← Condition-based WOs
│   └── shutdown_maintenance.md        ← Turnaround & shutdown WOs
│
├── inspection_reports/                ← Inspection & NDT records
│   ├── mechanical_integrity.md        ← API 510/570/653 inspections
│   ├── ndt_results.md                 ← UT, RT, PT, MT test results
│   ├── thickness_surveys.md           ← Corrosion monitoring records
│   └── pressure_test_records.md       ← Hydro/pneumatic test records
│
├── incidents/                         ← Safety incidents & near-misses
│   ├── major_incidents.md             ← High-severity incidents
│   ├── near_misses.md                 ← Near-miss event records
│   ├── rca_reports.md                 ← Root Cause Analysis reports
│   └── lessons_learned.md             ← Cross-plant lessons
│
├── compliance/                        ← Regulatory & compliance data
│   ├── osha_requirements.md           ← OSHA regulation compliance
│   ├── oisd_standards.md              ← OISD standards (India)
│   ├── api_standards.md               ← API standards compliance
│   ├── certificates.md                ← Inspection certificates registry
│   └── audit_records.md               ← Internal & external audit results
│
├── failure_history/                   ← Equipment failure database
│   ├── pump_failures.md               ← Pump failure events
│   ├── compressor_failures.md         ← Compressor failure events
│   ├── instrument_failures.md         ← Instrumentation failures
│   └── electrical_failures.md         ← Electrical system failures
│
├── oem_manuals/                       ← Equipment OEM references
│   ├── pump_specifications.md         ← Pump technical specs
│   ├── compressor_specs.md            ← Compressor technical specs
│   └── vendor_contacts.md             ← Vendor & supplier registry
│
├── spare_parts/                       ← Parts & inventory data
│   ├── critical_spares.md             ← Critical spare parts list
│   ├── stock_levels.md                ← Current inventory levels
│   └── procurement_history.md         ← Purchase history
│
├── personnel/                         ← People & roles registry
│   ├── engineering_team.md            ← Engineers & disciplines
│   ├── maintenance_crew.md            ← Maintenance technicians
│   └── certifications.md              ← Personal certifications
│
├── analytics/                         ← KPI & analytics test data
│   ├── kpi_baselines.md               ← Expected KPI values
│   ├── query_scenarios.md             ← Test query scenarios
│   └── roi_calculations.md            ← ROI benchmark data
│
├── benchmark_queries/                 ← AI query test suite
│   ├── operational_queries.md         ← General operational questions
│   ├── maintenance_rca_queries.md     ← RCA & troubleshooting questions
│   ├── compliance_queries.md          ← Compliance & regulatory questions
│   └── lessons_learned_queries.md     ← Historical knowledge questions
│
└── api_test_cases/                    ← API endpoint test cases
    ├── auth_tests.md                  ← Authentication test cases
    ├── query_endpoint_tests.md        ← /api/v1/query test cases
    ├── equipment_endpoint_tests.md    ← Equipment API test cases
    ├── compliance_endpoint_tests.md   ← Compliance API test cases
    ├── analytics_endpoint_tests.md    ← Analytics API test cases
    └── document_endpoint_tests.md     ← Document API test cases
```

---

## 🏭 Plant Overview

This database covers a fictional but realistic **Indian refinery complex** — **Bharat Refinery Corporation (BRC)** — used as the primary test environment for all platform capabilities.

| Attribute | Value |
|-----------|-------|
| Plant Name | Bharat Refinery Corporation (BRC) |
| Location | Vadodara, Gujarat, India |
| Capacity | 15 MMTPA Crude Oil Processing |
| Units | CDU, VDU, FCC, HDS, ARDS, Utilities |
| Total Equipment Count | 1,200+ tagged items |
| Annual Turnaround | Every 4 years |
| Workforce | ~850 permanent + 1,200 contract |
| Regulatory Body | PESO, OISD, Factory Inspectorate |

---

## 🎯 Testing Levels Covered

| Level | Coverage |
|-------|----------|
| **API Level** | All 16+ REST endpoints with valid/invalid payloads |
| **AI Agent Level** | 50+ benchmark queries across all 4 agent types |
| **Data Ingestion Level** | 100+ document types and formats |
| **Knowledge Graph Level** | 500+ nodes, 200+ relationship types |
| **Compliance Level** | OSHA, OISD, API, ASME standards coverage |
| **Performance Level** | Load test scenarios (10 → 1000 users) |
| **Business Logic Level** | ROI calculations, KPI targets, anomaly detection |
| **Security Level** | Auth, rate limiting, input validation edge cases |

---

*Generated by Antigravity AI for BRC Industrial Knowledge Intelligence Platform testing.*
