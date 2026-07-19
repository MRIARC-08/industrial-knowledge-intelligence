# 📡 Instrumentation & Control Systems Registry

**Plant:** Bharat Refinery Corporation (BRC)  
**Document Type:** Instrumentation Master Registry  
**Rev:** 05 | **Date:** 2026-07-01

---

## 📊 Critical Instruments — Pressure & Temperature

| Tag | Description | Equipment/Loop | Type | Range | HART? | Calibration Due | Status |
|-----|-------------|---------------|------|-------|-------|----------------|--------|
| PI-101A-001 | P-101A Discharge Pressure | CDU Crude Feed | Rosemount 3051C | 0–30 bar g | Yes | 2026-09-01 | ✅ OK |
| PI-101A-002 | P-101A Suction Pressure | CDU Crude Feed | Rosemount 3051C | 0–10 bar g | Yes | 2026-09-01 | ✅ OK |
| TE-101A-001 | P-101A Bearing DE Temperature | CDU Pump | Pt100 RTD | 0–150°C | No | 2026-11-01 | ✅ OK |
| TE-101A-002 | P-101A Bearing NDE Temperature | CDU Pump | Pt100 RTD | 0–150°C | No | 2026-11-01 | ✅ OK |
| VI-101A-001 | P-101A Vibration Monitor (DE) | CDU Pump | Bently Nevada 3300 XL | 0–100 µm pp | N/A | Annual — 2026-12-01 | ✅ OK |
| VI-201B-001 | P-201B Vibration Monitor (DE) | VDU/FCC Pump | Bently Nevada 3300 XL | 0–100 µm pp | N/A | Annual — 2026-12-01 | ⚠️ TRIGGERED (13.7 mm/s) |
| PIT-301-001 | V-301 HDS HP Sep Pressure | HDS HP Loop | Rosemount 3051S (SIL 2) | 0–100 bar g | Yes | 2026-06-01 | ⚠️ OVERDUE 6 WEEKS |
| TIT-301-001 | V-301 HDS HP Sep Temperature | HDS HP Loop | Rosemount 3144P | -50 to 300°C | Yes | 2026-06-01 | ⚠️ OVERDUE 6 WEEKS |
| FIT-102-001 | CDU Crude Feed Flow | CDU Crude Train | Coriolis — Emerson Micro Motion F-Series | 0–1200 m³/hr | Yes | 2026-10-01 | ✅ OK |
| LIT-103-001 | CDU Overhead Accumulator Level | CDU Overhead | Guided Wave Radar — Rosemount 5300 | 0–100% | Yes | 2026-08-15 | ✅ OK |
| AI-303-001 | H₂S Analyzer — HDS Absorber Outlet | HDS H₂S Absorber | Galvanic Applied Science — Model 402 | 0–100 ppm | No | 2026-07-15 | ❌ OVERDUE (4 days) |
| GD-401-001 | Gas Detector — Utilities Compressor House | C-201 Area | Honeywell Searchline Excel | 0–100% LEL | No | 2026-07-10 | ❌ OVERDUE (9 days) |
| GD-401-002 | H₂S Detector — Utilities Compressor House | C-201 Area | RKI Instruments — Eagle | 0–100 ppm | No | 2026-07-10 | ❌ OVERDUE (9 days) |

---

## 🔒 Safety Instrumented System (SIS) — Critical Trips

### SIS-CDU-001: P-101A/B High Temperature Trip

```
SIS Loop ID:        SIS-CDU-001
Equipment:          P-101A, P-101B
Function:           Shutdown pump on high bearing temperature
Safety Integrity:   SIL 1

Trip Setpoints:
  TE-101A-001 (DE Bearing): >95°C → P-101A trip
  TE-101A-002 (NDE Bearing): >95°C → P-101A trip
  
SIS Components:
  Sensor:            Pt100 RTD (1 of 2 voting — 1oo2 architecture)
  Logic Solver:      Yokogawa ProSafe-RS SIS
  Final Element:     P-101A Motor MCC breaker (via SIL-rated relay)

Proof Test Schedule:
  Proof Test Interval: 12 months
  Last Proof Test: 2025-10-15 (PASSED — response time 2.1 seconds)
  Next Proof Test Due: 2026-10-15

PFD (Probability of Failure on Demand) target: <1×10⁻²
Actual PFD (calculated): 8.4×10⁻³ ✅ Within SIL 1 requirement
```

### SIS-HDS-001: V-301 High Pressure Trip

