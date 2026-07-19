# 📖 OEM Manuals — Pump Technical Specifications

**Plant:** Bharat Refinery Corporation (BRC)  
**Document Type:** OEM Equipment Specifications & Vendor Reference Data  

---

## 🏭 Vendor Directory

| Vendor | Equipment Type | Contact | Regional Office | Support Email |
|--------|---------------|---------|-----------------|---------------|
| Flowserve Corporation | Pumps (P-101A/B, P-103A/B) | +91-22-xxxx | Mumbai | india.support@flowserve.com |
| KSB AG | Pumps (P-201A/B, P-402A/B/C) | +91-20-xxxx | Pune | ksb.india@ksb.com |
| Elliott Group (Ebara) | Compressors (C-102A/B) | +1-xxx-xxx | USA (remote) | elliott.support@ebara.com |
| SKF India | Bearings (all rotating equipment) | +91-80-xxxx | Bangalore | skf.india@skf.com |
| John Crane India | Mechanical Seals (P-101 series) | +91-22-xxxx | Mumbai | johncrane.india@smiths.com |
| EagleBurgmann India | Dry Gas Seals (C-102, C-101) | +91-22-xxxx | Mumbai | india@eagleburgmann.com |
| ABB India | Motors (large MV pumps) | +91-80-xxxx | Bangalore | abb.india@in.abb.com |
| Bently Nevada (Baker Hughes) | Vibration Monitoring | +91-22-xxxx | Mumbai | bently.india@bakerhughes.com |
| Yokogawa India | DCS, SIS, Instrumentation | +91-80-xxxx | Bangalore | yokogawa.india@in.yokogawa.com |
| Rosemount (Emerson) | Pressure/Temperature transmitters | +91-22-xxxx | Mumbai | emerson.india@emerson.com |

---

## 📐 Pump Torque Specifications (OEM Data)

### P-101A/B — Flowserve DVSH 14×14-20

```
Coupling Bolt Torque:
  Coupling Hub to Shaft (Taper fit):    Hydraulic installation — 150 bar hydraulic pressure
  Coupling Bolts (M20, Grade 8.8):      280 N·m (dry) / 250 N·m (lubricated with Molykote)

Impeller Nut Torque:
  Impeller Lock Nut (M50 × 1.5P):      680 N·m (use anti-seize compound — Molykote P-37)
  Direction:                             Left-hand thread (tightens with forward rotation)

Bearing Housing Bolts:
  Bearing End Cover Bolts (M12, Grade 8.8): 85 N·m
  Bearing Retaining Nuts:               45 N·m

Mechanical Seal Gland Bolts:
  Gland Plate Bolts (M16, Grade A2-70 SS): 120 N·m (equal tightening — 4 passes star pattern)
  Gland Pipe Union Connections:         Hand-tight + 1/4 turn only (PTFE tape on threads)

General Notes:
  All fasteners: Apply Loctite 243 (medium strength) unless stated otherwise
  Stainless bolts into stainless: Use Molykote 1000 anti-seize (galling prevention)
  Recommended torque wrench accuracy: ±4%
```

### P-201A/B — KSB RDLD 250-500 B

```
Coupling Bolts (M24, Grade 10.9):     420 N·m
Impeller Nut (KSB proprietary, LH thread): 850 N·m (hydraulic wrench required)
Bearing End Cap Bolts (M16):          140 N·m
Mechanical Seal Gland Bolts (M16):    110 N·m
Pump Foot Bolts (M20, foundation):    350 N·m
```

---

## 📋 Pump Startup Procedure — P-101A (From OEM Manual Section 5.3)

```
PRE-STARTUP CHECKLIST (MUST BE COMPLETED BEFORE START COMMAND):

MECHANICAL:
□ Coupling guard installed and secured
□ All drain valves CLOSED
□ All vent valves CLOSED
□ Suction valve FULLY OPEN (confirm by visual + position indicator)
□ Minimum flow recirculation valve OPEN (if applicable)
□ Seal buffer fluid pressure at 2 bar above process pressure (Plan 53B accumulator)
□ Seal flush connections intact and flowing
□ Oil level at MID-MARK in sight glass
□ Oil color: clear/golden (milky = water contamination — DO NOT START)
□ Bearing housing lip seals intact (no cracking or fraying)

ELECTRICAL:
□ Motor megger test (if out of service >72 hours): >100 MΩ at 1000V
□ Earthing connections intact
□ MCC breaker in AUTO position
□ All electrical isolations cleared and LOTO removed

INSTRUMENT:
□ Discharge pressure gauge reading (should read suction pressure when stopped)
□ Vibration monitor (Bently Nevada) — channels reading zero/ambient
□ Bearing temperature RTDs showing ambient temperature (roughly equal)
□ Motor current relay set to 1.1× FLA (86A × 1.1 = 94.6A trip)

SEQUENCE:
1. Confirm all above checks complete — sign checklist
2. Start pump from CCR/local
3. Check motor starts and accelerates normally (watch ammeter — peak current ≈ 6× FLA for 5–8 seconds)
4. Monitor discharge pressure rises to ≈ design (22 bar g at rated flow)
5. If no pressure rise within 30 seconds → STOP PUMP immediately (check suction, cavitation, rotation)
6. If discharge ΔP = zero → STOP (may be running backward or blocked suction)
7. After stable operation (5 min): record vibration reading, temperatures, pressures in logsheet

FAILURE TO FOLLOW THIS CHECKLIST IS THE PRIMARY CAUSE OF P-101A SEAL FAILURES:
  2018-03-12: Suction valve closed → seal failure
  2023-02-25: Discharge valve closed → deadheading → seal failure  
  2026-01-08: Suction valve partially closed → dry running → seal failure
```

---

## ⚙️ Operating Parameters — Quick Reference Card

### Pump Quick Reference

| Tag | Min Flow (m³/hr) | Max Temp (°C) | Max Disch P (bar g) | Bearing Alarm T (°C) | Vib Alarm (mm/s) |
|-----|----------------|--------------|---------------------|---------------------|-----------------|
| P-101A/B | 220 | 85 | 22 | 85 | 7.1 |
| P-201A/B | 130 | 120 | 28 | 85 | 7.1 |
| P-202A/B | 80 | 180 | 20 | 80 | 5.6 |
| P-301A/B | 25 | 60 | 8 | 75 | 4.5 |
| P-401A/B/C | 850 | 45 | 5 | 80 | 7.1 |
| P-402A/B/C | 45 | 150 | 130 | 90 | 5.6 |
| P-501A/B | 165 | 100 | 30 | 85 | 7.1 |

### Compressor Quick Reference

| Tag | Max Speed (rpm) | Oil Pressure Alarm (bar g) | Max Oil Temp (°C) | Vib Alarm (µm pp) | Axial Alarm (mm) |
|-----|----------------|--------------------------|-----------------|-----------------|-----------------|
| C-101A/B | 11,000 | <1.4 | 65 | 50 | 0.6 |
| C-102A/B | 11,200 | <1.4 | 65 | 50 | 0.6 |
| C-301A/B | N/A (recip) | <2.5 | 60 | N/A | N/A |
| C-401A/B | 8,500 | <1.2 | 60 | 45 | 0.5 |
