from typing import List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from agents.state import AgentState
from config import settings
import logging

logger = logging.getLogger(__name__)

class RouteIntent(BaseModel):
    intent: str = Field(description="The routed intent, one of: 'copilot', 'maintenance_rca', 'compliance', 'lessons_learned'")

class SupervisorAgent:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.LLM_MODEL, 
            temperature=0,
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL if settings.OPENAI_BASE_URL else None
        )
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an Industrial AI Supervisor. Route the user's query to the correct specialized agent.
            
            Routing rules:
            - 'maintenance_rca': Queries about root causes, failure history, broken equipment, or diagnosing issues.
            - 'compliance': Queries specifically about regulations, safety standards (OISD, PESO), or audits.
            - 'lessons_learned': Queries asking about past incidents, historical patterns, or safety learnings.
            - 'copilot': General Q&A, specs, operating procedures, or anything else that doesn't fit the above.
            
            RESPOND WITH ONLY VALID JSON. Do not include markdown blocks or any conversational text.
            Your output must be exactly in this format: {{"intent": "value"}}
            """),
            ("user", "{query}")
        ])
        
    def __call__(self, state: AgentState) -> dict:
        query = state.get("query", "")
        logger.info(f"Supervisor routing query: {query}")
        
        try:
            chain = self.prompt | self.llm
            result = chain.invoke({"query": query})
            
            import json, re
            content = result.content
            content = re.sub(r'```json|```', '', content).strip()
            data = json.loads(content)
            intent = data.get("intent", "copilot")
            
            if intent not in ['copilot', 'maintenance_rca', 'compliance', 'lessons_learned']:
                intent = 'copilot'
        except Exception as e:
            logger.warning(f"Supervisor failed to route, defaulting to copilot: {e}")
            intent = 'copilot'
            
        logger.info(f"Routed to: {intent}")
        return {"route": intent}
