# 🤖 AI Query Benchmark Suite — 50 Expert Test Questions

**Platform:** Industrial Knowledge Intelligence Platform  
**Test Suite:** Corporate Benchmark v2.0  
**Total Questions:** 50 across 4 agent types  
**Ground Truth:** Derived from BRC plant knowledge base  
**Pass Threshold:** >80% correct | >90% citation accuracy

---

## 🧭 Agent 1: Expert Copilot Queries (Operational Questions)

### CAT: Operational — Easy

**Q-OPS-001**
```
Question: What is the rated flow capacity of pump P-101A?
Ground Truth: 850 m³/hr
Source: data/equipment/pumps.md — P-101A specifications
Category: Operational
Difficulty: Easy
Expected Confidence: >0.92
Agent Route: Copilot
```

**Q-OPS-002**
```
Question: What type of mechanical seal does P-101A use?
Ground Truth: Dual Mechanical Seal (API Plan 53B), John Crane HPXE model
Source: data/equipment/pumps.md
Category: Operational
Difficulty: Easy
Expected Confidence: >0.90
Agent Route: Copilot
```

**Q-OPS-003**
```
Question: What is the vibration alarm setpoint for CDU pumps?
Ground Truth: 7.1 mm/s RMS (alarm), 11.2 mm/s RMS (trip)
Source: data/equipment/pumps.md — operating limits section
Category: Operational
Difficulty: Easy
Expected Confidence: >0.90
Agent Route: Copilot
```

**Q-OPS-004**
```
Question: What is the design pressure of the HDS HP Separator V-301?
Ground Truth: 68 bar g
Source: data/equipment/vessels_tanks.md
Category: Operational
Difficulty: Easy
Expected Confidence: >0.90
Agent Route: Copilot
```

**Q-OPS-005**
```
Question: What oil type should be used for the C-102A Wet Gas Compressor?
Ground Truth: Turbine Oil ISO VG 46 (e.g., Shell Turbo T 46)
Source: data/equipment/compressors.md — C-102A lube oil system
Category: Operational
Difficulty: Easy
Expected Confidence: >0.92
Agent Route: Copilot
```

### CAT: Operational — Medium

**Q-OPS-006**
```
Question: What are all the operating limits for pump P-101A — max pressure, 
          temperature, minimum flow, and bearing temperature alarm?
Ground Truth: 
  Max Discharge Pressure: 22 bar g
  Max Suction Pressure: 3.5 bar g
  Max Temperature: 85°C
  Minimum Flow: 220 m³/hr (25% of rated)
  Bearing Temp Alarm: 85°C
  Bearing Temp Trip: 95°C
Source: data/equipment/pumps.md
Category: Operational
Difficulty: Medium (multi-field)
Expected Confidence: >0.88
```

**Q-OPS-007**
```
Question: What PPE is required for the monthly centrifugal pump inspection?
Ground Truth: Safety helmet, safety shoes, nitrile gloves, safety glasses
Source: data/work_orders/preventive_maintenance.md — SOP-PM-001
Category: Operational
Difficulty: Medium
Expected Confidence: >0.88
Agent Route: Copilot
```

**Q-OPS-008**
```
Question: How often should lube oil sampling be performed on rotating equipment?
Ground Truth: Monthly
Source: data/work_orders/preventive_maintenance.md
Category: Operational
Difficulty: Medium
Expected Confidence: >0.87
```

**Q-OPS-009**
```
Question: What is the dry gas seal primary vent flow alarm limit for C-102A?
Ground Truth: >5 Nm³/hr (alarm); normal is <2.5 Nm³/hr
Source: data/equipment/compressors.md — C-102A seal system
Category: Operational
Difficulty: Medium
Expected Confidence: >0.88
```

**Q-OPS-010**
```
Question: What is the lube oil reservoir capacity for C-102A?
Ground Truth: 1,200 litres
Source: data/equipment/compressors.md
Category: Operational
Difficulty: Easy-Medium
Expected Confidence: >0.90
```

**Q-OPS-011**
```
Question: What is the bearing Attention/Warning/Alarm vibration threshold 
          for centrifugal pumps per the PM inspection procedure?
Ground Truth: 
  Normal: <3.0 mm/s
  Attention: 3.0–5.0 mm/s
  Warning: 5.0–7.1 mm/s
  Alarm: >7.1 mm/s
  Trip: >11.2 mm/s
Source: data/work_orders/preventive_maintenance.md — SOP-PM-001
Category: Operational
Difficulty: Medium
Expected Confidence: >0.88
```

