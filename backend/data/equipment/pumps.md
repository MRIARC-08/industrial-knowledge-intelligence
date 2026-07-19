# 🔩 Equipment Master Registry — Pumps

**Plant:** Bharat Refinery Corporation (BRC), Vadodara  
**Unit:** All Process Units  
**Document Type:** Equipment Master Registry  
**Rev:** 04 | **Date:** 2026-07-01  

---

## 📋 Centrifugal Pumps — Full Fleet

| Tag | Name | Service | Unit | Rated Flow (m³/hr) | Head (m) | Driver HP | Status | Last Inspection |
|-----|------|---------|------|---------------------|----------|-----------|--------|-----------------|
| P-101A | Crude Charge Pump A | Crude Oil Feed | CDU | 850 | 185 | 750 | Operational | 2026-04-15 |
| P-101B | Crude Charge Pump B | Crude Oil Feed (Standby) | CDU | 850 | 185 | 750 | Standby | 2026-04-18 |
| P-102A | Kerosene Rundown Pump A | Kerosene Product | CDU | 120 | 75 | 55 | Operational | 2026-03-22 |
| P-102B | Kerosene Rundown Pump B | Kerosene Product (Standby) | CDU | 120 | 75 | 55 | Warning | 2026-01-10 |
| P-103A | Diesel Product Pump A | Diesel Transfer | CDU | 340 | 95 | 125 | Operational | 2026-05-01 |
| P-103B | Diesel Product Pump B | Diesel Transfer (Standby) | CDU | 340 | 95 | 125 | Operational | 2026-05-05 |
| P-201A | FCC Feed Pump A | Vacuum Gas Oil | VDU | 480 | 220 | 400 | Operational | 2026-02-28 |
| P-201B | FCC Feed Pump B | Vacuum Gas Oil (Standby) | VDU | 480 | 220 | 400 | Critical | 2025-12-01 |
| P-202A | Slurry Recirculation A | FCC Slurry | FCC | 280 | 165 | 250 | Operational | 2026-06-01 |
| P-202B | Slurry Recirculation B | FCC Slurry (Standby) | FCC | 280 | 165 | 250 | Operational | 2026-06-03 |
| P-301A | Amine Circulation Pump A | DEA Solution | HDS | 95 | 55 | 30 | Operational | 2026-01-20 |
| P-301B | Amine Circulation Pump B | DEA Solution (Standby) | HDS | 95 | 55 | 30 | Operational | 2026-01-25 |
| P-302A | Sour Water Stripper Bottoms A | Sour Water | HDS | 65 | 45 | 15 | Operational | 2026-03-10 |
| P-302B | Sour Water Stripper Bottoms B | Sour Water (Standby) | HDS | 65 | 45 | 15 | Operational | 2026-03-12 |
| P-401A | Cooling Water Circ Pump A | Cooling Water | Utilities | 3200 | 30 | 400 | Operational | 2026-04-20 |
| P-401B | Cooling Water Circ Pump B | Cooling Water | Utilities | 3200 | 30 | 400 | Operational | 2026-04-22 |
| P-401C | Cooling Water Circ Pump C | Cooling Water (Standby) | Utilities | 3200 | 30 | 400 | Standby | 2026-04-25 |
| P-402A | BFW Pump A | Boiler Feed Water | Utilities | 180 | 1200 | 900 | Operational | 2026-05-10 |
| P-402B | BFW Pump B | Boiler Feed Water | Utilities | 180 | 1200 | 900 | Operational | 2026-05-12 |
| P-402C | BFW Pump C | Boiler Feed Water (Standby) | Utilities | 180 | 1200 | 900 | Standby | 2026-05-14 |
| P-501A | ARDS Feed Pump A | AR + DA Mix | ARDS | 620 | 260 | 600 | Operational | 2026-03-05 |
| P-501B | ARDS Feed Pump B | AR + DA Mix (Standby) | ARDS | 620 | 260 | 600 | Operational | 2026-03-08 |
| P-601A | LPG Product Pump A | LPG Bottling | Offsite | 45 | 35 | 11 | Operational | 2026-06-10 |
| P-601B | LPG Product Pump B | LPG Bottling (Standby) | Offsite | 45 | 35 | 11 | Operational | 2026-06-12 |

---

## 🔧 Reciprocating Pumps

| Tag | Name | Service | Stroke (mm) | Plungers | Capacity (L/min) | Max Pressure (bar) | Status |
|-----|------|---------|-------------|---------|-----------------|-------------------|--------|
| P-151A | Chemical Injection Pump A | Corrosion Inhibitor Dosing | 60 | 1 | 12 | 280 | Operational |
| P-151B | Chemical Injection Pump B | Biocide Dosing | 60 | 1 | 8 | 280 | Operational |
| P-152A | Metering Pump A | Caustic Dosing | 45 | 2 | 6 | 150 | Operational |
| P-152B | Metering Pump B | Phosphate Dosing | 45 | 2 | 6 | 150 | Warning |
| P-153A | High-Pressure Injection A | Catalytic Inhibitor | 80 | 3 | 20 | 450 | Operational |

