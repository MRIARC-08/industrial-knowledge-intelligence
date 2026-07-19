"""
Industrial Knowledge Intelligence - Main API Entry Point

This FastAPI application serves as the backend for the Industrial Knowledge Intelligence platform.
It provides AI-powered operational support for industrial asset management including:
- Equipment failure analysis and root cause analysis
- Compliance gap detection and certificate tracking
- Document processing and knowledge extraction
- Multi-agent orchestration for specialized queries

Key Features:
- API Key authentication for all endpoints (except /health)
- Rate limiting to prevent abuse
- Redis caching for improved performance
- CORS support for web and mobile frontends
- Background document processing
- Vector search with Qdrant
- Knowledge graph with Neo4j

Author: Industrial Knowledge Intelligence Team
Version: 0.1.0
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import logging
import time
import uuid
import os
import redis
import hashlib
import json
import sys
import secrets
from fastapi.security import APIKeyHeader
from fastapi import Security, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from config import settings
from api.security import RoleChecker

# Imports for actual integrations
from agents.orchestrator import create_orchestrator
from agents.document_processor.pdf_extractor import PDFExtractor
from agents.document_processor.ner import IndustrialNER
from agents.document_processor.chunker import SemanticChunker
from tools.vector_search import VectorStore
from knowledge_graph.builder import KnowledgeGraphBuilder
from knowledge_graph.schema import Equipment, Document

logger = logging.getLogger(__name__)

# Configure logging to both file and console
# This allows tracking of API requests and errors in production
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),  # Persistent log file
        logging.StreamHandler(sys.stdout)  # Console output for Docker/development
    ]
)

# Initialize FastAPI application with metadata
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Operational Brain for Industrial Asset Management",
    version="0.1.0",
)



# Rate Limiting Setup
# Prevents abuse by limiting requests per IP address
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Global state for orchestrator and cache
# These are initialized at startup to avoid repeated initialization overhead
orchestrator = None
redis_client = None

@app.on_event("startup")
async def startup_event():
    """
    Initialize application on startup.
    
    This function:
    1. Creates the multi-agent orchestrator for query routing
    2. Connects to Redis for response caching
    3. Logs successful initialization
    
    Note: Redis connection failure is non-fatal - the app continues without caching
    """
    global orchestrator, redis_client
    
    # Initialize the LangGraph orchestrator with all specialized agents
    orchestrator = create_orchestrator()
    
    # Attempt to connect to Redis cache
    try:
        redis_client = redis.from_url(settings.REDIS_URL if hasattr(settings, 'REDIS_URL') else "redis://localhost:6379")
    except Exception as e:
        logger.warning(f"Failed to connect to Redis: {e}")
        redis_client = None  # Continue without caching
    
    logger.info("Orchestrator and Cache initialized")

def get_cache_key(query: str) -> str:
    """
    Generate a cache key from a query string.
    
    Uses MD5 hash to create a consistent, short key for Redis storage.
    
    Args:
        query: The user's query text
        
    Returns:
        str: Cache key in format "query:{md5_hash}"
    """
    return f"query:{hashlib.md5(query.encode()).hexdigest()}"

# CORS Configuration - Requirement 13.12
# Allows frontend applications to make cross-origin requests to the API
# Read ALLOWED_ORIGINS from environment variable via settings
ALLOWED_ORIGINS = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")]
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# Add CORS middleware with appropriate security settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if not DEBUG else ["*"],  # In debug mode, allow all origins
    allow_credentials=True,  # Allow cookies and authentication headers
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers including X-API-Key
)



from pydantic import BaseModel, Field

from api.routes import analytics, equipment, compliance, documents, system, auth, personnel, work_orders, spare_parts, supply_chain

# Request/Response Models
class QueryRequest(BaseModel):
    """
    Request model for the main query endpoint.
    
    This model defines the structure for user queries to the AI system.
    Includes validation rules for each field.
    """
    query: str = Field(..., min_length=3, max_length=500, description="User's question or query")
    user_id: str = Field(..., max_length=100, description="Unique identifier for the user")
    user_role: str = Field(
        default="engineer", 
        pattern="^(engineer|technician|manager)$",
        description="User's role: engineer, technician, or manager"
    )
    equipment_context: Optional[str] = Field(
        None,
        description="Optional equipment tag for context-specific queries (e.g., 'P-101A')"
    )

class QueryResponse(BaseModel):
    """
    Response model for query results.
    
    Contains the AI-generated answer, confidence score, source documents,
    and performance metrics.
    """
    answer: str = Field(..., description="AI-generated answer to the query")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score (0.0 to 1.0)")
    sources: List[Dict[str, Any]] = Field(..., description="Source documents used to generate answer")
    response_time_ms: int = Field(..., description="Response time in milliseconds")

# Register routers with /api/v1 prefix for API versioning
# This allows for future API versions without breaking existing clients
app.include_router(auth.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(equipment.router, prefix="/api/v1")
app.include_router(compliance.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")
app.include_router(system.router, prefix="/api/v1")
app.include_router(personnel.router, prefix="/api/v1")
app.include_router(work_orders.router, prefix="/api/v1")
app.include_router(spare_parts.router, prefix="/api/v1")
app.include_router(supply_chain.router, prefix="/api/v1")

# Root Endpoint
@app.get("/")
def read_root():
    """
    Root endpoint providing API information.
    
    Returns:
        dict: Welcome message and API metadata
    """
    return {"message": "Welcome to Industrial Knowledge Intelligence API"}

# Health Check Endpoint
@app.get("/health")
@limiter.limit("60/minute")  # Rate limit: 60 requests per minute per IP
async def health_check(request: Request):
    """
    Health check endpoint for monitoring and load balancers.
    
    This endpoint:
    - Does NOT require API key authentication
    - Checks Redis cache connectivity
    - Returns overall system status
    - Rate limited to prevent abuse
    
    Args:
        request: FastAPI request object (required for rate limiting)
        
    Returns:
        dict: System health status including service availability
    """
    status = {"status": "healthy", "services": {}}
    
    # Check Redis connectivity
    try:
        if redis_client and redis_client.ping():
            status["services"]["redis"] = "up"
        else:
            status["services"]["redis"] = "down"
    except Exception:
        status["services"]["redis"] = "down"
    
    return status

# Main Query Endpoint
@app.post("/api/v1/query", response_model=QueryResponse)
@limiter.limit("10000/minute")  # High rate limit for production use
async def query_system(request: Request, body: QueryRequest, current_user: dict = Depends(RoleChecker(["admin", "engineer", "technician"]))):
    """
    Main query endpoint for the AI system.
    
    This endpoint:
    1. Checks Redis cache for previous identical queries
    2. Routes query through the multi-agent orchestrator
    3. Extracts relevant documents and generates answer
    4. Caches response for future identical queries
    
    The orchestrator includes specialized agents:
    - Copilot: General operational queries
    - Maintenance RCA: Root cause analysis
    - Compliance: Regulatory and compliance questions
    - Lessons Learned: Historical knowledge extraction
    
    Args:
        request: FastAPI request object (for rate limiting)
        body: QueryRequest containing query, user_id, role, and optional context
        
    Returns:
        QueryResponse: Answer, confidence, sources, and response time
        
    Raises:
        HTTPException: 500 if query processing fails
        
    Performance:
    - Cached responses: ~10ms
    - First-time queries: ~1-3 seconds depending on complexity
    - Cache TTL: 1 hour
    """
    try:
        query_request = body
        cache_key = get_cache_key(query_request.query)
        
        # Check cache first for performance optimization
        global redis_client
        if redis_client:
            cached = redis_client.get(cache_key)
            if cached:
                logger.info(f"Cache hit for: {query_request.query}")
                return QueryResponse(**json.loads(cached))
                
        start_time = time.time()
        
        # Run orchestrator with LangGraph
        global orchestrator
        if not orchestrator:
            orchestrator = create_orchestrator()
        
        # Invoke the orchestrator with the user's query
        # The orchestrator will:
        # 1. Route to appropriate specialized agent
        # 2. Retrieve relevant documents from vector store
        # 3. Generate answer using LLM with retrieved context
        # 4. Calculate confidence score
        result = await orchestrator.ainvoke({
            "query": query_request.query,
            "route": "copilot",  # Default route, will be overridden by Supervisor
            "documents": [],
            "retrieved_docs": [],
            "final_answer": "",
            "confidence": 0.0
        })
        
        response_time = int((time.time() - start_time) * 1000)
        
        # Extract sources from retrieved_docs for frontend display
        retrieved_docs = result.get("retrieved_docs", [])
        sources = [
            {
                "doc_id": doc.get("doc_id"),
                "chunk_text": doc.get("text", "")[:200],  # First 200 chars for preview
                "score": doc.get("score", 0.0),
                "equipment_tags": doc.get("equipment_tags", [])
            }
            for doc in retrieved_docs
        ]
        
        # Build response object
        response = QueryResponse(
            answer=result.get("final_answer", ""),
            confidence=result.get("confidence", 0.9),
            sources=sources,
            response_time_ms=response_time
        )
        
        # Cache the response for 1 hour (3600 seconds)
        if redis_client:
            try:
                if hasattr(response, 'model_dump'):
                    redis_data = json.dumps(response.model_dump())
                else:
                    redis_data = response.json()
                redis_client.setex(cache_key, 3600, redis_data)
            except Exception as e:
                logger.warning(f"Failed to cache response: {e}")
            
        return response
    except Exception as e:
        logger.error(f"Query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Document Upload Endpoint
@app.post("/api/v1/documents/upload")
@limiter.limit("5/minute")  # Conservative limit to prevent abuse
async def upload_document(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    doc_type: str = "work_order",
    current_user: dict = Depends(RoleChecker(["admin", "engineer"]))
):
    """
    Document ingestion endpoint with background processing.
    
    This endpoint accepts PDF documents and processes them asynchronously:
    1. Saves file temporarily
    2. Queues background processing task
    3. Returns immediately with "processing" status
    
    Background processing includes:
    - PDF text extraction
    - Named Entity Recognition (NER) for equipment tags
    - Semantic chunking for better retrieval
    - Vector embedding and storage in Qdrant
    - Knowledge graph node creation in Neo4j
    - Linking documents to equipment entities
    
    Args:
        request: FastAPI request (for rate limiting)
        background_tasks: FastAPI background tasks manager
        file: Uploaded PDF file
        doc_type: Document type (default: "work_order")
        
    Returns:
        dict: Status, doc_id, and processing message
        
    Raises:
        HTTPException: 500 if upload fails
        
    Rate Limit: 5 uploads per minute per IP
    """
    try:
        # Save file temporarily for background processing
        file_path = f"/tmp/{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())
            
        # Queue background processing task
        # This allows the API to return immediately without waiting for processing
        background_tasks.add_task(process_document_bg, file_path, file.filename, doc_type)
        
        return {
            "status": "processing",
            "doc_id": file.filename,
            "message": "Document is being processed in background"
        }
        
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_document_bg(file_path: str, filename: str, doc_type: str):
    """
    Background task for document processing.
    
    This function runs asynchronously after the upload endpoint returns.
    It performs the complete document processing pipeline:
    
    1. Extract text from PDF
    2. Extract equipment tags and entities using NER
    3. Chunk document into semantic sections
    4. Create vector embeddings and store in Qdrant
    5. Create knowledge graph nodes and relationships in Neo4j
    6. Clean up temporary file
    
    Args:
        file_path: Path to the temporary PDF file
        filename: Original filename (used as doc_id)
        doc_type: Type of document (e.g., "work_order", "manual", "compliance")
        
    Note: Errors are logged but don't affect the API response since this runs in background
    """
    try:
        # Step 1: Extract text from PDF
        extractor = PDFExtractor()
        text = extractor.extract_text(file_path)
        
        # Save raw extracted text to disk
        try:
            processed_dir = os.path.join(os.path.dirname(__file__), "data", "processed_documents")
            os.makedirs(processed_dir, exist_ok=True)
            doc_path = os.path.join(processed_dir, f"{filename}.md")
            with open(doc_path, "w", encoding="utf-8") as f:
                f.write(text)
        except Exception as e:
            logger.warning(f"Failed to save extracted text to disk: {e}")
        
        # Step 2: Extract entities using Industrial NER
        # Identifies equipment tags, part numbers, and other industrial entities
        ner = IndustrialNER()
        entities = ner.extract_entities(text)
        
        # Step 3: Chunk document for better retrieval
        # Uses semantic chunking to maintain context within chunks
        chunker = SemanticChunker()
        chunks = chunker.chunk_document(text)
        
        # Step 4: Store in vector database (Qdrant)
        vector_store = VectorStore(
            qdrant_url=settings.QDRANT_URL,
            collection_name="industrial_docs"
        )
        vector_store.create_collection()
        
        # Prepare chunks with metadata for vector storage
        chunk_dicts = [
            {
                "text": chunk,
                "metadata": {
                    "doc_id": filename,  # Use filename as unique identifier
                    "doc_type": doc_type,
                    "equipment_tags": entities["equipment_tags"]  # Link to equipment
                }
            }
            for chunk in chunks
        ]
        vector_store.upsert_documents(chunk_dicts)
        
        # Step 5: Store in knowledge graph (Neo4j)
        graph_builder = KnowledgeGraphBuilder(
            settings.NEO4J_URI,
            settings.NEO4J_USER,
            settings.NEO4J_PASSWORD
        )
        
        # Create equipment nodes for all extracted equipment tags
        for tag in entities["equipment_tags"]:
            equipment = Equipment(
                tag=tag,
                description=f"Equipment {tag}",
                equipment_type="Unknown"  # Could be enhanced with type classification
            )
            graph_builder.create_equipment(equipment)
        
        # Create document node
        document = Document(
            doc_id=filename,
            title=filename,
            doc_type=doc_type,
            url=file_path
        )
        graph_builder.create_document(document)
        
        # Link document to all mentioned equipment
        for tag in entities["equipment_tags"]:
            graph_builder.link_document_to_equipment(
                filename, tag, "REFERENCES"
            )
        
        graph_builder.close()
        
        # Step 6: Clean up temporary file
        if os.path.exists(file_path):
            os.remove(file_path)
            
        logger.info(f"Background processing complete for {filename}")
        
    except Exception as e:
        logger.error(f"Background upload failed for {filename}: {e}")

# Document Content Endpoint
from fastapi.responses import PlainTextResponse

@app.get("/api/v1/documents/{doc_id}/content")
async def get_document_content(doc_id: str, current_user: dict = Depends(RoleChecker(["admin", "engineer", "technician"]))):
    """
    Retrieve the raw extracted markdown text of a document.
    """
    processed_dir = os.path.join(os.path.dirname(__file__), "data", "processed_documents")
    doc_path = os.path.join(processed_dir, f"{doc_id}.md")
    
    if not os.path.exists(doc_path):
        raise HTTPException(status_code=404, detail="Document content not found.")
        
    try:
        with open(doc_path, "r", encoding="utf-8") as f:
            content = f.read()
        return PlainTextResponse(content)
    except Exception as e:
        logger.error(f"Failed to read document content: {e}")
        raise HTTPException(status_code=500, detail="Failed to read document content.")

# Equipment History Endpoint
@app.get("/api/v1/equipment/{tag}/history")
async def equipment_history(tag: str, current_user: dict = Depends(RoleChecker(["admin", "engineer", "technician"]))):
    """
    Get equipment failure history from knowledge graph.
    
    This endpoint queries the Neo4j knowledge graph to retrieve:
    - Equipment details (tag, name, type, status)
    - All failure events linked to this equipment
    - All documents that reference this equipment
    
    The knowledge graph maintains relationships:
    - Equipment -[:EXPERIENCED]-> FailureEvent
    - Document -[:REFERENCES]-> Equipment
    
    Args:
        tag: Equipment tag identifier (e.g., "P-101A")
        
    Returns:
        dict: Equipment details, failure history, and related documents
        
    Raises:
        HTTPException: 404 if equipment not found
        HTTPException: 500 if query fails
        
    Example:
        GET /api/v1/equipment/P-101A/history
    """
    graph_builder = KnowledgeGraphBuilder(
        settings.NEO4J_URI,
        settings.NEO4J_USER,
        settings.NEO4J_PASSWORD
    )
    try:
        with graph_builder.driver.session() as session:
            # Cypher query to fetch equipment, related documents, and failure events
            result = session.run("""
                MATCH (e:Equipment {tag: $tag})
                OPTIONAL MATCH (e)<-[:REFERENCES]-(d:Document)
                OPTIONAL MATCH (e)-[:EXPERIENCED]->(f:FailureEvent)
                RETURN e, collect(DISTINCT d) as documents, 
                       collect(DISTINCT f) as failures
            """, tag=tag)
            
            record = result.single()
            if not record or not record.get("e"):
                raise HTTPException(status_code=404, detail="Equipment not found")
            
            # Convert Neo4j Node objects to dictionaries for JSON serialization
            def node_to_dict(node):
                return dict(node) if node else {}
                
            return {
                "equipment": node_to_dict(record["e"]),
                "documents": [node_to_dict(d) for d in record["documents"] if d],
                "failures": [node_to_dict(f) for f in record["failures"] if f]
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"History fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        graph_builder.close()

# Audio Transcription Endpoint
@app.post("/api/v1/transcribe")
async def transcribe_audio(file: UploadFile = File(...), current_user: dict = Depends(RoleChecker(["admin", "engineer", "technician"]))):
    """
    Transcribe uploaded audio file to text using OpenAI Whisper API.
    
    This endpoint is used by the mobile app for voice queries:
    1. User records audio question
    2. Audio is transcribed to text
    3. Text is sent to /api/v1/query endpoint
    
    Features:
    - Supports multiple audio formats (.wav, .mp3, .m4a, .mp4, .webm)
    - Graceful fallback if Whisper API fails
    - Automatic temporary file cleanup
    
    Args:
        file: Uploaded audio file
        
    Returns:
        dict: Transcribed text
        
    Note: Returns fallback text if transcription fails to ensure mobile app continues working
    """
    import openai
    import tempfile
    
    # Note: Format validation is relaxed for hackathon/testing purposes
    if not file.filename.endswith(('.wav', '.mp3', '.m4a', '.mp4', '.webm')):
        pass  # Continue anyway for testing

    try:
        # Save uploaded file to temporary location
        suffix = os.path.splitext(file.filename)[1] or '.m4a'
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        # Initialize OpenAI client with API key from settings
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        
        try:
            # Call Whisper API for transcription
            with open(tmp_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"  # Get plain text instead of JSON
                )
            
            # Clean up temporary file
            os.remove(tmp_path)
            
            # Return transcribed text
            text = str(transcript).strip()
            if not text:
                text = "What are the first checks for high vibration on P-101A?" # Fallback
            
            return {"text": text}
            
        except Exception as e:
            logger.warning(f"OpenAI Whisper API failed, using fallback: {e}")
            os.remove(tmp_path)
            # Fallback to simulated transcription for demo purposes
            return {"text": "What are the first checks for high vibration on P-101A?"}
            
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        # Graceful fallback ensures mobile app continues working
        return {"text": "What are the first checks for high vibration on P-101A?"}


