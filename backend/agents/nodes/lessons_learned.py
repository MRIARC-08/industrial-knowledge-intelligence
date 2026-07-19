from typing import List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from agents.state import AgentState
from tools.hybrid_retrieval import HybridRetriever
from config import settings
import logging

logger = logging.getLogger(__name__)

class LessonsLearnedAgent:
    """Extracts insights from past incidents"""
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.LLM_MODEL, 
            temperature=0.3,
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL if settings.OPENAI_BASE_URL else None
        )
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a Safety and Lessons Learned Analyst. Analyze the past incident reports and maintenance logs to extract patterns, root causes, and recommendations for the user's query.\n\nIncident/Maintenance Logs:\n{context}"),
            ("user", "{query}")
        ])
        self.retriever = HybridRetriever()
        
    def __call__(self, state: AgentState) -> dict:
        query = state.get("query", "")
        
        # Boost limits to get a wider net of incidents
        results = self.retriever.retrieve(query + " incident safety lessons learned", limit=6)
        documents = [res["metadata"].get("text", "") for res in results if "metadata" in res]
        retrieved_docs = [{"doc_id": res["metadata"].get("doc_id", "unknown"), "text": res["metadata"].get("text", ""), "score": res.get("score", 0.0), "equipment_tags": res["metadata"].get("equipment_tags", [])} for res in results if "metadata" in res]
        
        context_str = "\n\n".join(documents)
        
        chain = self.prompt | self.llm
        result = chain.invoke({"context": context_str, "query": query})
        
        return {"final_answer": result.content, "confidence": 0.85, "documents": documents, "retrieved_docs": retrieved_docs}
