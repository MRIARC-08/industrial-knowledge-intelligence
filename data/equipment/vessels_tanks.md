# 🔥 Equipment Registry — Vessels, Heat Exchangers & Storage Tanks

**Plant:** Bharat Refinery Corporation (BRC)  
**Document Type:** Static Equipment Registry  
**Rev:** 06 | **Date:** 2026-05-28

---

## 🏺 Pressure Vessels

| Tag | Name | Service | Design P (bar g) | Design T (°C) | Material | Volume (m³) | ASME Class | Next Inspection |
|-----|------|---------|-----------------|--------------|----------|------------|------------|-----------------|
| V-101 | CDU Atmospheric Column | Crude Fractionation | 3.5 / FV | 365 | SS 304 Clad on CS | 750 | ASME Div 1 | 2027-02 (TA-27) |
| V-102 | Crude Pre-Flash Drum | Pre-flash Vapors | 5 | 215 | ASTM A516 Gr 70 | 38 | ASME Div 1 | 2026-09-15 |
| V-103 | CDU Overhead Accumulator | Naphtha+Gas | 9.5 / FV | 110 | ASTM A516 Gr 60 | 28 | ASME Div 1 | 2026-09-15 |
| V-201 | VDU Vacuum Column | VGO Fractionation | 0.05 mbar abs | 390 | 317L SS Clad | 480 | ASME Div 1 | 2027-02 (TA-27) |
| V-202 | VDU Overhead Ejector Drum | Vacuum Vapors | 0.05 mbar | 60 | ASTM A516 Gr 70 | 22 | ASME Div 1 | 2026-11-01 |
| V-301 | HDS HP Separator | H₂+HC at HP | 68 | 220 | ASTM A387 Gr 22 Cl2 | 45 | ASME Div 1 | 2026-08-01 |
| V-302 | HDS LP Separator | H₂+HC at LP | 18 | 180 | ASTM A516 Gr 70 | 30 | ASME Div 1 | 2026-08-05 |
| V-303 | H₂S Absorber | Amine Treating | 7 | 55 | ASTM A516 Gr 70 + Amine inhibitor | 65 | ASME Div 1 | 2026-12-01 |
| V-401 | FCC Reactor | Catalytic Cracking | 3 | 540 | 1.25Cr-0.5Mo Clad 347SS | 420 | ASME Div 1 | 2027-02 (TA-27) |
| V-402 | FCC Regenerator | Catalyst Regeneration | 3.2 | 720 | CS Refractory Lined | 580 | ASME Div 1 | 2027-02 (TA-27) |
| V-501 | Debutanizer | C4/C5 Separation | 11 | 185 | ASTM A516 Gr 70 | 88 | ASME Div 1 | 2027-01-15 |
| V-502 | Propane-Propylene Splitter | C3 Fractionation | 22 | 65 | ASTM A516 Gr 70 | 145 | ASME Div 1 | 2027-02-01 |
| V-601 | Sour Water Stripper | H₂S/NH₃ Removal | 4.5 | 130 | ASTM A516 Gr 70 | 55 | ASME Div 1 | 2026-10-01 |

---

## ♨️ Heat Exchangers

| Tag | Name | Service | Type | Shell Side | Tube Side | Shell P (bar g) | Tube P (bar g) | Tube Material | Last Tube Bundle Replaced |
|-----|------|---------|------|-----------|----------|----------------|----------------|---------------|--------------------------|
| E-101A | Crude Pre-Heat Train 1A | Crude vs. AR | TEMA E, Fixed TS | AR (shell) | Crude (tube) | 8 | 22 | CS ASTM A179 | 2022-03-10 |
| E-101B | Crude Pre-Heat Train 1B | Crude vs. AR | TEMA E, Fixed TS | AR (shell) | Crude (tube) | 8 | 22 | CS ASTM A179 | 2022-03-15 |
| E-102A | CDU Overhead Condenser A | Naphtha Condensing | TEMA AEL | CW (shell) | Naphtha Vapor | 5 | 9.5 | CS ASTM A179 | 2024-09-01 |
| E-102B | CDU Overhead Condenser B | Naphtha Condensing | TEMA AEL | CW (shell) | Naphtha Vapor | 5 | 9.5 | CS ASTM A179 | 2024-09-05 |
| E-201A | HDS Feed-Effluent HX A | H₂+HC Feed vs. Effluent | TEMA F, U-tube | Effluent | Feed+H₂ | 75 | 72 | 1.25Cr-0.5Mo (ASTM A213 T11) | 2023-02-08 |
| E-201B | HDS Feed-Effluent HX B | H₂+HC Feed vs. Effluent | TEMA F, U-tube | Effluent | Feed+H₂ | 75 | 72 | 1.25Cr-0.5Mo (ASTM A213 T11) | 2023-02-12 |
| E-301 | FCC Main Fractionator Pumparound | FCC PC vs. CW | TEMA AES | CW | PC | 5 | 4 | CS ASTM A214 | 2025-02-01 |
| E-401A | BFW Pre-heater A | BFW vs. HP Steam Cond | TEMA BEM | Steam (shell) | BFW | 42 | 52 | SA 192 | 2024-01-15 |
| E-401B | BFW Pre-heater B | BFW vs. HP Steam Cond | TEMA BEM | Steam (shell) | BFW | 42 | 52 | SA 192 | 2024-01-18 |
| E-501 | Propylene Condenser | Propylene Refrigerant | TEMA AES | Propylene | CW | 22 | 5 | SS 304 | 2021-11-20 |