**Q-OPS-012**
```
Question: What is the minimum pump flow for P-101A and why is it important?
Ground Truth: 220 m³/hr (25% of rated 850 m³/hr) — below this, 
              recirculation and cavitation risk, heat build-up
Source: data/equipment/pumps.md
Category: Operational
Difficulty: Medium
Expected Confidence: >0.85
```

---

## 🔧 Agent 2: Maintenance RCA Queries

**Q-RCA-001**
```
Question: Why did P-201B fail in June 2026?
Ground Truth: Bearing fatigue due to water contamination of lube oil 
              caused by degraded lip seal (5 years old, overdue for 4-year replacement)
Source: data/incidents/rca_reports.md — INC-2026-001
Category: Maintenance RCA
Difficulty: Easy (direct lookup)
Expected Confidence: >0.90
Agent Route: Maintenance RCA
```

**Q-RCA-002**
```
Question: What are the first checks when P-101A shows high vibration?
Ground Truth: 
  1. Check current vibration reading vs 7.1 mm/s alarm setpoint
  2. Check bearing temperatures (alarm: 85°C)
  3. Listen for unusual noise
  4. Check oil level and oil condition (color, milky = water contamination)
  5. Check seal flush pressure/flow
  6. Review recent vibration trend (increasing trend indicates bearing issue)
  7. If >7.1 mm/s: notify supervisor; if >11.2 mm/s: consider emergency stop
Source: data/equipment/pumps.md + data/failure_history/pump_failures.md
Category: Maintenance RCA
Difficulty: Medium
Expected Confidence: >0.85
```

**Q-RCA-003**
```
Question: P-202A has been experiencing recurring cavitation failures. 
          What is the root cause and what permanent fix is recommended?
Ground Truth: Root cause is suction strainer fouling causing NPSH degradation.
  Events: 2018, 2025 (3rd in 2018 counting original). 
  Permanent fix: Install dP transmitter across suction strainer with 0.3 bar alarm,
  reduce cleaning to 3 months, consider duplex strainer (₹8,50,000)
Source: data/failure_history/pump_failures.md — recurring failure alert
Category: Maintenance RCA
Difficulty: Hard (pattern recognition)
Expected Confidence: >0.80
Agent Route: Maintenance RCA
```

**Q-RCA-004**
```
Question: What is the history of mechanical seal failures on P-101A and 
          what is the systemic root cause?
Ground Truth: 3 events (2018, 2023, 2026) — all human error, 
              improper valve positions at startup. Systemic cause: 
              no interlock or mandatory pre-startup checklist.
              Interim fix: Digital pre-startup checklist (Jan 2026)
Source: data/failure_history/pump_failures.md
Category: Maintenance RCA
Difficulty: Hard (pattern synthesis)
Expected Confidence: >0.80
```

**Q-RCA-005**
```
Question: What are the typical symptoms of bearing failure in a centrifugal pump 
          and how do you detect it early?
Ground Truth: 
  Symptoms: High vibration (mm/s), high bearing temperature, unusual noise (whining),
             oil discoloration (metallic particles, milky color = water)
  Early detection: Vibration analysis (trend monitoring), oil sampling 
                   (Fe/Cr particle count), infrared thermography, noise monitoring
Source: data/equipment/pumps.md — failure modes table
Category: Maintenance RCA
Difficulty: Medium
Expected Confidence: >0.87
```

**Q-RCA-006**
```
Question: What happened during the hot oil spill incident in May 2025?
Ground Truth: Crude oil spill (~40L) at P-101A seal area during startup.
  Cause: Mechanical seal transport collar was NOT removed before installation.
  Root systemic cause: Paper-based checklist had been modified with handwriting.
  Regulatory consequence: Reported to Gujarat Factory Inspectorate. 
  Improvement notice issued.
Source: data/incidents/rca_reports.md — INC-2025-012
Category: Maintenance RCA
Difficulty: Medium
Expected Confidence: >0.88
```

**Q-RCA-007**
```
Question: C-102A has run 28,450 hours since last overhaul. What is the risk 
          level and what components should be prioritized for inspection?
Ground Truth: Risk is moderate — next scheduled TA-27 in 2027. 
  No immediate action needed unless condition monitoring shows deterioration.
  Priority components: Dry gas seal (check vent flows), journal bearings 
  (check vibration spectrum for oil whirl), impeller (fouling)
Source: data/equipment/compressors.md — C-102A specs + failure patterns
Category: Maintenance RCA
Difficulty: Hard (inference)
Expected Confidence: >0.75
```

