"""
rag_data/ingest.py  —  RAG pipeline: index medical source documents into ChromaDB

Run once to build the vector index:
    python ingest.py

Re-run any time you add new source files.
"""

from pathlib import Path
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import chromadb

# ── Paths ──────────────────────────────────────────────────────
BASE_DIR    = Path(__file__).parent
SOURCES_DIR = BASE_DIR / "sources"
CHROMA_DIR  = BASE_DIR / "chroma_store"

# ── Config ─────────────────────────────────────────────────────
COLLECTION_NAME = "medical_knowledge"
EMBED_MODEL     = "pritamdeka/S-PubMedBert-MS-MARCO"
# EMBED_MODEL   = "all-MiniLM-L6-v2"  # faster backup if needed
CHUNK_SIZE      = 500
CHUNK_OVERLAP   = 50

# ── Model cache — loaded once, reused across all calls ─────────
_model = None

def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        print(f"[ingest] Loading embedding model: {EMBED_MODEL}")
        _model = SentenceTransformer(EMBED_MODEL)
    return _model


# ── Step 1: Load source documents ──────────────────────────────

def load_sources() -> list[dict]:
    """
    CURRENT (demo): reads .txt files from sources/
    FUTURE: swap to PDFs or live URLs.
    """
    docs = []
    txt_files = list(SOURCES_DIR.rglob("*.txt"))

    print(f"[ingest] Found {len(txt_files)} source files")
    for path in txt_files:
        try:
            text = path.read_text(encoding="utf-8")
            docs.append({
                "text":   text,
                "source": path.stem.replace("_", " ").title(),
                "url":    f"local://{path.name}",
                "file":   path.name
            })
            print(f"  ✓  {path.name}")
        except Exception as e:
            print(f"  ✗  {path.name} → {e}")

    return docs


# ── Step 2: Chunk documents ────────────────────────────────────

def chunk_documents(docs: list[dict]) -> list[dict]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP
    )

    chunks = []
    for doc in docs:
        pieces = splitter.split_text(doc["text"])
        for i, piece in enumerate(pieces):
            chunks.append({
                "text":   piece,
                "source": doc["source"],
                "url":    doc["url"],
                "id":     f"{doc['file']}__chunk_{i}"
            })

    print(f"[ingest] Split into {len(chunks)} chunks")
    return chunks


# ── Step 3: Embed + store in ChromaDB ─────────────────────────

def embed_and_store(chunks: list[dict]) -> None:
    model = _get_model()
    texts = [c["text"] for c in chunks]

    print(f"[ingest] Embedding {len(texts)} chunks...")
    embeddings = model.encode(
        texts,
        show_progress_bar=True,
        normalize_embeddings=True   # ← cosine needs normalized vectors
    ).tolist()

    client     = chromadb.PersistentClient(path=str(CHROMA_DIR))
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}  # ← use cosine distance
    )

    collection.add(
        ids        = [c["id"]     for c in chunks],
        documents  = [c["text"]   for c in chunks],
        embeddings = embeddings,
        metadatas  = [{"source": c["source"], "url": c["url"]} for c in chunks]
    )

    print(f"[ingest] Stored {len(chunks)} chunks in ChromaDB at {CHROMA_DIR}")


# ── Step 4: Query function ─────────────────────────────────────

def query_rag(symptoms: str, top_k: int = 5) -> list[dict]:
    """
    Retrieves top_k most relevant chunks.
    Called by core/rag.py during every patient session.
    """
    model     = _get_model()                                  # ← cached
    query_emb = model.encode(
        [symptoms],
        normalize_embeddings=True                             # ← matches stored
    ).tolist()

    client     = chromadb.PersistentClient(path=str(CHROMA_DIR))
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}                    # ← consistent
    )

    results = collection.query(
        query_embeddings = query_emb,
        n_results        = top_k,
        include          = ["documents", "metadatas", "distances"]
    )

    retrieved = []
    for text, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0]
    ):
        retrieved.append({
            "text":       text,
            "source":     meta.get("source", ""),
            "url":        meta.get("url", ""),
            "similarity": round(1 - dist, 4)
        })

    return retrieved


# ── Run ingest ─────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 50)
    print("RAG Ingest Pipeline")
    print("=" * 50)

    docs   = load_sources()
    chunks = chunk_documents(docs)
    embed_and_store(chunks)

    # ── Test queries ───────────────────────────────────────────
    test_queries = [
        "stomach pain after eating",
        "runny nose sneezing itchy eyes",
        "high fever body aches fatigue",
        "severe headache with stiff neck",
    ]

    print("\n" + "=" * 50)
    print("TESTING RETRIEVAL")
    print("=" * 50)

    for query in test_queries:
        results = query_rag(query, top_k=3)
        print(f"\nQuery: '{query}'")
        for i, r in enumerate(results, 1):
            print(f"  [{i}] {r['source']} (similarity: {r['similarity']})")
            print(f"       {r['text'][:150]}...")