# ⚠️ Safety Incidents & Root Cause Analysis Reports

**Plant:** Bharat Refinery Corporation (BRC)  
**Document Type:** Safety Incident & RCA Database  
**Classification:** Confidential — For Internal Use Only  
**Period:** 2022-2026

---

## 🔴 Major Incidents (2022–2026)

---

### INC-2026-001 — P-201B Bearing Failure & Near-Miss Overheat

```
Incident Number:   INC-2026-001
Date/Time:         2026-06-28 | 14:35 hrs
Location:          VDU Pump House — P-201B (FCC Feed Pump B)
Classification:    NEAR-MISS (Category 2)
Severity:          HIGH — Potential for pump fire if bearing seized

INCIDENT DESCRIPTION:
  During routine operator rounds at 14:35, operator Pradeepkumar Ramnaresh Sharma (OPR-001) 
  observed unusual noise from P-201B (high-pitched whining). Vibration monitor 
  display showed 13.7 mm/s — above the trip setpoint of 11.2 mm/s. 
  Emergency stop was initiated at 14:38.

  On inspection: DE bearing housing temperature was 121°C (normal <75°C).
  NDE bearing temperature: 108°C. Bearing oil showed heavy metallic particles
  (Fe: 185 ppm vs normal <20 ppm). Bearing discolored/bluish due to overheating.

IMMEDIATE ACTIONS:
  14:38 — P-201B manually stopped by Pradeepkumar Ramnaresh Sharma (OPR-001)
  14:40 — Shift supervisor Rajesh Babulal Mehta (OPR-002) notified
  14:45 — P-201A switched to take full FCC feed load
  14:50 — P-201B isolated (electrical LOTO + piping blinds) by Jayaram Srinivasan (ELEC-001) and Nareshkumar Yadav (MECH-008)
  15:20 — Maintenance team dispatched (Ravi Shankar Kumar, MECH-001)
  15:45 — Work Order WO-2026-0892 raised (Emergency) by Rajesh Babulal Mehta
  16:00 — Safety team investigation initiated by Kavya Suresh Nair (ENG-002)

PEOPLE INVOLVED:
  Operator:          Pradeepkumar Ramnaresh Sharma (OPR-001, Shift A)
  Shift Supervisor:  Rajesh Babulal Mehta (OPR-002)
  Maintenance Lead:  Ravi Shankar Kumar (MECH-001)
  Safety Officer:    Kavya Suresh Nair (ENG-002)
  Lead Investigator: Kavya Suresh Nair (ENG-002)

ROOT CAUSE ANALYSIS (5-Why):

  Why 1: Why did the bearing fail?
  → Bearing fatigue due to running with contaminated lubricating oil

  Why 2: Why was the oil contaminated?
  → Water ingress into the oil sump through a degraded lip seal on the bearing housing

  Why 3: Why was the lip seal degraded?
  → Lip seal was last replaced in 2021 and exceeded its 4-year service life (now 5 years)

  Why 4: Why wasn't the lip seal replaced at 4-year interval?
  → No PM task existed specifically for bearing housing lip seal replacement — 
    only visual inspection of external seal condition (not replacement trigger)

  Why 5: Why was there no lip seal replacement PM?
  → OEM recommendation for lip seal replacement was in the German-language manual 
    appendix and was not captured in the BRC maintenance strategy by Anandkumar Venkatrao (ENG-001)

CONTRIBUTING FACTORS:
  - Oil analysis from May 2026 showed Fe: 85 ppm (elevated) but no action was triggered by Dineshkumar Shah (ENG-004)
  - Alert threshold in CMMS for Fe was set at 100 ppm (should be 50 ppm per OEM)
  - Vibration trending showed slow increase over 3 months but no WO was raised

IMMEDIATE CORRECTIVE ACTIONS:
  1. P-201B de-isolated, bearing replaced by Ravi Shankar Kumar (MECH-001) (completed 2026-07-02)
  2. Oil analysis thresholds updated in CMMS: Fe alarm = 50 ppm (was 100 ppm) by Dineshkumar Shah (ENG-004)
  3. Lip seal inspection added to next PM cycle for all 24 pumps by Anandkumar Venkatrao (ENG-001)
  4. OEM manuals reviewed for German appendices — 3 more hidden PMs found by Anandkumar Venkatrao (ENG-001)

LONG-TERM CORRECTIVE ACTIONS (with owners and dates):
  1. Anandkumar Venkatrao (ENG-001): Review all OEM manuals for hidden/missed PMs (SOP-MM-007) — by 2026-09-01
  2. Dineshkumar Shah (ENG-004): Update all oil analysis alert thresholds (SOP-OA-005) — by 2026-08-01
  3. Dineshkumar Shah (ENG-004): Implement 6-month oil analysis review meeting — by 2026-08-15
  4. Anandkumar Venkatrao (ENG-001): Add lip seal replacement to 4-year PM for all pumps — by 2026-09-01
  5. Ravi Shankar Kumar (MECH-001): Conduct refresher training (TRN-2026-003) on reading vibration trends — by 2026-08-31

LESSONS LEARNED:
  LL-2026-001: OEM maintenance instructions in appendices or non-English sections 
  may not be captured in CMMS strategy. Systematic review of all OEM manuals needed. (Authored by Kavya Suresh Nair)

  LL-2026-002: Elevated oil analysis readings should trigger WO creation even if 
  below absolute alarm limit. Trend analysis is more important than single readings. (Authored by Dineshkumar Shah)

REGULATORY NOTIFICATION:
  Not required (No personnel injury, no release to environment, contained failure)

COST OF INCIDENT:
  Parts (bearing replacement): ₹85,000
  Labour: ₹32,000
  Production impact (partial throughput reduction 2 hrs): ₹2,20,000 (estimated)
  Total: ₹3,37,000
```

