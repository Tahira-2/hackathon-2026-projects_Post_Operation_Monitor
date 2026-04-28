import os
from pathlib import Path
from rag.embedder import Embedder
from rag.vectorstore import VectorStore

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        chunks.append(text[start:start + chunk_size])
        start += chunk_size - overlap
    return chunks

def main():
    data_dir = Path("data/processed")
    if not data_dir.exists():
        print(f"Data directory {data_dir} does not exist.")
        return
        
    embedder = Embedder()
    store = VectorStore()
    
    for file_path in data_dir.glob("*.txt"):
        print(f"Processing {file_path.name}...")
        text = file_path.read_text()
        chunks = chunk_text(text)
        
        for i, chunk in enumerate(chunks):
            embedding = embedder.embed(chunk)
            doc_id = f"{file_path.stem}_{i}"
            
            store.collection.upsert(
                ids=[doc_id],
                embeddings=[embedding],
                documents=[chunk],
                metadatas=[{"source": file_path.name, "chunk": i}]
            )
        print(f"Upserted {len(chunks)} chunks for {file_path.name}")
        
    print("Ingestion complete.")

if __name__ == "__main__":
    main()
