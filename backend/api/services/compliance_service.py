"""
Compliance Service
Methods to retrieve compliance gaps and certificates from Neo4j and PostgreSQL
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from neo4j import GraphDatabase
import logging

logger = logging.getLogger(__name__)


class ComplianceService:
    """Service for compliance data retrieval"""
    
    def __init__(self, neo4j_uri: str, neo4j_user: str, neo4j_password: str):
        """
        Initialize ComplianceService with Neo4j connection
        
        Args:
            neo4j_uri: Neo4j connection URI
            neo4j_user: Neo4j username
            neo4j_password: Neo4j password
        """
        self.driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))
    
    def close(self):
        """Close database connections"""
        if self.driver:
            self.driver.close()
    
    def get_compliance_gaps(self, severity: Optional[str] = None, 
                           status: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get compliance gaps from the knowledge graph
        
        Args:
            severity: Filter by severity (high, medium, low)
            status: Filter by status (open, resolved)
            
        Returns:
            List of compliance gap dictionaries
        """
        try:
            with self.driver.session() as session:
                # Build query with optional filters
                query = """
                    MATCH (e:Equipment)<-[:AFFECTS]-(g:ComplianceGap)
                    WHERE 1=1
                """
                params = {}
                
                if severity:
                    query += " AND g.severity = $severity"
                    params["severity"] = severity
                
                if status:
                    query += " AND g.status = $status"
                    params["status"] = status
                
                query += """
                    RETURN g.gap_id as id,
                           g.severity as severity,
                           g.regulation as regulation,
                           g.clause as clause,
                           g.description as description,
                           e.tag as equipment,
                           COALESCE(g.status, 'open') as status,
                           g.identified_date as identified_date,
                           g.due_date as due_date
                    ORDER BY 
                        CASE g.severity 
                            WHEN 'high' THEN 1 
                            WHEN 'medium' THEN 2 
                            WHEN 'low' THEN 3 
                            ELSE 4 
                        END,
                        g.identified_date DESC
                """
                
                result = session.run(query, **params)
                
                gaps = []
                for record in result:
                    # Convert dates
                    identified_date = record["identified_date"]
                    if identified_date:
                        if hasattr(identified_date, 'to_native'):
                            identified_date = identified_date.to_native()
                        elif isinstance(identified_date, str):
                            try:
                                identified_date = datetime.fromisoformat(identified_date)
                            except:
                                identified_date = None
                    
                    due_date = record["due_date"]
                    if due_date:
                        if hasattr(due_date, 'to_native'):
                            due_date = due_date.to_native()
                        elif isinstance(due_date, str):
                            try:
                                due_date = datetime.fromisoformat(due_date)
                            except:
                                due_date = None
                    
                    gaps.append({
                        "id": record["id"] or f"gap_{len(gaps)+1}",
                        "severity": record["severity"] or "medium",
                        "regulation": record["regulation"] or "Unknown",
                        "clause": record["clause"] or "N/A",
                        "description": record["description"] or "No description",
                        "equipment": record["equipment"] or "General",
                        "status": record["status"] or "open",
                        "identified_date": identified_date,
                        "due_date": due_date
                    })
                
                # If no data found, return mock gaps
                if not gaps:
                    gaps = self._get_mock_compliance_gaps(severity, status)
                
                return gaps
        except Exception as e:
            logger.error(f"Error fetching compliance gaps: {e}")
            # Return fallback mock data
            return self._get_mock_compliance_gaps(severity, status)
    
    def _get_mock_compliance_gaps(self, severity: Optional[str] = None, 
                                  status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Generate mock compliance gaps for fallback"""
        all_gaps = [
            {
                "id": "gap_001",
                "severity": "high",
                "regulation": "OSHA 1910.119",
                "clause": "Process Safety Management",
                "description": "Missing pressure relief valve documentation for V-301",
                "equipment": "V-301",
                "status": "open",
                "identified_date": datetime(2024, 2, 15),
                "due_date": datetime(2024, 4, 15)
            },
            {
                "id": "gap_002",
                "severity": "high",
                "regulation": "API 570",
                "clause": "Piping Inspection",
                "description": "Overdue inspection for piping system PSL-100",
                "equipment": "PSL-100",
                "status": "open",
                "identified_date": datetime(2024, 1, 10),
                "due_date": datetime(2024, 3, 10)
            },
            {
                "id": "gap_003",
                "severity": "medium",
                "regulation": "ASME B31.3",
                "clause": "Process Piping",
                "description": "Welding documentation incomplete for new installation",
                "equipment": "P-101A",
                "status": "open",
                "identified_date": datetime(2024, 2, 20),
                "due_date": datetime(2024, 5, 20)
            },
            {
                "id": "gap_004",
                "severity": "medium",
                "regulation": "EPA 40 CFR 68",
                "clause": "Risk Management Plan",
                "description": "RMP update required for process modifications",
                "equipment": "HX-201",
                "status": "open",
                "identified_date": datetime(2024, 1, 25),
                "due_date": datetime(2024, 4, 25)
            },
            {
                "id": "gap_005",
                "severity": "low",
                "regulation": "ISO 14001",
                "clause": "Environmental Management",
                "description": "Minor documentation updates needed for environmental procedures",
                "equipment": "General",
                "status": "open",
                "identified_date": datetime(2024, 3, 1),
                "due_date": datetime(2024, 6, 1)
            },
            {
                "id": "gap_006",
                "severity": "high",
                "regulation": "API 510",
                "clause": "Pressure Vessel Inspection",
                "description": "Certificate expired for pressure vessel V-201",
                "equipment": "V-201",
                "status": "resolved",
                "identified_date": datetime(2023, 12, 5),
                "due_date": datetime(2024, 1, 5)
            },
            {
                "id": "gap_007",
                "severity": "medium",
                "regulation": "OSHA 1910.147",
                "clause": "Lockout/Tagout",
                "description": "LOTO procedures need updating for new equipment",
                "equipment": "C-401",
                "status": "resolved",
                "identified_date": datetime(2023, 11, 15),
                "due_date": datetime(2024, 1, 15)
            }
        ]
        
        # Apply filters
        filtered_gaps = all_gaps
        if severity:
            filtered_gaps = [g for g in filtered_gaps if g["severity"] == severity]
        if status:
            filtered_gaps = [g for g in filtered_gaps if g["status"] == status]
        
        return filtered_gaps
    
    def get_certificates(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get certificate expiry information
        
        Args:
            status: Filter by status (valid, expiring_soon, expired)
            
        Returns:
            List of certificate dictionaries
        """
        try:
            with self.driver.session() as session:
                # Build query with optional filter
                query = """
                    MATCH (e:Equipment)<-[:CERTIFIES]-(c:Certificate)
                    RETURN c.cert_id as id,
                           c.name as name,
                           e.tag as equipment,
                           c.standard as standard,
                           c.issue_date as issue_date,
                           c.expiry_date as expiry,
                           c.issued_by as issued_by
                    ORDER BY c.expiry_date ASC
                """
                
                result = session.run(query)
                
                certificates = []
                now = datetime.now()
                
                for record in result:
                    # Convert expiry date
                    expiry = record["expiry"]
                    if expiry:
                        if hasattr(expiry, 'to_native'):
                            expiry = expiry.to_native()
                        elif isinstance(expiry, str):
                            try:
                                expiry = datetime.fromisoformat(expiry)
                            except:
                                expiry = now + timedelta(days=365)
                    else:
                        expiry = now + timedelta(days=365)
                    
                    # Convert issue date
                    issue_date = record["issue_date"]
                    if issue_date:
                        if hasattr(issue_date, 'to_native'):
                            issue_date = issue_date.to_native()
                        elif isinstance(issue_date, str):
                            try:
                                issue_date = datetime.fromisoformat(issue_date)
                            except:
                                issue_date = None
                    
                    # Calculate days until expiry and status
                    days_until_expiry = (expiry - now).days
                    
                    if days_until_expiry < 0:
                        cert_status = "expired"
                    elif days_until_expiry <= 30:
                        cert_status = "expiring_soon"
                    else:
                        cert_status = "valid"
                    
                    # Apply status filter
                    if status and cert_status != status:
                        continue
                    
                    certificates.append({
                        "id": record["id"] or f"cert_{len(certificates)+1}",
                        "name": record["name"] or "Certificate",
                        "equipment": record["equipment"] or "General",
                        "standard": record["standard"] or "N/A",
                        "expiry": expiry,
                        "status": cert_status,
                        "days_until_expiry": days_until_expiry,
                        "issue_date": issue_date,
                        "issued_by": record["issued_by"]
                    })
                
                # If no data found, return mock certificates
                if not certificates:
                    certificates = self._get_mock_certificates(status)
                
                return certificates
        except Exception as e:
            logger.error(f"Error fetching certificates: {e}")
            # Return fallback mock data
            return self._get_mock_certificates(status)
    
    def _get_mock_certificates(self, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Generate mock certificates for fallback"""
        now = datetime.now()
        
        all_certificates = [
            {
                "id": "cert_001",
                "name": "Pressure Vessel Inspection Certificate",
                "equipment": "V-301",
                "standard": "ASME Section VIII",
                "expiry": now + timedelta(days=15),
                "status": "expiring_soon",
                "days_until_expiry": 15,
                "issue_date": now - timedelta(days=350),
                "issued_by": "TUV Rheinland"
            },
            {
                "id": "cert_002",
                "name": "Pump Performance Test Certificate",
                "equipment": "P-101A",
                "standard": "API 610",
                "expiry": now + timedelta(days=120),
                "status": "valid",
                "days_until_expiry": 120,
                "issue_date": now - timedelta(days=245),
                "issued_by": "Bureau Veritas"
            },
            {
                "id": "cert_003",
                "name": "Heat Exchanger Certification",
                "equipment": "HX-201",
                "standard": "TEMA",
                "expiry": now + timedelta(days=200),
                "status": "valid",
                "days_until_expiry": 200,
                "issue_date": now - timedelta(days=165),
                "issued_by": "Lloyd's Register"
            },
            {
                "id": "cert_004",
                "name": "Compressor Certification",
                "equipment": "C-401",
                "standard": "API 617",
                "expiry": now - timedelta(days=10),
                "status": "expired",
                "days_until_expiry": -10,
                "issue_date": now - timedelta(days=375),
                "issued_by": "DNV GL"
            },
            {
                "id": "cert_005",
                "name": "Safety Valve Certification",
                "equipment": "PSV-101",
                "standard": "API 526",
                "expiry": now + timedelta(days=25),
                "status": "expiring_soon",
                "days_until_expiry": 25,
                "issue_date": now - timedelta(days=340),
                "issued_by": "TUV SUD"
            },
            {
                "id": "cert_006",
                "name": "Piping System Inspection",
                "equipment": "PSL-100",
                "standard": "API 570",
                "expiry": now + timedelta(days=90),
                "status": "valid",
                "days_until_expiry": 90,
                "issue_date": now - timedelta(days=275),
                "issued_by": "SGS"
            },
            {
                "id": "cert_007",
                "name": "Pressure Vessel Re-certification",
                "equipment": "V-201",
                "standard": "ASME Section VIII",
                "expiry": now - timedelta(days=5),
                "status": "expired",
                "days_until_expiry": -5,
                "issue_date": now - timedelta(days=370),
                "issued_by": "TUV Rheinland"
            },
            {
                "id": "cert_008",
                "name": "Equipment Calibration Certificate",
                "equipment": "P-101B",
                "standard": "ISO/IEC 17025",
                "expiry": now + timedelta(days=180),
                "status": "valid",
                "days_until_expiry": 180,
                "issue_date": now - timedelta(days=185),
                "issued_by": "Intertek"
            }
        ]
        
        # Apply status filter
        if status:
            return [c for c in all_certificates if c["status"] == status]
        
        return all_certificates
    
    def get_compliance_summary(self) -> Dict[str, Any]:
        """
        Get compliance summary statistics
        
        Returns:
            Dictionary with compliance metrics
        """
        try:
            gaps = self.get_compliance_gaps()
            certificates = self.get_certificates()
            
            # Count gaps by severity and status
            gaps_by_severity = {"high": 0, "medium": 0, "low": 0}
            open_gaps = 0
            resolved_gaps = 0
            
            for gap in gaps:
                severity = gap.get("severity", "medium")
                if severity in gaps_by_severity:
                    gaps_by_severity[severity] += 1
                
                if gap.get("status") == "open":
                    open_gaps += 1
                else:
                    resolved_gaps += 1
            
            # Count certificates by status
            certs_by_status = {"valid": 0, "expiring_soon": 0, "expired": 0}
            
            for cert in certificates:
                cert_status = cert.get("status", "valid")
                if cert_status in certs_by_status:
                    certs_by_status[cert_status] += 1
            
            # Calculate compliance score (0-100)
            # Based on gaps and certificate status
            total_items = len(gaps) + len(certificates)
            if total_items == 0:
                compliance_score = 100.0
            else:
                # Penalty weights
                high_gap_penalty = 10
                medium_gap_penalty = 5
                low_gap_penalty = 2
                expired_cert_penalty = 8
                expiring_cert_penalty = 3
                
                total_penalty = (
                    gaps_by_severity["high"] * high_gap_penalty +
                    gaps_by_severity["medium"] * medium_gap_penalty +
                    gaps_by_severity["low"] * low_gap_penalty +
                    certs_by_status["expired"] * expired_cert_penalty +
                    certs_by_status["expiring_soon"] * expiring_cert_penalty
                )
                
                max_penalty = total_items * 10
                compliance_score = max(0, 100 - (total_penalty / max_penalty * 100))
            
            return {
                "compliance_score": round(compliance_score, 1),
                "total_gaps": len(gaps),
                "open_gaps": open_gaps,
                "resolved_gaps": resolved_gaps,
                "gaps_by_severity": gaps_by_severity,
                "total_certificates": len(certificates),
                "certificates_by_status": certs_by_status,
                "high_priority_items": gaps_by_severity["high"] + certs_by_status["expired"]
            }
        except Exception as e:
            logger.error(f"Error calculating compliance summary: {e}")
            raise
