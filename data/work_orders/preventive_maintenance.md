# 📋 Preventive Maintenance — Schedule & Records

**Plant:** Bharat Refinery Corporation (BRC)  
**Document Type:** Preventive Maintenance Work Orders & Schedule  
**Period:** 2026 Annual PM Plan

---

## 📅 Annual PM Schedule (2026)

### Rotating Equipment — Monthly PMs

| PM Task | Equipment Scope | Frequency | Duration (hrs) | Responsible | Latest Completion |
|---------|----------------|-----------|---------------|-------------|-------------------|
| PM-ROT-01 | All operating pumps (24 units) | Monthly | 16 hrs (team) | Mech Rotating Team (Lead: **Ravi Shankar Kumar**) | 2026-07-05 |
| PM-ROT-02 | All operating compressors (8 units) | Monthly | 12 hrs (team) | Comp Specialist Team (Lead: **Suresh Narayandas Patel**) | 2026-07-08 |
| PM-ROT-03 | Vibration monitoring readings | Bi-weekly | 8 hrs | **Dineshkumar Shah** (ENG-004) | 2026-07-12 |
| PM-ROT-04 | Lube oil sampling — all rotating equipment | Monthly | 4 hrs | Oil Analysis Lab (via **Subramaniam Pillai**) | 2026-07-01 |
| PM-ROT-05 | Coupling inspection — running units | Quarterly | 24 hrs | Mech Team 1 (Lead: **Arvindkumar Singh**) | 2026-04-20 |

### PM-ROT-01 — July 2026 Execution Record

```
PM Work Order:    PM-WO-2026-07-ROT-01
Date Executed:    2026-07-05
Duration:         14.5 hours (actual vs 16 planned)
Team Lead:        Arvindkumar Ramchand Singh (MECH-004)
Inspectors:       Rameshchandra Gopal Joshi (MECH-002), Vikram Durgaprasad Singh (MECH-003)

Equipment Inspected (24 pumps):
  P-101A: ✅ Vibration 2.3 mm/s | Bearing temp 52°C | Oil level OK | Seal flush OK
  P-101B: ✅ Standby checks — no anomalies
  P-102A: ✅ Vibration 1.8 mm/s | Bearing temp 48°C | Oil level OK | Seal flush OK
  P-102B: ⚠️ Vibration 4.2 mm/s (above 3.0 trend threshold, below 7.1 alarm)
            Action: Increased monitoring frequency to weekly by Dineshkumar Shah
  P-103A: ✅ All parameters normal
  P-103B: ✅ All parameters normal  
  P-201A: ✅ Vibration 3.1 mm/s | Bearing temp 61°C | Oil level OK
  P-201B: ❌ Vibration 13.7 mm/s — CRITICAL (WO-2026-0892 raised)
  P-202A: ✅ All parameters normal
  P-202B: ✅ All parameters normal
  P-301A/B: ✅ All parameters normal
  P-302A/B: ✅ All parameters normal
  P-401A/B: ✅ Vibration 2.8/3.1 mm/s — within limits
  P-401C: ✅ Standby checks OK
  P-402A/B/C: ✅ All parameters normal
  P-501A/B: ✅ All parameters normal
  P-601A/B: ✅ All parameters normal

PM Compliance: 100% (all 24 units checked)
Anomalies Found: 2 (P-102B trending, P-201B critical)
Actions Raised: 2 WOs
```

---

## 📋 Quarterly PM Records

### PM-2026-Q2 — Compressor Annual/Quarterly Inspections

| WO | Equipment | Task | Completion Date | Finding | Action / Lead Technician |
|----|-----------|------|----------------|---------|-------------------------|
| QPM-2026-0201 | C-101A | Steam turbine governor check + trip test | 2026-04-05 | Governor drift found — recalibrated | Trip test PASSED — **Suresh Narayandas Patel** (MECH-006) |
| QPM-2026-0202 | C-101B | Standby test — auto-start, load transfer | 2026-04-06 | No anomalies | — **Suresh Narayandas Patel** (MECH-006) |
| QPM-2026-0203 | C-201A/B/C | Oil & filter change, valve inspection | 2026-04-10 | Stage 2 valve wear on C-201B — replaced | New valves installed — **Ganesh Balakrishnan Kumar** (MECH-007) |
| QPM-2026-0204 | C-301A/B | Cylinder lubrication check, crosshead pin | 2026-04-18 | C-301B valve temp high (Stage 2) | WO-2026-0915 raised — **Suresh Narayandas Patel** (MECH-006) |
| QPM-2026-0205 | C-401A/B | Seal system check, oil analysis, vibration | 2026-04-22 | Normal — slight balance deterioration on C-401A | Trend monitoring increased — **Dineshkumar Shah** (ENG-004) |

---

## 🔧 Preventive Maintenance Procedures

