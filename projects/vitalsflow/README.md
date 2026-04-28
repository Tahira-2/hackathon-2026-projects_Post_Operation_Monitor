# VitalsFlow 🩺

> AI-powered predictive triage using HL7 FHIR interoperability — CareDevi AI Innovation Hackathon 2026

[![Track](https://img.shields.io/badge/Track-AI%20Patient%20Triage-blue)](https://caredevi.com)
[![FHIR](https://img.shields.io/badge/Standard-HL7%20FHIR%20R4-green)](https://hl7.org/fhir/)
[![Protocol](https://img.shields.io/badge/Protocol-NEWS2-orange)](https://www.rcplondon.ac.uk/projects/outputs/national-early-warning-score-news-2)

---

## The Problem

Every minute a deteriorating patient spends in the wrong triage tier increases mortality risk. Clinicians in busy emergency departments manually assess dozens of patients simultaneously — cross-referencing vitals, EHR history, and clinical protocols under time pressure. This cognitive load leads to delays, missed escalations, and documentation burden that pulls nurses away from bedside care.

**VitalsFlow automates the first pass.** It reads real patient data from FHIR-compliant EHR systems, applies the clinically validated NEWS2 protocol via an AI reasoning layer, and surfaces a risk score with draft care orders — so the clinician approves or dismisses, rather than assembling from scratch.

---

## Demo

> **Live URL:** `https://vitalsflow.vercel.app`
> **API:** `https://vitalsflow-api.onrender.com/docs`

### Demo flow (3 minutes)
1. Search a patient by name → fetches real FHIR R4 data from HAPI FHIR public server
2. Enter or confirm current vitals in the input panel
3. Click **Run triage** → AI returns risk score, NEWS2 score, clinical justification
4. Review AI-drafted care orders in the **Action Center**
5. Approve (turns green, creates FHIR `ServiceRequest`) or Dismiss each suggested action

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        VitalsFlow                           │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Next.js 14  │───▶│  FastAPI     │───▶│  Gemini 1.5  │  │
│  │  App Router  │    │  Python 3.12 │    │  Flash (LLM) │  │
│  │  Tailwind    │◀───│  Pydantic v2 │◀───│  NEWS2       │  │
│  │  Shadcn/UI   │    │  httpx async │    │  Protocol    │  │
│  └──────────────┘    └──────┬───────┘    └──────────────┘  │
│                             │                               │
│                      ┌──────▼───────┐                       │
│                      │  HAPI FHIR   │                       │
│                      │  Public R4   │                       │
│                      │  Server      │                       │
│                      └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### Layer breakdown

| Layer | Technology | Purpose |
|---|---|---|
| Data Integration | HAPI FHIR R4 + httpx | Fetch `Patient`, `Observation`, `Condition` resources |
| Normalizer | Python service | Convert FHIR JSON → compact Clinical Summary string |
| AI Reasoning | Gemini 1.5 Flash | NEWS2-based risk scoring with structured JSON output |
| Output Parser | Pydantic v2 | Enforce schema — `risk_score`, `news2_score`, `justification`, `suggested_actions` |
| Action Engine | FastAPI router | Draft FHIR `ServiceRequest` resources from AI suggestions |
| Frontend | Next.js 14 + Shadcn | Risk heatmap, Action Center, vitals trend (Recharts) |
| Hosting | Vercel + Render | Zero-config deployment, free tier |

---

## FHIR Resources Used

| Resource | FHIR Type | Purpose |
|---|---|---|
| Patient demographics | `Patient` | Name, DOB, gender |
| Current vitals | `Observation` (vital-signs) | HR, BP, SpO2, temp, RR |
| Medical history | `Condition` | Existing diagnoses for context |
| Draft care orders | `ServiceRequest` | AI-generated referrals and lab orders |

**Data source:** [HAPI FHIR Public Test Server](http://hapi.fhir.org/baseR4) — synthetic patient data only. No real patient data is used or stored.

---

## NEWS2 Protocol

VitalsFlow implements the [National Early Warning Score 2 (NEWS2)](https://www.rcplondon.ac.uk/projects/outputs/national-early-warning-score-news-2) — a clinically validated UK standard for detecting patient deterioration.

The LLM is instructed to reason as a senior triage nurse using NEWS2 parameters:

- Respiratory rate
- SpO2 (with/without supplemental O2)
- Systolic blood pressure
- Heart rate
- Consciousness (ACVPU scale)
- Temperature

Output is a structured JSON object with `risk_score` (1–10), `news2_score`, `triage_tier` (critical/urgent/routine), clinical `justification`, and `suggested_actions`.

---

## Project Structure

```
vitalsflow/
├── frontend/                    # Next.js 14 App Router
│   ├── app/
│   │   └── page.tsx             # Main dashboard
│   ├── components/
│   │   ├── RiskBadge.tsx        # Colour-coded triage tier badge
│   │   ├── ActionCenter.tsx     # Approve/Dismiss care orders
│   │   └── VitalsTrend.tsx      # Recharts vitals sparkline
│   ├── lib/
│   │   └── api.ts               # FastAPI client functions
│   └── .env.local
│
├── backend/                     # FastAPI Python backend
│   ├── main.py                  # App entry, CORS, router registration
│   ├── routers/
│   │   ├── patients.py          # /patients/search, /patients/{id}/summary
│   │   └── triage.py            # POST /triage/{patient_id}
│   ├── services/
│   │   ├── fhir_client.py       # HAPI FHIR R4 async client
│   │   ├── normalizer.py        # FHIR → Clinical Summary string
│   │   └── llm_agent.py         # Gemini 1.5 Flash integration
│   ├── models/
│   │   └── schemas.py           # Pydantic input/output models
│   ├── requirements.txt
│   └── .env
│
├── docs/
│   └── RESPONSIBLE_AI.md        # Responsible AI documentation
│
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.12+
- A free [Google AI Studio](https://aistudio.google.com) API key (Gemini 1.5 Flash)

### 1. Clone the repo

```bash
git clone https://github.com/caredevi-innovation-lab/hackathon-2026-projects/vitalsflow
cd vitalsflow
```

### 2. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:
```
FHIR_BASE_URL=http://hapi.fhir.org/baseR4
GEMINI_API_KEY=your_gemini_api_key_here
```

Run the backend:
```bash
uvicorn main:app --reload --port 8000
```

Swagger UI available at: `http://localhost:8000/docs`

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the frontend:
```bash
npm run dev
```

App available at: `http://localhost:3000`

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check |
| `/patients/search?name=&count=` | GET | Search FHIR patients by name |
| `/patients/{id}/summary` | GET | Fetch + normalise patient FHIR data |
| `/triage/{patient_id}` | POST | Run AI triage with vitals payload |

### Triage request body

```json
{
  "heart_rate": 98,
  "systolic_bp": 145,
  "diastolic_bp": 92,
  "spo2": 91.0,
  "temperature": 38.4,
  "respiratory_rate": 22,
  "consciousness": "alert",
  "on_supplemental_o2": false
}
```

### Triage response

```json
{
  "risk_score": 8,
  "news2_score": 7,
  "triage_tier": "critical",
  "justification": "Patient presents with elevated respiratory rate, low SpO2, and tachycardia. NEWS2 score of 7 indicates high clinical risk requiring immediate assessment.",
  "suggested_actions": [
    "Immediate senior clinician review",
    "Order ABG and CBC labs",
    "Apply supplemental oxygen",
    "Continuous cardiac monitoring"
  ]
}
```

---

## Limitations

- **Synthetic data only** — HAPI FHIR public server contains synthetic patients. No real patient data.
- **No authentication layer** — production would require SMART-on-FHIR OAuth 2.0.
- **LLM is advisory only** — AI output is a clinical decision support tool, not a clinical decision. All actions require clinician approval.
- **NEWS2 approximation** — the LLM interprets NEWS2 parameters rather than computing a deterministic algorithm. A production system would use a validated, auditable algorithm.
- **No audit trail** — production requires full action logging for clinical governance.
- **Not HIPAA compliant** — demo uses public synthetic data. Real deployment requires BAA, encryption at rest/transit, access controls.

---

## Tech Stack

| Component | Technology |
|---|---|
| Frontend framework | Next.js 16 (App Router) |
| UI components | Shadcn/UI + Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Backend framework | FastAPI (Python 3.12) |
| Data validation | Pydantic v2 |
| HTTP client | httpx (async) |
| AI model | Google Gemini 1.5 Flash |
| FHIR standard | HL7 FHIR R4 |
| FHIR data source | HAPI FHIR Public Test Server |
| Frontend hosting | Vercel |
| Backend hosting | Render |

---

## Team

| Name | Role |
|---|---|
| [Teammate] | |
| [Teammate] |  |
| [Teammate] |  |

**Track:** AI Patient Triage
**Hackathon:** CareDevi AI Innovation Hackathon 2026

---

## Acknowledgements

- [HAPI FHIR](https://hapifhir.io/) — open-source FHIR server
- [Royal College of Physicians](https://www.rcplondon.ac.uk/) — NEWS2 protocol
- [Google AI Studio](https://aistudio.google.com/) — Gemini 1.5 Flash API
- [Shadcn/UI](https://ui.shadcn.com/) — component library