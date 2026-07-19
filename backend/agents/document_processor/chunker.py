from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List

class SemanticChunker:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", " ", ""]
        )
        
    def chunk_document(self, text: str) -> List[str]:
        """
        Splits a large document text into smaller semantic chunks.
        """
        chunks = self.splitter.split_text(text)
        return chunks
