from langgraph.graph import StateGraph, END
from agents.state import AgentState
from agents.nodes.supervisor import SupervisorAgent
from agents.nodes.copilot import CopilotAgent
from agents.nodes.maintenance_rca import MaintenanceRCAAgent
from agents.nodes.compliance import ComplianceAgent
from agents.nodes.lessons_learned import LessonsLearnedAgent

def route_condition(state: AgentState):
    """Conditional edge function to determine next node based on route."""
    route = state.get("route", "copilot")
    if route == "maintenance_rca":
        return "maintenance_rca"
    elif route == "compliance":
        return "compliance"
    elif route == "lessons_learned":
        return "lessons_learned"
    return "copilot"

def create_orchestrator():
    # Initialize nodes
    supervisor_node = SupervisorAgent()
    copilot_node = CopilotAgent()
    rca_node = MaintenanceRCAAgent()
    compliance_node = ComplianceAgent()
    lessons_node = LessonsLearnedAgent()
    
    # Build graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("supervisor_node", supervisor_node)
    workflow.add_node("copilot", copilot_node)
    workflow.add_node("maintenance_rca", rca_node)
    workflow.add_node("compliance", compliance_node)
    workflow.add_node("lessons_learned", lessons_node)
    
    # Define edges
    workflow.set_entry_point("supervisor_node")
    
    workflow.add_conditional_edges(
        "supervisor_node",
        route_condition,
        {
            "copilot": "copilot",
            "maintenance_rca": "maintenance_rca",
            "compliance": "compliance",
            "lessons_learned": "lessons_learned"
        }
    )
    
    # All terminal nodes go to END
    workflow.add_edge("copilot", END)
    workflow.add_edge("maintenance_rca", END)
    workflow.add_edge("compliance", END)
    workflow.add_edge("lessons_learned", END)
    
    # Compile
    app = workflow.compile()
    return app
