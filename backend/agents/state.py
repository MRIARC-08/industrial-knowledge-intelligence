from typing import TypedDict, List, Annotated, Dict, Any
import operator

class AgentState(TypedDict):
    query: str
    route: str
    documents: Annotated[List[str], operator.add]
    retrieved_docs: Annotated[List[Dict[str, Any]], operator.add]
    final_answer: str
    confidence: float