---

### INC-2025-012 — Hot Oil Spill at CDU Area

```
Incident Number:   INC-2025-012
Date/Time:         2025-05-10 | 09:15 hrs
Location:          CDU Area — Crude Charge Pump P-101A seal vicinity
Classification:    ENVIRONMENTAL SPILL (Tier 1) + NEAR-FIRE
Severity:          HIGH

INCIDENT DESCRIPTION:
  During startup of P-101A after seal replacement (WO-2025-0089) by Rameshchandra Gopal Joshi (MECH-002), 
  operator Amit Shivkumar Tiwari (OPR-003) noticed hot crude oil spray from mechanical seal area. 
  Crude at ~85°C. Approximately 40 litres spilled onto bunded area before emergency stop 
  by Amit Shivkumar Tiwari (OPR-003).
  Hot crude contacted metal surface (deck grating) but did not ignite.
  No personnel injury — all operators were behind the guard during startup.

ROOT CAUSE:
  New mechanical seal cartridge installed without removing transport collar by Rameshchandra Gopal Joshi (MECH-002).
  Seal faces were held in 'transport position' (faces separated) and could not
  function. Faces contacted upon pressurization, causing immediate failure.

DIRECT CAUSE:
  Technician (Rameshchandra Gopal Joshi) installed seal without following pre-installation checklist item:
  "Remove transport collar/set screws before installation"

ROOT CAUSE (Systemic):
  Pre-installation checklist was paper-based and had been modified with handwriting
  by an unknown previous technician to remove the transport collar check. Digital checklists not in use.

INVESTIGATORS:
  Lead: Kavya Suresh Nair (ENG-002)
  Team: Ankitkumar Rajesh Mehra (ENG-003), Rameshchandra Gopal Joshi (MECH-002)
  Reviewed By: Deepa Krishnamurthy (MGT-004)

CORRECTIVE ACTIONS:
  1. Immediate: Spill cleaned up by Aisha Tariq Khan's (ENG-009) environmental team — waste sent to authorized disposal
  2. Digital pre-installation checklists (SOP-LS-006) implemented in CMMS (mandatory sign-off) by Rameshchandra Gopal Joshi (MECH-002) and Anandkumar Venkatrao (ENG-001)
  3. Toolbox talk (TRN-2026-002) conducted with all mechanical technicians by Rameshchandra Gopal Joshi (MECH-002)
  4. John Crane seal vendor re-trained installation team on proper seal installation (coordinated by Ravi Shankar Kumar)

REGULATORY ACTION:
  Incident reported to Gujarat Factory Inspectorate (as required for HC spill >10L) by Deepa Krishnamurthy (MGT-004)
  Regulatory Reference: The Factories Act 1948 — Section 38
  Factory Inspector Visit: 2025-05-15 (accompanied by Kavya Suresh Nair and Deepa Krishnamurthy)
  Result: No enforcement action; improvement notice issued

LESSONS LEARNED:
  LL-2025-012: Transport collars/setting clips must be on a mandatory pre-startup 
  visual checklist — paper checklists with handwritten modifications are unreliable.
  Digital, mandatory checklists with supervisor sign-off must be implemented. (Authored by Kavya Suresh Nair)
```

---

## 🟡 Near-Miss Events (2026 YTD)

