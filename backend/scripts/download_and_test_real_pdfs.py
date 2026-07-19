#!/usr/bin/env python3
"""
Real Industrial PDF Download and Test Script
============================================
Downloads real industrial PDFs from public sources and tests the pipeline.

Usage:
    python scripts/download_and_test_real_pdfs.py
"""

import sys
import os
import requests
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

# Real industrial PDFs from public sources
REAL_INDUSTRIAL_PDFS = [
    {
        "name": "Quincy Compressor Manual",
        "url": "https://www.manualslib.com/download/2389336/Quincy-Compressor-Qsvb-Series.html",
        "type": "Equipment Manual",
        "description": "Rotary Screw Vacuum Pump Manual"
    },
    {
        "name": "Industrial Air Compressor",
        "url": "https://www.manualslib.com/download/1351345/Industrial-Air.html",
        "type": "Equipment Manual",
        "description": "Air Compressor Operator Manual"
    },
    {
        "name": "Schrader Compressor Manual",
        "url": "https://www.manualslib.com/download/863457/Schrader-International-7-5-And-10-Hp-Electric.html",
        "type": "Equipment Manual",
        "description": "Electric Compressor O&M Manual"
    },
    # Public OISD documents from Scribd (if accessible)
    {
        "name": "OISD-STD-191 Explosive Safety",
        "url": "https://www.scribd.com/document/428719637/OISD-STD-191-pdf",
        "type": "Safety Standard",
        "description": "Oil Field Explosive Safety Standard"
    },
    {
        "name": "OISD-STD-114 Chemical Handling",
        "url": "https://www.scribd.com/document/283805613/Std-114",
        "type": "Safety Standard",
        "description": "Safe Chemical Handling Guidelines"
    },
]

# Alternative: Public industrial PDF URLs that are directly accessible
DIRECT_PDF_URLS = [
    {
        "name": "API_Pump_Standard",
        "url": "https://law.resource.org/pub/us/cfr/ibr/003/api.610.1989.pdf",
        "type": "Industry Standard",
        "description": "API 610 Centrifugal Pumps"
    },
    {
        "name": "Pump_Handbook",
        "url": "https://www.pumpschool.com/intro/Pump%20Basics.pdf",
        "type": "Technical Guide",
        "description": "Pump Basics and Applications"
    },
    {
        "name": "Industrial_Safety_Guide",
        "url": "https://www.ccohs.ca/oshanswers/safety_haz/welding/fumes.pdf",
        "type": "Safety Guide",
        "description": "Industrial Safety Guidelines"
    },
]


def download_pdf(url: str, output_path: Path, timeout: int = 30) -> bool:
    """Download a PDF from URL."""
    try:
        logger.info(f"Downloading from: {url}")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=timeout, allow_redirects=True)
        response.raise_for_status()
        
        # Check if response is actually a PDF
        content_type = response.headers.get('content-type', '')
        if 'pdf' not in content_type.lower() and not url.endswith('.pdf'):
            logger.warning(f"Response may not be a PDF: {content_type}")
        
        with open(output_path, 'wb') as f:
            f.write(response.content)
        
        file_size = output_path.stat().st_size
        if file_size < 1024:  # Less than 1KB
            logger.warning(f"Downloaded file is very small ({file_size} bytes), may not be valid")
            return False
            
        logger.info(f"✓ Downloaded successfully: {file_size / 1024:.1f} KB")
        return True
        
    except Exception as e:
        logger.error(f"Failed to download: {e}")
        return False


def main():
    logger.info("="*70)
    logger.info("REAL INDUSTRIAL PDF TESTING")
    logger.info("="*70)
    logger.info("")
    
    # Create download directory
    download_dir = Path("real_industrial_pdfs")
    download_dir.mkdir(exist_ok=True)
    
    results = []
    successful_tests = 0
    failed_downloads = 0
    
    logger.info(f"Attempting to download and test {len(DIRECT_PDF_URLS)} real industrial PDFs...")
    logger.info("")
    
    for i, pdf_info in enumerate(DIRECT_PDF_URLS, 1):
        logger.info(f"\n[{i}/{len(DIRECT_PDF_URLS)}] {pdf_info['name']}")
        logger.info(f"  Type: {pdf_info['type']}")
        logger.info(f"  Description: {pdf_info['description']}")
        logger.info("-" * 70)
        
        # Download PDF
        filename = f"{pdf_info['name'].replace(' ', '_')}.pdf"
        output_path = download_dir / filename
        
        if output_path.exists():
            logger.info(f"  PDF already downloaded: {output_path}")
        else:
            success = download_pdf(pdf_info['url'], output_path)
            if not success:
                logger.error(f"  ✗ Failed to download {pdf_info['name']}")
                failed_downloads += 1
                results.append({
                    "name": pdf_info['name'],
                    "status": "download_failed",
                    "type": pdf_info['type']
                })
                continue
        
        # Test the PDF
        try:
            logger.info(f"\n  Testing pipeline with: {filename}")
            logger.info("  " + "="*66)
            
            validator = PipelineValidator(str(output_path), detailed=False)
            status = validator.run_full_test()
            
            results.append({
                "name": pdf_info['name'],
                "type": pdf_info['type'],
                "description": pdf_info['description'],
                "status": status,
                "file_path": str(output_path),
                "test_results": validator.results
            })
            
            if status == "PASSED":
                successful_tests += 1
                logger.info(f"  ✓ Test PASSED for {pdf_info['name']}")
            else:
                logger.warning(f"  ⚠ Test status: {status}")
                
        except Exception as e:
            logger.error(f"  ✗ Test failed: {e}")
            results.append({
                "name": pdf_info['name'],
                "status": "test_error",
                "error": str(e)
            })
    
    # Generate summary report
    logger.info("\n" + "="*70)
    logger.info("REAL INDUSTRIAL PDF TEST SUMMARY")
    logger.info("="*70)
    logger.info(f"\nTotal PDFs Attempted: {len(DIRECT_PDF_URLS)}")
    logger.info(f"Successful Downloads: {len(DIRECT_PDF_URLS) - failed_downloads}")
    logger.info(f"Failed Downloads: {failed_downloads}")
    logger.info(f"Tests Passed: {successful_tests}")
    logger.info(f"Tests with Warnings/Failures: {len(results) - successful_tests - failed_downloads}")
    
    # Save detailed report
    report_path = Path("real_industrial_pdf_test_report.json")
    report_data = {
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total_attempted": len(DIRECT_PDF_URLS),
            "successful_downloads": len(DIRECT_PDF_URLS) - failed_downloads,
            "failed_downloads": failed_downloads,
            "tests_passed": successful_tests,
            "tests_failed": len(results) - successful_tests - failed_downloads
        },
        "results": results
    }
    
    with open(report_path, 'w') as f:
        json.dump(report_data, f, indent=2)
    
    logger.info(f"\n📊 Detailed report saved: {report_path}")
    logger.info("\n" + "="*70)
    
    if successful_tests == 0:
        logger.warning("\n⚠️  No PDFs successfully tested!")
        logger.info("\nNOTE: Many industrial PDF sources require authentication or")
        logger.info("have download restrictions. You may need to:")
        logger.info("1. Manually download real industrial PDFs from your company")
        logger.info("2. Use test_production_pipeline.py on those files")
        logger.info("3. Or provide URLs to directly accessible PDFs")
    
    return successful_tests > 0


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
