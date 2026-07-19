# 🧪 Failure History — Equipment Failure Event Database

**Plant:** Bharat Refinery Corporation (BRC)  
**Document Type:** Equipment Failure History Database  
**Period:** 2018–2026  
**Purpose:** RCA reference, pattern analysis, lessons learned

---

## 🔩 Pump Failure History (2018–2026)

| Failure ID | Date | Equipment | Failure Mode | Symptoms | Root Cause | Downtime (hrs) | Cost (₹) | Recurrence |
|-----------|------|-----------|-------------|----------|-----------|----------------|---------|-----------|
| PF-2018-001 | 2018-03-12 | P-101A | Mechanical seal failure | External leakage, buffer pressure loss | Dry running during commissioning — suction valve closed | 18 | 95,000 | No |
| PF-2018-002 | 2018-07-25 | P-202A | Impeller erosion/cavitation | Head drop, noise, vibration | Suction strainer partially blocked — NPSH degraded | 36 | 1,85,000 | Yes (2025) |
| PF-2019-001 | 2019-02-08 | P-102B | Bearing failure (NDE) | High vibration (8.4 mm/s), heat 98°C | Oil contamination — water ingress through lip seal | 24 | 78,000 | Yes (2026) |
| PF-2019-002 | 2019-09-15 | P-401A | Motor winding failure | Failed to start, High insulation resistance | Winding insulation degraded — VFD harmonics damage | 12 | 2,45,000 | No |
| PF-2020-001 | 2020-04-10 | P-301A | Coupling failure | Unusual noise, vibration | Misalignment after piping modification — thermal growth not accounted | 8 | 42,000 | No |
| PF-2020-002 | 2020-11-22 | P-501A | Shaft seal failure — API Plan 53B rupture disk | Loss of barrier fluid | Overpressure of buffer fluid — control valve failure | 14 | 62,000 | No |
| PF-2021-001 | 2021-03-18 | P-101B | Mechanical seal face crack | Progressive leakage increase | Thermal shock — steam purge too hot applied to seal chamber | 20 | 1,10,000 | No |
| PF-2021-002 | 2021-08-05 | P-402C | Strainer fouling — startup failed | Zero flow on startup | BFW strainer blocked by magnetite scale | 4 | 8,000 | No |
| PF-2022-001 | 2022-01-20 | P-201A | Impeller wear ring erosion | Efficiency drop 12%, high power | High solids content in VGO feed during FCC catalyst changeover | 72 | 3,20,000 | No |
| PF-2022-002 | 2022-06-30 | P-103B | Bearing failure (DE) | Vibration 9.1 mm/s, smell of burnt oil | Bearing overloaded — misalignment after foundation settlement | 20 | 95,000 | No |
| PF-2022-003 | 2022-09-14 | P-302A | Pump casing crack (minor) | Small external HC leak at casing rib | Manufacturing defect + hydrogen stress cracking in amine service | 96 | 8,50,000 | No |
| PF-2023-001 | 2023-02-25 | P-101A | Seal failure (same as 2018) | External leakage | Operator error — pump started with discharge valve closed (deadheading) | 16 | 1,25,000 | Yes |
| PF-2023-002 | 2023-07-12 | P-201B | Bearing failure | Vibration 7.8 mm/s | Insufficient bearing clearance — wrong SKF clearance class (C2 vs C3) | 30 | 1,40,000 | No |
| PF-2024-001 | 2024-03-18 | P-101A | Mechanical seal — planned replacement (end of life) | N/A — preventive | 5-year seal service life reached | 42 | 1,45,000 | N/A |
| PF-2024-002 | 2024-06-05 | P-301B | Pump dry running — suction loss | No flow, cavitation noise | Suction tank level dropped below pump suction — low level alarm masked | 6 | 22,000 | No |
| PF-2025-001 | 2025-01-15 | P-101B | Bearing failure (NDE) | Vibration 8.2 mm/s (alarm), heat 89°C | Vibration-induced fatigue — previous misalignment history | 28 | 95,000 | Yes (pattern) |
| PF-2025-002 | 2025-07-18 | P-202A | Impeller erosion/cavitation | Head drop, crackling noise | Suction strainer blocked again — recurring pattern (2018, 2025) | 48 | 2,20,000 | Yes — 3rd event |
| PF-2025-003 | 2025-09-01 | P-201A | Minor shaft seal leakage | Weeping at gland | Normal end-of-life — 6 years since installation | 0 | 0 | N/A |
| PF-2026-001 | 2026-01-08 | P-101A | Mechanical seal thermal crack | Seal leakage — dry running damage | Started with suction valve partially closed (human error) | 42.75 | 1,73,500 | Yes — 2nd similar |
| PF-2026-002 | 2026-06-28 | P-201B | Bearing failure (DE+NDE) | Vibration 13.7 mm/s, temp 121°C | Oil contamination + lip seal degraded (overdue replacement) | 84 | 3,37,000 | Yes — 2nd event |

---

## 📊 Failure Pattern Analysis

