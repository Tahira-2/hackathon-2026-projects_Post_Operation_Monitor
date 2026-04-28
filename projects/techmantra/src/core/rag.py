"""
core/rag.py  —  RAG query interface for the symptom session pipeline


Called by core/llm.py during every symptom session (Layer 2.5).
Reads from the ChromaDB index built by rag_data/ingest.py.

Usage:
    from core.rag import get_rag_context
    context = get_rag_context("runny nose sneezing itchy eyes")
    # pass context directly to llm.run_inference(payload, context)
"""

from pathlib import Path
from sentence_transformers import SentenceTransformer
import chromadb

# ── Paths — resolve chroma_store relative to this file ─────────
_CORE_DIR   = Path(__file__).parent
_CHROMA_DIR = _CORE_DIR.parent / "rag_data" / "chroma_store"

# ── Must match exactly what ingest.py used ──────────────────────
COLLECTION_NAME = "medical_knowledge"
EMBED_MODEL     = "pritamdeka/S-PubMedBert-MS-MARCO"

# Cached model — loaded once, reused across calls
_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    """Load embedding model once and cache it."""
    global _model
    if _model is None:
        print(f"[rag] Loading embedding model: {EMBED_MODEL}")
        _model = SentenceTransformer(EMBED_MODEL)
    return _model


def get_rag_context(symptoms: str, top_k: int = 5) -> dict:
    """
    Main function called by llm.py.

    Takes raw symptom string, queries ChromaDB, and returns
    a context dict in exactly the format llm.run_inference() expects:

        {
            "docs":    ["chunk text 1", "chunk text 2", ...],
            "sources": [{"source": "Headache"}, {"source": "Common Cold"}, ...]
        }

    Args:
        symptoms: raw symptom text from the patient
        top_k:    number of chunks to retrieve (default 5)

    Returns:
        dict with "docs" and "sources" keys
    """
    if not _CHROMA_DIR.exists():
        print(f"[rag] WARNING: chroma_store not found at {_CHROMA_DIR}")
        print("[rag] Run: python src/rag_data/ingest.py  to build the index first")
        return {"docs": [], "sources": []}

    model     = _get_model()
    query_emb = model.encode([symptoms], normalize_embeddings=True).tolist()

    client     = chromadb.PersistentClient(path=str(_CHROMA_DIR))
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )

    if collection.count() == 0:
        print("[rag] WARNING: ChromaDB collection is empty. Run ingest.py first.")
        return {"docs": [], "sources": []}

    results = collection.query(
        query_embeddings = query_emb,
        n_results        = min(top_k, collection.count()),
        include          = ["documents", "metadatas", "distances"]
    )

    docs    = []
    sources = []

    for text, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0]
    ):
        similarity = round(1 - dist, 4)
        docs.append(text)
        sources.append({
            "source":     meta.get("source", "Medical Database"),
            "url":        meta.get("url", ""),
            "similarity": similarity
        })

    print(f"[rag] Retrieved {len(docs)} chunks for: '{symptoms[:60]}...'")
    return {"docs": docs, "sources": sources}


def format_context_for_display(context: dict) -> str:
    """
    Helper to display RAG results in a readable format.
    Useful for debugging or showing sources in the UI.
    """
    if not context["docs"]:
        return "No relevant medical documents found."

    lines = []
    for i, (doc, src) in enumerate(zip(context["docs"], context["sources"]), 1):
        lines.append(f"[{i}] {src['source']}  (similarity: {src.get('similarity', 'N/A')})")
        lines.append(f"    {doc[:200]}...")
        lines.append("")
    return "\n".join(lines)


# ── Quick test ─────────────────────────────────────────────────

if __name__ == "__main__":
    test_queries = [
        "runny nose sneezing itchy eyes",
        "stomach pain after eating spicy food",
        "bad headache and feeling tired",
        "cough sore throat fever"
    ]

    for query in test_queries:
        print(f"\n{'='*55}")
        print(f"Query: {query}")
        print('='*55)
        ctx = get_rag_context(query, top_k=3)
        print(format_context_for_display(ctx))