```
SIS Loop ID:        SIS-HDS-001
Equipment:          V-301 (HDS HP Separator)
Function:           Trip C-101A/B compressor on high vessel pressure
Safety Integrity:   SIL 2 (High consequence — H₂ service)

Trip Setpoints:
  High: 70 bar g → PAHH (alarm only)
  High-High: 72 bar g → SIS trip: C-101A/B shutdown + V-301 inlet SDV close

SIS Components:
  Sensors: PIT-301-001, PIT-301-002, PIT-301-003 (2oo3 voting)
  Logic Solver: Yokogawa ProSafe-RS SIS (redundant)
  Final Elements: 
    - SDV-301-001 (Inlet SDV — Fail Closed, spring return)
    - C-101A/B Motor trip via SIL relay

Note: ⚠️ PIT-301-001 calibration overdue (6 weeks) — RISK to SIS integrity
      Action: Calibrate immediately per WO to be raised — PRIORITY

Last Proof Test: 2025-06-01 (PASSED)
Next Proof Test: 2026-06-01 ❌ OVERDUE
```

---

## 📻 DCS (Distributed Control System) Configuration

```
DCS Vendor:         Yokogawa CENTUM VP
Version:            R6.07 (latest applied patch: 2025-11)
Controllers:        6 × FCS (Field Control Stations)
I/O Capacity:       12,800 I/O points (currently 9,245 active)
Engineering Station: 3 × HIS (Human Interface Stations)
Operator Station:   8 × OIS (Operator Interface Stations — CCR)
Historian:          Exaquantum R3.12 — 5-year data retention

Network Architecture:
  Control Network: Vnet/IP (redundant pair)
  Information Network: Ethernet (separate VLAN from control)
  Firewall: Checkpoint NGFW between OT and IT networks
  Remote Access: Secure VPN for vendor remote maintenance (Cisco AnyConnect)

Cybersecurity:
  ICS/SCADA Security Assessment: Last performed 2024-09-01
  Next Assessment Due: 2026-09-01
  NIST Manufacturing Cybersecurity Framework compliance: 87% (per 2024 assessment)
```

---

## ⚙️ Instruments Requiring Calibration (Overdue)

| Tag | Description | Last Calibrated | Overdue By | Risk |
|-----|-------------|----------------|-----------|------|
| PIT-301-001 | V-301 HDS HP Sep Pressure (SIS loop) | 2025-12-01 (6 mo interval) | 6 weeks | HIGH — SIS integrity |
| TIT-301-001 | V-301 HDS HP Sep Temperature | 2025-12-01 | 6 weeks | HIGH — SIS integrity |
| AI-303-001 | H₂S Analyzer — HDS Absorber Outlet | 2025-07-15 (12 mo interval) | 4 days | HIGH — Environmental/safety |
| GD-401-001 | Gas Detector (LEL) — C-201 area | 2025-07-10 (12 mo interval) | 9 days | HIGH — Fire/explosion safety |
| GD-401-002 | H₂S Detector — C-201 area | 2025-07-10 | 9 days | HIGH — H₂S toxicity risk |

**Action Required:** All 5 instruments above are overdue. PRIORITY work order to be raised immediately.

---

## 🔧 Instrument Failure History — 2026 YTD

| Failure ID | Date | Tag | Description | Failure Mode | MTTR (hrs) | Cost (₹) |
|-----------|------|-----|-------------|-------------|-----------|---------|
| IF-2026-001 | 2026-01-22 | LIT-103-001 | CDU Accumulator level transmitter failed — false high reading | Sensor drift → HART communication loss | 4 | 12,000 |
| IF-2026-002 | 2026-03-08 | FIT-102-001 | Coriolis meter — sensor tube fouled (waxy crude deposition) | Fouling causing zero-point error | 8 | 22,000 |
| IF-2026-003 | 2026-04-19 | GD-501-001 | FCC area gas detector — false alarm (catalyst dust) | Sensor contamination | 2 | 5,000 |
| IF-2026-004 | 2026-05-30 | TE-201B-001 | P-201B bearing temp — reading stuck at 55°C (actual 108°C) | RTD probe lead wire failure | 1 | 3,500 |
| IF-2026-005 | 2026-06-28 | VI-201B-001 | P-201B vibration — correctly read 13.7 mm/s (led to bearing replacement) | N/A — correct reading | N/A | N/A |

**Notable:** IF-2026-004 — P-201B bearing temperature was reading INCORRECTLY for unknown period.  
If reading had been correct in May (actual was 108°C), the bearing failure would have been caught earlier.  
Root cause: Lead wire corrosion — single-point failure in bearing temp monitoring.  
Recommended Action: Dual RTD redundancy for all critical pump bearing temperature monitoring.
