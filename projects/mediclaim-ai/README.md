# MediClaim AI

> AI-powered medical bill analyzer — know exactly what you're paying for, in plain English.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://medicare-ai-hackathon.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Railway-purple?logo=railway)](https://hackathon-2026-projects-production-7ed9.up.railway.app)
[![Track](https://img.shields.io/badge/Track-Health%20Data%20%26%20Interoperability-teal)](https://github.com/caredevi-innovation-lab/hackathon-2026-projects)
[![Hackathon](https://img.shields.io/badge/CareDevi%20AI%20Hackathon-2026-navy)](https://github.com/caredevi-innovation-lab/hackathon-2026-projects)

---

## The Problem

Medical billing errors affect **1 in 5 patients**. Bills are deliberately opaque, with vague procedure codes, duplicate charges, and inflated line items cost Americans **$210B+ annually**. Most patients never question a bill because they can't read one.

## The Solution

Upload your bill → get a **plain-English breakdown in under 30 seconds**. Every overcharge is flagged against CMS Medicare benchmarks. Every vague item is explained. Full FHIR R4 output means your results plug directly into any hospital system, insurance portal, or government health API.

**No medical expertise required.**

---

## Demo

> 🌐 [Live App](https://medicare-ai-hackathon.vercel.app) · [Try with a sample bill](./demo/demo_bill_severe.pdf)

| Demo Bill | What It Shows |
|-----------|--------------|
| `demo_bill_clean.pdf` | Fairly priced bill — minimal flags |
| `demo_bill_mixed.pdf` | A few suspicious charges mixed in |
| `demo_bill_severe.pdf` | Heavily overcharged — maximum flags ⚠️ |

---

## Architecture

```
PDF Upload
    │
    ▼
PyMuPDF Text Extraction + Tesseract OCR (fallback for scanned docs)
    │
    ▼
Medical NER Entity Extraction
  ├─ Regex-based (CPT codes, dollar amounts, drug names) — always runs
  ├─ HuggingFace biomedical-ner-all — optional enhancement
  └─ Google Gemini API — fallback if HF unavailable
    │
    ▼
API Enrichment (all free, no key required)
  ├─ RxNorm — drug normalization
  ├─ OpenFDA — drug verification + recall check
  └─ NLM Clinical Tables — CPT code validation
    │
    ▼
Llama3-OpenBioLLM-70B (HuggingFace)
  └─ Plain-English explanations ONLY — never used for numeric decisions
    │
    ▼
CMS Medicare Fee Schedule Benchmarking (deterministic Python)
  └─ Overcharge detection >50% above benchmark = HIGH, >20% = MEDIUM
    │
    ▼
Severity Classification + Insurance Coverage Estimate
    │
    ▼
FHIR R4 ExplanationOfBenefit Output + React Dashboard
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts | Fast dev, great DX, responsive charts |
| **Backend** | FastAPI, Python 3.11, Uvicorn | Async, typed, auto-docs at `/docs` |
| **PDF Parsing** | PyMuPDF + Tesseract OCR | Handles both digital and scanned PDFs |
| **NER** | Regex + HuggingFace `d4data/biomedical-ner-all` + Google Gemini | Layered fallback — deterministic first, AI-assisted second |
| **LLM** | `aaditya/Llama3-OpenBioLLM-70B` via HuggingFace Inference API | Medical-domain fine-tuned; reduces clinical hallucination |
| **Enrichment** | OpenFDA, RxNorm, NLM Clinical Tables | All government APIs, free, no key required |
| **Benchmarks** | CMS Medicare Physician Fee Schedule (bundled JSON) | Public domain US government data |
| **FHIR** | Custom ExplanationOfBenefit R4 resource | R4-compliant, interoperable with any EHR |
| **Deployment** | Vercel (frontend) + Railway (backend) | Zero-config deploys, HTTPS, env var management |

---

## Key Design Decisions

**LLM for language, never for numbers.** All overcharge detection, severity scores, and benchmark comparisons are pure deterministic Python. The LLM only generates the plain-English explanation — it never touches a dollar figure.

**Hybrid NER with graceful fallback.** Regex extraction always runs first. HuggingFace NER enhances when available. If HuggingFace is down, Google Gemini takes over. If both are down, regex result stands.

**Three free government APIs, no rate-limit surprises.** RxNorm, OpenFDA, and NLM Clinical Tables are all public US government APIs. No API keys, no quota headaches, no privacy risk.

**FHIR R4 output.** Valid ExplanationOfBenefit resource — drops directly into any hospital EHR, insurance claims portal, or HL7-compliant system.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/bills/analyze` | Analyze a medical bill PDF |
| `GET` | `/api/bills/demo/{type}` | Download demo bill (`clean`, `mixed`, `severe`) |
| `GET` | `/api/insurance/providers` | List insurance providers |
| `GET` | `/api/insurance/coverage` | Estimate coverage for a given amount |
| `POST` | `/api/fhir/eob` | Generate FHIR ExplanationOfBenefit |
| `GET` | `/api/fhir/eob/{id}/download` | Download FHIR EOB as JSON |

Full interactive docs: https://hackathon-2026-projects-production-7ed9.up.railway.app/docs

---

## Setup — Run Locally

```bash
# Backend
cd projects/mediclaim-ai/src
pip install -r requirements.txt
cp .env.example .env
# Add HF_API_TOKEN and GEMINI_API_KEY to .env
python -m uvicorn backend.main:app --reload --port 8000

# Frontend
cd projects/mediclaim-ai/src/frontend
npm install
npm run dev
```

---

## Limitations

- OCR accuracy degrades on handwritten or low-resolution scanned bills
- Insurance coverage is simulated — not connected to real insurer APIs
- CMS benchmarks reflect Medicare pricing; private insurer rates vary
- Not a substitute for professional billing, legal, or medical advice

---

## Team

Solo participant — [@demonz69](https://github.com/demonz69)

**Track:** Health Data & Interoperability ·
CareDevi AI Innovation Hackathon 2026
