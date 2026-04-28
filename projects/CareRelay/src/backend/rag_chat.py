"""
RAG Chat module for Mitchell EHR PDF.

Extracts text from the PDF, builds a TF-IDF index, retrieves relevant
chunks for a query, and generates answers via HuggingFace API.
"""

import os
import re
from pathlib import Path

import fitz  # PyMuPDF
import requests
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv(Path(__file__).resolve().parent / ".env")

HF_API_KEY = os.getenv("HF_API_KEY")
HF_MODEL = os.getenv("HF_BRIEF_MODEL", "aaditya/Llama3-OpenBioLLM-70B")
HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions"
REQUEST_TIMEOUT = 30

PDF_PATH = Path(__file__).resolve().parent.parent / "data" / "Patient_EHR_James_Mitchell.pdf"

# ── Header pattern to strip from every page ──
HEADER_RE = re.compile(
    r"METROPOLITAN GENERAL HOSPITAL.*?Generated:.*?\d{4}\s*\d{2}:\d{2}\s*",
    re.DOTALL,
)


# ═══════════════════════════════════════════════════════════
#  PDF → Chunks with page metadata
# ═══════════════════════════════════════════════════════════

def _extract_pages(pdf_path: Path) -> list[dict]:
    """Extract cleaned text from each page of the PDF."""
    doc = fitz.open(str(pdf_path))
    pages = []
    for i, page in enumerate(doc):
        raw = page.get_text()
        # Strip repeated headers
        cleaned = HEADER_RE.sub("", raw).strip()
        if cleaned:
            pages.append({"page": i + 1, "text": cleaned})
    doc.close()
    return pages


def _chunk_pages(pages: list[dict], max_words: int = 250, overlap: int = 50) -> list[dict]:
    """Split page text into overlapping chunks, preserving page metadata."""
    chunks = []
    for pg in pages:
        words = pg["text"].split()
        if len(words) <= max_words:
            chunks.append({
                "page": pg["page"],
                "text": pg["text"],
                "chunk_id": f"p{pg['page']}_0",
            })
        else:
            start = 0
            idx = 0
            while start < len(words):
                end = min(start + max_words, len(words))
                chunk_text = " ".join(words[start:end])
                chunks.append({
                    "page": pg["page"],
                    "text": chunk_text,
                    "chunk_id": f"p{pg['page']}_{idx}",
                })
                start += max_words - overlap
                idx += 1
    return chunks


# ═══════════════════════════════════════════════════════════
#  TF-IDF Index (built once at import time)
# ═══════════════════════════════════════════════════════════

_chunks: list[dict] = []
_vectorizer: TfidfVectorizer | None = None
_tfidf_matrix = None


def _build_index():
    global _chunks, _vectorizer, _tfidf_matrix

    if not PDF_PATH.exists():
        print(f"[RAG] PDF not found at {PDF_PATH}")
        return

    pages = _extract_pages(PDF_PATH)
    _chunks = _chunk_pages(pages)

    if not _chunks:
        print("[RAG] No chunks extracted from PDF")
        return

    texts = [c["text"] for c in _chunks]
    _vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=5000,
        ngram_range=(1, 2),
    )
    _tfidf_matrix = _vectorizer.fit_transform(texts)
    print(f"[RAG] Index built: {len(_chunks)} chunks from {len(pages)} pages")


# Build at import
_build_index()


# ═══════════════════════════════════════════════════════════
#  Retrieval
# ═══════════════════════════════════════════════════════════

def retrieve(query: str, top_k: int = 3) -> list[dict]:
    """Retrieve top-k chunks most relevant to the query."""
    if _vectorizer is None or _tfidf_matrix is None:
        return []

    query_vec = _vectorizer.transform([query])
    scores = cosine_similarity(query_vec, _tfidf_matrix).flatten()

    # Get top-k indices
    top_indices = scores.argsort()[::-1][:top_k]
    results = []
    for idx in top_indices:
        if scores[idx] > 0.01:  # minimum relevance threshold
            chunk = _chunks[idx]
            results.append({
                "page": chunk["page"],
                "text": chunk["text"],
                "score": round(float(scores[idx]), 4),
                "chunk_id": chunk["chunk_id"],
            })
    return results


# ═══════════════════════════════════════════════════════════
#  Answer generation (HuggingFace)
# ═══════════════════════════════════════════════════════════

SYSTEM_PROMPT = """You are a clinical assistant for a physician reviewing the Electronic Health Record of James R. Mitchell (MRN 004-72-8831).

Answer the doctor's question based ONLY on the EHR excerpts provided below. Be concise and clinically precise.
- Always cite the page number(s) where you found the information, using the format [Page N].
- If the information is not found in the provided excerpts, say "This information was not found in the available EHR pages."
- Do NOT fabricate clinical data.
"""


def _build_chat_prompt(query: str, context_chunks: list[dict]) -> list[dict]:
    """Build the chat messages for the HF API."""
    context_parts = []
    for c in context_chunks:
        context_parts.append(f"--- EHR Page {c['page']} ---\n{c['text']}")
    context_text = "\n\n".join(context_parts)

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"EHR EXCERPTS:\n{context_text}\n\nDOCTOR'S QUESTION:\n{query}"},
    ]


def _call_hf(messages: list[dict]) -> str | None:
    """Call HuggingFace Router API."""
    if not HF_API_KEY:
        return None

    try:
        resp = requests.post(
            HF_ROUTER_URL,
            headers={
                "Authorization": f"Bearer {HF_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": HF_MODEL,
                "messages": messages,
                "max_tokens": 500,
                "temperature": 0.2,
            },
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()
    except Exception as exc:
        print(f"[RAG] HF API error: {exc}")
        return None


def _extractive_fallback(query: str, chunks: list[dict]) -> str:
    """If LLM is unavailable, return the most relevant chunks as-is."""
    if not chunks:
        return "No relevant information found in the EHR for this query."

    parts = []
    for c in chunks:
        # Take first 200 chars as a snippet
        snippet = c["text"][:300].strip()
        parts.append(f"**From Page {c['page']}:** {snippet}...")
    return "Based on the EHR records:\n\n" + "\n\n".join(parts)


def answer(query: str) -> dict:
    """
    Main RAG pipeline: retrieve → generate → return structured response.

    Returns:
        {
            "answer": str,
            "sources": [{"page": int, "snippet": str}],
            "source_type": "llm" | "extractive"
        }
    """
    chunks = retrieve(query, top_k=3)
    sources = [
        {
            "page": c["page"],
            "snippet": c["text"][:150].strip() + "...",
            "score": c["score"],
        }
        for c in chunks
    ]

    # Try LLM generation
    messages = _build_chat_prompt(query, chunks)
    llm_answer = _call_hf(messages)

    if llm_answer:
        return {
            "answer": llm_answer,
            "sources": sources,
            "source_type": "llm",
        }

    # Fallback to extractive
    return {
        "answer": _extractive_fallback(query, chunks),
        "sources": sources,
        "source_type": "extractive",
    }
