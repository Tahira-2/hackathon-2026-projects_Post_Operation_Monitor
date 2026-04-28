import os
import chromadb
from rag.embedder import Embedder

class VectorStore:
    def __init__(self):
        persist_dir = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
        self.client = chromadb.PersistentClient(path=persist_dir)
        self.collection = self.client.get_or_create_collection(name="health_knowledge")
        self.embedder = Embedder()

    def search(self, query: str, n_results: int = 4) -> list[str]:
        query_embedding = self.embedder.embed(query)
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        if results and results["documents"] and results["documents"][0]:
            return results["documents"][0]
        return []
