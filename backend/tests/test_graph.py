import unittest
from unittest.mock import MagicMock, patch
from knowledge_graph.schema import Equipment, Document
from knowledge_graph.builder import KnowledgeGraphBuilder
from datetime import date

class TestKnowledgeGraphBuilder(unittest.TestCase):
    
    @patch('knowledge_graph.builder.GraphDatabase.driver')
    def setUp(self, mock_driver):
        self.mock_driver = mock_driver
        self.builder = KnowledgeGraphBuilder("bolt://dummy", "user", "pass")
        self.session_mock = MagicMock()
        self.builder.driver.session.return_value.__enter__.return_value = self.session_mock

    def test_create_equipment(self):
        eq = Equipment(tag="P-101A", description="Centrifugal Pump", equipment_type="Pump")
        self.builder.create_equipment(eq)
        self.session_mock.execute_write.assert_called_once()
        
    def test_create_document(self):
        doc = Document(doc_id="DOC-123", title="Pump Manual", doc_type="manual", created_date=date.today())
        self.builder.create_document(doc)
        self.session_mock.execute_write.assert_called_once()
        
    def test_link_document_to_equipment(self):
        self.builder.link_document_to_equipment("DOC-123", "P-101A")
        self.session_mock.execute_write.assert_called_once()
