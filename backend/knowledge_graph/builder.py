from neo4j import GraphDatabase
import logging

logger = logging.getLogger(__name__)

class KnowledgeGraphBuilder:
    _driver = None
    
    @classmethod
    def get_driver(cls, uri, user, password):
        if cls._driver is None:
            cls._driver = GraphDatabase.driver(
                uri, 
                auth=(user, password),
                max_connection_pool_size=50
            )
        return cls._driver
        
    def __init__(self, uri, user, password):
        self.driver = self.get_driver(uri, user, password)
    
    def close(self):
        # We are using a connection pool now, so we don't close the driver per request.
        pass

    def initialize_schema(self):
        with self.driver.session() as session:
            session.run("CREATE CONSTRAINT equipment_tag IF NOT EXISTS FOR (e:Equipment) REQUIRE e.tag IS UNIQUE")
            session.run("CREATE CONSTRAINT document_id IF NOT EXISTS FOR (d:Document) REQUIRE d.doc_id IS UNIQUE")
            session.run("CREATE CONSTRAINT failure_event_id IF NOT EXISTS FOR (f:FailureEvent) REQUIRE f.event_id IS UNIQUE")
            logger.info("Graph schema initialized")

    def create_equipment(self, equipment):
        with self.driver.session() as session:
            result = session.execute_write(self._create_equipment_node, equipment.model_dump())
            return result

    @staticmethod
    def _create_equipment_node(tx, equipment_dict):
        query = (
            "MERGE (e:Equipment {tag: $tag}) "
            "SET e.description = $description, "
            "e.equipment_type = $equipment_type, "
            "e.location = $location "
            "RETURN e"
        )
        result = tx.run(query, **equipment_dict)
        return result.single()[0]

    def create_document(self, document):
        with self.driver.session() as session:
            # handle date serialization correctly
            doc_dict = document.model_dump()
            if doc_dict.get('created_date'):
                doc_dict['created_date'] = doc_dict['created_date'].isoformat()
            
            result = session.execute_write(self._create_document_node, doc_dict)
            return result
    
    @staticmethod
    def _create_document_node(tx, document_dict):
        query = (
            "MERGE (d:Document {doc_id: $doc_id}) "
            "SET d.title = $title, "
            "d.doc_type = $doc_type, "
            "d.url = $url, "
            "d.created_date = $created_date "
            "RETURN d"
        )
        result = tx.run(query, **document_dict)
        return result.single()[0]

    def link_document_to_equipment(self, doc_id, equipment_tag, relation_type="REFERENCES"):
        with self.driver.session() as session:
            result = session.execute_write(self._link_doc_equipment, doc_id, equipment_tag, relation_type)
            return result

    @staticmethod
    def _link_doc_equipment(tx, doc_id, equipment_tag, relation_type):
        # We assume doc and equipment nodes already exist, hence MERGE relationship
        query = (
            "MATCH (d:Document {doc_id: $doc_id}) "
            "MATCH (e:Equipment {tag: $equipment_tag}) "
            f"MERGE (d)-[r:{relation_type}]->(e) "
            "RETURN r"
        )
        result = tx.run(query, doc_id=doc_id, equipment_tag=equipment_tag)
        record = result.single()
        return record[0] if record else None
        
    def get_failure_history(self, tag: str) -> list:
        with self.driver.session() as session:
            result = session.run(
                "MATCH (e:Equipment {tag: $tag})-[:EXPERIENCED]->(f:FailureEvent) "
                "RETURN f ORDER BY f.date DESC",
                tag=tag
            )
            return [dict(record["f"]) for record in result]
            
    def find_similar_failures(self, root_cause: str) -> list:
        with self.driver.session() as session:
            result = session.run(
                "MATCH (e:Equipment)-[:EXPERIENCED]->(f:FailureEvent) "
                "WHERE toLower(f.root_cause) CONTAINS toLower($root_cause) "
                "RETURN e.tag as tag, count(f) as failure_count "
                "ORDER BY failure_count DESC",
                root_cause=root_cause
            )
            return [{"tag": record["tag"], "failure_count": record["failure_count"]} for record in result]
            
    def get_related_documents(self, tag: str) -> list:
        with self.driver.session() as session:
            result = session.run(
                "MATCH (e:Equipment {tag: $tag})<-[:REFERENCES]-(d:Document) "
                "RETURN d.title as title, d.doc_type as doc_type",
                tag=tag
            )
            return [{"title": record["title"], "doc_type": record["doc_type"]} for record in result]
