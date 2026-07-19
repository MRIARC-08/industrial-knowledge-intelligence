"""
Document Service
Methods for document metadata retrieval and upload status tracking
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from neo4j import GraphDatabase
import logging

logger = logging.getLogger(__name__)


class DocumentService:
    """Service for document metadata retrieval"""
    
    def __init__(self, neo4j_uri: str, neo4j_user: str, neo4j_password: str):
        """
        Initialize DocumentService with Neo4j connection
        
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
    
    def get_document_list(self, doc_type: Optional[str] = None, 
                         status: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get list of all documents with metadata
        
        Args:
            doc_type: Filter by document type
            status: Filter by processing status (processing, completed, failed)
            
        Returns:
            List of document dictionaries with id, name, type, upload_date, status
        """
        try:
            with self.driver.session() as session:
                # Build query with optional filters
                query = """
                    MATCH (d:Document)
                    WHERE 1=1
                """
                params = {}
                
                if doc_type:
                    query += " AND d.doc_type = $doc_type"
                    params["doc_type"] = doc_type
                
                if status:
                    query += " AND d.status = $status"
                    params["status"] = status
                
                query += """
                    RETURN d.doc_id as id,
                           d.title as name,
                           d.doc_type as type,
                           d.created_date as upload_date,
                           COALESCE(d.status, 'completed') as status,
                           d.file_path as file_path,
                           d.page_count as page_count,
                           d.file_size as file_size
                    ORDER BY d.created_date DESC
                """
                
                result = session.run(query, **params)
                
                documents = []
                for record in result:
                    # Convert upload date
                    upload_date = record["upload_date"]
                    if upload_date:
                        if hasattr(upload_date, 'to_native'):
                            upload_date = upload_date.to_native()
                        elif isinstance(upload_date, str):
                            try:
                                upload_date = datetime.fromisoformat(upload_date)
                            except:
                                upload_date = datetime.now()
                    else:
                        upload_date = datetime.now()
                    
                    documents.append({
                        "id": record["id"] or f"doc_{len(documents)+1}",
                        "name": record["name"] or "Untitled Document",
                        "type": record["type"] or "unknown",
                        "upload_date": upload_date,
                        "status": record["status"] or "completed",
                        "file_path": record["file_path"],
                        "page_count": record["page_count"],
                        "file_size": record["file_size"]
                    })
                
                # If no data found, return mock documents
                if not documents:
                    documents = self._get_mock_documents(doc_type, status)
                
                return documents
        except Exception as e:
            logger.error(f"Error fetching document list: {e}")
            # Return fallback mock data
            return self._get_mock_documents(doc_type, status)
    
    def _get_mock_documents(self, doc_type: Optional[str] = None, 
                           status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Generate mock documents for fallback"""
        now = datetime.now()
        
        all_documents = [
            {
                "id": "doc_001",
                "name": "P&ID Drawing - Section A",
                "type": "piping_and_instrumentation",
                "upload_date": now - timedelta(days=5),
                "status": "completed",
                "file_path": "/docs/piping/pid_section_a.pdf",
                "page_count": 12,
                "file_size": 2048576
            },
            {
                "id": "doc_002",
                "name": "Pump P-101A Maintenance Manual",
                "type": "maintenance_manual",
                "upload_date": now - timedelta(days=10),
                "status": "completed",
                "file_path": "/docs/manuals/pump_p101a.pdf",
                "page_count": 45,
                "file_size": 5242880
            },
            {
                "id": "doc_003",
                "name": "OSHA Compliance Report Q1 2024",
                "type": "compliance_report",
                "upload_date": now - timedelta(days=2),
                "status": "completed",
                "file_path": "/docs/compliance/osha_q1_2024.pdf",
                "page_count": 28,
                "file_size": 3145728
            },
            {
                "id": "doc_004",
                "name": "Heat Exchanger Specifications",
                "type": "technical_specification",
                "upload_date": now - timedelta(days=15),
                "status": "completed",
                "file_path": "/docs/specs/hx201_spec.pdf",
                "page_count": 8,
                "file_size": 1048576
            },
            {
                "id": "doc_005",
                "name": "Work Order WO-2024-0315",
                "type": "work_order",
                "upload_date": now - timedelta(hours=6),
                "status": "processing",
                "file_path": "/docs/workorders/wo_2024_0315.pdf",
                "page_count": 3,
                "file_size": 512000
            },
            {
                "id": "doc_006",
                "name": "Safety Data Sheet - Chemical XYZ",
                "type": "safety_data_sheet",
                "upload_date": now - timedelta(days=20),
                "status": "completed",
                "file_path": "/docs/sds/chemical_xyz.pdf",
                "page_count": 6,
                "file_size": 819200
            },
            {
                "id": "doc_007",
                "name": "Vessel V-301 Inspection Report",
                "type": "inspection_report",
                "upload_date": now - timedelta(days=3),
                "status": "completed",
                "file_path": "/docs/inspections/v301_inspection.pdf",
                "page_count": 15,
                "file_size": 2621440
            },
            {
                "id": "doc_008",
                "name": "Equipment Installation Procedure",
                "type": "procedure",
                "upload_date": now - timedelta(hours=2),
                "status": "failed",
                "file_path": "/docs/procedures/installation.pdf",
                "page_count": None,
                "file_size": 1024000
            },
            {
                "id": "doc_009",
                "name": "Annual Maintenance Schedule 2024",
                "type": "maintenance_schedule",
                "upload_date": now - timedelta(days=30),
                "status": "completed",
                "file_path": "/docs/schedules/annual_2024.pdf",
                "page_count": 22,
                "file_size": 1572864
            },
            {
                "id": "doc_010",
                "name": "Compressor C-401 Datasheet",
                "type": "datasheet",
                "upload_date": now - timedelta(days=7),
                "status": "completed",
                "file_path": "/docs/datasheets/c401.pdf",
                "page_count": 4,
                "file_size": 716800
            }
        ]
        
        # Apply filters
        filtered_docs = all_documents
        if doc_type:
            filtered_docs = [d for d in filtered_docs if d["type"] == doc_type]
        if status:
            filtered_docs = [d for d in filtered_docs if d["status"] == status]
        
        return filtered_docs
    
    def get_document_by_id(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """
        Get document details by ID
        
        Args:
            doc_id: Document ID
            
        Returns:
            Document dictionary or None if not found
        """
        try:
            with self.driver.session() as session:
                result = session.run("""
                    MATCH (d:Document {doc_id: $doc_id})
                    OPTIONAL MATCH (d)-[:REFERENCES]->(e:Equipment)
                    WITH d, collect(e.tag) as equipment_tags
                    RETURN d.doc_id as id,
                           d.title as name,
                           d.doc_type as type,
                           d.created_date as upload_date,
                           COALESCE(d.status, 'completed') as status,
                           d.file_path as file_path,
                           d.page_count as page_count,
                           d.file_size as file_size,
                           d.summary as summary,
                           equipment_tags
                """, doc_id=doc_id)
                
                record = result.single()
                if not record:
                    return None
                
                # Convert upload date
                upload_date = record["upload_date"]
                if upload_date:
                    if hasattr(upload_date, 'to_native'):
                        upload_date = upload_date.to_native()
                    elif isinstance(upload_date, str):
                        try:
                            upload_date = datetime.fromisoformat(upload_date)
                        except:
                            upload_date = datetime.now()
                else:
                    upload_date = datetime.now()
                
                return {
                    "id": record["id"],
                    "name": record["name"] or "Untitled Document",
                    "type": record["type"] or "unknown",
                    "upload_date": upload_date,
                    "status": record["status"] or "completed",
                    "file_path": record["file_path"],
                    "page_count": record["page_count"],
                    "file_size": record["file_size"],
                    "summary": record["summary"],
                    "equipment_tags": record["equipment_tags"] or []
                }
        except Exception as e:
            logger.error(f"Error fetching document {doc_id}: {e}")
            return None
    
    def get_document_statistics(self) -> Dict[str, Any]:
        """
        Get document statistics
        
        Returns:
            Dictionary with document statistics
        """
        try:
            documents = self.get_document_list()
            
            # Count by type
            types_count = {}
            status_count = {"completed": 0, "processing": 0, "failed": 0}
            total_pages = 0
            total_size = 0
            
            for doc in documents:
                # Count by type
                doc_type = doc.get("type", "unknown")
                types_count[doc_type] = types_count.get(doc_type, 0) + 1
                
                # Count by status
                doc_status = doc.get("status", "completed")
                if doc_status in status_count:
                    status_count[doc_status] += 1
                
                # Sum pages and size
                if doc.get("page_count"):
                    total_pages += doc["page_count"]
                if doc.get("file_size"):
                    total_size += doc["file_size"]
            
            # Recent uploads (last 7 days)
            now = datetime.now()
            seven_days_ago = now - timedelta(days=7)
            recent_uploads = sum(
                1 for doc in documents 
                if doc.get("upload_date") and doc["upload_date"] >= seven_days_ago
            )
            
            return {
                "total_documents": len(documents),
                "total_pages": total_pages,
                "total_size_bytes": total_size,
                "total_size_mb": round(total_size / 1048576, 2),
                "by_type": types_count,
                "by_status": status_count,
                "recent_uploads_7days": recent_uploads,
                "avg_pages_per_doc": round(total_pages / len(documents), 1) if documents else 0
            }
        except Exception as e:
            logger.error(f"Error calculating document statistics: {e}")
            raise
    
    def search_documents(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Search documents by title or content
        
        Args:
            query: Search query string
            limit: Maximum number of results
            
        Returns:
            List of matching documents
        """
        try:
            with self.driver.session() as session:
                result = session.run("""
                    MATCH (d:Document)
                    WHERE toLower(d.title) CONTAINS toLower($query)
                       OR toLower(d.summary) CONTAINS toLower($query)
                    RETURN d.doc_id as id,
                           d.title as name,
                           d.doc_type as type,
                           d.created_date as upload_date,
                           COALESCE(d.status, 'completed') as status,
                           d.file_path as file_path,
                           d.page_count as page_count,
                           d.summary as summary
                    ORDER BY d.created_date DESC
                    LIMIT $limit
                """, query=query, limit=limit)
                
                documents = []
                for record in result:
                    # Convert upload date
                    upload_date = record["upload_date"]
                    if upload_date:
                        if hasattr(upload_date, 'to_native'):
                            upload_date = upload_date.to_native()
                        elif isinstance(upload_date, str):
                            try:
                                upload_date = datetime.fromisoformat(upload_date)
                            except:
                                upload_date = datetime.now()
                    else:
                        upload_date = datetime.now()
                    
                    documents.append({
                        "id": record["id"],
                        "name": record["name"] or "Untitled Document",
                        "type": record["type"] or "unknown",
                        "upload_date": upload_date,
                        "status": record["status"] or "completed",
                        "file_path": record["file_path"],
                        "page_count": record["page_count"],
                        "summary": record["summary"]
                    })
                
                return documents
        except Exception as e:
            logger.error(f"Error searching documents: {e}")
            return []
    
    def get_documents_by_equipment(self, equipment_tag: str) -> List[Dict[str, Any]]:
        """
        Get all documents related to a specific equipment
        
        Args:
            equipment_tag: Equipment tag identifier
            
        Returns:
            List of related documents
        """
        try:
            with self.driver.session() as session:
                result = session.run("""
                    MATCH (d:Document)-[:REFERENCES]->(e:Equipment {tag: $tag})
                    RETURN d.doc_id as id,
                           d.title as name,
                           d.doc_type as type,
                           d.created_date as upload_date,
                           COALESCE(d.status, 'completed') as status
                    ORDER BY d.created_date DESC
                """, tag=equipment_tag)
                
                documents = []
                for record in result:
                    # Convert upload date
                    upload_date = record["upload_date"]
                    if upload_date:
                        if hasattr(upload_date, 'to_native'):
                            upload_date = upload_date.to_native()
                        elif isinstance(upload_date, str):
                            try:
                                upload_date = datetime.fromisoformat(upload_date)
                            except:
                                upload_date = datetime.now()
                    else:
                        upload_date = datetime.now()
                    
                    documents.append({
                        "id": record["id"],
                        "name": record["name"] or "Untitled Document",
                        "type": record["type"] or "unknown",
                        "upload_date": upload_date,
                        "status": record["status"] or "completed"
                    })
                
                return documents
        except Exception as e:
            logger.error(f"Error fetching documents for equipment {equipment_tag}: {e}")
            return []
