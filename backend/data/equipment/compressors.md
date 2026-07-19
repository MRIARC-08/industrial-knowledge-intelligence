# 🌀 Equipment Master Registry — Compressors

**Plant:** Bharat Refinery Corporation (BRC)  
**Document Type:** Compressor Fleet Registry  
**Rev:** 03 | **Date:** 2026-06-15

---

## 📋 Compressor Fleet Overview

| Tag | Name | Service | Type | Capacity (Nm³/hr) | Suction P (bar g) | Disch P (bar g) | Driver | Status |
|-----|------|---------|------|-------------------|-------------------|-----------------|--------|--------|
| C-101A | H₂ Recycle Compressor A | HDS H₂ Recycle | Centrifugal (4-stage) | 48,000 | 28 | 62 | Steam Turbine (4.5 MW) | Operational |
| C-101B | H₂ Recycle Compressor B | HDS H₂ Recycle (Standby) | Centrifugal (4-stage) | 48,000 | 28 | 62 | Steam Turbine (4.5 MW) | Standby |
| C-102A | Wet Gas Compressor A | FCC Wet Gas | Centrifugal (2-stage) | 95,000 | 0.8 | 18 | Steam Turbine (8 MW) | Operational |
| C-102B | Wet Gas Compressor B | FCC Wet Gas (Standby) | Centrifugal (2-stage) | 95,000 | 0.8 | 18 | Steam Turbine (8 MW) | Operational |
| C-201A | Instrument Air Compressor A | IA Header | Reciprocating (2-stage) | 8,500 | ATM | 7 | Electric Motor (450 kW) | Operational |
| C-201B | Instrument Air Compressor B | IA Header | Reciprocating (2-stage) | 8,500 | ATM | 7 | Electric Motor (450 kW) | Operational |
| C-201C | Instrument Air Compressor C | IA Header (Standby) | Reciprocating (2-stage) | 8,500 | ATM | 7 | Electric Motor (450 kW) | Standby |
| C-202A | Plant Air Compressor A | PA Header | Screw | 6,200 | ATM | 7 | Electric Motor (250 kW) | Operational |
| C-202B | Plant Air Compressor B | PA Header | Screw | 6,200 | ATM | 7 | Electric Motor (250 kW) | Operational |
| C-301A | Fuel Gas Compressor A | Fuel Gas Boosting | Reciprocating (3-stage) | 12,000 | 2.5 | 35 | Electric Motor (600 kW) | Operational |
| C-301B | Fuel Gas Compressor B | Fuel Gas Boosting (Standby) | Reciprocating (3-stage) | 12,000 | 2.5 | 35 | Electric Motor (600 kW) | Warning |
| C-401A | Refrigeration Compressor A | Propylene Refrig | Centrifugal (3-stage) | 35,000 | 1.8 | 22 | Electric Motor (2.5 MW) | Operational |
| C-401B | Refrigeration Compressor B | Propylene Refrig | Centrifugal (3-stage) | 35,000 | 1.8 | 22 | Electric Motor (2.5 MW) | Operational |

---

## ⚙️ Detailed Specs — Critical Machines

### C-102A — FCC Wet Gas Compressor A

