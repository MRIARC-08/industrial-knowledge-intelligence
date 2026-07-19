# 🔧 Work Orders — Corrective Maintenance

**Plant:** Bharat Refinery Corporation (BRC)  
**Document Type:** Corrective Maintenance Work Orders  
**Period:** 2024-01-01 to 2026-07-19

---

## 📋 Active Critical Work Orders

| WO Number | Equipment | Description | Priority | Status | Raised Date | Target | Raised By | Assigned To | Supervised By |
|-----------|-----------|-------------|----------|--------|-------------|--------|-----------|-------------|--------------|
| WO-2026-0892 | P-201B | Emergency bearing replacement — vibration at 13.7 mm/s (above trip 11.2) | EMERGENCY | In Progress | 2026-06-28 | 2026-07-05 | **Rajesh Babulal Mehta** (OPR-002) | **Ravi Shankar Kumar** (MECH-001) | **Anandkumar Venkatrao** (ENG-001) |
| WO-2026-0915 | C-301B | Stage 2 suction valve inspection — temperature 145°C (alarm 120°C) | HIGH | Planned | 2026-06-20 | 2026-07-25 | **Suresh Narayandas Patel** (MECH-006) | **Suresh Narayandas Patel** (MECH-006) | **Anandkumar Venkatrao** (ENG-001) |
| WO-2026-0930 | E-201A/B | HDS Feed-Effluent HX bundle cleaning — efficiency dropped to 71.4% | HIGH | Planned | 2026-07-05 | 2026-08-15 | **Dineshkumar Shah** (ENG-004) | **Arvindkumar Singh** (MECH-004) | **Ankitkumar Mehra** (ENG-003) |
| WO-2026-0945 | V-301 | H₂ service API 510 inspection + UT thickness survey (16 months overdue) | HIGH | Planned | 2026-07-12 | 2026-08-01 | **Ankitkumar Mehra** (ENG-003) | **Balvantsinh Parmar** (NDT-001) | **Ankitkumar Mehra** (ENG-003) |

---

## 📂 Completed Work Orders — 2026

### WO-2026-0001 — P-101A Mechanical Seal Replacement

```
Work Order:         WO-2026-0001
Equipment:          P-101A (Crude Charge Pump A)
Description:        Mechanical seal face leak — buffer fluid loss rate >200 mL/hr
Priority:           HIGH
Status:             COMPLETED ✅
Raised:             2026-01-08 09:30  by  Rajesh Babulal Mehta (OPR-002, Shift A Supervisor)
Started:            2026-01-08 14:00  — Work Permit No: WP-2026-0008 issued by Kavya Suresh Nair
Completed:          2026-01-10 08:15
Total Duration:     42.75 hours

Root Cause:
  Pradeepkumar Ramnaresh Sharma (OPR-001) started P-101A on 2026-01-07 with
  suction valve partially closed (OPEN position indicator defective — not checked
  physically). Dry running for ~4 min caused thermal cracking of carbon primary face.
  Root cause documented by Kavya Suresh Nair in INC-2026-001 RCA.

Materials Used:
  - John Crane HPXE Seal Cartridge, P/N JC-HPXE-4521 × 1 unit  (from stock SP-A-001)
  - Seal Gland Gasket Set × 1 set
  - Coupling Spacer Bolts M20 × 8 (replaced as precaution)

Personnel:
  Lead Technician:   Rameshchandra Gopal Joshi (MECH-002)
  Support:           Vikram Durgaprasad Singh (MECH-003)
  Supervisor:        Anandkumar Venkatrao (ENG-001) — site supervision
  Sign-Off:          Anandkumar Venkatrao (ENG-001)
  Permit Issuer:     Kavya Suresh Nair (ENG-002)
  Permit Receiver:   Rameshchandra Gopal Joshi (MECH-002)

Permits:
  - Work Permit: WP-2026-0008 (Cold Work) — issued by Kavya Suresh Nair
  - Isolation Certificate: IC-P-101A-2026-001 — signed by Meenakshi Iyer (ENG-007)

Cost:
  Parts:    ₹1,45,000 (Seal Cartridge + Gaskets)
  Labour:   ₹28,500 (42.75 hrs × 2 techs)
  Total:    ₹1,73,500

Downtime Impact:
  P-101A out 42.75 hrs — P-101B covered full load — NO production impact

Corrective Actions Introduced (from this WO):
  → SOP-WT-002 authored by Anandkumar Venkatrao: digital pre-startup checklist
  → Suction valve position switch inspection added to PM-ROT-01 by Ravi Shankar Kumar
  → Incident linked to INC-2026-001 (3rd recurrence of same failure mode)
```

