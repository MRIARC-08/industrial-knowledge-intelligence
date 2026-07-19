# 🛡️ OT Network & Cybersecurity Events

**Plant:** Bharat Refinery Corporation (BRC)  
**Document Type:** OT (Operational Technology) Security & DCS Network Log  
**Classification:** STRICTLY CONFIDENTIAL  
**Period:** 2026 YTD

---

## 🌐 OT Network Topology Overview

| Zone | Description | Access Control | Key Assets |
|------|-------------|----------------|------------|
| **Zone 3 (OT Operations)** | Main control network (Vnet/IP) | Air-gapped from IT. Remote access via Cisco AnyConnect (MFA only). | Yokogawa CENTUM VP (FCS, HIS), ProSafe-RS (SIS) |
| **Zone 2 (DMZ)** | Intermediate zone for data transfer | Firewall (CheckPoint NGFW) rules whitelist only | Exaquantum Historian, OPC Servers |
| **Zone 1 (IT Corporate)** | Business network | Standard corporate IT security | ERP, CMMS, Email |

---

## 🚨 Security Incidents & Anomalies (2026 YTD)

### SEC-2026-001: Unauthorized USB Insertion Attempt
- **Date/Time**: 2026-03-12 | 14:20
- **Location**: Central Control Room (CCR) - HIS-04 (Operator Console)
- **Detected By**: Endpoint Protection (Trellix) Alert on HIS-04
- **Investigator**: Meenakshi Chandran Iyer (ENG-007)
- **Description**: An operator (Rekha Pillai, OPR-006) attempted to insert a personal USB drive into HIS-04 to view a PDF document. Trellix blocked the mount and triggered a high-priority alert to the OT Security dashboard.
- **Action Taken**: USB drive confiscated by Meenakshi Iyer. Scanned on isolated IT machine — found benign (contained personal tax documents). Rekha Pillai issued a formal warning by Tariq Hussain (MGT-003). 
- **Corrective Action**: Physical USB port blockers installed on all HIS and SIS engineering stations (Completed 2026-03-15).

### SEC-2026-002: Failed VPN Authentication Spikes
- **Date/Time**: 2026-05-22 | 02:00 - 04:30
- **Location**: External VPN Gateway (DMZ)
- **Detected By**: CheckPoint NGFW Intrusion Detection System (IDS)
- **Investigator**: Meenakshi Chandran Iyer (ENG-007) + Corporate IT
- **Description**: 450+ failed login attempts originating from IP addresses in Eastern Europe targeting the OT remote access VPN portal. The attempts used brute-force dictionary attacks against generic usernames (admin, operator, engineer).
- **Action Taken**: IP ranges blacklisted at the perimeter firewall. Verified that MFA (Multi-Factor Authentication) was active and no successful logins occurred.
- **Corrective Action**: VPN portal hidden from public routing; access now requires a pre-authenticated IPsec tunnel from approved vendor endpoints (e.g., Yokogawa, Elliott Group).

### SEC-2026-003: Exaquantum OPC DCOM Error Flood
- **Date/Time**: 2026-07-01 | 09:15
- **Location**: Exaquantum Historian Server (Zone 2 DMZ)
- **Detected By**: DCS System Alarm (System Status Display)
- **Investigator**: Balasubramanian Narayanan (INST-001)
- **Description**: The historian server generated thousands of DCOM connection errors, causing high CPU load and delaying data updates to the CMMS.
- **Action Taken**: Balasubramanian N. identified a misconfigured OPC client application deployed by corporate IT trying to poll data at 10ms intervals instead of the approved 1-second interval. Polling rate corrected.
- **Corrective Action**: Strict change management (MOC) enforcement for any IT applications connecting to the OT DMZ.

---

## 🔒 Patch Management & Maintenance

| System | Last Patched | Next Scheduled Patch | Executed By | Notes |
|--------|--------------|----------------------|-------------|-------|
| Yokogawa CENTUM VP (HIS/FCS) | 2026-02-10 (R6.07 Update 4) | 2026-08-15 (Turnaround) | Meenakshi Iyer / Yokogawa Vendor | Requires plant partial shutdown. |
| Trellix Endpoint Security | 2026-07-01 (Signatures) | 2026-07-08 (Weekly) | Automated via DMZ WSUS | Automated signature updates only. |
| CheckPoint NGFW (DMZ) | 2026-04-15 (R81.20 Take 14) | 2026-10-15 | Corporate IT SecOps | Planned outage window required. |
| Windows OS (Historian/OPC) | 2026-06-15 (May 2026 Rollup) | 2026-07-20 | Balasubramanian N. | Applied manually after testing in staging. |

---

## 🔑 Remote Access Log (Vendor Support)

| Session ID | Date | Vendor | Purpose | Authorized By | Supervised By | Duration |
|------------|------|--------|---------|---------------|---------------|----------|
| RA-2026-104 | 2026-02-10 | Yokogawa | Remote pre-patch health check | Meenakshi Iyer | Balasubramanian N. | 2.5 hrs |
| RA-2026-145 | 2026-04-05 | Elliott Grp | C-101A Governor drift analysis (QPM-2026-0201) | Anandkumar V. | Suresh N. Patel | 1.5 hrs |
| RA-2026-189 | 2026-06-12 | Bently Nevada | System 1 vibration analysis review | Dineshkumar S. | Ravi Shankar Kumar | 1.0 hrs |

*All remote sessions require explicit approval (permit) and are recorded via a jump-host bastion server.*
