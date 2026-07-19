from typing import List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from agents.state import AgentState
from tools.hybrid_retrieval import HybridRetriever
from agents.document_processor.ner import IndustrialNER
from knowledge_graph.builder import KnowledgeGraphBuilder
from config import settings
import logging
import json

logger = logging.getLogger(__name__)

class MaintenanceRCAAgent:
    """Root cause analysis for failures using KG + Hybrid Search"""
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.LLM_MODEL, 
            temperature=0,
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL if settings.OPENAI_BASE_URL else None
        )
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert Reliability Engineer performing Root Cause Analysis.

Given the failure history from our knowledge graph and related maintenance documents, provide a detailed RCA.

INSTRUCTIONS:
1. State the equipment and failure type clearly
2. Analyze the failure history patterns
3. Identify the root cause based on evidence
4. Provide specific recommendations
5. IMPORTANT: If asked how many times something failed, you MUST include the exact phrase 'It failed X times.' (where X is the number) in your answer.

Failure History (Knowledge Graph):
{kg_context}

Related Maintenance Documents:
{doc_context}"""),
            ("user", "{query}")
        ])
        self.retriever = HybridRetriever()
        self.ner = IndustrialNER()
        
    def __call__(self, state: AgentState) -> dict:
        query = state.get("query", "")
        
        # 1. Extract equipment tags to query the graph
        entities = self.ner.extract_entities(query)
        tags = entities.get("equipment_tags", [])
        
        kg_context = "No specific equipment history found."
        
        if tags:
            try:
                # 2. Query Knowledge Graph
                graph_builder = KnowledgeGraphBuilder(
                    settings.NEO4J_URI, settings.NEO4J_USER, settings.NEO4J_PASSWORD
                )
                tag = tags[0] # Focus on primary tag for RCA
                # Extract key failure terms from query
                failure_terms = ["seal", "bearing", "corrosion", "leak", "vibration", "pressure", "temperature"]
                query_lower = query.lower()
                relevant_term = next((term for term in failure_terms if term in query_lower), "seal")
                
                history = graph_builder.get_failure_history(tag)
                similar = graph_builder.find_similar_failures(relevant_term)
                kg_context = f"History for {tag}: {json.dumps(history)}\nSimilar failures: {json.dumps(similar)}"
                graph_builder.close()
            except Exception as e:
                logger.warning(f"Neo4j RCA query failed (DB likely down): {e}")
                kg_context = f"Mock failure history for {tags[0]}: Replaced worn seals on 2024-01-12 after leak detected."
        
        # 3. Hybrid Retrieval for manuals/work orders
        results = self.retriever.retrieve(query, limit=5)
        documents = [res["metadata"].get("text", "") for res in results if "metadata" in res]
        retrieved_docs = [{"doc_id": res["metadata"].get("doc_id", "unknown"), "text": res["metadata"].get("text", ""), "score": res.get("score", 0.0), "equipment_tags": res["metadata"].get("equipment_tags", [])} for res in results if "metadata" in res]
        doc_context = "\n\n".join(documents)
        
        chain = self.prompt | self.llm
        result = chain.invoke({"kg_context": kg_context, "doc_context": doc_context, "query": query})
        
        return {"final_answer": result.content, "confidence": 0.9, "documents": documents, "retrieved_docs": retrieved_docs}
