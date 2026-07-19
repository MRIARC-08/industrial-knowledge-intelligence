# 📜 Compliance Database — OSHA, OISD, API Standards

**Plant:** Bharat Refinery Corporation (BRC)  
**Document Type:** Regulatory Compliance Registry  
**Rev:** 08 | **Date:** 2026-07-01  

---

## ⚖️ Applicable Regulations — Master List

| Regulation | Authority | Applicability to BRC | Status |
|-----------|----------|---------------------|--------|
| OSHA 29 CFR 1910.119 — Process Safety Management | US OSHA (adopted by PESO) | All HHC processes (CDU, VDU, FCC, HDS) | Active |
| OSHA 29 CFR 1910.147 — Lockout/Tagout | US OSHA (adopted by BIS) | All energy isolation work | Active |
| OSHA 29 CFR 1910.146 — Confined Space Entry | US OSHA (adapted for India) | All vessel entry activities | Active |
| OSHA 29 CFR 1910.269 — Electrical Safety | US OSHA / BIS IS 5216 | All electrical work | Active |
| OISD-STD-118 — Layouts for Oil & Gas Installations | OISD (India) | Plant layout and spacing | Active |
| OISD-STD-116 — Fire Protection for Petroleum Refineries | OISD (India) | Fire protection systems | Active |
| OISD-STD-137 — Inspection of in-service welding | OISD (India) | All in-service welding activities | Active |
| OISD-STD-105 — Work Permit System | OISD (India) | All maintenance work permit | Active |
| OISD-GDN-206 — Guidelines for Mechanical Integrity | OISD (India) | Pressure vessel/piping inspection | Active |
| API 510 — Pressure Vessel Inspection | API (adopted at BRC) | All registered pressure vessels | Active |
| API 570 — Piping Inspection Code | API (adopted at BRC) | All process piping | Active |
| API 653 — Tank Inspection, Repair, Alteration | API (adopted at BRC) | All atmospheric storage tanks | Active |
| API 617 — Centrifugal Compressors | API | Centrifugal compressor design/maintenance | Active |
| API 670 — Machinery Protection Systems | API | Vibration monitoring systems | Active |
| ASME BPVC Section VIII — Pressure Vessels | ASME | All new pressure vessel fabrication | Active |
| ASME B31.3 — Process Piping | ASME | All process piping fabrication/repair | Active |
| The Factories Act, 1948 (India) | Ministry of Labour, Govt of India | All factory operations | Active |
| PESO Rules — Static & Mobile Pressure Vessels | PESO (India) | Pressure vessel registration & inspection | Active |
| IS 5216 — Safety Recommendations for Electrical | BIS (India) | All electrical installations | Active |
| Environment Protection Act 1986 | MoEF (India) | All environmental aspects | Active |

---

## 🔴 Active Compliance Gaps

### GAP-2026-001 — Missing PRV Inspection Records (HIGH SEVERITY)

```
Gap ID:            GAP-2026-001
Regulation:        OSHA 1910.119 — Process Safety Management (PSM)
Specific Clause:   29 CFR 1910.119(j) — Mechanical Integrity
Requirement:       Written documentation of inspection and testing of pressure relief devices

Finding:
  During internal PSM audit (May 2026), it was found that pressure relief valve
  inspection records are missing for 7 PRVs across the HDS and VDU units for
  the period 2023-2024. Records exist in paper format (pre-2023) but were not
  migrated to digital CMMS when system was upgraded in 2023.

Equipment Affected:
  V-301-PRV-001, V-301-PRV-002 (HDS HP Separator)
  V-302-PRV-001 (HDS LP Separator)
  V-201-PRV-001, V-201-PRV-002 (VDU Vacuum Column)
  V-202-PRV-001 (VDU Ejector Drum)
  C-101A-PRV-001 (H₂ Compressor Discharge)

Risk Assessment:
  Severity: HIGH
  Likelihood: MEDIUM
  Risk Score: 450 (HIGH)
  Regulatory Consequence: Potential PESO enforcement action / shutdown order

Corrective Action Plan:
  Owner: Ankit Mehra (Inspection Engineer)
  1. Locate paper records in archive room — by 2026-07-31
  2. Scan and upload to CMMS with proper record identification — by 2026-08-15
  3. If any records cannot be found, schedule repeat inspection — by 2026-09-01
  4. Implement digital PRV inspection record procedure — by 2026-10-01

Status: OPEN | Target Closure: 2026-10-01
```

### GAP-2026-002 — Confined Space Rescue Drill Overdue (HIGH SEVERITY)

```
Gap ID:            GAP-2026-002
Regulation:        OSHA 29 CFR 1910.146(k)(2)(iv) / OISD-STD-105
Requirement:       Annual confined space rescue practice for permit-required spaces
                   Emergency response drill to be conducted at least annually

Finding:
  Last confined space rescue drill was conducted on 2024-11-10.
  Annual drill is overdue as of 2026-07-19 (required by 2025-11-10).
  OISD-105 Section 8.3 also requires annual emergency drills.

Risk Assessment:
  Severity: HIGH (personnel safety)
  Likelihood: LOW (unlikely to need rescue unless incident)
  Risk Score: 300 (HIGH)

Corrective Action:
  Owner: Kavya Nair (Safety Officer)
  Schedule rescue drill with CISF fire team — by 2026-08-15

Status: OPEN | Target Closure: 2026-08-15
```

