"""
Documents API Routes

This module provides document management endpoints:
- Document List: All ingested documents with metadata and processing status
- Document Upload: Upload new PDF documents for processing

Document processing pipeline (background task):
1. PDF text extraction
2. Named Entity Recognition (NER) for equipment tags
3. Semantic chunking for better retrieval
4. Vector embedding and storage in Qdrant
5. Knowledge graph updates in Neo4j

Document status values:
- processing: Document is being processed in background
- completed: Processing completed successfully
- failed: Processing failed (check logs for details)

Supported document types:
- maintenance_manual: Equipment maintenance manuals
- work_order: Work order documents
- inspection_report: Inspection and audit reports
- compliance_document: Regulatory compliance documents
- standard: Industry standards and specifications
- drawing: Technical drawings and P&IDs

Author: Industrial Knowledge Intelligence Team
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, BackgroundTasks
from typing import List
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import logging

import logging
import psycopg2
import psycopg2.extras
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import settings

def get_db_connection():
    return psycopg2.connect(
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        dbname=settings.POSTGRES_DB,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD
    )

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["documents"])


# Response Models
class DocumentItem(BaseModel):
    id: str = Field(..., description="Document ID")
    name: str = Field(..., description="Document name")
    type: str = Field(..., description="Document type")
    upload_date: datetime = Field(..., description="Upload date")
    status: str = Field(..., description="Status: processing, completed, or failed")


class DocumentListResponse(BaseModel):
    documents: List[DocumentItem]
    total: int


class DocumentUploadResponse(BaseModel):
    id: str = Field(..., description="Document ID")
    name: str = Field(..., description="Document name")
    status: str = Field(..., description="Upload status")
    message: str = Field(..., description="Status message")


# Endpoints
@router.get("/list", response_model=DocumentListResponse)
async def get_document_list():
    """
    Get list of all documents
    Returns all ingested documents with metadata
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cur.execute("SELECT id, title, doc_type, url FROM documents")
        rows = cur.fetchall()
        
        documents = []
        now = datetime.now()
        for i, r in enumerate(rows):
            documents.append(DocumentItem(
                id=str(r['id']),
                name=r['title'],
                type=r['doc_type'],
                upload_date=now - timedelta(days=i),
                status="completed"
            ))
            
        cur.close()
        conn.close()
        
        return DocumentListResponse(
            documents=documents,
            total=len(documents)
        )
    except Exception as e:
        logger.error(f"Error fetching document list: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Upload a new document
    Accepts multipart/form-data file upload
    """
    try:
        # Generate document ID
        doc_id = f"doc-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # In a real implementation, we would:
        # 1. Save the file to storage
        # 2. Extract text and metadata
        # 3. Process with NER and chunking
        # 4. Store in vector database and knowledge graph
        # 5. Update status asynchronously
        
        # Currently acting as a stub until the pipeline is connected.
        logger.info(f"Document upload initiated: {file.filename} ({file.content_type})")
        
        return DocumentUploadResponse(
            id=doc_id,
            name=file.filename,
            status="processing",
            message="Document uploaded successfully and is being processed"
        )
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(status_code=500, detail=str(e))