---

### WO-2026-0047 — C-201A Intercooler Weld Repair

```
Work Order:         WO-2026-0047
Equipment:          C-201A (Instrument Air Compressor A — Intercooler)
Description:        Stage 1 intercooler shell-side water leak at N2 nozzle weld
Priority:           HIGH
Status:             COMPLETED ✅
Raised:             2026-02-14 11:00  by  Sunita Prakash Desai (OPR-004, Shift B)
Started:            2026-02-15 06:00
Completed:          2026-02-16 18:30
Total Duration:     36.5 hours

Root Cause:
  Pre-existing weld root crack at cooling water inlet nozzle (N2). Thermal cycling
  (seasonal CW temperature swings 28°C → 38°C summer) activated dormant flaw.
  PWHT not performed at original fabrication (1998) — confirmed by Ankitkumar Mehra
  after reviewing original hydrotest records from archive.

  RCA authored by: Kavya Suresh Nair (ENG-002)
  RCA reviewed by: Ankitkumar Mehra (ENG-003)

Personnel:
  Lead Welder:       Kiran Bhupendra Patel (MECH-005) — ASME Sec IX qualified
  Pipefitter Supp:   Nareshkumar Bhagwandas Yadav (MECH-008)
  NDE Inspector:     Balvantsinh Govindsinh Parmar (NDT-001)
  Third Party NDE:   Ultrascan India (RT Level II — Cert No: UT-2026-0047)
  Supervisor:        Ankitkumar Mehra (ENG-003) — NDE and weld acceptance
  Sign-Off:          Anandkumar Venkatrao (ENG-001)

Repair Steps:
  1. Drained CW side — verified by Nareshkumar Yadav
  2. Crack excavated by Kiran Patel using angle grinder
  3. Dye Penetrant Test by Balvantsinh Parmar — crack extent 45mm arc confirmed
  4. SMAW weld repair — Kiran Patel (E309L electrode, pre-heat 100°C)
  5. PWHT 600°C / 2 hrs — contracted to Thermex India
  6. Post-weld DP test by Balvantsinh Parmar — CLEAR ✅
  7. Hydro test 1.5× design = 11.25 bar g — witnessed by Ankitkumar Mehra — PASSED ✅

Cost:
  Materials:   ₹32,000
  Labour:      ₹45,000 (certified welder + PWHT + NDE contractor)
  Total:       ₹77,000

Standby coverage:
  C-201B carried full load. C-201C (standby) kept on auto-start.
  Instrument air supply uninterrupted — confirmed by Balasubramanian Narayanan (INST-001)
```

---

### WO-2026-0115 — TK-103 Rim Seal Inspection & Repair

