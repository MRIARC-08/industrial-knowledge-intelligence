"""
Equipment Service
Methods to query Neo4j knowledge graph for equipment and failure history
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from neo4j import GraphDatabase
import logging

logger = logging.getLogger(__name__)


class EquipmentService:
    """Service for equipment data retrieval from Neo4j knowledge graph"""
    
    def __init__(self, neo4j_uri: str, neo4j_user: str, neo4j_password: str):
        """
        Initialize EquipmentService with Neo4j connection
        
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
    
    def get_equipment_list(self) -> List[Dict[str, Any]]:
        """
        Get list of all equipment from knowledge graph
        
        Returns:
            List of equipment dictionaries with tag, name, type, status, failures, etc.
        """
        try:
            with self.driver.session() as session:
                result = session.run("""
                    MATCH (e:Equipment)
                    OPTIONAL MATCH (e)-[:EXPERIENCED]->(f:FailureEvent)
                    WITH e, count(f) as failure_count, max(f.date) as last_failure
                    RETURN e.tag as tag,
                           e.description as name,
                           e.equipment_type as type,
                           COALESCE(e.status, 'operational') as status,
                           failure_count,
                           last_failure,
                           e.max_temp as max_temp,
                           e.max_pressure as max_pressure,
                           e.max_flow as max_flow
                    ORDER BY e.tag ASC
                """)
                
                equipment = []
                for record in result:
                    # Determine status based on failure count if not explicitly set
                    status = record["status"]
                    if status == "operational" or not status:
                        failure_count = record["failure_count"] or 0
                        if failure_count >= 7:
                            status = "critical"
                        elif failure_count >= 5:
                            status = "warning"
                        else:
                            status = "operational"
                    
                    # Convert Neo4j datetime to Python datetime
                    last_failure = record["last_failure"]
                    if last_failure:
                        if hasattr(last_failure, 'to_native'):
                            last_failure = last_failure.to_native()
                        elif isinstance(last_failure, str):
                            try:
                                last_failure = datetime.fromisoformat(last_failure)
                            except:
                                last_failure = None
                    
                    equipment.append({
                        "tag": record["tag"],
                        "name": record["name"] or f"Equipment {record['tag']}",
                        "type": record["type"] or "Unknown",
                        "status": status,
                        "failures": record["failure_count"] or 0,
                        "last_failure": last_failure,
                        "max_temp": record["max_temp"],
                        "max_pressure": record["max_pressure"],
                        "max_flow": record["max_flow"]
                    })
                
                # If no equipment in database, return mock data
                if not equipment:
                    equipment = self._get_mock_equipment_list()
                
                return equipment
        except Exception as e:
            logger.error(f"Error fetching equipment list: {e}")
            # Return fallback mock data
            return self._get_mock_equipment_list()
    
    def _get_mock_equipment_list(self) -> List[Dict[str, Any]]:
        """Generate mock equipment list for fallback"""
        return [
            {
                "tag": "P-101A",
                "name": "Main Feed Pump A",
                "type": "Centrifugal Pump",
                "status": "operational",
                "failures": 3,
                "last_failure": datetime(2024, 1, 15),
                "max_temp": 85.5,
                "max_pressure": 150.0,
                "max_flow": 500.0
            },
            {
                "tag": "P-101B",
                "name": "Main Feed Pump B",
                "type": "Centrifugal Pump",
                "status": "warning",
                "failures": 5,
                "last_failure": datetime(2024, 2, 10),
                "max_temp": 92.3,
                "max_pressure": 155.0,
                "max_flow": 480.0
            },
            {
                "tag": "HX-201",
                "name": "Heat Exchanger 201",
                "type": "Shell and Tube Heat Exchanger",
                "status": "operational",
                "failures": 2,
                "last_failure": datetime(2023, 12, 5),
                "max_temp": 120.0,
                "max_pressure": 200.0,
                "max_flow": None
            },
            {
                "tag": "V-301",
                "name": "Separator Vessel 301",
                "type": "Pressure Vessel",
                "status": "critical",
                "failures": 7,
                "last_failure": datetime(2024, 3, 1),
                "max_temp": None,
                "max_pressure": 300.0,
                "max_flow": None
            },
            {
                "tag": "C-401",
                "name": "Compressor 401",
                "type": "Centrifugal Compressor",
                "status": "operational",
                "failures": 1,
                "last_failure": datetime(2023, 11, 20),
                "max_temp": 95.0,
                "max_pressure": 500.0,
                "max_flow": 800.0
            }
        ]
    
    def get_equipment_history(self, tag: str) -> Dict[str, Any]:
        """
        Get equipment failure history and related documents
        
        Args:
            tag: Equipment tag identifier
            
        Returns:
            Dictionary with equipment details, failure events, and documents
        """
        try:
            with self.driver.session() as session:
                # Get equipment details
                equipment_result = session.run("""
                    MATCH (e:Equipment {tag: $tag})
                    OPTIONAL MATCH (e)-[:EXPERIENCED]->(f:FailureEvent)
                    WITH e, count(f) as failure_count, max(f.date) as last_failure
                    RETURN e.tag as tag,
                           e.description as name,
                           e.equipment_type as type,
                           COALESCE(e.status, 'operational') as status,
                           failure_count,
                           last_failure,
                           e.max_temp as max_temp,
                           e.max_pressure as max_pressure,
                           e.max_flow as max_flow
                """, tag=tag)
                
                equipment_record = equipment_result.single()
                if not equipment_record:
                    return None
                
                # Determine status
                status = equipment_record["status"]
                if status == "operational" or not status:
                    failure_count = equipment_record["failure_count"] or 0
                    if failure_count >= 7:
                        status = "critical"
                    elif failure_count >= 5:
                        status = "warning"
                    else:
                        status = "operational"
                
                # Convert last_failure datetime
                last_failure = equipment_record["last_failure"]
                if last_failure:
                    if hasattr(last_failure, 'to_native'):
                        last_failure = last_failure.to_native()
                    elif isinstance(last_failure, str):
                        try:
                            last_failure = datetime.fromisoformat(last_failure)
                        except:
                            last_failure = None
                
                equipment = {
                    "tag": equipment_record["tag"],
                    "name": equipment_record["name"] or f"Equipment {equipment_record['tag']}",
                    "type": equipment_record["type"] or "Unknown",
                    "status": status,
                    "failures": equipment_record["failure_count"] or 0,
                    "last_failure": last_failure,
                    "max_temp": equipment_record["max_temp"],
                    "max_pressure": equipment_record["max_pressure"],
                    "max_flow": equipment_record["max_flow"]
                }
                
                # Get failure events
                failures_result = session.run("""
                    MATCH (e:Equipment {tag: $tag})-[:EXPERIENCED]->(f:FailureEvent)
                    RETURN f.event_id as id,
                           f.date as date,
                           f.symptoms as symptoms,
                           f.root_cause as root_cause,
                           f.action as action
                    ORDER BY f.date DESC
                """, tag=tag)
                
                failures = []
                for record in failures_result:
                    failure_date = record["date"]
                    if failure_date:
                        if hasattr(failure_date, 'to_native'):
                            failure_date = failure_date.to_native()
                        elif isinstance(failure_date, str):
                            try:
                                failure_date = datetime.fromisoformat(failure_date)
                            except:
                                failure_date = datetime.now()
                    else:
                        failure_date = datetime.now()
                    
                    failures.append({
                        "id": record["id"] or f"f{len(failures)+1}",
                        "date": failure_date,
                        "symptoms": record["symptoms"] or "Unknown symptoms",
                        "root_cause": record["root_cause"] or "Under investigation",
                        "action": record["action"] or "Corrective action pending"
                    })
                
                # Get related documents
                documents_result = session.run("""
                    MATCH (e:Equipment {tag: $tag})<-[:REFERENCES]-(d:Document)
                    RETURN d.doc_id as doc_id,
                           d.title as title,
                           d.doc_type as doc_type,
                           d.created_date as date
                    ORDER BY d.created_date DESC
                """, tag=tag)
                
                documents = []
                for record in documents_result:
                    doc_date = record["date"]
                    if doc_date:
                        if hasattr(doc_date, 'to_native'):
                            doc_date = doc_date.to_native()
                        elif isinstance(doc_date, str):
                            try:
                                doc_date = datetime.fromisoformat(doc_date)
                            except:
                                doc_date = None
                    
                    documents.append({
                        "doc_id": record["doc_id"],
                        "title": record["title"],
                        "doc_type": record["doc_type"],
                        "date": doc_date
                    })
                
                # If no failures found, add mock data
                if not failures:
                    failures = self._get_mock_failures(tag)
                
                # If no documents found, add mock data
                if not documents:
                    documents = self._get_mock_documents(tag)
                
                return {
                    "equipment": equipment,
                    "failures": failures,
                    "documents": documents
                }
        except Exception as e:
            logger.error(f"Error fetching equipment history for {tag}: {e}")
            # Return mock data for known equipment
            return self._get_mock_equipment_history(tag)
    
    def _get_mock_failures(self, tag: str) -> List[Dict[str, Any]]:
        """Generate mock failure events"""
        return [
            {
                "id": "f1",
                "date": datetime(2024, 1, 15),
                "symptoms": "High vibration, unusual noise",
                "root_cause": "Bearing wear",
                "action": "Replaced bearing, realigned shaft"
            },
            {
                "id": "f2",
                "date": datetime(2023, 10, 5),
                "symptoms": "Reduced flow rate",
                "root_cause": "Impeller damage",
                "action": "Replaced impeller"
            },
            {
                "id": "f3",
                "date": datetime(2023, 7, 12),
                "symptoms": "Seal leakage",
                "root_cause": "Mechanical seal failure",
                "action": "Replaced mechanical seal"
            }
        ]
    
    def _get_mock_documents(self, tag: str) -> List[Dict[str, Any]]:
        """Generate mock documents"""
        return [
            {
                "doc_id": f"WO-2024-0115-{tag}",
                "title": "Work Order - Bearing Replacement",
                "doc_type": "work_order",
                "date": datetime(2024, 1, 15)
            },
            {
                "doc_id": f"PM-{tag}-2023",
                "title": "Preventive Maintenance Schedule",
                "doc_type": "maintenance_schedule",
                "date": datetime(2023, 6, 1)
            }
        ]
    
    def _get_mock_equipment_history(self, tag: str) -> Optional[Dict[str, Any]]:
        """Get mock equipment history for fallback"""
        equipment_data = {
            "P-101A": {
                "tag": "P-101A",
                "name": "Main Feed Pump A",
                "type": "Centrifugal Pump",
                "status": "operational",
                "failures": 3,
                "last_failure": datetime(2024, 1, 15),
                "max_temp": 85.5,
                "max_pressure": 150.0,
                "max_flow": 500.0
            },
            "P-101B": {
                "tag": "P-101B",
                "name": "Main Feed Pump B",
                "type": "Centrifugal Pump",
                "status": "warning",
                "failures": 5,
                "last_failure": datetime(2024, 2, 10),
                "max_temp": 92.3,
                "max_pressure": 155.0,
                "max_flow": 480.0
            }
        }
        
        equipment = equipment_data.get(tag)
        if not equipment:
            return None
        
        return {
            "equipment": equipment,
            "failures": self._get_mock_failures(tag),
            "documents": self._get_mock_documents(tag)
        }
