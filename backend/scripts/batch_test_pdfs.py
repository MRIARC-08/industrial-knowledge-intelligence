#!/usr/bin/env python3
"""
Batch PDF Pipeline Testing Script
=================================
Tests multiple PDF files and generates comparative analysis.

Usage:
    python scripts/batch_test_pdfs.py <directory_path> [--detailed]
    
Example:
    python scripts/batch_test_pdfs.py sample_docs/ --detailed
"""

import sys
import os
import argparse
from pathlib import Path
import json
from datetime import datetime
import logging

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from test_production_pipeline import PipelineValidator

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class BatchPipelineTester:
    """Test multiple PDFs and generate comparative analysis."""
    
    def __init__(self, directory: str, detailed: bool = False):
        self.directory = Path(directory)
        self.detailed = detailed
        self.test_results = []
        
    def find_pdfs(self):
        """Find all PDF files in directory."""
        if not self.directory.exists():
            logger.error(f"Directory not found: {self.directory}")
            return []
            
        pdfs = list(self.directory.glob("*.pdf"))
        logger.info(f"Found {len(pdfs)} PDF files in {self.directory}")
        return pdfs
        
    def run_batch_tests(self):
        """Run tests on all PDFs."""
        pdfs = self.find_pdfs()
        
        if not pdfs:
            logger.warning("No PDF files found")
            return
            
        logger.info(f"\n{'='*60}")
        logger.info(f"BATCH TESTING: {len(pdfs)} FILES")
        logger.info(f"{'='*60}\n")
        
        for i, pdf_path in enumerate(pdfs, 1):
            logger.info(f"\n[{i}/{len(pdfs)}] Testing: {pdf_path.name}")
            logger.info("-" * 60)
            
            try:
                validator = PipelineValidator(str(pdf_path), detailed=self.detailed)
                status = validator.run_full_test()
                
                self.test_results.append({
                    "file": pdf_path.name,
                    "status": status,
                    "results": validator.results
                })
                
            except Exception as e:
                logger.error(f"Failed to test {pdf_path.name}: {e}")
                self.test_results.append({
                    "file": pdf_path.name,
                    "status": "ERROR",
                    "error": str(e)
                })
                
        self.generate_comparative_report()
        
    def generate_comparative_report(self):
        """Generate comparative analysis of all tests."""
        logger.info(f"\n{'='*60}")
        logger.info("BATCH TEST COMPARATIVE REPORT")
        logger.info(f"{'='*60}\n")
        
        # Summary statistics
        total_files = len(self.test_results)
        passed = sum(1 for r in self.test_results if r["status"] == "PASSED")
        warnings = sum(1 for r in self.test_results if r["status"] == "PASSED_WITH_WARNINGS")
        failed = sum(1 for r in self.test_results if r["status"] in ["FAILED", "ERROR"])
        
        logger.info(f"Total Files: {total_files}")
        logger.info(f"✓ Passed: {passed}")
        logger.info(f"⚠ Warnings: {warnings}")
        logger.info(f"✗ Failed: {failed}")
        
        # Performance comparison
        logger.info(f"\n--- Performance Comparison ---")
        logger.info(f"{'File':<40} {'Size (MB)':<12} {'Chunks':<10} {'Entities':<10} {'Status':<10}")
        logger.info("-" * 85)
        
        for result in self.test_results:
            if result["status"] != "ERROR":
                res = result["results"]
                file_name = result["file"][:38]
                size = res.get("file_size_mb", 0)
                chunks = res.get("chunking", {}).get("total_chunks", 0)
                entities = res.get("ner", {}).get("total_entities", 0)
                status = result["status"]
                
                logger.info(f"{file_name:<40} {size:<12.2f} {chunks:<10} {entities:<10} {status:<10}")
                
        # Save detailed report
        report_path = Path("batch_pipeline_report.json")
        report_data = {
            "timestamp": datetime.now().isoformat(),
            "directory": str(self.directory),
            "summary": {
                "total_files": total_files,
                "passed": passed,
                "warnings": warnings,
                "failed": failed
            },
            "test_results": self.test_results
        }
        
        with open(report_path, 'w') as f:
            json.dump(report_data, f, indent=2)
            
        logger.info(f"\n📊 Detailed batch report saved: {report_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Batch test PDF processing pipeline on multiple files"
    )
    
    parser.add_argument(
        'directory',
        type=str,
        help='Directory containing PDF files to test'
    )
    
    parser.add_argument(
        '--detailed',
        action='store_true',
        help='Show detailed output for each file'
    )
    
    args = parser.parse_args()
    
    tester = BatchPipelineTester(args.directory, detailed=args.detailed)
    tester.run_batch_tests()


if __name__ == "__main__":
    main()
