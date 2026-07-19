# Quick Test Commands

## Before Demo - Essential Tests

### 1. Check Qdrant is Running
```bash
curl http://localhost:6333/collections
```
Expected: JSON response with collections list

### 2. Test Single PDF (Fast)
```bash
python scripts/test_production_pipeline.py your_document.pdf
```
⏱️ Takes: 10-30 seconds depending on PDF size

### 3. Test Single PDF (Detailed)
```bash
python scripts/test_production_pipeline.py your_document.pdf --detailed
```
Shows extracted text samples, entities, and retrieval examples

### 4. Test Multiple PDFs
```bash
python scripts/batch_test_pdfs.py sample_docs/
```
Tests all PDFs in a directory

## Quick Status Check

Look for these in the output:

✓ **PASSED** - Ready for demo!  
⚠ **PASSED_WITH_WARNINGS** - Works, but check warnings  
✗ **FAILED** - Fix issues before demo

## Success Criteria

All 5 stages should show ✓:
- ✓ EXTRACTION: success
- ✓ CHUNKING: success  
- ✓ NER: success
- ✓ EMBEDDINGS: success
- ✓ RETRIEVAL: success

## Performance Targets

- PDF Extraction: < 5 seconds per MB
- Chunking: < 1 second for typical docs
- NER: < 2 seconds for typical docs
- Embeddings: < 100ms per chunk
- Search: < 200ms per query

## Common Issues

### "Connection refused" on Qdrant
```bash
# Start Qdrant
docker run -p 6333:6333 qdrant/qdrant
```

### "ModuleNotFoundError"
```bash
pip install -r requirements.txt
```

### "No entities found"
This is OK if document doesn't have equipment tags - but check the detailed output to verify extraction worked

## What to Demo

After successful testing, your demo flow:

1. Upload PDF via API: `POST /api/documents/upload`
2. Query knowledge: Chat with your orchestrator
3. Show retrieved context: Vector search + knowledge graph
4. Display analytics: Dashboard with metrics

The test scripts validate steps 1-3 work correctly!
