import uuid
from typing import List, Dict, Any
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from fastembed import TextEmbedding
import logging
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self, qdrant_url: str = "http://localhost:6333", collection_name: str = "industrial_docs"):
        self.qdrant = QdrantClient(url=qdrant_url)
        self.embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
        self.collection_name = collection_name
        
    def create_collection(self):
        """Creates the Qdrant collection if it doesn't already exist."""
        collections = self.qdrant.get_collections().collections
        if not any(col.name == self.collection_name for col in collections):
            self.qdrant.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE)
            )
            logger.info(f"Created Qdrant collection: {self.collection_name}")
        else:
            logger.info(f"Collection {self.collection_name} already exists.")
            
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
    def embed_text_batch(self, texts: List[str]) -> List[List[float]]:
        """Batch embed multiple texts using FastEmbed model."""
        if not texts:
            return []
        try:
            embeddings_generator = self.embedding_model.embed(texts)
            embeddings = list(embeddings_generator)
            return [e.tolist() for e in embeddings]
        except Exception as e:
            logger.error(f"Embedding failed: {e}")
            raise
            
    def embed_text(self, text: str) -> List[float]:
        """Backwards compatible single-text embed."""
        return self.embed_text_batch([text])[0]
        
    def upsert_documents(self, chunks: List[Dict[str, Any]]):
        """
        Takes a list of document chunk dictionaries. Each should have 'text' and 'metadata'.
        Improved with batch embedding.
        """
        texts = [chunk.get("text", "") for chunk in chunks if chunk.get("text")]
        
        if not texts:
            return
            
        # Batch embed all texts at once (10x faster, cheaper)
        embeddings = self.embed_text_batch(texts)
        
        points = []
        for i, chunk in enumerate(chunks):
            if not chunk.get("text"):
                continue
            
            # Use provided ID or generate a unique one
            point_id = chunk.get("id", str(uuid.uuid4()))
            
            payload = chunk.get("metadata", {})
            payload["text"] = chunk["text"] # Ensure text is stored in payload for retrieval
            
            points.append(PointStruct(
                id=point_id,
                vector=embeddings[i],
                payload=payload
            ))
            
        if points:
            try:
                self.qdrant.upsert(collection_name=self.collection_name, points=points)
                logger.info(f"Upserted {len(points)} documents to {self.collection_name}")
            except Exception as e:
                logger.error(f"Failed to upsert to Qdrant: {e}")
                raise
            
    def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Searches the vector store for the closest chunks to the query.
        """
        query_vector = self.embed_text(query)
        
        search_result = self.qdrant.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=limit
        )
        
        results = []
        for hit in search_result:
            results.append({
                "id": hit.id,
                "score": hit.score,
                "metadata": hit.payload
            })
            
        return results
