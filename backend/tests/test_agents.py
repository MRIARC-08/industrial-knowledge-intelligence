import unittest
from unittest.mock import patch, MagicMock
from agents.orchestrator import create_orchestrator

class TestAgents(unittest.TestCase):
    
    @patch('agents.nodes.retrieval.HybridRetriever')
    @patch('agents.nodes.supervisor.ChatOpenAI')
    @patch('agents.nodes.copilot.ChatOpenAI')
    def test_orchestrator_rag_route(self, mock_gen_llm, mock_router_llm, mock_retriever_cls):
        # Mock Router to return 'copilot'
        mock_router_instance = MagicMock()
        mock_router_route_decision = MagicMock()
        mock_router_route_decision.intent = "copilot"
        # When prompt | router_llm is evaluated and invoked, it acts like router_llm(prompt_val)
        mock_router_instance.with_structured_output.return_value.invoke.return_value = mock_router_route_decision
        mock_router_instance.invoke.return_value = mock_router_route_decision
        mock_router_instance.with_structured_output.return_value.invoke.return_value = mock_router_route_decision
        mock_router_llm.return_value = mock_router_instance
        
        # Mock Generator to return a test answer
        mock_gen_instance = MagicMock()
        mock_gen_content = MagicMock()
        mock_gen_content.content = "Generated final answer."
        mock_gen_instance.return_value = mock_gen_content
        mock_gen_instance.invoke.return_value = mock_gen_content
        mock_gen_llm.return_value = mock_gen_instance
        
        # Mock Retriever
        mock_retriever = mock_retriever_cls.return_value
        mock_retriever.retrieve.return_value = [{"metadata": {"text": "Mock document chunk"}}]
        
        # Create and invoke graph
        app = create_orchestrator()
        result = app.invoke({"query": "How to fix the pump?", "documents": []})
        
        self.assertEqual(result["route"], "copilot")
        # In copilot, documents might not be retrieved if it's general Q&A, but wait, retrieval runs for all routes
        # Wait, if retriever is mock, it should still retrieve documents if it's a RAG flow.
        self.assertEqual(result["final_answer"], "Generated final answer.")
