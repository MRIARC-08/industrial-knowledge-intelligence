from typing import List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from agents.state import AgentState

class RouteDecision(BaseModel):
    route: str = Field(description="The destination route, either 'rag' for document retrieval, 'kg' for equipment knowledge graph, or 'direct' for general queries.")

from config import settings

class RouterNode:
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
        self.router_llm = self.llm.with_structured_output(RouteDecision)
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert routing agent for an industrial plant. "
                       "Determine if the user query needs document retrieval ('rag'), "
                       "knowledge graph equipment linkage ('kg'), or just a direct response ('direct')."),
            ("user", "{query}")
        ])
        
    def __call__(self, state: AgentState) -> dict:
        query = state.get("query", "")
        chain = self.prompt | self.router_llm
        result = chain.invoke({"query": query})
        
        return {"route": result.route}
