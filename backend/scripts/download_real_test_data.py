#!/usr/bin/env python3
"""
Download Real Industrial Test Data & Run Pipeline Tests
========================================================
Downloads 15 real, publicly available industrial PDFs and 7 real industrial
images from verified government/public sources. Then tests each PDF through
the document processing pipeline.

ALL URLs verified to return HTTP 200 before inclusion.
Sources: OSHA, DOE, NIST, Pexels, Unsplash, Pixabay (all public/free-use)
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
import ssl
from pathlib import Path
from datetime import datetime

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# ============================================================================
# ALL URLs VERIFIED — HTTP 200 confirmed before inclusion
# ============================================================================

REAL_PDFS = [
    # ── OSHA Safety Publications (8 verified) ──────────────────────────
    {
        "name": "01_OSHA_COVID_Workers_Guide.pdf",
        "url": "https://www.osha.gov/sites/default/files/publications/OSHA3990.pdf",
        "category": "safety",
        "description": "OSHA Guidance on Preparing Workplaces for COVID-19"
    },
    {
        "name": "02_OSHA_Lockout_Tagout.pdf",
        "url": "https://www.osha.gov/sites/default/files/publications/osha3120.pdf",
        "category": "safety",
        "description": "OSHA Control of Hazardous Energy — Lockout/Tagout"
    },
    {
        "name": "03_OSHA_Machine_Guarding.pdf",
        "url": "https://www.osha.gov/sites/default/files/publications/osha3170.pdf",
        "category": "safety",
        "description": "OSHA Concepts and Techniques of Machine Safeguarding"
    },
    {
        "name": "04_OSHA_PPE_Guide.pdf",
        "url": "https://www.osha.gov/sites/default/files/publications/osha3151.pdf",
        "category": "safety",
        "description": "OSHA Personal Protective Equipment Guide"
    },
    {
        "name": "05_OSHA_Process_Safety_Mgmt.pdf",
        "url": "https://www.osha.gov/sites/default/files/publications/osha3132.pdf",
        "category": "safety",
        "description": "OSHA Process Safety Management Guidelines"
    },
    {
        "name": "06_OSHA_Electrical_Safety.pdf",
        "url": "https://www.osha.gov/sites/default/files/publications/osha3075.pdf",
        "category": "safety",
        "description": "OSHA Controlling Electrical Hazards"
    },
    {
        "name": "07_OSHA_Confined_Space.pdf",
        "url": "https://www.osha.gov/sites/default/files/publications/osha3138.pdf",
        "category": "safety",
        "description": "OSHA Permit-Required Confined Spaces"
    },
    {
        "name": "08_OSHA_Fall_Prevention.pdf",
        "url": "https://www.osha.gov/sites/default/files/publications/osha3146.pdf",
        "category": "safety",
        "description": "OSHA Fall Protection in Construction"
    },
    # ── More OSHA (3 verified) ─────────────────────────────────────────
    {
        "name": "09_OSHA_Scaffolding_Safety.pdf",
        "url": "https://www.osha.gov/sites/default/files/publications/osha3150.pdf",
        "category": "safety",
        "description": "OSHA A Guide to Scaffold Use in the Construction Industry"
    },
    {
        "name": "10_OSHA_Excavation_Safety.pdf",
        "url": "https://www.osha.gov/sites/default/files/publications/osha2226.pdf",
        "category": "safety",
        "description": "OSHA Excavation Hazards"
    },
    {
        "name": "11_OSHA_Crane_Safety.pdf",
        "url": "https://www.osha.gov/sites/default/files/publications/osha3144.pdf",
        "category": "equipment_manual",
        "description": "OSHA Crane, Derrick, and Hoist Safety"
    },
    {
        "name": "12_OSHA_Noise_Exposure.pdf",
        "url": "https://www.osha.gov/sites/default/files/publications/osha3074.pdf",
        "category": "safety",
        "description": "OSHA Hearing Conservation"
    },
    # ── DOE Industrial Equipment Guides (2 verified) ───────────────────
    {
        "name": "13_DOE_Pump_Energy_Savings.pdf",
        "url": "https://www.energy.gov/sites/prod/files/2014/05/f16/pump.pdf",
        "category": "equipment_manual",
        "description": "DOE Improving Pumping System Performance — Sourcebook"
    },
    {
        "name": "14_DOE_Motor_Systems_Guide.pdf",
        "url": "https://www.energy.gov/sites/default/files/2014/04/f15/amo_motors_sourcebook_web.pdf",
        "category": "equipment_manual",
        "description": "DOE Improving Motor and Drive System Performance"
    },
    # ── NIST Standards (1 verified) ────────────────────────────────────
    {
        "name": "15_NIST_Cybersecurity_Manufacturing.pdf",
        "url": "https://nvlpubs.nist.gov/nistpubs/ir/2017/NIST.IR.8183.pdf",
        "category": "standards",
        "description": "NIST Cybersecurity Framework Manufacturing Profile"
    },
]

REAL_IMAGES = [
    # ── Pixabay (public domain, free use) ──────────────────────────────
    {
        "name": "img_01_world_map_industrial.jpg",
        "url": "https://cdn.pixabay.com/photo/2017/06/14/08/20/map-of-the-world-2401458_1280.jpg",
        "category": "industrial_photo",
        "description": "Industrial world map infographic (Pixabay, free use)"
    },
    # ── Pexels (free stock, no auth needed) ────────────────────────────
    {
        "name": "img_02_industrial_pump_station.jpg",
        "url": "https://images.pexels.com/photos/2310483/pexels-photo-2310483.jpeg?auto=compress&cs=tinysrgb&w=1260",
        "category": "equipment_photo",
        "description": "Industrial pump/machinery station (Pexels, free)"
    },
    {
        "name": "img_03_factory_floor.jpg",
        "url": "https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=1260",
        "category": "industrial_photo",
        "description": "Factory floor manufacturing line (Pexels, free)"
    },
    {
        "name": "img_04_industrial_pipes.jpg",
        "url": "https://images.pexels.com/photos/3855962/pexels-photo-3855962.jpeg?auto=compress&cs=tinysrgb&w=1260",
        "category": "piping",
        "description": "Industrial piping system (Pexels, free)"
    },
    {
        "name": "img_05_factory_machinery.jpg",
        "url": "https://images.pexels.com/photos/257700/pexels-photo-257700.jpeg?auto=compress&cs=tinysrgb&w=1260",
        "category": "equipment_photo",
        "description": "Factory machinery and equipment (Pexels, free)"
    },
    # ── Unsplash (free, direct links) ──────────────────────────────────
    {
        "name": "img_06_industrial_interior.jpg",
        "url": "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=1280",
        "category": "industrial_photo",
        "description": "Industrial interior / warehouse (Unsplash, free)"
    },
    {
        "name": "img_07_manufacturing_plant.jpg",
        "url": "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1280",
        "category": "industrial_photo",
        "description": "Manufacturing plant / production facility (Unsplash, free)"
    },
]


def create_ssl_context():
    """Create an SSL context that handles certificate issues gracefully."""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx


def download_file(url: str, dest_path: str, timeout: int = 120) -> dict:
    """Download a file with proper error handling and result tracking."""
    result = {
        "url": url,
        "dest": dest_path,
        "status": "pending",
        "size_bytes": 0,
        "time_seconds": 0,
        "error": None
    }

    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 1024:
        result["status"] = "already_exists"
        result["size_bytes"] = os.path.getsize(dest_path)
        print(f"  ⏭  Already exists ({result['size_bytes']:,} bytes)")
        return result

    start = time.time()
    try:
        ctx = create_ssl_context()
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        })

        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as response:
            data = response.read()

        with open(dest_path, "wb") as f:
            f.write(data)

        result["status"] = "downloaded"
        result["size_bytes"] = len(data)
        result["time_seconds"] = round(time.time() - start, 2)

        print(f"  ✅ Downloaded ({result['size_bytes']:,} bytes in {result['time_seconds']}s)")

    except urllib.error.HTTPError as e:
        result["status"] = "http_error"
        result["error"] = f"HTTP {e.code}: {e.reason}"
        result["time_seconds"] = round(time.time() - start, 2)
        print(f"  ❌ HTTP Error: {e.code} {e.reason}")

    except urllib.error.URLError as e:
        result["status"] = "url_error"
        result["error"] = str(e.reason)
        result["time_seconds"] = round(time.time() - start, 2)
        print(f"  ❌ URL Error: {e.reason}")

    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)
        result["time_seconds"] = round(time.time() - start, 2)
        print(f"  ❌ Error: {e}")

    return result


def download_all():
    """Download all PDFs and images."""
    base_dir = Path(__file__).parent.parent
    pdf_dir = base_dir / "real_test_data" / "pdfs"
    img_dir = base_dir / "real_test_data" / "images"

    pdf_dir.mkdir(parents=True, exist_ok=True)
    img_dir.mkdir(parents=True, exist_ok=True)

    results = {"pdfs": [], "images": [], "timestamp": datetime.now().isoformat()}

    print("=" * 70)
    print("  DOWNLOADING REAL INDUSTRIAL TEST DATA")
    print("  All URLs pre-verified — no sample/generated data")
    print("=" * 70)

    # Download PDFs
    print(f"\n📄 Downloading {len(REAL_PDFS)} Real Industrial PDFs...")
    print("-" * 60)

    for i, pdf_info in enumerate(REAL_PDFS, 1):
        dest = str(pdf_dir / pdf_info["name"])
        print(f"\n[{i}/{len(REAL_PDFS)}] {pdf_info['name']}")
        print(f"     {pdf_info['description']}")

        dl_result = download_file(pdf_info["url"], dest)
        dl_result["category"] = pdf_info["category"]
        dl_result["description"] = pdf_info["description"]
        dl_result["filename"] = pdf_info["name"]
        results["pdfs"].append(dl_result)

    # Download Images
    print(f"\n\n🖼  Downloading {len(REAL_IMAGES)} Real Industrial Images...")
    print("-" * 60)

    for i, img_info in enumerate(REAL_IMAGES, 1):
        dest = str(img_dir / img_info["name"])
        print(f"\n[{i}/{len(REAL_IMAGES)}] {img_info['name']}")
        print(f"     {img_info['description']}")

        dl_result = download_file(img_info["url"], dest)
        dl_result["category"] = img_info["category"]
        dl_result["description"] = img_info["description"]
        dl_result["filename"] = img_info["name"]
        results["images"].append(dl_result)

    # Summary
    pdf_ok = sum(1 for r in results["pdfs"] if r["status"] in ("downloaded", "already_exists"))
    img_ok = sum(1 for r in results["images"] if r["status"] in ("downloaded", "already_exists"))

    print("\n" + "=" * 70)
    print("  DOWNLOAD SUMMARY")
    print("=" * 70)
    print(f"  PDFs:   {pdf_ok}/{len(REAL_PDFS)} successfully downloaded")
    print(f"  Images: {img_ok}/{len(REAL_IMAGES)} successfully downloaded")
    print(f"  Total:  {pdf_ok + img_ok}/{len(REAL_PDFS) + len(REAL_IMAGES)}")

    # Save download manifest
    manifest_path = base_dir / "real_test_data" / "download_manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n  📋 Manifest saved: {manifest_path}")

    return results, pdf_dir, img_dir


def run_pipeline_tests(pdf_dir: Path):
    """Run the document processing pipeline on all downloaded PDFs."""
    from agents.document_processor.pdf_extractor import PDFExtractor
    from agents.document_processor.chunker import SemanticChunker
    from agents.document_processor.ner import IndustrialNER
    from tools.vector_search import VectorStore

    extractor = PDFExtractor()
    chunker = SemanticChunker(chunk_size=1000, chunk_overlap=200)
    ner = IndustrialNER()

    try:
        vector_store = VectorStore(collection_name="real_data_test_collection")
        vector_store.create_collection()
    except Exception as e:
        print(f"\n⚠️  Could not initialize VectorStore (is Qdrant running?): {e}")
        vector_store = None

    pdf_files = sorted(pdf_dir.glob("*.pdf"))

    if not pdf_files:
        print("\n⚠️  No PDF files found to test!")
        return []

    print("\n" + "=" * 70)
    print(f"  PIPELINE TESTING: {len(pdf_files)} REAL PDFs")
    print("=" * 70)

    test_results = []

    for i, pdf_path in enumerate(pdf_files, 1):
        file_size_mb = pdf_path.stat().st_size / (1024 * 1024)

        print(f"\n{'─' * 60}")
        print(f"[{i}/{len(pdf_files)}] {pdf_path.name} ({file_size_mb:.2f} MB)")
        print(f"{'─' * 60}")

        result = {
            "file": pdf_path.name,
            "file_size_mb": round(file_size_mb, 2),
            "extraction": {},
            "chunking": {},
            "ner": {},
            "status": "pending"
        }

        # === STAGE 1: PDF TEXT EXTRACTION ===
        try:
            t0 = time.time()
            text = extractor.extract_text(str(pdf_path))
            extraction_time = time.time() - t0

            word_count = len(text.split())
            char_count = len(text)

            result["extraction"] = {
                "status": "success",
                "time_seconds": round(extraction_time, 2),
                "char_count": char_count,
                "word_count": word_count,
                "first_200_chars": text[:200].replace('\n', ' ')
            }

            if char_count < 100:
                result["extraction"]["warning"] = "Very short text - may be image-based/scanned PDF"
                print(f"  📝 Extraction: ⚠️  Only {char_count} chars ({extraction_time:.2f}s) - possibly scanned")
            else:
                print(f"  📝 Extraction: ✅ {word_count:,} words, {char_count:,} chars ({extraction_time:.2f}s)")

        except Exception as e:
            result["extraction"] = {"status": "failed", "error": str(e)}
            result["status"] = "FAILED"
            print(f"  📝 Extraction: ❌ {e}")
            test_results.append(result)
            continue

        # === STAGE 2: SEMANTIC CHUNKING ===
        try:
            t0 = time.time()
            chunks = chunker.chunk_document(text)
            chunking_time = time.time() - t0

            chunk_sizes = [len(c) for c in chunks]
            avg_chunk = sum(chunk_sizes) / len(chunk_sizes) if chunk_sizes else 0

            result["chunking"] = {
                "status": "success",
                "time_seconds": round(chunking_time, 2),
                "total_chunks": len(chunks),
                "avg_chunk_size": round(avg_chunk),
                "min_chunk_size": min(chunk_sizes) if chunk_sizes else 0,
                "max_chunk_size": max(chunk_sizes) if chunk_sizes else 0
            }
            print(f"  🔪 Chunking:   ✅ {len(chunks)} chunks, avg {avg_chunk:.0f} chars ({chunking_time:.2f}s)")

        except Exception as e:
            result["chunking"] = {"status": "failed", "error": str(e)}
            print(f"  🔪 Chunking:   ❌ {e}")

        # === STAGE 3: NAMED ENTITY RECOGNITION ===
        try:
            t0 = time.time()
            entities = ner.extract_entities(text)
            ner_time = time.time() - t0

            entity_counts = {k: len(v) for k, v in entities.items()}
            total_entities = sum(entity_counts.values())

            sample_tags = entities.get("equipment_tags", [])[:5]
            sample_params = entities.get("parameters", [])[:3]
            sample_regs = entities.get("regulations", [])[:3]

            result["ner"] = {
                "status": "success",
                "time_seconds": round(ner_time, 2),
                "total_entities": total_entities,
                "entity_counts": entity_counts,
                "sample_equipment_tags": sample_tags,
                "sample_parameters": sample_params,
                "sample_regulations": sample_regs
            }

            print(f"  🏷  NER:        ✅ {total_entities} entities ({ner_time:.2f}s)")
            if sample_tags:
                print(f"     Equipment tags: {sample_tags}")
            if sample_params:
                print(f"     Parameters: {sample_params}")
            if sample_regs:
                print(f"     Regulations: {sample_regs}")

        except Exception as e:
            result["ner"] = {"status": "failed", "error": str(e)}
            print(f"  🏷  NER:        ❌ {e}")

        # Determine overall status
        
        # === STAGE 4: VECTOR EMBEDDINGS & STORAGE ===
        if vector_store and chunks:
            try:
                t0 = time.time()
                import uuid
                # Prepare chunk documents
                chunk_dicts = [
                    {
                        "id": str(uuid.uuid4()),
                        "text": chunk,
                        "metadata": {
                            "source": str(pdf_path.name),
                            "chunk_index": i,
                            "timestamp": datetime.now().isoformat()
                        }
                    }
                    for i, chunk in enumerate(chunks[:20])  # Test with first 20 chunks to speed up testing
                ]
                vector_store.upsert_documents(chunk_dicts)
                embed_time = time.time() - t0

                result["embeddings"] = {
                    "status": "success",
                    "time_seconds": round(embed_time, 2),
                    "chunks_embedded": len(chunk_dicts)
                }
                print(f"  🧠 Embeddings: ✅ {len(chunk_dicts)} chunks embedded ({embed_time:.2f}s)")
            except Exception as e:
                result["embeddings"] = {"status": "failed", "error": str(e)}
                print(f"  🧠 Embeddings: ❌ {e}")
        else:
            result["embeddings"] = {"status": "skipped"}

        # === STAGE 5: RETRIEVAL TESTING ===
        if vector_store and result["embeddings"].get("status") == "success":
            try:
                t0 = time.time()
                test_queries = [
                    "What are the safety regulations for this equipment?",
                    "How to perform maintenance and troubleshooting?",
                ]

                retrieval_results = []
                for query in test_queries:
                    search_hits = vector_store.search(query, limit=2)
                    retrieval_results.append({
                        "query": query,
                        "hits": len(search_hits),
                        "top_score": search_hits[0]["score"] if search_hits else 0
                    })

                retrieve_time = time.time() - t0
                result["retrieval"] = {
                    "status": "success",
                    "time_seconds": round(retrieve_time, 2),
                    "queries_run": len(test_queries)
                }

                print(f"  🔍 Retrieval:  ✅ {len(test_queries)} queries run ({retrieve_time:.2f}s)")
                for r in retrieval_results:
                    print(f"     Q: '{r['query']}' -> {r['hits']} hits (top score: {r['top_score']:.3f})")
            except Exception as e:
                result["retrieval"] = {"status": "failed", "error": str(e)}
                print(f"  🔍 Retrieval:  ❌ {e}")
        else:
            result["retrieval"] = {"status": "skipped"}

        # Determine overall status
        stages = [
            result.get("extraction", {}), 
            result.get("chunking", {}), 
            result.get("ner", {}), 
            result.get("embeddings", {}), 
            result.get("retrieval", {})
        ]
        failed = sum(1 for s in stages if s.get("status") == "failed")
        warnings = sum(1 for s in stages if "warning" in s)

        if failed > 0:
            result["status"] = "FAILED"
        elif warnings > 0:
            result["status"] = "PASSED_WITH_WARNINGS"
        else:
            result["status"] = "PASSED"

        status_icon = {"PASSED": "✅", "PASSED_WITH_WARNINGS": "⚠️", "FAILED": "❌"}
        print(f"  📊 Overall:    {status_icon.get(result['status'], '?')} {result['status']}")

        test_results.append(result)

    return test_results


def generate_final_report(download_results: dict, test_results: list, base_dir: Path):
    """Generate comprehensive test report."""
    report = {
        "timestamp": datetime.now().isoformat(),
        "summary": {},
        "download_results": download_results,
        "pipeline_test_results": test_results
    }

    total_pdfs = len(test_results)
    passed = sum(1 for r in test_results if r["status"] == "PASSED")
    warnings = sum(1 for r in test_results if r["status"] == "PASSED_WITH_WARNINGS")
    failed = sum(1 for r in test_results if r["status"] == "FAILED")

    total_words = sum(r.get("extraction", {}).get("word_count", 0) for r in test_results)
    total_chunks = sum(r.get("chunking", {}).get("total_chunks", 0) for r in test_results)
    total_entities = sum(r.get("ner", {}).get("total_entities", 0) for r in test_results)

    report["summary"] = {
        "total_pdfs_tested": total_pdfs,
        "passed": passed,
        "passed_with_warnings": warnings,
        "failed": failed,
        "pass_rate": f"{((passed + warnings) / total_pdfs * 100):.1f}%" if total_pdfs else "0%",
        "total_words_extracted": total_words,
        "total_chunks_created": total_chunks,
        "total_entities_found": total_entities
    }

    print("\n" + "=" * 70)
    print("  FINAL TEST REPORT — REAL INDUSTRIAL PDFs")
    print("=" * 70)
    print(f"\n  📊 PDFs Tested:     {total_pdfs}")
    print(f"  ✅ Passed:          {passed}")
    print(f"  ⚠️  Warnings:       {warnings}")
    print(f"  ❌ Failed:          {failed}")
    print(f"  📈 Pass Rate:       {report['summary']['pass_rate']}")
    print(f"\n  📝 Total Words:     {total_words:,}")
    print(f"  🔪 Total Chunks:    {total_chunks:,}")
    print(f"  🏷  Total Entities:  {total_entities:,}")

    # Performance table
    print(f"\n  {'File':<45} {'Size':>8} {'Words':>8} {'Chunks':>8} {'Entities':>8} {'Status':>10}")
    print(f"  {'─'*45} {'─'*8} {'─'*8} {'─'*8} {'─'*8} {'─'*10}")

    for r in test_results:
        name = r["file"][:43]
        size = f"{r.get('file_size_mb', 0):.1f}MB"
        words = str(r.get("extraction", {}).get("word_count", 0))
        chunks = str(r.get("chunking", {}).get("total_chunks", 0))
        entities = str(r.get("ner", {}).get("total_entities", 0))
        status = r["status"]
        print(f"  {name:<45} {size:>8} {words:>8} {chunks:>8} {entities:>8} {status:>10}")

    # Image summary
    img_ok = sum(1 for r in download_results.get("images", []) if r["status"] in ("downloaded", "already_exists"))
    print(f"\n  🖼  Images Downloaded: {img_ok}/{len(download_results.get('images', []))}")

    # Save report
    report_path = base_dir / "real_test_data" / "pipeline_test_report.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2, default=str)
    print(f"\n  📋 Full report saved: {report_path}")

    return report


def main():
    base_dir = Path(__file__).parent.parent

    print("\n" + "🏭" * 35)
    print("  INDUSTRIAL KNOWLEDGE INTELLIGENCE — REAL DATA TEST SUITE")
    print("  All data scraped from real public sources (no samples)")
    print("🏭" * 35 + "\n")

    # Step 1: Download real data
    download_results, pdf_dir, img_dir = download_all()

    # Step 2: Run pipeline tests on PDFs
    test_results = run_pipeline_tests(pdf_dir)

    # Step 3: Generate final report
    if test_results:
        generate_final_report(download_results, test_results, base_dir)
    else:
        print("\n⚠️  No PDFs were available to test. Check download results.")

    print("\n" + "🏭" * 35)
    print("  TEST SUITE COMPLETE")
    print("🏭" * 35 + "\n")


if __name__ == "__main__":
    main()
