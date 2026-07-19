from typing import List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from agents.state import AgentState

from config import settings

class GeneratorNode:
    def __init__(self):
        # Only add thinking parameter if using DeepSeek
        model_kwargs = {}
        if "deepseek" in settings.LLM_MODEL.lower():
            model_kwargs["thinking"] = "high"
            
        self.llm = ChatOpenAI(
            model=settings.LLM_MODEL, 
            temperature=0,
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL if settings.OPENAI_BASE_URL else None,
            model_kwargs=model_kwargs
        )
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert industrial plant AI assistant. Answer the user's question using the provided context documents.\n\nContext:\n{context}"),
            ("user", "{query}")
        ])
        
    def calculate_confidence(self, answer: str, documents: List[str]) -> float:
        """Calculate answer confidence based on document overlap"""
        if not documents:
            return 0.3  # Low confidence without sources
        
        # Simple heuristic: check answer terms in documents
        answer_words = set(answer.lower().split())
        doc_words = set(' '.join(documents).lower().split())
        
        overlap = len(answer_words & doc_words) / max(len(answer_words), 1)
        return min(overlap * 1.2, 0.95)  # Cap at 0.95

    def __call__(self, state: AgentState) -> dict:
        query = state.get("query", "")
        docs = state.get("documents", [])
        
        context_str = "\n\n".join(docs)
        
        chain = self.prompt | self.llm
        result = chain.invoke({"context": context_str, "query": query})
        
        confidence = self.calculate_confidence(result.content, docs)
        
        return {"final_answer": result.content, "confidence": confidence}
