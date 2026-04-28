# VitalsFlow — Architecture
# Feed this to your AI when building any service, understanding data flow,
# or making decisions about where code should live.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         VitalsFlow                              │
│                                                                 │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │  Next.js 14 │───▶│   FastAPI    │───▶│  Gemini 1.5 Flash │  │
│  │  (Vercel)   │    │  (Render)    │    │  (Google AI)      │  │
│  │             │◀───│              │◀───│  NEWS2 Protocol   │  │
│  └─────────────┘    └──────┬───────┘    └───────────────────┘  │
│                            │                                    │
│                     ┌──────▼───────┐                           │
│                     │  HAPI FHIR   │                           │
│                     │  Public R4   │                           │
│                     │  (external)  │                           │
│                     └──────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer Breakdown

### Layer 1 — Data Integration

**What it does:** Fetches raw FHIR R4 resources from external server

**Files:**
- `src/backend/services/fhir_client.py`

**FHIR Server:** `http://hapi.fhir.org/baseR4` (public, no auth, synthetic data)

**Resources fetched:**
| FHIR Resource | Endpoint | Purpose |
|---|---|---|
| `Patient` | `/Patient/{id}` | Demographics: name, DOB, gender |
| `Observation` | `/Observation?patient={id}&category=vital-signs` | Historical vitals |
| `Condition` | `/Condition?patient={id}` | Medical history |
| `ServiceRequest` | Written back on approve | Draft care orders |

**Key constraint:** All calls are async. Timeout is 15 seconds.
If HAPI server is slow, the UI shows a skeleton — never hangs.

---

### Layer 2 — Normalizer

**What it does:** Converts verbose FHIR JSON into a compact plain-text
"Clinical Summary" that the LLM can read without wasting tokens.

**Files:**
- `src/backend/services/normalizer.py`

**Input:** Raw FHIR Patient + Condition + Observation dicts
**Output:** A compact string like:
```
PATIENT: John Smith, 67yo male
CONDITIONS: Hypertension, Type 2 Diabetes, COPD
RECENT VITALS: heart_rate: 105 /min; spo2: 91 %; systolic_bp: 88 mmHg
```

**Why this matters:** Sending raw FHIR JSON to the LLM wastes ~2000 tokens
per patient. The normalized summary is ~50 tokens. Same information,
40x cheaper and faster.

**LOINC code mapping used:**
```
8867-4  → heart_rate
8480-6  → systolic_bp
8462-4  → diastolic_bp
59408-5 → spo2
8310-5  → temperature
9279-1  → respiratory_rate
```

---

### Layer 3 — LLM Reasoning Agent

**What it does:** Sends the Clinical Summary + current vitals to Gemini,
gets back a structured risk assessment following NEWS2 protocol.

**Files:**
- `src/backend/services/llm_agent.py`

**Model:** `gemini-1.5-flash` via REST API
**Temperature:** 0.1 (minimal variance for clinical reasoning)
**Max tokens:** 512 (enough for JSON output, not wasteful)

**Data flow:**
```
Clinical Summary (string)
        +
Current Vitals (VitalsInput)
        ↓
  Gemini 1.5 Flash
  [acts as senior triage nurse]
  [follows NEWS2 protocol]
        ↓
  Raw JSON string
        ↓
  Pydantic parser
        ↓
  TriageOutput (validated)
```

**Fallback:** If Gemini fails or returns invalid JSON, return:
```python
TriageOutput(
    risk_score=0,
    news2_score=0,
    triage_tier="unknown",
    justification="Analysis unavailable. Manual assessment required.",
    suggested_actions=["Manual clinical assessment required"]
)
```
Never crash. Never return 500 if avoidable.

---

### Layer 4 — Action Engine

**What it does:** Packages AI suggestions as FHIR-compliant draft resources
when a clinician clicks Approve.

**Files:**
- `src/backend/routers/triage.py`

**On Approve:** A FHIR `ServiceRequest` resource is drafted with:
- `status: "draft"`
- `intent: "proposal"`
- `subject: Patient/{id}`
- `note: [AI suggestion text]`

For the hackathon, this is logged server-side. Production would write
it back to the EHR via authenticated FHIR POST.

---

### Layer 5 — Presentation

**What it does:** Clinical dashboard for searching patients, entering
vitals, reviewing AI risk scores, and approving/dismissing care orders.

