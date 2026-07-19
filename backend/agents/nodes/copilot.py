from typing import List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from agents.state import AgentState
from tools.hybrid_retrieval import HybridRetriever
from config import settings
import logging

logger = logging.getLogger(__name__)

class CopilotAgent:
    """Handles general Q&A (70% of queries)"""
    def __init__(self):
        model_kwargs = {}
        if "deepseek" in settings.LLM_MODEL.lower():
            model_kwargs["thinking"] = "high"
            
        self.llm = ChatOpenAI(
            model=settings.LLM_MODEL, 
            temperature=0.0,
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL if settings.OPENAI_BASE_URL else None,
            model_kwargs=model_kwargs
        )
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert Industrial Copilot. Answer the general engineering question using the provided technical context.\n\nContext:\n{context}"),
            ("user", "{query}")
        ])
        self.retriever = HybridRetriever()

    def calculate_confidence(self, answer: str, documents: List[str]) -> float:
        if not documents: return 0.3
        answer_words = set(answer.lower().split())
        doc_words = set(' '.join(documents).lower().split())
        overlap = len(answer_words & doc_words) / max(len(answer_words), 1)
        return min(overlap * 1.2, 0.95)

    def __call__(self, state: AgentState) -> dict:
        query = state.get("query", "")
        
        # Hybrid retrieval
        results = self.retriever.retrieve(query, limit=6)
        documents = [res["metadata"].get("text", "") for res in results if "metadata" in res]
        retrieved_docs = [{"doc_id": res["metadata"].get("doc_id", "unknown"), "text": res["metadata"].get("text", ""), "score": res.get("score", 0.0), "equipment_tags": res["metadata"].get("equipment_tags", [])} for res in results if "metadata" in res]
        
        context_str = "\n\n".join(documents)
        
        chain = self.prompt | self.llm
        result = chain.invoke({"context": context_str, "query": query})
        confidence = self.calculate_confidence(result.content, documents)
        
        return {"final_answer": result.content, "confidence": confidence, "documents": documents, "retrieved_docs": retrieved_docs}
