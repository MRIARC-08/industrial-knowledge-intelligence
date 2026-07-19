from typing import List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from agents.state import AgentState
from tools.hybrid_retrieval import HybridRetriever
from config import settings
import logging

logger = logging.getLogger(__name__)

class ComplianceAgent:
    """Regulatory compliance checks"""
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.LLM_MODEL, 
            temperature=0.0,
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL if settings.OPENAI_BASE_URL else None
        )
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a strict Regulatory Compliance Agent. Answer the user's question about industrial regulations, standards (e.g., OISD, PESO), or audits using ONLY the provided regulatory documents.

INSTRUCTIONS:
1. Base your answer strictly on the provided documents. Do not hallucinate or guess.
2. Ensure you strictly match compliance regulations and clauses mentioned in the text.
3. If the answer is not in the documents, state that you cannot confirm compliance.

Regulatory Documents:
{context}"""),
            ("user", "{query}")
        ])
        self.retriever = HybridRetriever()
        
    def __call__(self, state: AgentState) -> dict:
        query = state.get("query", "")
        
        results = self.retriever.retrieve(query, limit=5)
        documents = [res["metadata"].get("text", "") for res in results if "metadata" in res]
        retrieved_docs = [{"doc_id": res["metadata"].get("doc_id", "unknown"), "text": res["metadata"].get("text", ""), "score": res.get("score", 0.0), "equipment_tags": res["metadata"].get("equipment_tags", [])} for res in results if "metadata" in res]
        
        context_str = "\n\n".join(documents)
        
        chain = self.prompt | self.llm
        result = chain.invoke({"context": context_str, "query": query})
        
        return {"final_answer": result.content, "confidence": 0.95, "documents": documents, "retrieved_docs": retrieved_docs}