---

## ⚙️ Detailed Equipment Specs — Critical Pumps

### P-101A — Crude Charge Pump A (Primary)

```
Manufacturer:          Flowserve Corporation
Model:                 DVSH 14×14-20 (Double Volute)
Serial No:             FLW-2018-04521
Commissioned:          2018-11-15
API Standard:          API 610, 12th Edition
Seal Type:             Dual Mechanical Seal (API Plan 53B)
Seal Vendor:           John Crane — Model HPXE
Impeller Material:     12Cr Stainless Steel
Casing Material:       ASTM A216 WCB
Shaft Material:        AISI 4140

Design Conditions:
  Flow:                850 m³/hr
  Head:                185 m
  Speed:               1480 rpm
  NPSH Required:       4.2 m
  Efficiency:          78%
  BEP Flow:            820 m³/hr
  
Operating Limits:
  Max Discharge Pressure:  22 bar g
  Max Suction Pressure:    3.5 bar g
  Max Temperature:         85°C
  Minimum Flow:            220 m³/hr (25% of rated)
  Vibration Alarm:         7.1 mm/s RMS
  Vibration Trip:          11.2 mm/s RMS
  Bearing Temp Alarm:      85°C
  Bearing Temp Trip:       95°C

Motor Details:
  Manufacturer:         ABB
  Power:                750 kW (1005 HP)
  Voltage:              6.6 kV
  Current FLA:          86 A
  Insulation Class:     F (rated)
  Speed:                1490 rpm
  Frame:                IEC 450

Bearing Schedule:
  DE Bearing:           SKF 6318/C3 (Ball)
  NDE Bearing:          SKF NU 318 ECM/C3 (Cylindrical Roller)
  Lubrication:          Shell Tellus 46 Oil, 4L sump
  Oil Change:           Every 8,000 operating hours
  
Last Major Overhaul:   2024-03-18
Next Scheduled PM:     2026-09-15
Criticality Rating:    A (Production Critical)
Spare Availability:    P-101B (standby), one bare shaft in warehouse
```

### P-201B — FCC Feed Pump B (CRITICAL)

```
Status:                CRITICAL — High vibration trending
Manufacturer:          KSB AG
Model:                 RDLD 250-500 B
Serial No:             KSB-2019-07834
Commissioned:          2019-03-22

Current Issue (as of 2026-06-28):
  DE Bearing vibration:  13.7 mm/s (ABOVE TRIP SETPOINT)
  Vibration trend:       Increasing 0.3 mm/s per week
  Last oil analysis:     Metallic particles detected (Fe: 85 ppm, Cr: 12 ppm)
  Root Cause (prelim):   Bearing fatigue — initiated WO-2026-0892

Immediate Actions Required:
  1. Switch to P-201A (if not already running)
  2. Prepare for emergency bearing replacement
  3. Schedule shutdown within 5 days
  4. Order SKF 7222 BECBM bearings (Part No: 7222-SKF)
```

---

## 🔄 Pump Failure Modes & Symptoms

| Failure Mode | Root Cause Categories | Observable Symptoms | Detection Method |
|--------------|-----------------------|---------------------|-----------------|
| Bearing Failure | Overload, contamination, fatigue, misalignment | High vibration, noise, heat, oil discoloration | Vibration analysis, oil sampling, thermography |
| Mechanical Seal Failure | Dry running, misalignment, erosion, chemical attack | Leakage, loss of buffer fluid pressure, seal flush flow change | Visual, pressure transmitter, flow indicator |
| Impeller Erosion | Cavitation, sand/abrasive content, material selection | Reduced flow/head, increased power, noise, pitting | Performance curve deviation, visual on dismantling |
| Cavitation | Insufficient NPSH, high suction temp, blocked strainer | Crackling noise, pitting, vibration, head collapse | Flow, pressure, noise monitoring |
| Shaft Misalignment | Thermal growth, improper alignment, foundation settle | High vibration (1× or 2× RPM), bearing heat, coupling wear | Vibration spectrum, laser alignment check |
| Wear Ring Erosion | High flow operation, particulates, corrosion | Recirculation internally, efficiency drop, increased power | Performance test, dismantling inspection |
| Motor Failure | Winding insulation, overload, single phasing | High motor current, heat, vibration, failure to start | Megger test, IR thermography, current monitoring |

---

## 📊 Fleet KPIs (Current Period: 2026 Q2)

| KPI | Target | Actual Q2-2026 | Status |
|-----|--------|----------------|--------|
| Pump Fleet Availability | >97% | 96.2% | ⚠️ Warning |
| Mean Time Between Failures (MTBF) | >18 months | 14.3 months | ❌ Below Target |
| Seal MTBF | >24 months | 19.8 months | ⚠️ Warning |
| Pump PM Compliance | >95% | 98.1% | ✅ On Target |
| Vibration-Related Failures | <3/year | 5 YTD | ❌ Above Target |
| Oil Contamination Events | <2/year | 1 YTD | ✅ On Target |
| Emergency WOs (Pump-Related) | <10% of total | 13.4% | ❌ Above Target |
