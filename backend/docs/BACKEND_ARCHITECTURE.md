# Backend Architecture Overview

**Industrial Knowledge Intelligence Platform**

This document provides a comprehensive overview of the backend architecture for frontend developers.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [API Structure](#api-structure)
4. [Data Flow](#data-flow)
5. [Database Schema](#database-schema)
6. [Agent System](#agent-system)
7. [Caching Strategy](#caching-strategy)
8. [Security](#security)
9. [Deployment](#deployment)

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                          │
│  ┌──────────────┐           ┌──────────────┐                │
│  │   Dashboard  │           │  Mobile App  │                │
│  │   (React)    │           │ (React Native│                │
│  └──────┬───────┘           └──────┬───────┘                │
│         │                           │                         │
│         └───────────────┬───────────┘                        │
│                         │                                     │
└─────────────────────────┼─────────────────────────────────────┘
                          │ HTTP/REST + API Key Auth
┌─────────────────────────┼─────────────────────────────────────┐
│                         ▼                                     │
│                  ┌──────────────┐                            │
│                  │  FastAPI     │                            │
│                  │  Gateway     │                            │
│                  └──────┬───────┘                            │
│                         │                                     │
│         ┌───────────────┼───────────────┐                   │
│         │               │               │                    │
│    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐               │
│    │Analytics│    │Equipment│    │Documents│               │
│    │ Routes  │    │ Routes  │    │ Routes  │               │
│    └────┬────┘    └────┬────┘    └────┬────┘               │
│         │              │              │                      │
│         └──────────────┼──────────────┘                     │
│                        │                                     │
│                   ┌────▼─────┐                              │
│                   │  Multi-  │                              │
│                   │  Agent   │                              │
│                   │Orchestrator                             │
│                   └────┬─────┘                              │
│                        │                                     │
└────────────────────────┼─────────────────────────────────────┘
                         │
┌────────────────────────┼─────────────────────────────────────┐
│         Data Layer     │                                     │
│    ┌───────┬───────────┴───────┬────────────┐              │
│    │       │                   │            │               │
│ ┌──▼───┐ ┌▼──────┐   ┌────────▼─┐   ┌──────▼──┐           │
│ │Redis │ │Qdrant │   │  Neo4j   │   │PostgreSQL           │
│ │Cache │ │Vector │   │Knowledge │   │Analytics│           │
│ │      │ │  DB   │   │  Graph   │   │   DB    │           │
│ └──────┘ └───────┘   └──────────┘   └─────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**FastAPI Gateway (main.py)**
- API request routing
- Authentication and rate limiting
- CORS handling
- Request/response validation
- Caching coordination

**Route Modules**
- `/api/v1/analytics` - KPIs, trends, ROI calculations
- `/api/v1/equipment` - Equipment data and history
- `/api/v1/compliance` - Compliance gaps and certificates
- `/api/v1/documents` - Document management and upload
- `/api/v1/system` - System health monitoring

**Multi-Agent Orchestrator**
- Query routing to specialized agents
- Document retrieval from vector store
- Answer generation using LLMs
- Confidence scoring

**Data Stores**
- **Redis**: Response caching (1 hour TTL)
- **Qdrant**: Vector embeddings for semantic search
- **Neo4j**: Knowledge graph for relationships
- **PostgreSQL**: Analytics and user data (planned)

---

## Technology Stack

### Backend Framework
- **FastAPI** (0.100+): Modern, async Python web framework
- **Uvicorn**: ASGI server for production
- **Pydantic**: Data validation and serialization

### AI/ML Stack
- **LangChain**: LLM orchestration framework
- **LangGraph**: Multi-agent workflow management
- **OpenAI GPT-4**: Primary LLM for answer generation
- **OpenAI Whisper**: Speech-to-text for mobile app

### Data Processing
- **PyPDF2**: PDF text extraction
- **spaCy**: Named Entity Recognition (NER)
- **Sentence Transformers**: Text embeddings

### Databases
- **Qdrant** (1.7+): Vector database for semantic search
- **Neo4j** (5.0+): Graph database for knowledge graph
- **Redis** (7.0+): In-memory cache
- **PostgreSQL** (15+): Relational database (planned)

### Security & Monitoring
- **slowapi**: Rate limiting
- **python-dotenv**: Environment configuration
- **logging**: Application logging

---

## API Structure

### Endpoint Organization

```
/
├── health                          # Health check (no auth)
├── api/v1/
│   ├── query                      # Main AI query endpoint
│   ├── transcribe                 # Audio transcription
│   ├── analytics/
│   │   ├── kpis                   # Dashboard KPIs
│   │   ├── query-trends           # Time-series data
│   │   ├── agent-performance      # Agent metrics
│   │   ├── activity-feed          # Recent activity
│   │   ├── roi                    # ROI calculator
│   │   └── top-equipment          # Most queried
│   ├── equipment/
│   │   ├── list                   # All equipment
│   │   └── {tag}/history          # Failure history
│   ├── compliance/
│   │   ├── gaps                   # Compliance issues
│   │   └── certificates           # Certificate status
│   ├── documents/
│   │   ├── list                   # Document index
│   │   └── upload                 # Upload endpoint
│   └── system/
│       └── health                 # Detailed health check
```

### Request/Response Flow

**1. Typical Query Request**
```
Client → FastAPI (auth check) → Cache check → Orchestrator → 
Vector Search → LLM → Response → Cache → Client
```

**2. Document Upload Flow**
```
Client → FastAPI → Temp Storage → Background Task →
PDF Extract → NER → Chunking → Vector DB + Graph DB → Complete
```

**3. Equipment History Request**
```
Client → FastAPI → Neo4j Query → Response
```

---

## Data Flow

### Query Processing Pipeline

```
┌────────────────────────────────────────────────────────────┐
│ 1. User Query                                              │
│    "What are the first checks for P-101A vibration?"      │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│ 2. Cache Check (Redis)                                     │
│    Key: md5(query) → Hit? Return cached response          │
└─────────────────────┬──────────────────────────────────────┘
                      │ Miss
                      ▼
┌────────────────────────────────────────────────────────────┐
│ 3. Supervisor Agent                                        │
│    Analyzes query → Routes to specialized agent           │
│    - Copilot (general queries)                            │
│    - Maintenance RCA (root cause analysis)                │
│    - Compliance (regulations)                             │
│    - Lessons Learned (historical)                         │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│ 4. Vector Retrieval (Qdrant)                              │
│    Embed query → Semantic search → Top K documents        │
│    Returns: chunks + metadata + scores                    │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│ 5. Answer Generation (LLM)                                │
│    Prompt: query + retrieved docs → GPT-4 → answer        │
│    Calculate confidence score                             │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│ 6. Cache & Return                                          │
│    Store in Redis (1hr TTL) → Return to client            │
└────────────────────────────────────────────────────────────┘
```

### Document Processing Pipeline

```
┌────────────────────────────────────────────────────────────┐
│ 1. Upload PDF                                              │
│    POST /api/v1/documents/upload                          │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│ 2. Immediate Response                                      │
│    Return "processing" status → Continue in background    │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│ 3. PDF Text Extraction                                     │
│    PyPDF2 → Raw text                                       │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│ 4. Named Entity Recognition                                │
│    spaCy + Industrial patterns → Equipment tags           │
│    Extract: P-101A, V-301, HX-201, etc.                   │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│ 5. Semantic Chunking                                       │
│    Split text → Maintain context → ~500 token chunks      │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│ 6. Vector Embedding & Storage                              │
│    Sentence Transformers → Embeddings → Qdrant            │
│    Metadata: doc_id, doc_type, equipment_tags             │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│ 7. Knowledge Graph Update                                  │
│    Neo4j: Create Equipment nodes, Document node           │
│    Create relationships: Document-[:REFERENCES]->Equipment │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────────┐
│ 8. Cleanup                                                 │
│    Delete temporary file → Log completion                  │
└────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Qdrant Vector Store

**Collection: `industrial_docs`**

```python
{
  "id": "unique_chunk_id",
  "vector": [0.123, 0.456, ...],  # 768-dimensional embedding
  "payload": {
    "text": "Chunk text content...",
    "doc_id": "Manual_P101A.pdf",
    "doc_type": "maintenance_manual",
    "equipment_tags": ["P-101A", "P-101B"],
    "timestamp": "2024-07-14T10:00:00Z"
  }
}
```

### Neo4j Knowledge Graph

**Node Types:**

```cypher
// Equipment Node
(:Equipment {
  tag: "P-101A",
  name: "Main Feed Pump A",
  type: "Centrifugal Pump",
  status: "operational"
})

// Document Node
(:Document {
  doc_id: "Manual_P101A.pdf",
  title: "P-101A Maintenance Manual",
  doc_type: "maintenance_manual",
  url: "/path/to/file"
})

// Failure Event Node
(:FailureEvent {
  id: "failure_123",
  date: "2024-01-15",
  symptoms: "High vibration",
  root_cause: "Bearing wear",
  action: "Replaced bearing"
})
```

**Relationships:**

```cypher
// Document references equipment
(d:Document)-[:REFERENCES]->(e:Equipment)

// Equipment experienced failure
(e:Equipment)-[:EXPERIENCED]->(f:FailureEvent)

// Equipment has part relationship
(e1:Equipment)-[:HAS_PART]->(e2:Equipment)
```

### Redis Cache

**Key Pattern:**

```
query:{md5_hash} → JSON response
TTL: 3600 seconds (1 hour)
```

**Example:**
```
query:a3f8d9c2e1b4f7a6 → {
  "answer": "Check bearings...",
  "confidence": 0.94,
  "sources": [...],
  "response_time_ms": 1250
}
```

---

## Agent System

### Multi-Agent Architecture

The system uses **LangGraph** to orchestrate multiple specialized AI agents:

```
User Query
    ↓
┌───────────────┐
│  Supervisor   │ ← Analyzes query intent
│    Agent      │ ← Routes to specialist
└───────┬───────┘
        │
        ├──→ Copilot Agent         (General operational queries)
        ├──→ Maintenance RCA Agent  (Root cause analysis)
        ├──→ Compliance Agent       (Regulatory questions)
        └──→ Lessons Learned Agent  (Historical knowledge)
```

### Agent Capabilities

**1. Supervisor Agent**
- **Purpose**: Query classification and routing
- **Logic**: Analyzes query keywords and intent
- **Routes to**: Appropriate specialized agent

**2. Copilot Agent**
- **Purpose**: General operational support
- **Handles**: Equipment info, procedures, specifications
- **Example**: "What is the torque spec for P-101A bolts?"

**3. Maintenance RCA Agent**
- **Purpose**: Root cause analysis for failures
- **Handles**: Troubleshooting, diagnostics, failure analysis
- **Example**: "Why did P-101A vibration increase?"

**4. Compliance Agent**
- **Purpose**: Regulatory and compliance queries
- **Handles**: OSHA, API standards, certifications
- **Example**: "What are OSHA requirements for lockout/tagout?"

**5. Lessons Learned Agent**
- **Purpose**: Historical knowledge extraction
- **Handles**: Past failures, best practices, lessons
- **Example**: "What have we learned from pump failures?"

### Agent Workflow

```python
# Simplified agent workflow
def agent_workflow(query):
    # 1. Supervisor decides route
    route = supervisor.classify(query)
    
    # 2. Retrieve relevant documents
    docs = vector_store.search(query, top_k=5)
    
    # 3. Specialized agent processes
    agent = get_agent(route)
    answer = agent.generate_answer(query, docs)
    
    # 4. Calculate confidence
    confidence = calculate_confidence(answer, docs)
    
    return {
        "answer": answer,
        "confidence": confidence,
        "sources": docs
    }
```

---

## Caching Strategy

### Cache Hierarchy

**Level 1: Redis (Server-Side)**
- **Scope**: Identical queries across all users
- **TTL**: 1 hour
- **Key**: MD5 hash of query text
- **Benefits**: Fastest response, reduced LLM costs

**Level 2: Client-Side (Recommended)**
- **Scope**: Per-user/per-device
- **TTL**: 5-10 minutes
- **Storage**: React Query cache or localStorage
- **Benefits**: Instant responses, offline capability

### Cache Invalidation

**Automatic:**
- TTL expiration after 1 hour
- Redis memory limits (LRU eviction)

**Manual (Future):**
- Document updates
- System configuration changes
- Force refresh API endpoint

---

## Security

### Authentication
- **Method**: API Key in X-API-Key header
- **Algorithm**: Constant-time comparison (timing attack prevention)
- **Storage**: Environment variable (`API_KEY`)

### Rate Limiting
- **Method**: IP-based rate limiting (slowapi)
- **Limits**:
  - `/health`: 60/minute
  - `/api/v1/query`: 10,000/minute
  - `/api/v1/documents/upload`: 5/minute

### CORS
- **Origins**: Configurable via `ALLOWED_ORIGINS`
- **Credentials**: Allowed
- **Headers**: All (including X-API-Key)

### Data Protection
- **In Transit**: HTTPS (production)
- **At Rest**: Database encryption (production)
- **Secrets**: Environment variables, never logged

---

## Deployment

### Environment Variables

```bash
# Required
API_KEY=your-secret-api-key
OPENAI_API_KEY=your-openai-key

# Databases
QDRANT_URL=http://localhost:6333
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password
REDIS_URL=redis://localhost:6379

# Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
PROJECT_NAME="Industrial Knowledge Intelligence"
DEBUG=false
```

### Running Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Start services
docker-compose up -d  # Qdrant, Neo4j, Redis

# Run application
uvicorn main:app --reload --port 8000
```

### Production Deployment

```bash
# Use production ASGI server
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker

# Or with uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker Deployment (Planned)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Performance Considerations

### Response Times

- **Cached query**: ~10-20ms
- **New query (simple)**: ~1-2 seconds
- **New query (complex)**: ~2-5 seconds
- **Document upload**: ~100ms (background processing: 30-60s)

### Optimization Tips

1. **Use caching**: Implement client-side caching
2. **Batch requests**: Combine multiple analytics requests
3. **Debounce searches**: Wait 300-500ms after user stops typing
4. **Lazy load**: Load equipment list on demand
5. **Prefetch**: Load common data on app startup

---

## Monitoring & Debugging

### Health Endpoints

```bash
# Quick health check
GET /health

# Detailed system health
GET /api/v1/system/health
```

### Logs

```bash
# Application logs
tail -f app.log

# Filter for errors
grep "ERROR" app.log

# Watch for specific endpoint
grep "/api/v1/query" app.log
```

### Common Issues

**See**: [Troubleshooting Section in Frontend Developer Guide](FRONTEND_DEVELOPER_GUIDE.md#troubleshooting)

---

## Future Enhancements

### Planned Features

1. **WebSocket Support**: Real-time updates
2. **Batch Query API**: Process multiple queries
3. **Streaming Responses**: Stream LLM output
4. **Advanced Analytics**: ML-based insights
5. **Multi-tenancy**: Support multiple organizations

### Scalability

- **Horizontal scaling**: Add more FastAPI workers
- **Database sharding**: Partition Qdrant collections
- **Load balancing**: Nginx/Cloudflare in front
- **Async processing**: Celery for heavy tasks

---

## Additional Resources

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [Frontend Developer Guide](FRONTEND_DEVELOPER_GUIDE.md) - Integration guide
- [Implementation Details](implementation.md) - Technical implementation

---

**Last Updated:** July 14, 2024
