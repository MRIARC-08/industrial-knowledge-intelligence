from typing import List
from agents.state import AgentState
from tools.hybrid_retrieval import HybridRetriever
import logging

logger = logging.getLogger(__name__)

class RetrievalNode:
    def __init__(self):
        self.retriever = HybridRetriever()
        
    def __call__(self, state: AgentState) -> dict:
        query = state.get("query", "")
        logger.info(f"Retrieving documents (Hybrid) for: {query}")
        
        try:
            results = self.retriever.retrieve(query, limit=3)
            documents = [res["metadata"].get("text", "") for res in results if "metadata" in res]
            retrieved_docs = [
                {
                    "doc_id": res["metadata"].get("doc_id", "unknown"),
                    "text": res["metadata"].get("text", ""),
                    "score": res.get("score", 0.0),
                    "equipment_tags": res["metadata"].get("equipment_tags", [])
                }
                for res in results if "metadata" in res
            ]
        except Exception as e:
            logger.warning(f"Hybrid retrieval failed: {e}")
            documents = ["Mock document chunk retrieved for testing."]
            retrieved_docs = [{"doc_id": "mock.txt", "text": documents[0], "score": 1.0, "equipment_tags": []}]
            
        return {"documents": documents, "retrieved_docs": retrieved_docs}