### Top Recurring Failure Modes

| Rank | Failure Mode | Total Events (2018–2026) | Avg Cost/Event (₹) | Equipment Most Affected |
|------|-------------|------------------------|-------------------|------------------------|
| 1 | Mechanical Seal Failure | 8 events | 1,08,000 | P-101A (3×), P-101B (1×), others |
| 2 | Bearing Failure | 7 events | 1,17,000 | P-201B (2×), P-101B (1×), others |
| 3 | Impeller Erosion/Cavitation | 3 events | 2,42,000 | P-202A (2×), P-201A (1×) |
| 4 | Motor/Electrical Failure | 2 events | 1,60,000 | P-401A (1×), others |
| 5 | Coupling/Shaft Failure | 2 events | 52,000 | P-301A (1×), others |

### Recurring Failure Alert — P-202A Cavitation (CRITICAL PATTERN)

```
Equipment: P-202A (FCC Slurry Recirculation Pump A)
Failure Mode: Impeller erosion from cavitation
Event History:
  - 2018-07-25 (PF-2018-002): First event — strainer blocked
  - 2025-07-18 (PF-2025-002): Second event — strainer blocked again (7 years)
  
Root Cause (Both events): Suction strainer fouling causing NPSH degradation

Why is this recurring?
  - Strainer differential pressure gauge calibration: FAILED (not included in PM)
  - Strainer cleaning interval: Every 6 months (PM-STR-202)
  - But: No condition-based strainer cleaning trigger exists
  - FCC slurry service: high catalyst particle content leads to faster fouling

Recommended PERMANENT FIX:
  1. Install differential pressure transmitter across suction strainer
  2. Set alarm at 0.3 bar (NPSH margin starts to reduce)
  3. Add online strainer bypass to allow cleaning without pump shutdown
  4. Reduce strainer cleaning interval to 3 months
  5. Consider duplex strainer arrangement (investment: ₹8,50,000)
  
Status of Recommendation: Under engineering review (Eng. Change Request ECR-2025-042)
```

### Recurring Failure Alert — P-101A Mechanical Seal (CRITICAL PATTERN)

```
Equipment: P-101A (Crude Charge Pump A)
Failure Mode: Mechanical seal failure (dry running / thermal crack)
Event History:
  - 2018-03-12 (PF-2018-001): Commissioning error — suction valve closed
  - 2023-02-25 (PF-2023-001): Startup with discharge valve closed
  - 2026-01-08 (PF-2026-001): Startup with suction valve partially closed

Pattern: All 3 events are human-error related — improper valve position at startup

Root Cause (Systemic): No interlocking or pre-startup checklist verification
  forces operators to confirm valve positions before pump start.

Permanent Fix Options:
  Option A: Install valve position switches with interlock (Cost: ₹3,20,000)
  Option B: Mandatory digital pre-startup checklist with supervisor sign-off
            in DCS/CMMS before start command enabled
  
Decision: Option B selected as interim (already implemented Jan 2026)
          Option A under consideration for next capital budget cycle
```

---

## 🔬 Failure Mode Library (Reference)

### Mechanical Seals — Failure Cause Tree

```
Mechanical Seal Failure
├── Dry Running
│   ├── Suction valve closed/partially open at startup
│   ├── Suction blockage (strainer, check valve)
│   ├── Low liquid level in suction vessel
│   └── Vapor lock (flashing service)
├── Thermal Shock
│   ├── Steam purge at excessive temperature
│   ├── Hot pump restarted without cool-down
│   └── Large temperature differential at startup
├── Chemical Attack
│   ├── Wrong seal face material for fluid
│   ├── O-ring material incompatibility
│   └── pH excursion beyond seal design range
├── Mechanical Damage
│   ├── Misalignment of pump shaft
│   ├── Shaft whirl/vibration
│   ├── Incorrect installation (transport collar left on)
│   └── Over-tightened seal gland bolts
└── End of Life
    ├── Normal face wear (12,000–20,000 hrs typical)
    ├── O-ring aging/hardening
    └── Spring fatigue
```

### Bearing Failure — ISO 15243 Classification

```
Rolling Bearing Failure (ISO 15243)
├── Fatigue
│   ├── Surface-initiated — spalling at subsurface origin
│   └── Subsurface-initiated — classical rolling contact fatigue
├── Wear
│   ├── Abrasive wear (contamination)
│   ├── Adhesive wear (false brinelling, smearing)
│   └── Fretting corrosion (vibration-induced)
├── Corrosion
│   ├── Moisture corrosion
│   ├── Corrosion fatigue
│   └── Fretting corrosion
├── Electrical Erosion
│   ├── Spark erosion (electrical discharge)
│   └── Current leakage corrosion (VFD-driven motors)
├── Plastic Deformation
│   ├── Overload (static or shock)
│   └── Indentations from debris or incorrect mounting
└── Fracture and Cracking
    ├── Forced fracture (overload)
    ├── Fatigue fracture
    └── Thermal cracking
```