**Q-RCA-008**
```
Question: What is the ISO 15243 classification for a bearing that shows 
          white milky discoloration and surface pitting?
Ground Truth: Moisture corrosion (under ISO 15243 Corrosion category)
Source: data/failure_history/pump_failures.md — bearing failure ISO 15243 tree
Category: Maintenance RCA
Difficulty: Medium
Expected Confidence: >0.82
```

---

## 📋 Agent 3: Compliance Queries

**Q-COM-001**
```
Question: What OSHA regulation requires documentation of pressure relief 
          valve inspections?
Ground Truth: OSHA 29 CFR 1910.119(j) — Mechanical Integrity (PSM)
Source: data/compliance/osha_requirements.md
Category: Compliance
Difficulty: Easy
Expected Confidence: >0.90
Agent Route: Compliance
```

**Q-COM-002**
```
Question: Are there any open compliance gaps at BRC that are rated HIGH severity?
Ground Truth: Yes — 4 HIGH severity gaps:
  GAP-2026-001: Missing PRV inspection records (OSHA 1910.119)
  GAP-2026-002: Confined space rescue drill overdue (OSHA 1910.146)
  GAP-2026-004: API 570 piping inspection overdue for HDS unit
  (also API 653 deficiency for TK-103 bottom plate)
Source: data/compliance/osha_requirements.md
Category: Compliance
Difficulty: Medium
Expected Confidence: >0.87
```

**Q-COM-003**
```
Question: When does the inspection certificate for V-102 expire?
Ground Truth: 2026-09-15 (expiring within 3 months — EXPIRING SOON status)
Source: data/compliance/osha_requirements.md — certificates registry
Category: Compliance
Difficulty: Easy
Expected Confidence: >0.92
```

**Q-COM-004**
```
Question: What is the OISD standard for Work Permit systems?
Ground Truth: OISD-STD-105 — Work Permit System
Source: data/compliance/osha_requirements.md — applicable regulations list
Category: Compliance
Difficulty: Easy
Expected Confidence: >0.92
```

**Q-COM-005**
```
Question: What is the inspection interval for Class 1 piping per API 570 
          and what service is Class 1?
Ground Truth: Maximum 5-year inspection interval. 
  Class 1 = highest risk services (Hydrofluoric acid, H₂S services, 
  highly flammable liquids, HHC at high pressure/temperature)
Source: data/compliance/osha_requirements.md — GAP-2026-004
Category: Compliance
Difficulty: Medium-Hard
Expected Confidence: >0.82
```

**Q-COM-006**
```
Question: Which vessels are affected by the missing PRV inspection records gap?
Ground Truth: 
  V-301-PRV-001, V-301-PRV-002 (HDS HP Separator)
  V-302-PRV-001 (HDS LP Separator)
  V-201-PRV-001, V-201-PRV-002 (VDU Vacuum Column)
  V-202-PRV-001 (VDU Ejector Drum)
  C-101A-PRV-001 (H₂ Compressor Discharge)
Source: data/compliance/osha_requirements.md — GAP-2026-001
Category: Compliance
Difficulty: Medium
Expected Confidence: >0.88
```

**Q-COM-007**
```
Question: What regulatory reporting was required after the 2025 crude oil spill?
Ground Truth: Reported to Gujarat Factory Inspectorate (as required for HC spill >10L)
  Regulatory reference: The Factories Act 1948 — Section 38
  Factory Inspector visited 2025-05-15 — improvement notice issued (no enforcement action)
Source: data/incidents/rca_reports.md — INC-2025-012
Category: Compliance
Difficulty: Medium
Expected Confidence: >0.85
```

**Q-COM-008**
```
Question: What are the PESO certificate expiry dates for the LPG bullets TK-501A and B?
Ground Truth: 
  TK-501A: Expires 2031-03-10 (Valid)
  TK-501B: Expires 2031-03-12 (Valid)
Source: data/compliance/osha_requirements.md — certificates registry
Category: Compliance
Difficulty: Easy
Expected Confidence: >0.90
```

**Q-COM-009**
```
Question: What is the overall compliance percentage at BRC, and which 
          areas are below 90%?
Ground Truth: Overall 93.5% (86/92 requirements compliant)
  Below 90%: API Standards (83.3%), OSHA PSM (85.7%), OISD (87.5%)
Source: data/compliance/osha_requirements.md — compliance dashboard
Category: Compliance
Difficulty: Medium
Expected Confidence: >0.87
```