### E-201A/B — HDS Feed-Effluent Exchanger (HIGH FOULING RISK)

```
Current Concern (Q2 2026):
  - E-201A LMTD Efficiency: 71.4% (Design: 85%) — Approaching cleaning threshold (70%)
  - Fouling Factor: 0.00028 m²·K/W (Design: 0.00019) — Above design
  - Delta-T Increase: +8.2°C above design baseline
  - Recommendation: Schedule cleaning at next planned opportunity (WO-2026-0930)
  - Impact if deferred: Risk of HDS throughput reduction by ~12%

Cleaning History:
  - 2023-02-08: Chemical cleaning (2% citric acid) — LMTD restored to 93%
  - 2021-01-15: Mechanical pigging — partial success
  - 2019-03-20: Hydroblasting at 350 bar — full restoration
```

---

## 🛢️ Storage Tanks

| Tag | Name | Product | Capacity (kL) | Type | Roof | Year Built | API 653 Inspection | Next Inspection |
|-----|------|---------|--------------|------|------|-----------|-------------------|----------------|
| TK-101 | Crude Oil Tank A | Arabian Light Crude | 50,000 | Fixed Cone Roof | Fixed Steel | 2015 | 2022-06-10 | 2027-06 |
| TK-102 | Crude Oil Tank B | Arab Medium Crude | 50,000 | Fixed Cone Roof | Fixed Steel | 2015 | 2022-08-12 | 2027-08 |
| TK-103 | Crude Oil Tank C | Arab Heavy Crude | 80,000 | External Floating Roof | EFR+Rim Seal | 2012 | 2023-01-20 | 2028-01 |
| TK-201 | Naphtha Tank A | SR Naphtha | 15,000 | Internal Floating Roof | IFR | 2016 | 2023-05-15 | 2028-05 |
| TK-202 | Naphtha Tank B | Reformate | 12,000 | Internal Floating Roof | IFR | 2016 | 2023-05-18 | 2028-05 |
| TK-301 | MS Tank A | Motor Spirit (Petrol) | 20,000 | Internal Floating Roof | IFR | 2017 | 2024-02-01 | 2029-02 |
| TK-302 | MS Tank B | Motor Spirit (Petrol) | 20,000 | Internal Floating Roof | IFR | 2017 | 2024-02-05 | 2029-02 |
| TK-401 | HSD Tank A | High Speed Diesel | 30,000 | Fixed Cone Roof | Fixed Steel | 2014 | 2023-09-22 | 2028-09 |
| TK-402 | HSD Tank B | High Speed Diesel | 30,000 | Fixed Cone Roof | Fixed Steel | 2014 | 2023-09-25 | 2028-09 |
| TK-501A | LPG Bullet A | LPG (Propane+Butane) | 1,500 | Pressurized Sphere | N/A (Pressure) | 2018 | 2026-03-10 | 2031-03 |
| TK-501B | LPG Bullet B | LPG (Propane+Butane) | 1,500 | Pressurized Sphere | N/A (Pressure) | 2018 | 2026-03-12 | 2031-03 |
| TK-601 | Fuel Oil Tank | LSHS / Fuel Oil | 25,000 | Fixed Cone Roof | Fixed Steel | 2010 | 2024-11-01 | 2029-11 |
| TK-701 | Slops Tank | Mixed Slops | 5,000 | Fixed Cone Roof | Fixed Steel | 2013 | 2024-07-08 | 2029-07 |

### TK-103 — Crude Oil Tank C (EFR) — Inspection Deficiency

```
Issue Found at API 653 Inspection (2023-01-20):
  - Floating Roof Pontoon: 3 compartments with water ingress 
  - Primary Rim Seal: Worn — recommends replacement within 18 months
  - Bottom Plate Minimum Thickness: 5.8 mm (MAWT per API 653: 6.0 mm)
  - Corrosion Rate: 0.28 mm/year (higher than baseline 0.15 mm/year)

Actions Taken:
  - WO-2023-1102: Rim seal replacement — COMPLETED 2023-09-15
  - WO-2023-1103: Pontoon repairs — COMPLETED 2024-01-20
  - WO-2024-0210: Bottom plate thickness survey — COMPLETED 2024-03-01
    Result: 8 plates below 6mm — planned for repair/replacement at next OOS

Fitness for Service:
  FFS per API 579-1: ACCEPTABLE for continued service until 2026-12-31
  Owner Decision: Take out of service for repairs during 2026 Q4 OSBL shutdown
```

---

## 🔢 Vessels Requiring Immediate Attention (Priority List)

| Priority | Tag | Issue | Required Action | Target Date |
|----------|-----|-------|-----------------|------------|
| HIGH | V-301 | Hydrogen embrittlement monitoring — next H₂ service inspection overdue by 3 months | Schedule API 579 FFS assessment + UT thickness survey | 2026-08-01 |
| HIGH | TK-103 | Bottom plate thickness below MAWT per API 653 | Plan OOS for bottom plate repair | 2026-Q4 |
| MEDIUM | V-601 | Amine stress corrosion cracking risk — PWHT records missing for 2019 nozzle weld | Locate/verify PWHT records or perform stress relief UT | 2026-09-01 |
| MEDIUM | E-201A | Fouling beyond threshold — efficiency 71.4% (threshold 70%) | Schedule bundle cleaning | 2026-08-15 |
| LOW | V-102 | Internal coating thickness reduced to 0.8 mm (design 1.5 mm) | Recoat at next opportunity shutdown | 2026-12-01 |