### SOP-PM-001: Centrifugal Pump Monthly Inspection

```
Standard Operating Procedure: SOP-PM-001
Title: Monthly Inspection of Centrifugal Pumps
Revision: 05 | Date: 2025-11-01
Authored By: Dineshkumar Hasmukh Shah (ENG-004)
Approved By: Anandkumar Venkatrao (ENG-001)
Applicable Equipment: All centrifugal pumps at BRC

SAFETY PRECAUTIONS:
  - PPE Required: Safety helmet, safety shoes, nitrile gloves, safety glasses
  - Fire Permit: Required if pump handles HC above AIT
  - Minimum team: 2 persons for rotating equipment inspection

INSPECTION STEPS:

1. VISUAL INSPECTION (5 min)
   □ Check for any leaks (pump casing, seal, drain points)
   □ Verify coupling guard is in place and intact
   □ Check for any unusual noise or vibration (subjective)
   □ Verify oil reservoir level is between MIN-MAX marks
   □ Check seal flush/quench system pressure gauge reading
   □ Record observations in log sheet

2. VIBRATION MEASUREMENT (10 min)
   □ Using Fluke 810 Vibration Tester or equivalent
   □ Measure at: Drive End Bearing (horizontal, vertical, axial)
   □ Measure at: Non-Drive End Bearing (horizontal, vertical, axial)
   □ Measure on coupling at: Motor DE bearing
   □ Record all readings in mm/s (RMS) in logsheet
   □ Compare with previous readings and alarm setpoints:
     - Normal: <3.0 mm/s RMS
     - Attention: 3.0–5.0 mm/s (increase monitoring)
     - Warning: 5.0–7.1 mm/s (plan corrective action)
     - Alarm: >7.1 mm/s (notify supervisor, may stop pump)
     - Trip: >11.2 mm/s (automatic trip or immediate stop)

3. TEMPERATURE CHECK (5 min)
   □ Using Fluke 62 MAX infrared thermometer
   □ Measure: DE bearing housing temperature
   □ Measure: NDE bearing housing temperature
   □ Measure: Motor DE and NDE bearing housing temperature
   □ Measure: Mechanical seal gland temperature (if not hot service)
   □ Reference limits:
     - Bearing Temperature Normal: <75°C
     - Bearing Temperature Alarm: 85°C
     - Bearing Temperature Trip: 95°C

4. LUBE OIL CHECK (5 min)
   □ Check oil level in sump — verify between MIN and MAX
   □ Visually inspect oil color through sight glass:
     - Clear/Golden = OK
     - Milky/Cloudy = Water contamination — ALERT
     - Dark/Black = Oxidation — plan oil change
   □ Check oil cooler flow (if applicable) — verify flow indicator

5. SEAL SYSTEM CHECK (5 min)
   □ Check Plan 53B accumulator nitrogen pressure (should be 2–3 bar above seal)
   □ Check buffer fluid level in accumulator sight glass
   □ Record seal buffer fluid pressure: _____ bar g
   □ Check for external leakage: trace leakage <1 drop/min is acceptable
   □ Any continuous flow = REPORT to supervisor immediately

6. DOCUMENTATION (5 min)
   □ Complete inspection logsheet (Form PM-001-LOG)
   □ Sign and date log sheet
   □ Enter data in CMMS system (work order closure)
   □ Raise corrective WO if any anomaly found
   □ Escalate critical findings immediately via phone

Total Estimated Time: 30 minutes per pump
Frequency: Monthly (on or before last Friday of month)
```

---

## 📊 PM Performance Dashboard — 2026 YTD

| Metric | Jan | Feb | Mar | Apr | May | Jun | Jul | Target | Accountable |
|--------|-----|-----|-----|-----|-----|-----|-----|--------|-------------|
| PM Completion % | 98% | 100% | 97% | 99% | 100% | 98% | 95%* | >95% | **Anandkumar Venkatrao** |
| PM On-Time % | 95% | 97% | 91% | 98% | 100% | 96% | 92%* | >90% | **Anandkumar Venkatrao** |
| PM-Preventable Failures | 2 | 0 | 1 | 0 | 1 | 2 | 1* | <2/mo | **Dineshkumar Shah** |
| PM Hours Worked | 485 | 490 | 462 | 510 | 495 | 478 | 420* | 480–520 | **Nalini Subramanian** |
| Emergency → Planned Ratio | 12:88 | 10:90 | 15:85 | 8:92 | 9:91 | 14:86 | 11:89* | <15:85 | **Nalini Subramanian** |

*July data as of 2026-07-19 (partial month)

### Key Observations:
- March PM compliance dropped due to HDS unit upset — resource diverted to emergency
- June had 2 PM-preventable failures (P-102B bearing, C-301B valve) — both trending
- Overall 2026 YTD PM compliance: **98.1%** — exceeding target
