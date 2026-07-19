import unittest
from unittest.mock import patch, MagicMock
from tools.vector_search import VectorStore

class TestVectorStore(unittest.TestCase):
    
    @patch('tools.vector_search.QdrantClient')
    @patch('tools.vector_search.TextEmbedding')
    def setUp(self, mock_text_embedding, mock_qdrant_client):
        self.mock_qdrant = mock_qdrant_client.return_value
        self.mock_embedding_model = mock_text_embedding.return_value
        
        # Mock FastEmbed embedding response
        mock_embedding = MagicMock()
        mock_embedding.tolist.return_value = [0.1] * 384
        # Return an iterable that provides as many mock embeddings as requested
        self.mock_embedding_model.embed.side_effect = lambda texts: [mock_embedding] * len(texts)
        
        self.vector_store = VectorStore(qdrant_url="http://dummy", collection_name="test_col")
        
    def test_create_collection_when_not_exists(self):
        # Mock get_collections returning empty
        mock_col_list = MagicMock()
        mock_col_list.collections = []
        self.mock_qdrant.get_collections.return_value = mock_col_list
        
        self.vector_store.create_collection()
        self.mock_qdrant.create_collection.assert_called_once()
        
    def test_embed_text(self):
        embedding = self.vector_store.embed_text("Test query")
        self.assertEqual(len(embedding), 384)
        self.mock_embedding_model.embed.assert_called_once_with(["Test query"])
        
    def test_upsert_documents(self):
        chunks = [
            {"text": "Sample text 1", "metadata": {"source": "doc1"}},
            {"text": "Sample text 2", "id": "12345-abcde", "metadata": {"source": "doc2"}}
        ]
        
        self.vector_store.upsert_documents(chunks)
        self.assertEqual(self.mock_embedding_model.embed.call_count, 1) # batch called once
        self.mock_qdrant.upsert.assert_called_once()
        
    def test_search(self):
        # Mock Qdrant search results
        mock_hit = MagicMock()
        mock_hit.id = "123"
        mock_hit.score = 0.95
        mock_hit.payload = {"text": "Sample result", "source": "doc1"}
        self.mock_qdrant.search.return_value = [mock_hit]
        
        results = self.vector_store.search("query")
        
        self.mock_qdrant.search.assert_called_once()
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["score"], 0.95)
        self.assertEqual(results[0]["metadata"]["source"], "doc1")
