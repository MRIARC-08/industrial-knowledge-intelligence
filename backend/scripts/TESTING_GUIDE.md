# Production Pipeline Testing Guide

## Overview

This guide explains how to test your PDF processing pipeline with real-world industrial documents before your demo.

## What Gets Tested

The production testing scripts validate your entire pipeline end-to-end:

1. **PDF Text Extraction** - Tests extraction quality with complex formatting (tables, diagrams)
2. **Semantic Chunking** - Validates chunk size, overlap, and semantic coherence
3. **Named Entity Recognition (NER)** - Tests equipment tags, parameters, dates, regulations extraction
4. **Vector Embeddings** - Validates embedding generation speed and storage
5. **Semantic Retrieval** - Tests search quality and response time

## Scripts Available

### 1. `test_production_pipeline.py` - Single PDF Test
Tests a single PDF file through the complete pipeline.

**Usage:**
```bash
# Basic test
python scripts/test_production_pipeline.py path/to/document.pdf

# Detailed test (shows text samples, entities, retrieval results)
python scripts/test_production_pipeline.py path/to/document.pdf --detailed
```

**Output:**
- Console output with stage-by-stage results
- `pipeline_test_report.json` with detailed metrics

### 2. `batch_test_pdfs.py` - Multiple PDF Test
Tests all PDFs in a directory and generates comparative analysis.

**Usage:**
```bash
# Test all PDFs in a directory
python scripts/batch_test_pdfs.py sample_docs/

# With detailed output
python scripts/batch_test_pdfs.py sample_docs/ --detailed
```

**Output:**
- Console output with comparative table
- `batch_pipeline_report.json` with all results

## Test Metrics

### Extraction Metrics
- Extraction time (seconds)
- Text length (characters)
- Word count
- Line count
- Average words per line

### Chunking Metrics
- Total chunks created
- Average chunk size
- Min/max chunk sizes
- Chunking time

### NER Metrics
- Equipment tags found
- Parameters extracted (values + units)
- Dates identified
- Regulation references
- Person names
- Total entities
- Processing time

### Embedding Metrics
- Embedding generation time
- Average time per chunk
- Chunks embedded successfully
- Vector dimension (384 for BAAI/bge-small-en-v1.5)

### Retrieval Metrics
- Search latency (milliseconds)
- Results relevance (cosine similarity scores)
- Average search time across queries

## Quality Benchmarks

### ✓ Production-Ready Indicators

**Extraction:**
- Text length > 1000 characters
- Reasonable word count (not just noise)
- Processing time < 5s per MB

**Chunking:**
- Chunks created: > 5 for typical documents
- Average chunk size: 800-1200 characters
- No excessive fragmentation

**NER:**
- Equipment tags found (if document contains them)
- Parameters extracted with units
- No crashes on complex formatting

**Embeddings:**
- < 100ms per chunk average
- All chunks embedded successfully
- No memory errors

**Retrieval:**
- Search latency < 200ms per query
- Top results have similarity > 0.5
- Relevant results returned

### ⚠ Warning Signs

- Text extraction < 100 characters (image-based PDF?)
- Zero entities extracted (wrong document type?)
- Embedding time > 500ms per chunk (performance issue)
- Search latency > 500ms (index optimization needed)
- Low similarity scores < 0.3 (chunking strategy issue)

## Recommended Test Documents

### Ideal Test PDFs:
1. **OEM Equipment Manuals** - Multi-page, technical specs, diagrams
2. **OISD Regulations** - Structured text, regulation references
3. **Safety Procedures** - Lists, dates, compliance references
4. **Maintenance Logs** - Equipment tags, parameters, dates
5. **Inspection Reports** - Mixed content types

### What to Look For:
- **Tables**: Do they extract correctly or turn into gibberish?
- **Diagrams**: Is surrounding text preserved?
- **Multi-column layouts**: Are columns merged properly?
- **Headers/Footers**: Are they cleaned appropriately?
- **Special characters**: Technical symbols, units (°C, PSI, etc.)

## Running Tests Before Demo

### Quick Pre-Demo Checklist

