"""
Health Service
Methods to check Neo4j, Qdrant, PostgreSQL, and Redis connection health
"""
from typing import Dict, Any, Optional
from datetime import datetime
from neo4j import GraphDatabase
import logging
import time

logger = logging.getLogger(__name__)


class HealthService:
    """Service for system health monitoring"""
    
    def __init__(self, 
                 neo4j_uri: str, 
                 neo4j_user: str, 
                 neo4j_password: str,
                 qdrant_url: str,
                 postgres_config: Optional[Dict[str, str]] = None,
                 redis_url: Optional[str] = None):
        """
        Initialize HealthService with connection parameters
        
        Args:
            neo4j_uri: Neo4j connection URI
            neo4j_user: Neo4j username
            neo4j_password: Neo4j password
            qdrant_url: Qdrant service URL
            postgres_config: PostgreSQL connection configuration
            redis_url: Redis connection URL
        """
        self.neo4j_uri = neo4j_uri
        self.neo4j_user = neo4j_user
        self.neo4j_password = neo4j_password
        self.qdrant_url = qdrant_url
        self.postgres_config = postgres_config or {}
        self.redis_url = redis_url
        
        # Initialize drivers (will be created on demand)
        self.neo4j_driver = None
    
    def close(self):
        """Close all database connections"""
        if self.neo4j_driver:
            self.neo4j_driver.close()
            self.neo4j_driver = None
    
    def check_neo4j_health(self) -> Dict[str, Any]:
        """
        Check Neo4j database health
        
        Returns:
            Dictionary with status, response_time, and metadata
        """
        start_time = time.time()
        
        try:
            # Create driver if not exists
            if not self.neo4j_driver:
                self.neo4j_driver = GraphDatabase.driver(
                    self.neo4j_uri, 
                    auth=(self.neo4j_user, self.neo4j_password)
                )
            
            # Verify connectivity with a simple query
            with self.neo4j_driver.session() as session:
                result = session.run("RETURN 1 as test")
                result.single()
                
                # Get database info
                db_info = session.run("""
                    CALL dbms.components() YIELD name, versions, edition
                    RETURN name, versions[0] as version, edition
                """)
                info_record = db_info.single()
                
                # Count nodes
                count_result = session.run("MATCH (n) RETURN count(n) as node_count")
                count_record = count_result.single()
                node_count = count_record["node_count"] if count_record else 0
                
                response_time = (time.time() - start_time) * 1000  # Convert to ms
                
                return {
                    "name": "Neo4j",
                    "status": "healthy",
                    "response_time": round(response_time, 2),
                    "version": info_record["version"] if info_record else "unknown",
                    "edition": info_record["edition"] if info_record else "unknown",
                    "node_count": node_count,
                    "timestamp": datetime.now()
                }
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            logger.error(f"Neo4j health check failed: {e}")
            return {
                "name": "Neo4j",
                "status": "down",
                "response_time": round(response_time, 2),
                "error": str(e),
                "timestamp": datetime.now()
            }
    
    def check_qdrant_health(self) -> Dict[str, Any]:
        """
        Check Qdrant vector database health
        
        Returns:
            Dictionary with status, response_time, and metadata
        """
        start_time = time.time()
        
        try:
            # Try to import qdrant_client
            try:
                from qdrant_client import QdrantClient
            except ImportError:
                logger.warning("Qdrant client not installed")
                return {
                    "name": "Qdrant",
                    "status": "degraded",
                    "response_time": 0,
                    "error": "Qdrant client not installed",
                    "timestamp": datetime.now()
                }
            
            # Create client and check health
            client = QdrantClient(url=self.qdrant_url)
            
            # Get collections info
            collections = client.get_collections()
            collection_count = len(collections.collections) if collections else 0
            
            # Get total vector count across all collections
            total_vectors = 0
            collection_names = []
            
            if collections and collections.collections:
                for collection in collections.collections:
                    collection_names.append(collection.name)
                    try:
                        collection_info = client.get_collection(collection.name)
                        if collection_info and hasattr(collection_info, 'vectors_count'):
                            total_vectors += collection_info.vectors_count
                        elif collection_info and hasattr(collection_info, 'points_count'):
                            total_vectors += collection_info.points_count
                    except:
                        pass
            
            response_time = (time.time() - start_time) * 1000
            
            return {
                "name": "Qdrant",
                "status": "healthy",
                "response_time": round(response_time, 2),
                "collection_count": collection_count,
                "vector_count": total_vectors,
                "collections": collection_names,
                "timestamp": datetime.now()
            }
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            logger.error(f"Qdrant health check failed: {e}")
            return {
                "name": "Qdrant",
                "status": "down",
                "response_time": round(response_time, 2),
                "error": str(e),
                "timestamp": datetime.now()
            }
    
    def check_postgresql_health(self) -> Dict[str, Any]:
        """
        Check PostgreSQL database health
        
        Returns:
            Dictionary with status, response_time, and metadata
        """
        start_time = time.time()
        
        try:
            # Try to import psycopg2
            try:
                import psycopg2
            except ImportError:
                logger.warning("psycopg2 not installed")
                return {
                    "name": "PostgreSQL",
                    "status": "degraded",
                    "response_time": 0,
                    "error": "psycopg2 not installed",
                    "timestamp": datetime.now()
                }
            
            # Build connection string
            conn_params = {
                "host": self.postgres_config.get("host", "localhost"),
                "port": self.postgres_config.get("port", "5432"),
                "database": self.postgres_config.get("database", "postgres"),
                "user": self.postgres_config.get("user", "postgres"),
                "password": self.postgres_config.get("password", "password")
            }
            
            # Connect and check health
            conn = psycopg2.connect(**conn_params)
            cursor = conn.cursor()
            
            # Get PostgreSQL version
            cursor.execute("SELECT version()")
            version = cursor.fetchone()[0].split()[1] if cursor.rowcount > 0 else "unknown"
            
            # Get database size
            cursor.execute("""
                SELECT pg_database_size(current_database())
            """)
            db_size_bytes = cursor.fetchone()[0] if cursor.rowcount > 0 else 0
            db_size_mb = round(db_size_bytes / 1048576, 2)
            
            # Get connection count
            cursor.execute("""
                SELECT count(*) FROM pg_stat_activity
            """)
            connection_count = cursor.fetchone()[0] if cursor.rowcount > 0 else 0
            
            cursor.close()
            conn.close()
            
            response_time = (time.time() - start_time) * 1000
            
            return {
                "name": "PostgreSQL",
                "status": "healthy",
                "response_time": round(response_time, 2),
                "version": version,
                "database_size_mb": db_size_mb,
                "active_connections": connection_count,
                "timestamp": datetime.now()
            }
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            logger.error(f"PostgreSQL health check failed: {e}")
            return {
                "name": "PostgreSQL",
                "status": "down",
                "response_time": round(response_time, 2),
                "error": str(e),
                "timestamp": datetime.now()
            }
    
    def check_redis_health(self) -> Dict[str, Any]:
        """
        Check Redis cache health
        
        Returns:
            Dictionary with status, response_time, and metadata
        """
        start_time = time.time()
        
        try:
            # Try to import redis
            try:
                import redis
            except ImportError:
                logger.warning("redis not installed")
                return {
                    "name": "Redis",
                    "status": "degraded",
                    "response_time": 0,
                    "error": "redis client not installed",
                    "timestamp": datetime.now()
                }
            
            # Connect to Redis
            r = redis.from_url(self.redis_url or "redis://localhost:6379")
            
            # Ping Redis
            r.ping()
            
            # Get Redis info
            info = r.info()
            
            # Get key count
            db_info = r.info("keyspace")
            key_count = 0
            if "db0" in db_info:
                key_count = db_info["db0"].get("keys", 0)
            
            response_time = (time.time() - start_time) * 1000
            
            return {
                "name": "Redis",
                "status": "healthy",
                "response_time": round(response_time, 2),
                "version": info.get("redis_version", "unknown"),
                "used_memory_mb": round(info.get("used_memory", 0) / 1048576, 2),
                "connected_clients": info.get("connected_clients", 0),
                "key_count": key_count,
                "timestamp": datetime.now()
            }
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            logger.error(f"Redis health check failed: {e}")
            return {
                "name": "Redis",
                "status": "down",
                "response_time": round(response_time, 2),
                "error": str(e),
                "timestamp": datetime.now()
            }
    
    def check_fastapi_health(self) -> Dict[str, Any]:
        """
        Check FastAPI service health (basic check)
        
        Returns:
            Dictionary with status and metadata
        """
        return {
            "name": "FastAPI",
            "status": "healthy",
            "response_time": 0,
            "timestamp": datetime.now(),
            "message": "API service is running"
        }
    
    def get_system_health(self) -> Dict[str, Any]:
        """
        Get comprehensive system health status
        
        Returns:
            Dictionary with all service statuses and system metrics
        """
        try:
            # Check all services
            services = [
                self.check_fastapi_health(),
                self.check_neo4j_health(),
                self.check_qdrant_health(),
                self.check_postgresql_health(),
                self.check_redis_health()
            ]
            
            # Calculate overall status
            statuses = [s["status"] for s in services]
            if all(status == "healthy" for status in statuses):
                overall_status = "healthy"
            elif any(status == "down" for status in statuses):
                overall_status = "degraded"
            else:
                overall_status = "degraded"
            
            # Count by status
            healthy_count = sum(1 for s in statuses if s == "healthy")
            degraded_count = sum(1 for s in statuses if s == "degraded")
            down_count = sum(1 for s in statuses if s == "down")
            
            # Calculate average response time (excluding FastAPI)
            response_times = [s.get("response_time", 0) for s in services if s.get("response_time", 0) > 0]
            avg_response_time = round(sum(response_times) / len(response_times), 2) if response_times else 0
            
            # Get metrics from Neo4j health check
            neo4j_health = next((s for s in services if s["name"] == "Neo4j"), {})
            qdrant_health = next((s for s in services if s["name"] == "Qdrant"), {})
            
            # Calculate system metrics (with fallback values)
            metrics = {
                "queries_per_min": 0,  # Would need query log analysis
                "avg_response_ms": avg_response_time,
                "cache_hit_rate": 0.0,  # Would need Redis statistics
                "error_rate": 0.0,  # Would need error log analysis
                "documents": 0,  # Would need document count
                "graph_nodes": neo4j_health.get("node_count", 0),
                "vector_embeddings": qdrant_health.get("vector_count", 0)
            }
            
            return {
                "overall_status": overall_status,
                "timestamp": datetime.now(),
                "services": services,
                "summary": {
                    "total_services": len(services),
                    "healthy": healthy_count,
                    "degraded": degraded_count,
                    "down": down_count
                },
                "metrics": metrics
            }
        except Exception as e:
            logger.error(f"Error getting system health: {e}")
            raise
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """
        Get detailed system performance metrics
        
        Returns:
            Dictionary with performance metrics
        """
        try:
            # Get basic health info
            neo4j_health = self.check_neo4j_health()
            qdrant_health = self.check_qdrant_health()
            redis_health = self.check_redis_health()
            
            # In a real implementation, these would come from monitoring systems
            # For now, return reasonable default/calculated values
            return {
                "queries_per_min": 0,  # Would track from query logs
                "avg_response_ms": round((
                    neo4j_health.get("response_time", 0) +
                    qdrant_health.get("response_time", 0) +
                    redis_health.get("response_time", 0)
                ) / 3, 2),
                "cache_hit_rate": 0.0,  # Would calculate from Redis stats
                "error_rate": 0.0,  # Would calculate from error logs
                "documents": 0,  # Would query from document count
                "graph_nodes": neo4j_health.get("node_count", 0),
                "vector_embeddings": qdrant_health.get("vector_count", 0),
                "timestamp": datetime.now()
            }
        except Exception as e:
            logger.error(f"Error getting system metrics: {e}")
            raise
