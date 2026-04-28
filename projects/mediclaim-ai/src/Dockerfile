# MediClaim AI — Backend Dockerfile
# Deploys FastAPI + PyMuPDF + Tesseract OCR on Railway
# Build context: projects/mediclaim-ai/src/

FROM python:3.11-slim

# ── System dependencies ──────────────────────────────────────────────────────
# Tesseract OCR + language data (English)
# PyMuPDF requires libmupdf system libraries (bundled in pymupdf wheel, but
# some distros need these base libs for Pillow + image support)
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ── Working directory ─────────────────────────────────────────────────────────
WORKDIR /app

# ── Python dependencies ───────────────────────────────────────────────────────
# Copy requirements first for layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir google-generativeai

# ── Application code ──────────────────────────────────────────────────────────
COPY . .

# ── Environment defaults (override via Railway dashboard) ─────────────────────
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    DEBUG=false

# ── Healthcheck ───────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# ── Expose port ───────────────────────────────────────────────────────────────
EXPOSE ${PORT}

# ── Start server ──────────────────────────────────────────────────────────────
# Railway injects $PORT at runtime; uvicorn binds to it.
CMD ["sh", "-c", "python -m uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]
