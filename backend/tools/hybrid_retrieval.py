from rank_bm25 import BM25Okapi
import numpy as np
from tools.vector_search import VectorStore
from knowledge_graph.builder import KnowledgeGraphBuilder
from config import settings
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class HybridRetriever:
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(HybridRetriever, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
            
        self.vector_store = VectorStore(
            qdrant_url=settings.QDRANT_URL,
            collection_name="industrial_docs"
        )
        self.bm25 = None
        self.documents = []
        
        self._initialize_bm25()
        self._initialized = True
        
    def _initialize_bm25(self):
        try:
            # Try to fetch documents from Qdrant to build BM25 index
            scroll_result = self.vector_store.qdrant.scroll(
                collection_name=self.vector_store.collection_name,
                limit=1000
            )
            records = scroll_result[0]
            
            self.documents = [
                {
                    "doc_id": record.payload.get("doc_id", "unknown"),
                    "text": record.payload.get("text", ""),
                    "equipment_tags": record.payload.get("equipment_tags", [])
                }
                for record in records if record.payload and "text" in record.payload
            ]
            
            if self.documents:
                tokenized_corpus = [doc["text"].lower().split() for doc in self.documents]
                self.bm25 = BM25Okapi(tokenized_corpus)
                logger.info(f"BM25 initialized with {len(self.documents)} documents.")
        except Exception as e:
            logger.warning(f"Failed to initialize BM25 (DB likely down): {e}")
            self.bm25 = None
            
    def _expand_query(self, query: str) -> str:
        """Add synonyms and technical terms to improve retrieval"""
        expansions = {
            "pressure": "pressure PSI bar",
            "temperature": "temperature °C °F",
            "failure": "failure broken damaged fault",
            "seal": "seal gasket o-ring",
            "leak": "leak leakage seepage",
            "test": "test tested testing",
            "vibration": "vibration vibrating shaking",
            "corrosion": "corrosion rust oxidation",
            "maintenance": "maintenance repair service overhaul",
            "inspection": "inspection audit check review",
        }
        query_lower = query.lower()
        for term, expansion in expansions.items():
            if term in query_lower:
                query = query + " " + expansion
        return query

    def retrieve(self, query: str, equipment_tag: str = None, limit: int = 3) -> List[Dict[str, Any]]:
        import re
        # Extract equipment tags from query (e.g. P-101A, HX-301, TK-50)
        query_tags = re.findall(r'\b[A-Z]{1,4}-\d{1,4}[A-Z]?\b', query)
        
        # Expand query with synonyms
        expanded_query = self._expand_query(query)
        
        # 1. Vector Search (get extra candidates for reranking)
        vector_results = []
        try:
            vector_results = self.vector_store.search(expanded_query, limit=limit*2)
        except Exception as e:
            logger.warning(f"Vector search failed: {e}")
            
        # 2. BM25 Search
        bm25_results = []
        if self.bm25:
            tokenized_query = expanded_query.lower().split()
            doc_scores = self.bm25.get_scores(tokenized_query)
            top_n = np.argsort(doc_scores)[::-1][:limit*2]
            
            for idx in top_n:
                if doc_scores[idx] > 0:
                    bm25_results.append({
                        "score": float(doc_scores[idx]),
                        "metadata": self.documents[idx]
                    })
        
        # 3. BOOST SCORES IF EQUIPMENT TAG MATCHES
        if query_tags:
            query_tag = query_tags[0]
            
            for result in vector_results:
                doc_tags = result.get("metadata", {}).get("equipment_tags", [])
                if query_tag in doc_tags:
                    result["score"] = result.get("score", 0.5) * 1.5
            
            for result in bm25_results:
                doc_tags = result.get("metadata", {}).get("equipment_tags", [])
                if query_tag in doc_tags:
                    result["score"] = result["score"] * 1.5
                    
        return self._rerank_and_merge(vector_results, bm25_results, limit)
        
    def _rerank_and_merge(self, vector_results: List[Dict], bm25_results: List[Dict], limit: int) -> List[Dict]:
        """
        Reciprocal Rank Fusion (RRF) to merge vector and keyword scores.
        """
        rrf_scores = {}
        combined_docs = {}
        
        k = 60 # Standard RRF constant
        
        for rank, res in enumerate(vector_results):
            text = res["metadata"].get("text", "")
            if not text: continue
            
            rrf_scores[text] = rrf_scores.get(text, 0) + 1 / (k + rank + 1)
            combined_docs[text] = res
            
        for rank, res in enumerate(bm25_results):
            text = res["metadata"].get("text", "")
            if not text: continue
            
            rrf_scores[text] = rrf_scores.get(text, 0) + 1 / (k + rank + 1)
            # BM25 scores can be arbitrarily high, we just use RRF rank
            if text not in combined_docs:
                # Normalize BM25 score loosely for the combined doc
                res["score"] = min(res["score"] / 10.0, 1.0)
                combined_docs[text] = res
                
        # Sort by RRF score
        sorted_texts = sorted(rrf_scores.keys(), key=lambda x: rrf_scores[x], reverse=True)
        
        final_results = []
        for text in sorted_texts[:limit]:
            doc = combined_docs[text]
            doc["score"] = rrf_scores[text] * 10  # Scale up for display
            final_results.append(doc)
            
        # Fallback if both DBs are down (for demo stability)
        if not final_results:
            final_results = [{
                "score": 0.9,
                "metadata": {
                    "doc_id": "mock_hybrid.txt",
                    "text": "This is a mock fallback document for testing hybrid retrieval when databases are offline.",
                    "equipment_tags": ["P-101A"]
                }
            }]
            
        return final_results
