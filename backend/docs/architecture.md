# Technical Architecture

## System Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                        USER LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Mobile App   │  │ Web App      │  │ Desktop UI   │      │
│  │ (React Native)│  │ (React)      │  │ (Optional)   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
┌─────────────────────────────▼───────────────────────────────┐
│                      API GATEWAY                            │
│                    (Load Balancer)                          │
└─────────────────────────────┬───────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
┌─────────▼──────┐  ┌─────────▼──────┐  ┌────────▼───────┐
│  API Service   │  │  API Service   │  │  API Service   │
│    (Pod 1)     │  │    (Pod 2)     │  │    (Pod N)     │
│   FastAPI      │  │   FastAPI      │  │   FastAPI      │
└─────────┬──────┘  └─────────┬──────┘  └────────┬───────┘
          │                   │                   │
          └───────────────────┴───────────────────┘
                              │
     ┌────────────────────────┼────────────────────────┐
     │                        │                        │
┌────▼────────┐     ┌─────────▼────────┐     ┌────────▼───────┐
│  Document   │     │   Query          │     │  Background    │
│  Processing │     │   Processing     │     │  Workers       │
│  Pipeline   │     │   Agents         │     │  (Celery)      │
└────┬────────┘     └─────────┬────────┘     └────────┬───────┘
     │                        │                        │
     └────────────────────────┼────────────────────────┘
                              │
     ┌────────────────────────┼────────────────────────┐
     │                        │                        │
┌────▼────────┐     ┌─────────▼────────┐     ┌────────▼───────┐
│   Neo4j     │     │    Qdrant        │     │  PostgreSQL    │
│  (Graph)    │     │   (Vector)       │     │  (Metadata)    │
└─────────────┘     └──────────────────┘     └────────────────┘
                              │
                    ┌─────────▼────────┐
                    │     Redis        │
                    │    (Cache)       │
                    └──────────────────┘
```

## Component Responsibilities

### 1. API Gateway / Load Balancer
- **Technology:** Traefik or Nginx
- **Responsibilities:**
  - Distribute traffic across API pods
  - TLS termination
  - Rate limiting
  - Health checks
- **Configuration:**
  - Round-robin load balancing
  - Sticky sessions for stateful operations
  - Timeout: [TIME]

### 2. FastAPI Application
- **Technology:** FastAPI + Uvicorn
- **Responsibilities:**
  - RESTful API endpoints
  - Request validation (Pydantic)
  - Authentication & authorization
  - Response serialization
- **Endpoints:**
  - POST /api/v1/query
  - POST /api/v1/documents/upload
  - GET /api/v1/analytics
  - GET /api/v1/equipment/{tag}/history
  - GET /api/v1/compliance/gaps

### 3. Agent Orchestration (LangGraph)
- **Technology:** LangChain + LangGraph
- **Responsibilities:**
  - Intent classification
  - Agent routing
  - State management
  - Response assembly
- **State Storage:** PostgreSQL for conversation history

### 4. Document Processing Pipeline
- **Technology:** Python async workers
- **Responsibilities:**
  - Text extraction (PDF, DOCX, etc.)
  - OCR for scanned documents
  - NER (entity extraction)
  - Chunking strategy
  - Embedding generation
  - Graph population
- **Queue:** RabbitMQ or Celery with Redis

### 5. Databases

**Neo4j (Knowledge Graph):**
- Stores: Equipment, documents, failures, relationships
- Queries: Graph traversal, pattern matching
- Scaling: Read replicas for query load

**Qdrant (Vector Store):**
- Stores: Document chunk embeddings (3072-dim)
- Queries: Similarity search, filtered search
- Scaling: Horizontal sharding

**PostgreSQL (Metadata):**
- Stores: Document metadata, user sessions, analytics
- Queries: Relational data, time-series analytics
- Scaling: Read replicas, partitioning

**Redis (Cache):**
- Stores: Query results, session data, rate limit counters
- TTL: 1 hour for query cache, 24 hours for sessions
- Scaling: Redis cluster for high availability

### 6. Storage Layer
- **Technology:** S3-compatible object storage (MinIO or AWS S3)
- **Stores:** Original documents, generated reports
- **Backup:** Regular snapshots, 30-day retention

## Data Flow Diagrams

### Document Ingestion Flow
```text
User uploads PDF
    ↓
API validates and stores in S3
    ↓
Publishes to processing queue (RabbitMQ)
    ↓
Document Processor Agent picks up task
    ↓
[Parallel Processing]
    ├→ Extract text → Chunk → Generate embeddings → Qdrant
    └→ NER extraction → Create graph nodes → Neo4j
    ↓
Update document status in PostgreSQL
    ↓
Return success to user
```

### Query Processing Flow
```text
User sends query (voice or text)
    ↓
API receives query + user context
    ↓
Check cache (Redis)
    ├→ If hit: Return cached response (sub-second)
    └→ If miss: Continue processing
    ↓
Supervisor Agent classifies intent
    ↓
Route to appropriate specialist agent
    ↓
Agent performs retrieval:
    ├→ Vector search (Qdrant)
    ├→ Graph traversal (Neo4j)
    └→ BM25 search (in-memory)
    ↓
Hybrid retrieval fusion (RRF)
    ↓
Rerank results (Cross-encoder)
    ↓
Generate answer with LLM (GPT-4)
    ↓
Calculate confidence score
    ↓
Build source citations
    ↓
Cache result (Redis, 1 hour TTL)
    ↓
Return to user
    ↓
Log analytics (PostgreSQL)
```

## Database Schemas

### PostgreSQL - documents table:
```sql
CREATE TABLE documents (
    doc_id VARCHAR(255) PRIMARY KEY,
    title TEXT NOT NULL,
    doc_type VARCHAR(50) NOT NULL,
    file_path TEXT NOT NULL,
    file_size_kb INTEGER,
    page_count INTEGER,
    ingested_at TIMESTAMP DEFAULT NOW(),
    processing_status VARCHAR(20),
    metadata JSONB,
    created_by VARCHAR(100),
    INDEX idx_doc_type (doc_type),
    INDEX idx_ingested_at (ingested_at)
);
```

### Neo4j - Equipment node:
```cypher
CREATE (e:Equipment {
  tag: "P-101A",
  name: "Crude Charge Pump A",
  equipment_class: "Centrifugal Pump",
  criticality: "A",
  location: "CDU Pump House A",
  commissioned_date: "[DATE]"
})
```

## System Scalability

### Horizontal Scaling
**Requirements:**
- API servers: Stateless, can add pods dynamically
- Load balancing: Traefik or Nginx
- Database: Read replicas for Neo4j, Qdrant sharding
- Auto-scaling: Based on CPU (>70%) and memory (>80%)

**Scaling Targets:**
- 10 users → 1 API pod
- 100 users → 3 API pods
- 1,000 users → 10 API pods

### Data Capacity
**Requirements:**
- Documents: Support 100,000+ documents
- Vector store: 1 million+ embeddings
- Knowledge graph: 500,000+ nodes, 2 million+ edges
- Storage: 500GB for documents, 100GB for databases

### Availability & Reliability
**Requirements:**
- Database replication: Master-slave for Neo4j
- Health checks: Frequent health checks for routing
- Automatic failover: If primary fails
- Error Handling: Graceful degradation if one service fails, others continue