| Incident No | Date | Location | Description | Lead Investigator | Severity | Closed? |
|-------------|------|---------|-------------|-------------------|---------|---------|
| NM-2026-001 | 2026-01-07 | CDU Pump House | P-101A started with partially closed suction valve by Pradeepkumar Sharma — dry running 4 min | **Kavya Suresh Nair** (ENG-002) | HIGH | ✅ Yes |
| NM-2026-002 | 2026-02-28 | HDS Unit | Operator (Mohandas Das) entered vessel V-303 without gas test — STOP WORK issued by Rajesh Mehta | **Kavya Suresh Nair** (ENG-002) | HIGH | ✅ Yes |
| NM-2026-003 | 2026-03-15 | Utilities | BFW pump P-402B low suction alarm — strainer partially blocked, caught by Sunita Desai | **Dineshkumar Shah** (ENG-004) | MEDIUM | ✅ Yes |
| NM-2026-004 | 2026-04-02 | FCC Area | Hot work near fuel gas line without isolation verification by Kiran Patel | **Kavya Suresh Nair** (ENG-002) | HIGH | ✅ Yes |
| NM-2026-005 | 2026-05-20 | Offloading | Crude offloading arm disconnected before pressure equalized by Hari Prasad — small spill | **Kavya Suresh Nair** (ENG-002) | HIGH | ✅ Yes |
| NM-2026-006 | 2026-06-28 | VDU Pump House | P-201B bearing failure with high temperature — potential fire (Pradeepkumar Sharma) | **Kavya Suresh Nair** (ENG-002) | HIGH | 🔄 In Progress |
| NM-2026-007 | 2026-07-10 | CDU Column | CDU V-101 tray inspection ladder left inside column before closure by Manojkumar Gupta | **Ankitkumar Mehra** (ENG-003) | MEDIUM | ✅ Yes |

---

## 📚 Lessons Learned Database

| LL Number | Source Incident | Lesson | Applicable Equipment | Author | Distributed? |
|-----------|----------------|--------|---------------------|--------|--------------|
| LL-2022-001 | INC-2022-003 (Compressor surge) | Anti-surge recycle valve must be open before speed ramp-up | All centrifugal compressors | **Dineshkumar Shah** | ✅ Yes |
| LL-2022-002 | NM-2022-018 (Pump cavitation) | NPSH margin <1.2 should trigger immediate flow reduction investigation | All centrifugal pumps | **Dineshkumar Shah** | ✅ Yes |
| LL-2023-005 | INC-2023-001 (H₂ leak) | H₂ detector calibration every 6 months is mandatory — not optional | HDS, ARDS units | **Meenakshi Iyer** | ✅ Yes |
| LL-2024-002 | NM-2024-009 (Blind flange wrong rating) | All blind flanges must be stamped with pressure rating — color-coding not sufficient | All flanged connections | **Arvindkumar Singh** | ✅ Yes |
| LL-2025-012 | INC-2025-012 (Seal spill) | Seal transport collar removal must be on mandatory digital checklist (SOP-LS-006) | All mechanical seal installations | **Kavya Suresh Nair** | ✅ Yes |
| LL-2026-001 | INC-2026-001 (Bearing failure) | OEM manuals in appendices may have hidden PMs — systematic review required (SOP-MM-007) | All rotating equipment | **Kavya Suresh Nair** | 🔄 In distribution |
| LL-2026-002 | INC-2026-001 (Bearing failure) | Oil analysis trend alerts are more important than absolute alarm thresholds (SOP-OA-005) | All lube oil systems | **Dineshkumar Shah** | 🔄 In distribution |

---

## 📊 Safety Performance (2026 YTD vs Targets)

| KPI | Target | YTD 2026 | Previous Year (2025) | Status | Accountable Executive |
|-----|--------|----------|---------------------|--------|----------------------|
| Lost Time Injury Rate (LTIR) | 0.0 | 0.0 | 0.0 | ✅ On Track | Deepa Krishnamurthy (MGT-004) |
| Total Recordable Incident Rate (TRIR) | <0.3 | 0.18 | 0.22 | ✅ On Track | Deepa Krishnamurthy (MGT-004) |
| Near-Miss Reports | >15/year (encourage reporting) | 7 (at mid-year) | 14 | ⚠️ Below trend | Kavya Suresh Nair (ENG-002) |
| High-Potential Incidents | <3/year | 4 (HIGH severity NMs) | 6 | ⚠️ Monitor | Deepa Krishnamurthy (MGT-004) |
| Root Cause Analysis Closure | >95% within 30 days | 92% | 89% | ⚠️ Below target | Kavya Suresh Nair (ENG-002) |
| Lessons Learned Distribution | 100% within 45 days | 85% | 91% | ⚠️ Below target | Nalini Subramanian (MGT-002) |
| Safety Observation Cards Raised | >500/year | 298 (mid-year) | 612 | ✅ On Track | All Department Heads |