### GAP-2026-003 — OISD-116 Fire Water Flow Test Overdue (MEDIUM)

```
Gap ID:            GAP-2026-003
Regulation:        OISD-STD-116 Section 5.8
Requirement:       Annual hydrant flow test to verify fire water delivery
                   Last test: 2025-01-20 (annual test due by 2026-01-20)

Finding:
  Annual fire water hydrant flow test is 6 months overdue.
  6 hydrants not tested since 2024 due to scheduling conflicts.

Corrective Action:
  Schedule fire water flow test — by 2026-08-30

Status: OPEN | Target Closure: 2026-08-30
```

### GAP-2026-004 — API 570 Piping Inspection Overdue — HDS Unit (MEDIUM)

```
Gap ID:            GAP-2026-004  
Regulation:        API 570 — Piping Inspection Code
Requirement:       Piping inspection per service classification (Class 1: 5 yr max interval)
                   HDS H₂ service piping (Class 1 — HF/H₂S service) last inspected 2020-03-01

Finding:
  HDS high-pressure H₂ piping (Class 1) is past its 5-year inspection interval.
  Total length affected: ~450m of 6" to 16" piping in HDS unit.
  ASME B31.3 section applies for HC service piping.

Risk Assessment:
  Severity: HIGH (H₂ embrittlement risk, potential for catastrophic failure)
  Risk Score: 480 (HIGH)

Corrective Action:
  Plan CML (Corrosion Monitoring Locations) inspection during 2026 Q3 opportunity
  Target: Inspect 100% of Class 1 HDS piping by 2026-11-30

Status: OPEN | Target Closure: 2026-11-30
```

---

## ✅ Certificates Registry

| Cert ID | Equipment | Standard | Certificate Type | Issued | Expiry | Status | Issuing Authority |
|---------|-----------|---------|-----------------|--------|--------|--------|------------------|
| CERT-2024-001 | V-301 (HDS HP Sep) | ASME BPVC | Form U-1 (New Construction) | 2019-03-01 | 2029-03-01 (10yr) | ✅ VALID | Authorized Inspection Agency (AIA) |
| CERT-2025-012 | V-102 (Pre-flash Drum) | API 510 | In-Service Inspection Certificate | 2025-09-15 | 2026-09-15 | ⚠️ EXPIRING IN <3 MONTHS | Lloyd's Register India |
| CERT-2026-003 | TK-501A (LPG Bullet A) | ASME Div 1 / PESO | Form U-1 + PESO Certificate | 2026-03-10 | 2031-03-10 | ✅ VALID | PESO Vadodara |
| CERT-2026-004 | TK-501B (LPG Bullet B) | ASME Div 1 / PESO | Form U-1 + PESO Certificate | 2026-03-12 | 2031-03-12 | ✅ VALID | PESO Vadodara |
| CERT-2024-008 | C-102A (FCC WGC) | API 617 | Design Certification | 2017-06-01 | N/A (lifetime) | ✅ VALID | Elliott Group |
| CERT-2023-015 | All PRVs (32 units) | API 520/521 | Spring-Loaded PRV Test Certificate | 2023-01-15 | 2026-01-15 | ⚠️ 7 RECORDS MISSING (see GAP-2026-001) | BRC Instrument Shop |
| CERT-2025-022 | P-101A/B/C (CDU Pumps) | API 610 | Factory Acceptance Test | 2018-10-01 | N/A (lifetime) | ✅ VALID | Flowserve |
| CERT-2024-031 | HDS Piping (Class 1) | API 570 | Piping Inspection Certificate | 2020-03-01 | 2025-03-01 | ❌ EXPIRED — see GAP-2026-004 | AIA India |
| CERT-2026-042 | BFW Pumps P-402A/B/C | ASME B73.1 | Design Certificate | 2018-05-01 | N/A | ✅ VALID | KSB AG |

---

## 📊 Compliance Dashboard

| Category | Total Requirements | Compliant | Non-Compliant | Compliance % |
|----------|-------------------|-----------|---------------|--------------|
| OSHA PSM Requirements | 14 elements | 12 | 2 | 85.7% ⚠️ |
| OISD Standards | 8 standards | 7 | 1 | 87.5% ⚠️ |
| API Standards | 6 standards | 5 | 1 | 83.3% ⚠️ |
| PESO Certificates | 24 items | 22 | 2 | 91.7% ⚠️ |
| ASME Certifications | 18 items | 18 | 0 | 100% ✅ |
| Factories Act Requirements | 22 items | 22 | 0 | 100% ✅ |
| **OVERALL** | **92 items** | **86** | **6** | **93.5%** ⚠️ |

> **Target:** >98% compliance across all categories  
> **Current Status:** ⚠️ BELOW TARGET — Urgent action required on 6 open gaps