```bash
# 1. Make sure services are running
# - Qdrant (http://localhost:6333)
# - Check with: curl http://localhost:6333/collections

# 2. Test with a sample document
python scripts/test_production_pipeline.py sample_docs/test_manual.pdf --detailed

# 3. Review the report
cat pipeline_test_report.json | python -m json.tool

# 4. Check for warnings
# Look for "warning" fields in the JSON output

# 5. If batch testing
python scripts/batch_test_pdfs.py sample_docs/ --detailed
```

### What to Check in Results:

1. **All stages show "success"**
2. **No warnings** (or only minor ones)
3. **Performance metrics** within benchmarks
4. **Sample outputs** look correct (in detailed mode)
5. **Entities extracted** are relevant

## Troubleshooting

### Issue: "No text extracted" or very short text
**Cause**: PDF is image-based (scanned document)
**Solution**: 
- Use OCR preprocessing (pytesseract, AWS Textract)
- Or note as limitation for demo

### Issue: "Chunks are very small"
**Cause**: Document has excessive whitespace or fragmentation
**Solution**:
- Adjust chunk_size in SemanticChunker
- Improve text cleaning in PDFExtractor._clean_text()

### Issue: "No entities found"
**Cause**: NER patterns don't match document format
**Solution**:
- Check regex patterns in IndustrialNER
- Add document-specific patterns
- Verify equipment tag formats match your data

### Issue: "Embedding time too high"
**Cause**: CPU-only embedding, large batch size
**Solution**:
- Use GPU if available
- Reduce batch size in embed_text_batch
- Consider lighter embedding model

### Issue: "Low similarity scores in retrieval"
**Cause**: Chunking strategy or embedding model mismatch
**Solution**:
- Experiment with chunk sizes
- Try different overlap values
- Consider domain-specific embedding model

## Integration with Main Application

Once testing passes, your main upload endpoint (`api/routes/documents.py`) should work smoothly:

```python
# Your actual upload flow (already implemented)
POST /api/documents/upload
  → extract_text()
  → chunk_document()
  → extract_entities()
  → embed_text_batch()
  → upsert_documents()
  → build_knowledge_graph()
```

The testing scripts validate this entire flow works correctly with production data.

## Demo Preparation Tips

1. **Pre-load sample data**: Use `scripts/ingest_data.py` with tested PDFs
2. **Verify retrieval quality**: Test actual queries you'll demo
3. **Check response times**: All APIs should respond < 500ms
4. **Prepare fallback**: Have pre-loaded data in case upload demo fails
5. **Note limitations**: Be transparent about image-based PDFs, etc.

## Example Test Session

```bash
# Start services
docker-compose up -d

# Test production pipeline
python scripts/test_production_pipeline.py docs/oem_manual.pdf --detailed

# Output:
# ============================================================
# STAGE 1: PDF TEXT EXTRACTION
# ============================================================
# ✓ Extraction successful
#   - Time taken: 2.34s
#   - Text length: 45,892 characters
#   - Word count: 7,234 words
#   - Lines: 892
# 
# ============================================================
# STAGE 2: SEMANTIC CHUNKING
# ============================================================
# ✓ Chunking successful
#   - Time taken: 0.15s
#   - Total chunks: 48
#   - Average chunk size: 956 chars
# 
# ... (continues for all stages)
# 
# ============================================================
# PRODUCTION PIPELINE TEST REPORT
# ============================================================
# 
# ✓ Overall Status: PASSED
# 📄 PDF File: oem_manual.pdf
# 💾 File Size: 2.4 MB
# 
# --- Stage Results ---
# ✓ EXTRACTION: success
# ✓ CHUNKING: success
# ✓ NER: success
# ✓ EMBEDDINGS: success
# ✓ RETRIEVAL: success
# 
# 📊 Detailed report saved: pipeline_test_report.json
```

## Questions?

If tests reveal issues with your pipeline:
1. Check the detailed JSON report for specific metrics
2. Run with `--detailed` flag to see actual extracted content
3. Review the troubleshooting section above
4. Adjust pipeline parameters based on your document types

**The goal**: All tests pass with no warnings for your demo documents. This gives you confidence the system will work smoothly during the presentation.