**Files:**
- `src/frontend/app/page.tsx` — main dashboard (all state lives here)
- `src/frontend/components/RiskBadge.tsx` — colour-coded tier badge
- `src/frontend/components/ActionCenter.tsx` — approve/dismiss UI
- `src/frontend/components/VitalsTrend.tsx` — Recharts sparkline
- `src/frontend/components/VitalsForm.tsx` — vitals input form
- `src/frontend/components/PatientCard.tsx` — patient list item
- `src/frontend/lib/api.ts` — all fetch calls to FastAPI

---

## Data Flow — Full Triage Request

```
1. Clinician searches patient by name
   → Frontend: GET /patients/search?name=Smith
   → Backend: FHIR GET /Patient?name=Smith
   → Returns: [{id, name, dob, gender}]

2. Clinician selects patient
   → Frontend: GET /patients/{id}/summary
   → Backend: parallel FHIR fetch (Patient + Conditions + Observations)
   → Normalizer converts to Clinical Summary string
   → Returns: {clinical_summary}

3. Clinician enters/confirms vitals → clicks Run Triage
   → Frontend: POST /triage/{id} with VitalsInput body
   → Backend: fetch FHIR data + normalize + call Gemini
   → Gemini returns JSON → Pydantic validates → TriageOutput returned
   → Frontend renders: RiskBadge + ActionCenter + VitalsTrend

4. Clinician clicks Approve on a suggested action
   → Frontend: state update (approved set)
   → Row turns green, button disappears
   → (Production: POST FHIR ServiceRequest back to EHR)

5. Clinician clicks Dismiss
   → Frontend: state update (dismissed set)
   → Row fades to 30% opacity, button disappears
```

---

## Backend File Responsibilities

| File | Single Responsibility |
|---|---|
| `main.py` | App entry, CORS, router registration, health endpoint |
| `models/schemas.py` | ALL Pydantic models — nothing else |
| `services/fhir_client.py` | FHIR HTTP calls only — no business logic |
| `services/normalizer.py` | FHIR → string conversion only |
| `services/llm_agent.py` | Gemini API call + output parsing only |
| `routers/patients.py` | /patients/* routes only |
| `routers/triage.py` | /triage/* routes only |

---

## Frontend File Responsibilities

| File | Single Responsibility |
|---|---|
| `app/page.tsx` | All state, all data fetching, layout orchestration |
| `app/layout.tsx` | Metadata, fonts, body wrapper only |
| `lib/api.ts` | ALL fetch calls — no fetch anywhere else |
| `components/RiskBadge.tsx` | Display risk tier + score — no state |
| `components/ActionCenter.tsx` | Approve/dismiss interactions — local state only |
| `components/VitalsTrend.tsx` | Recharts sparkline — display only |
| `components/VitalsForm.tsx` | Vitals input form — calls onChange prop |
| `components/PatientCard.tsx` | Patient list item — display + click only |

---

## NEWS2 Scoring Reference

The LLM is instructed to follow this protocol:

| Parameter | 3 | 2 | 1 | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|---|---|
| Resp rate | ≤8 | | 9–11 | 12–20 | | 21–24 | ≥25 |
| SpO2 (no O2) | ≤91 | 92–93 | 94–95 | ≥96 | | | |
| Systolic BP | ≤90 | 91–100 | 101–110 | 111–219 | | | ≥220 |
| Heart rate | ≤40 | | 41–50 | 51–90 | 91–110 | 111–130 | ≥131 |
| Consciousness | | | | Alert | | | CVPU |
| Temperature | ≤35.0 | | 35.1–36.0 | 36.1–38.0 | 38.1–39.0 | ≥39.1 | |

**Triage tier mapping:**
- NEWS2 0–4 → `routine`
- NEWS2 5–6 → `urgent`
- NEWS2 7+ → `critical`

---

## Deployment Architecture

```
GitHub (Shovaan83/hackathon-2026-projects)
    │
    ├── Vercel (auto-deploy on push)
    │   └── Root dir: projects/vitalsflow/src/frontend
    │   └── URL: https://vitalsflow.vercel.app
    │
    └── Render (auto-deploy on push)
        └── Root dir: projects/vitalsflow/src/backend
        └── URL: https://vitalsflow-api.onrender.com
```

**Important:** Render free tier sleeps after 15 minutes of inactivity.
Frontend pings `/health` every 10 minutes to keep it warm.