**Q-COM-010**
```
Question: What is the requirement frequency for confined space rescue drills 
          per OSHA 1910.146?
Ground Truth: At least annually (1910.146(k)(2)(iv))
Source: data/compliance/osha_requirements.md — GAP-2026-002
Category: Compliance
Difficulty: Easy
Expected Confidence: >0.92
```

---

## 📚 Agent 4: Lessons Learned Queries

**Q-LL-001**
```
Question: What lessons were learned from the P-201B bearing failure in 2026?
Ground Truth: 
  LL-2026-001: OEM manuals in appendices may have hidden PMs — systematic review needed
  LL-2026-002: Oil analysis trend alerts are more important than absolute alarm thresholds
Source: data/incidents/rca_reports.md
Category: Lessons Learned
Difficulty: Easy
Agent Route: Lessons Learned
```

**Q-LL-002**
```
Question: Have there been any recurring seal failures at BRC? What lessons 
          were learned to prevent them?
Ground Truth: Yes — P-101A had 3 seal failures (2018, 2023, 2026) all from
  dry running due to improper valve positions. Lesson: Digital mandatory pre-startup
  checklist implemented. Interlock under consideration.
Source: data/failure_history/pump_failures.md + data/work_orders/corrective_maintenance.md
Category: Lessons Learned
Difficulty: Medium (cross-reference)
Expected Confidence: >0.82
```

**Q-LL-003**
```
Question: What lessons from the 2025 crude oil spill changed the maintenance 
          procedures at BRC?
Ground Truth: 
  LL-2025-012: Transport collar removal must be on mandatory digital checklist.
  Paper checklists with handwritten modifications are unreliable.
  Action taken: Digital pre-installation checklists in CMMS mandatory.
Source: data/incidents/rca_reports.md
Category: Lessons Learned
Difficulty: Medium
Expected Confidence: >0.85
```

**Q-LL-004**
```
Question: What lesson was learned about confined space entry from 
          near-miss event NM-2026-002?
Ground Truth: Operator entered vessel V-303 without gas test — STOP WORK issued.
  Lesson: Confined space entry gas test is non-negotiable before entry,
  even if the vessel is "believed to be clean."
Source: data/incidents/rca_reports.md — near misses table
Category: Lessons Learned  
Difficulty: Easy
Expected Confidence: >0.88
```

**Q-LL-005**
```
Question: What best practices have been identified for managing 
          centrifugal compressor surge prevention?
Ground Truth: 
  LL-2022-001: Anti-surge recycle valve must be open before speed ramp-up on all 
  centrifugal compressors (from INC-2022-003)
Source: data/incidents/rca_reports.md — lessons learned database
Category: Lessons Learned
Difficulty: Easy
Expected Confidence: >0.90
```

---

## 📊 Benchmark Scoring Framework

```
Scoring Method:
  Correct Answer (full match):        1.0 point
  Partially Correct (key facts match): 0.5 point
  Incorrect / Hallucinated:            0.0 point
  
Citation Scoring:
  Correct source cited:               1.0 point
  No source or wrong source:          0.0 point

Minimum Pass Thresholds:
  Answer Accuracy:    >80% (40/50 questions correct or partial)
  Citation Accuracy:  >90% (45/50 correct source citations)
  
Target Performance:
  Answer Accuracy:    >90%
  Citation Accuracy:  >95%
  Avg Response Time:  <3 seconds
  P95 Response Time:  <8 seconds
  Min Confidence:     >0.75 on all answered questions
```

---

## 🏆 Expected Benchmark Scorecard

```
Industrial Knowledge Intelligence — Expected Benchmark Results
══════════════════════════════════════════════════════════════
Questions Tested:         50
Category Distribution:    OPS: 12 | RCA: 8 | COM: 10 | LL: 5 | Others: 15

Target Results:
  Fully Correct:          ≥40 (≥80%)
  Partially Correct:      ≤7
  Incorrect:              ≤3

By Category (Targets):
  Operational:            ≥90% accuracy (easy/medium mix)
  Maintenance RCA:        ≥80% accuracy (harder pattern recognition)
  Compliance:             ≥88% accuracy (specific fact retrieval)
  Lessons Learned:        ≥88% accuracy (narrative synthesis)

Source Citation:          ≥90% accuracy
Avg Response Time:        <2.5 seconds
P95 Response Time:        <5 seconds
══════════════════════════════════════════════════════════════
```
