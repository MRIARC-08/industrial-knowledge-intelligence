#!/usr/bin/env python3
"""
Production Pipeline Testing Script
==================================
Tests the complete PDF processing pipeline with real industrial documents.
Validates extraction, chunking, NER, vector embeddings, and retrieval quality.

Usage:
    python scripts/test_production_pipeline.py <path_to_pdf> [--detailed]
    
Example:
    python scripts/test_production_pipeline.py sample_docs/oem_manual.pdf --detailed
"""

import sys
import os
import json
import argparse
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime
import logging

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from agents.document_processor.pdf_extractor import PDFExtractor
from agents.document_processor.chunker import SemanticChunker
from agents.document_processor.ner import IndustrialNER
from tools.vector_search import VectorStore
from config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class PipelineValidator:
    """Validates the entire PDF processing pipeline with production-ready checks."""
    
    def __init__(self, pdf_path: str, detailed: bool = False):
        self.pdf_path = Path(pdf_path)
        self.detailed = detailed
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "pdf_file": str(self.pdf_path),
            "file_size_mb": 0,
            "extraction": {},
            "chunking": {},
            "ner": {},
            "embeddings": {},
            "retrieval": {},
            "overall_status": "pending"
        }
        
        # Initialize components
        self.extractor = PDFExtractor()
        self.chunker = SemanticChunker(chunk_size=1000, chunk_overlap=200)
        self.ner = IndustrialNER()
        self.vector_store = VectorStore(
            qdrant_url=settings.QDRANT_URL,
            collection_name="production_test_collection"
        )
        
    def validate_pdf_exists(self) -> bool:
        """Check if PDF file exists and is readable."""
        logger.info(f"Validating PDF file: {self.pdf_path}")
        
        if not self.pdf_path.exists():
            logger.error(f"PDF file not found: {self.pdf_path}")
            return False
            
        if not self.pdf_path.is_file():
            logger.error(f"Path is not a file: {self.pdf_path}")
            return False
            
        if self.pdf_path.suffix.lower() != '.pdf':
            logger.error(f"File is not a PDF: {self.pdf_path}")
            return False
            
        # Get file size
        file_size_bytes = self.pdf_path.stat().st_size
        self.results["file_size_mb"] = round(file_size_bytes / (1024 * 1024), 2)
        logger.info(f"✓ PDF file validated - Size: {self.results['file_size_mb']} MB")
        
        return True
        
    def test_extraction(self) -> str:
        """Test PDF text extraction."""
        logger.info("\n" + "="*60)
        logger.info("STAGE 1: PDF TEXT EXTRACTION")
        logger.info("="*60)
        
        try:
            import time
            start_time = time.time()
            
            text = self.extractor.extract_text(str(self.pdf_path))
            
            extraction_time = time.time() - start_time
            
            # Validation metrics
            text_length = len(text)
            word_count = len(text.split())
            line_count = len(text.split('\n'))
            
            self.results["extraction"] = {
                "status": "success",
                "extraction_time_seconds": round(extraction_time, 2),
                "text_length_chars": text_length,
                "word_count": word_count,
                "line_count": line_count,
                "avg_words_per_line": round(word_count / max(line_count, 1), 2)
            }
            
            logger.info(f"✓ Extraction successful")
            logger.info(f"  - Time taken: {extraction_time:.2f}s")
            logger.info(f"  - Text length: {text_length:,} characters")
            logger.info(f"  - Word count: {word_count:,} words")
            logger.info(f"  - Lines: {line_count:,}")
            
            if self.detailed:
                logger.info(f"\n--- First 500 characters ---")
                logger.info(text[:500])
                
            # Quality checks
            if text_length < 100:
                logger.warning("⚠ Warning: Extracted text is very short. PDF may be image-based or corrupted.")
                self.results["extraction"]["warning"] = "Text length suspiciously short"
                
            return text
            
        except Exception as e:
            logger.error(f"✗ Extraction failed: {str(e)}")
            self.results["extraction"] = {
                "status": "failed",
                "error": str(e)
            }
            raise
            
    def test_chunking(self, text: str) -> List[str]:
        """Test semantic chunking."""
        logger.info("\n" + "="*60)
        logger.info("STAGE 2: SEMANTIC CHUNKING")
        logger.info("="*60)
        
        try:
            import time
            start_time = time.time()
            
            chunks = self.chunker.chunk_document(text)
            
            chunking_time = time.time() - start_time
            
            # Analyze chunk quality
            chunk_lengths = [len(chunk) for chunk in chunks]
            avg_length = sum(chunk_lengths) / len(chunks) if chunks else 0
            min_length = min(chunk_lengths) if chunks else 0
            max_length = max(chunk_lengths) if chunks else 0
            
            self.results["chunking"] = {
                "status": "success",
                "chunking_time_seconds": round(chunking_time, 2),
                "total_chunks": len(chunks),
                "avg_chunk_size_chars": round(avg_length, 2),
                "min_chunk_size_chars": min_length,
                "max_chunk_size_chars": max_length,
                "target_chunk_size": getattr(self.chunker.splitter, '_chunk_size', 1000),
                "chunk_overlap": getattr(self.chunker.splitter, '_chunk_overlap', 200)
            }
            
            logger.info(f"✓ Chunking successful")
            logger.info(f"  - Time taken: {chunking_time:.2f}s")
            logger.info(f"  - Total chunks: {len(chunks)}")
            logger.info(f"  - Average chunk size: {avg_length:.0f} chars")
            logger.info(f"  - Size range: {min_length}-{max_length} chars")
            
            if self.detailed and chunks:
                logger.info(f"\n--- Sample chunk (first) ---")
                logger.info(chunks[0][:300] + "..." if len(chunks[0]) > 300 else chunks[0])
                
            # Quality checks
            if len(chunks) == 0:
                logger.warning("⚠ Warning: No chunks created")
                self.results["chunking"]["warning"] = "No chunks produced"
            elif avg_length < 100:
                logger.warning("⚠ Warning: Chunks are very small, may affect retrieval quality")
                self.results["chunking"]["warning"] = "Chunks smaller than expected"
                
            return chunks
            
        except Exception as e:
            logger.error(f"✗ Chunking failed: {str(e)}")
            self.results["chunking"] = {
                "status": "failed",
                "error": str(e)
            }
            raise
            
    def test_ner(self, text: str) -> Dict[str, List]:
        """Test Named Entity Recognition."""
        logger.info("\n" + "="*60)
        logger.info("STAGE 3: NAMED ENTITY RECOGNITION (NER)")
        logger.info("="*60)
        
        try:
            import time
            start_time = time.time()
            
            entities = self.ner.extract_entities(text)
            
            ner_time = time.time() - start_time
            
            # Count entities by type
            entity_counts = {k: len(v) for k, v in entities.items()}
            total_entities = sum(entity_counts.values())
            
            self.results["ner"] = {
                "status": "success",
                "ner_time_seconds": round(ner_time, 2),
                "total_entities": total_entities,
                "entity_counts": entity_counts,
                "entities_found": entities if self.detailed else None
            }
            
            logger.info(f"✓ NER extraction successful")
            logger.info(f"  - Time taken: {ner_time:.2f}s")
            logger.info(f"  - Total entities: {total_entities}")
            
            for entity_type, count in entity_counts.items():
                logger.info(f"  - {entity_type}: {count}")
                
            if self.detailed:
                logger.info(f"\n--- Entity samples ---")
                for entity_type, items in entities.items():
                    if items:
                        sample = items[:5]  # Show first 5 of each type
                        logger.info(f"{entity_type}: {sample}")
                        
            # Quality checks
            if total_entities == 0:
                logger.warning("⚠ Warning: No entities extracted. Document may not contain industrial data.")
                self.results["ner"]["warning"] = "No entities found"
                
            return entities
            
        except Exception as e:
            logger.error(f"✗ NER failed: {str(e)}")
            self.results["ner"] = {
                "status": "failed",
                "error": str(e)
            }
            raise
            
    def test_embeddings(self, chunks: List[str]) -> List[str]:
        """Test vector embedding generation and storage."""
        logger.info("\n" + "="*60)
        logger.info("STAGE 4: VECTOR EMBEDDINGS & STORAGE")
        logger.info("="*60)
        
        try:
            import time
            
            # Create test collection
            logger.info("Creating test collection...")
            self.vector_store.create_collection()
            
            # Prepare chunk documents
            chunk_dicts = [
                {
                    "id": i,  # Use integer IDs instead of strings
                    "text": chunk,
                    "metadata": {
                        "source": str(self.pdf_path.name),
                        "chunk_index": i,
                        "timestamp": datetime.now().isoformat()
                    }
                }
                for i, chunk in enumerate(chunks[:20])  # Test with first 20 chunks
            ]
            
            # Test embedding generation
            logger.info(f"Generating embeddings for {len(chunk_dicts)} chunks...")
            start_time = time.time()
            
            self.vector_store.upsert_documents(chunk_dicts)
            
            embedding_time = time.time() - start_time
            avg_time_per_chunk = embedding_time / len(chunk_dicts) if chunk_dicts else 0
            
            self.results["embeddings"] = {
                "status": "success",
                "embedding_time_seconds": round(embedding_time, 2),
                "chunks_embedded": len(chunk_dicts),
                "avg_time_per_chunk_ms": round(avg_time_per_chunk * 1000, 2),
                "embedding_model": "BAAI/bge-small-en-v1.5",
                "vector_dimension": 384,
                "collection_name": self.vector_store.collection_name
            }
            
            logger.info(f"✓ Embeddings generated and stored")
            logger.info(f"  - Time taken: {embedding_time:.2f}s")
            logger.info(f"  - Chunks embedded: {len(chunk_dicts)}")
            logger.info(f"  - Avg time per chunk: {avg_time_per_chunk*1000:.2f}ms")
            logger.info(f"  - Model: BAAI/bge-small-en-v1.5 (384 dims)")
            
            # Return chunk IDs for retrieval testing
            return [c["id"] for c in chunk_dicts]
            
        except Exception as e:
            logger.error(f"✗ Embedding failed: {str(e)}")
            self.results["embeddings"] = {
                "status": "failed",
                "error": str(e)
            }
            raise
            
    def test_retrieval(self, test_queries: List[str] = None):
        """Test semantic search and retrieval quality."""
        logger.info("\n" + "="*60)
        logger.info("STAGE 5: SEMANTIC RETRIEVAL")
        logger.info("="*60)
        
        if test_queries is None:
            test_queries = [
                "equipment maintenance procedure",
                "safety regulations and compliance",
                "operating temperature and pressure",
                "inspection schedule requirements"
            ]
            
        try:
            import time
            
            retrieval_results = []
            total_search_time = 0
            
            for query in test_queries:
                logger.info(f"\nTesting query: '{query}'")
                
                start_time = time.time()
                results = self.vector_store.search(query, limit=3)
                search_time = time.time() - start_time
                total_search_time += search_time
                
                logger.info(f"  ⏱ Search time: {search_time*1000:.2f}ms")
                logger.info(f"  📊 Results found: {len(results)}")
                
                if results and self.detailed:
                    for i, result in enumerate(results, 1):
                        score = result.get('score', 0)
                        text_preview = result.get('metadata', {}).get('text', '')[:150]
                        logger.info(f"    {i}. Score: {score:.3f}")
                        logger.info(f"       Preview: {text_preview}...")
                        
                retrieval_results.append({
                    "query": query,
                    "search_time_ms": round(search_time * 1000, 2),
                    "results_count": len(results),
                    "top_score": results[0].get('score', 0) if results else 0,
                    "results": results if self.detailed else None
                })
                
            avg_search_time = (total_search_time / len(test_queries)) * 1000 if test_queries else 0
            
            self.results["retrieval"] = {
                "status": "success",
                "queries_tested": len(test_queries),
                "avg_search_time_ms": round(avg_search_time, 2),
                "total_search_time_seconds": round(total_search_time, 2),
                "retrieval_results": retrieval_results
            }
            
            logger.info(f"\n✓ Retrieval testing complete")
            logger.info(f"  - Queries tested: {len(test_queries)}")
            logger.info(f"  - Avg search time: {avg_search_time:.2f}ms")
            
            # Quality checks
            if avg_search_time > 500:
                logger.warning("⚠ Warning: Average search time exceeds 500ms")
                self.results["retrieval"]["warning"] = "Search latency high"
                
        except Exception as e:
            logger.error(f"✗ Retrieval testing failed: {str(e)}")
            self.results["retrieval"] = {
                "status": "failed",
                "error": str(e)
            }
            raise
            
    def generate_report(self):
        """Generate final test report."""
        logger.info("\n" + "="*60)
        logger.info("PRODUCTION PIPELINE TEST REPORT")
        logger.info("="*60)
        
        # Determine overall status
        all_stages = ["extraction", "chunking", "ner", "embeddings", "retrieval"]
        failed_stages = [s for s in all_stages if self.results.get(s, {}).get("status") == "failed"]
        warning_stages = [s for s in all_stages if "warning" in self.results.get(s, {})]
        
        if failed_stages:
            self.results["overall_status"] = "FAILED"
            status_icon = "✗"
        elif warning_stages:
            self.results["overall_status"] = "PASSED_WITH_WARNINGS"
            status_icon = "⚠"
        else:
            self.results["overall_status"] = "PASSED"
            status_icon = "✓"
            
        logger.info(f"\n{status_icon} Overall Status: {self.results['overall_status']}")
        logger.info(f"📄 PDF File: {self.pdf_path.name}")
        logger.info(f"💾 File Size: {self.results['file_size_mb']} MB")
        
        logger.info("\n--- Stage Results ---")
        for stage in all_stages:
            stage_data = self.results.get(stage, {})
            status = stage_data.get("status", "not_run")
            
            if status == "success":
                icon = "✓"
            elif status == "failed":
                icon = "✗"
            else:
                icon = "○"
                
            logger.info(f"{icon} {stage.upper()}: {status}")
            
            if "warning" in stage_data:
                logger.info(f"  ⚠ {stage_data['warning']}")
            if "error" in stage_data:
                logger.info(f"  ✗ {stage_data['error']}")
                
        # Performance summary
        logger.info("\n--- Performance Summary ---")
        total_time = 0
        for stage in all_stages:
            stage_data = self.results.get(stage, {})
            time_key = [k for k in stage_data.keys() if 'time_seconds' in k]
            if time_key:
                stage_time = stage_data[time_key[0]]
                total_time += stage_time
                logger.info(f"{stage.title()}: {stage_time:.2f}s")
                
        logger.info(f"Total Pipeline Time: {total_time:.2f}s")
        
        # Save detailed report
        report_path = Path("pipeline_test_report.json")
        with open(report_path, 'w') as f:
            json.dump(self.results, f, indent=2)
        logger.info(f"\n📊 Detailed report saved: {report_path}")
        
        return self.results["overall_status"]
        
    def cleanup(self):
        """Clean up test collection."""
        try:
            logger.info("\nCleaning up test collection...")
            self.vector_store.qdrant.delete_collection(self.vector_store.collection_name)
            logger.info("✓ Cleanup complete")
        except Exception as e:
            logger.warning(f"Cleanup warning: {e}")
            
    def run_full_test(self) -> str:
        """Run complete pipeline validation."""
        try:
            # Validate PDF
            if not self.validate_pdf_exists():
                self.results["overall_status"] = "FAILED"
                return "FAILED"
                
            # Stage 1: Extraction
            text = self.test_extraction()
            
            # Stage 2: Chunking
            chunks = self.test_chunking(text)
            
            # Stage 3: NER
            entities = self.test_ner(text)
            
            # Stage 4: Embeddings
            chunk_ids = self.test_embeddings(chunks)
            
            # Stage 5: Retrieval
            self.test_retrieval()
            
            # Generate final report
            status = self.generate_report()
            
            return status
            
        except Exception as e:
            logger.error(f"\n❌ Pipeline test failed: {str(e)}")
            self.results["overall_status"] = "FAILED"
            self.results["fatal_error"] = str(e)
            return "FAILED"
            
        finally:
            # Always cleanup
            self.cleanup()


def main():
    parser = argparse.ArgumentParser(
        description="Test production PDF processing pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Test a single PDF
  python scripts/test_production_pipeline.py sample_docs/oem_manual.pdf
  
  # Test with detailed output
  python scripts/test_production_pipeline.py sample_docs/oem_manual.pdf --detailed
  
  # Test with custom queries
  python scripts/test_production_pipeline.py sample_docs/oem_manual.pdf --detailed
        """
    )
    
    parser.add_argument(
        'pdf_path',
        type=str,
        help='Path to the PDF file to test'
    )
    
    parser.add_argument(
        '--detailed',
        action='store_true',
        help='Show detailed output including text samples and entity lists'
    )
    
    args = parser.parse_args()
    
    # Run validation
    validator = PipelineValidator(args.pdf_path, detailed=args.detailed)
    status = validator.run_full_test()
    
    # Exit with appropriate code
    exit_codes = {
        "PASSED": 0,
        "PASSED_WITH_WARNINGS": 0,
        "FAILED": 1
    }
    
    sys.exit(exit_codes.get(status, 1))


if __name__ == "__main__":
    main()