```
Work Order:         WO-2026-0115
Equipment:          TK-103 (Crude Oil External Floating Roof Tank — 80,000 kL)
Description:        Scheduled 6-monthly rim seal inspection → deterioration found
Priority:           MEDIUM → escalated HIGH after findings
Status:             COMPLETED ✅
Raised:             2026-03-01  by  Ankitkumar Rajesh Mehra (ENG-003)
Started:            2026-03-18  (Tank partially de-inventoried to safe level by Hari Shankar Prasad, OPR-007)
Completed:          2026-04-22

Inspection Findings (by Ankitkumar Mehra + Balvantsinh Parmar):
  - Primary wiper seal: worn, multiple gaps (>15 mm) in 3 locations
  - Secondary mechanical shoe seal: 2 shoe assemblies cracked
  - Roof drain: blocked with debris accumulation
  - Pontoon access hatch No.7: hinges corroded (minor)

Contractor:         Tanktech Pvt Ltd (Tank Rim Seal Specialist)
  On-site supervised by: Arvindkumar Ramchand Singh (MECH-004)
  Quality inspected by:  Ankitkumar Rajesh Mehra (ENG-003)
  Sign-Off:              Vikramaditya Iyer (MGT-001) — required for TK-103 due to PESO registration

Repairs:
  1. Primary seal replacement: 45m circumference — Permatex FR-200 (Tanktech)
  2. Secondary seal: replaced 2 × shoe assemblies (Tanktech)
  3. Roof drain cleared + flow tested — by Ganesh Balakrishnan Kumar (MECH-007)
  4. Hatch hinges: WD-40 + zinc primer — by Mahesh Jagannath Tiwari (MECH-009)

Post-repair Seal Verification:
  Inspector: Balvantsinh Govindsinh Parmar (NDT-001)
  Test: API 653 Appendix B + VOC meter check at seal (<5 ppm) — PASSED ✅
  Documented in: IR-2026-040 (Tank Seal Inspection Certificate)

Cost:
  Materials:  ₹3,85,000
  Labour:     ₹1,20,000 (Tanktech contractor + BRC supervision)
  Total:      ₹5,05,000
```

---

## 📂 Historical Work Orders — 2025 (Selected)

| WO Number | Date | Equipment | Description | Lead Technician | Cost (₹) | Downtime (hrs) | Root Cause | Recurring? |
|-----------|------|-----------|-------------|-----------------|---------|----------------|-----------|-----------|
| WO-2025-0023 | 2025-01-15 | P-101B | NDE ball bearing worn — replaced | **Ravi Shankar Kumar** (MECH-001) | 95,000 | 28 | Vibration fatigue from previous misalignment | No |
| WO-2025-0089 | 2025-03-22 | V-301 | PRV-001 seat leak — lapping | **Ganesh Balakrishnan Kumar** (MECH-007) | 45,000 | 6 | Seat particulate damage | No |
| WO-2025-0145 | 2025-05-10 | C-101A | Lube oil cooler E-950A tube bundle cleaning | **Suresh Narayandas Patel** (MECH-006) | 78,000 | 12 | Fouling — CW side biofouling | First time |
| WO-2025-0234 | 2025-07-18 | P-202A | Impeller replaced (cavitation — 2nd event in 7 years) | **Ravi Shankar Kumar** (MECH-001) | 2,20,000 | 48 | Suction strainer fouling → NPSH loss | Yes — 3rd event (see ECR-2025-042) |
| WO-2025-0312 | 2025-09-01 | E-101A | Tube sheet under-deposit pitting — bundle replacement | **Arvindkumar Ramchand Singh** (MECH-004) | 3,50,000 | 96 | CW side corrosion + biofouling | 1st occurrence |
| WO-2025-0445 | 2025-11-20 | V-401 | Refractory lining — spall inspection + anchor fix | **Arvindkumar Ramchand Singh** (MECH-004) | 1,80,000 | 0 (online) | Thermal cycling | Recurring |
| WO-2025-0512 | 2025-12-08 | P-152B | Diaphragm failure in metering pump | **Rameshchandra Gopal Joshi** (MECH-002) | 28,000 | 4 | Normal wear — within expected life | Expected |

---

## 📊 WO Analytics — 2026 YTD

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total WOs Raised (YTD) | 312 | — | — |
| Corrective WOs | 87 (27.9%) | <25% | ⚠️ Above target |
| Emergency WOs | 12 (3.8%) | <3% | ⚠️ Slightly above |
| WOs Completed On Time | 271 (86.9%) | >90% | ⚠️ Below target |
| Average WO Duration | 4.2 days | <3.5 days | ⚠️ Below target |
| Top 1 Technician by WOs | **Ravi Shankar Kumar** — 68 WOs | — | Most experienced |
| Top 2 Technician by WOs | **Rameshchandra Joshi** — 45 WOs | — | — |
| Most Frequent Failure Category | Mechanical Seal (28 WOs) | — | Pattern concern |
| Total Maintenance Spend YTD | ₹3.49 Cr | ₹3.0 Cr | ⚠️ 16% over budget |