```
Manufacturer:          Elliott Group (Ebara Corp)
Model:                 38-SMT-T2 (Tandem Stage)
Serial No:             ELT-2017-09212
Commissioned:          2017-08-20
API Standard:          API 617, 8th Edition

Performance Data:
  Inlet Flow:          95,000 Nm³/hr
  Molecular Weight:    Gas = 28.4 (avg)
  Suction Pressure:    0.8 bar g
  Suction Temperature: 42°C
  Discharge Pressure:  18.2 bar g
  Polytropic Head:     14,200 m
  Polytropic Efficiency: 76%
  Speed:               10,850 rpm
  Shaft Power:         7.8 MW

Driver — Steam Turbine:
  Manufacturer:        Dresser-Rand
  Model:               DRSS-8 (Double Extraction)
  Steam Conditions:    40 bar g, 380°C (HP Inlet)
  Speed Range:         8,500 — 11,200 rpm (variable)
  Governor Type:       Woodward MHC-II

Seal System:
  Type:                Dry Gas Seal (Double) — API 614
  Seal Gas:            N₂ (99.9% purity)
  Primary Seal Vent:   <2.5 Nm³/hr (alarm: >5 Nm³/hr)
  Secondary Vent:      <0.3 Nm³/hr (alarm: >1.5 Nm³/hr)
  Seal Vendor:         Burgmann (now EagleBurgmann) — PDGS-I

Lube Oil System:
  Oil Type:            Turbine Oil ISO VG 46 (Shell Turbo T 46)
  Oil Pressure:        1.8 bar g (running), alarm <1.4, trip <1.0
  Oil Temperature:     45°C (alarm >65°C, trip >80°C)
  Reservoir Capacity:  1,200 L
  Oil Cooler:          Sea/Fresh Water — E-950A/B

Vibration Setpoints:
  Radial (Shaft): Alarm 50 µm peak-peak, Trip 75 µm
  Axial (Thrust): Alarm 0.6 mm, Trip 0.9 mm

Critical Spare Parts Onsite:
  - 1× Complete Rotor Assembly (P/N: ELT-9212-ROT-01)
  - 2× Dry Gas Seal Cartridges (P/N: BGM-PDGS-I-102)
  - 4× Journal Bearing Sets (P/N: ELT-9212-JB-01)
  - 1× Thrust Bearing Assy (P/N: ELT-9212-TB-01)

Criticality:          A — Single Train (No installed spare)
Last Major Overhaul:  2023-02-05 (Turnaround TA-23)
Next Scheduled:       2027 (TA-27)
Running Hours:        28,450 hours (since last overhaul)
```

### C-301B — Fuel Gas Compressor B (WARNING)

```
Status:               WARNING — High suction valve temperatures
Issue Detected:       2026-06-20
Current Symptom:      Stage 2 suction valve temperature 145°C (alarm: >120°C)
Probable Cause:       Suction valve plate leak-by
Recommended Action:   Plan valve inspection during next opportunity shutdown
WO Raised:            WO-2026-0915 (Planned - Target completion: 2026-07-25)
Risk Assessment:      LOW — C-301A can handle full load; monitor closely
```

---

## 🔄 Compressor Failure Modes

| Failure Mode | Mechanism | Symptoms | Detection |
|--------------|-----------|----------|-----------|
| Surge | Operating past surge line, low flow, high dP | Loud banging, rapid pressure fluctuation, high vibration | Anti-surge system, vibration monitor |
| Dry Gas Seal Failure | Contamination, excessive leakage, thermal shock | High seal vent flow, process gas in seal vent | Seal vent flow meter, gas detector |
| Lube Oil System Failure | Pump failure, cooler fouling, high temperature | Low oil pressure, high oil temp, bearing heat | Oil pressure/temp transmitters |
| Valves Failure (Recip) | Wear, fatigue, over-pressure, liquid carry-over | High valve temp, low efficiency, unusual knocking | Valve temp sensors, efficiency monitoring |
| Rotor Imbalance | Fouling deposits, blade erosion, rotor damage | High vibration (1× RPM dominant) | Vibration probes (API 670) |
| Aerodynamic Instability | Off-design operation, fouled impellers | Pulsation, high vibration, efficiency drop | Vibration, performance monitoring |

---

## 📊 Compressor Fleet KPIs

| KPI | Target | Current | Trend |
|-----|--------|---------|-------|
| Compressor Availability | >98.5% | 97.8% | ↗ Improving |
| MTBF (Centrifugal) | >48 months | 42 months | → Stable |
| MTBF (Reciprocating) | >24 months | 26 months | ↗ Improving |
| Dry Gas Seal MTBF | >60 months | 55 months | → Stable |
| Surge Events/Year | <5 | 2 YTD | ✅ On target |
| Lube Oil Contamination Events | <2/year | 0 YTD | ✅ On target |
| Valve Failure Rate (Recip) | <10 valves/year | 7 YTD | ✅ On target |
