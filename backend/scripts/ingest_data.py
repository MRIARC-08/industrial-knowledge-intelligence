"""
Data Ingestion Script
Loads sample documents into the system (vector DB + knowledge graph)
"""
import os
import json
import uuid
import logging
from typing import List, Dict, Any
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.document_processor.pdf_extractor import PDFExtractor
from agents.document_processor.ner import IndustrialNER
from agents.document_processor.chunker import SemanticChunker
from tools.vector_search import VectorStore
from knowledge_graph.builder import KnowledgeGraphBuilder
from knowledge_graph.schema import Equipment, Document
from config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def ingest_text_files(directory: str = "data/sample_documents"):
    """Ingest all text files from a directory"""
    logger.info(f"Starting ingestion from {directory}")
    
    # Initialize components
    ner = IndustrialNER()
    chunker = SemanticChunker(chunk_size=500, chunk_overlap=100)
    vector_store = VectorStore(
        qdrant_url=settings.QDRANT_URL,
        collection_name="industrial_docs"
    )
    vector_store.create_collection()
    
    graph_builder = KnowledgeGraphBuilder(
        settings.NEO4J_URI,
        settings.NEO4J_USER,
        settings.NEO4J_PASSWORD
    )
    graph_builder.initialize_schema()
    
    # Process all text files
    files_processed = 0
    total_chunks = 0
    
    for filename in os.listdir(directory):
        if not filename.endswith(('.txt', '.pdf')):
            continue
            
        filepath = os.path.join(directory, filename)
        logger.info(f"Processing: {filename}")
        
        try:
            # Read text
            if filename.endswith('.txt'):
                with open(filepath, 'r') as f:
                    text = f.read()
            else:
                # PDF extraction
                extractor = PDFExtractor()
                text = extractor.extract_text(filepath)
            
            # Extract entities
            entities = ner.extract_entities(text)
            logger.info(f"  Found {len(entities['equipment_tags'])} equipment tags")
            
            # Chunk document
            chunks = chunker.chunk_document(text)
            logger.info(f"  Created {len(chunks)} chunks")
            
            # Store in vector DB
            chunk_dicts = [
                {
                    "text": chunk,
                    "metadata": {
                        "doc_id": filename,
                        "doc_type": "manual",
                        "equipment_tags": entities["equipment_tags"],
                        "source": filename
                    }
                }
                for chunk in chunks
            ]
            vector_store.upsert_documents(chunk_dicts)
            
            # Store in knowledge graph
            # Create document node
            document = Document(
                doc_id=filename,
                title=filename.replace('_', ' ').replace('.txt', ''),
                doc_type="manual",
                url=filepath
            )
            graph_builder.create_document(document)
            
            # Create equipment nodes and link
            for tag in entities["equipment_tags"]:
                equipment = Equipment(
                    tag=tag,
                    description=f"Equipment {tag}",
                    equipment_type="Unknown"
                )
                graph_builder.create_equipment(equipment)
                graph_builder.link_document_to_equipment(filename, tag, "REFERENCES")
            
            files_processed += 1
            total_chunks += len(chunks)
            
        except Exception as e:
            logger.error(f"Failed to process {filename}: {e}")
    
    graph_builder.close()
    
    logger.info(f"\n✅ Ingestion complete!")
    logger.info(f"  Files processed: {files_processed}")
    logger.info(f"  Total chunks: {total_chunks}")
    logger.info(f"  Vector DB: {settings.QDRANT_URL}")
    logger.info(f"  Knowledge Graph: {settings.NEO4J_URI}")

def ingest_work_orders(filepath: str = "data/synthetic_work_orders.json"):
    """Ingest work orders as structured data"""
    logger.info(f"Ingesting work orders from {filepath}")
    
    with open(filepath, 'r') as f:
        work_orders = json.load(f)
    
    graph_builder = KnowledgeGraphBuilder(
        settings.NEO4J_URI,
        settings.NEO4J_USER,
        settings.NEO4J_PASSWORD
    )
    graph_builder.initialize_schema()
    
    for wo in work_orders:
        try:
            # Create equipment if doesn't exist
            equipment = Equipment(
                tag=wo["equipment_tag"],
                description=f"Equipment {wo['equipment_tag']}",
                equipment_type="Unknown"
            )
            graph_builder.create_equipment(equipment)
            
            # Create failure event
            with graph_builder.driver.session() as session:
                session.run("""
                    MERGE (e:Equipment {tag: $tag})
                    MERGE (f:FailureEvent {event_id: $event_id})
                    SET f.date = $date,
                        f.reported_issue = $issue,
                        f.root_cause = $root_cause,
                        f.action_taken = $action
                    MERGE (e)-[:EXPERIENCED]->(f)
                """, 
                    tag=wo["equipment_tag"],
                    event_id=wo["work_order_id"],
                    date=wo["date"],
                    issue=wo["reported_issue"],
                    root_cause=wo["root_cause"],
                    action=wo["action_taken"]
                )
        except Exception as e:
            logger.error(f"Failed to ingest work order {wo['work_order_id']}: {e}")
    
    graph_builder.close()
    logger.info(f"✅ Ingested {len(work_orders)} work orders")

if __name__ == "__main__":
    print("="*60)
    print("📥 DATA INGESTION PIPELINE")
    print("="*60)
    print("\nStep 1: Ingesting sample documents...")
    ingest_text_files()
    
    print("\nStep 2: Ingesting work orders...")
    ingest_work_orders()
    
    print("\n" + "="*60)
    print("✅ ALL DATA INGESTED SUCCESSFULLY")
    print("="*60)
    print("\nYou can now:")
    print("1. Start the API: uvicorn main:app --reload")
    print("2. Run benchmarks: python evaluate_benchmark.py")
    print("="*60)
