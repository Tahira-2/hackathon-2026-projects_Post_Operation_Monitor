# CareIT (CureIT)

CareIT is a telehealth workflow and interoperability bridge for independent practitioners.
It is **not** an EMR and **not** a diagnostic system.

The platform automates:
- free-text symptom triage
- doctor discovery and booking
- transcript-to-SOAP conversion
- reviewer-gated clinical approval
- FHIR R4 bundle generation for EMR-ready handoff

For hackathon scope, live Epic/Cerner/Athena production endpoint integration is deferred. The project demonstrates standards-based handoff with deterministic FHIR output and synthetic submission flow.

## Team

- Prajan Manoj Kumar Rekha (`PrajanManojKumarRekha`)
- Eric Cariaga (`eCarCodes`)
- Jessica C O'Bonna (`jessic-o`)
- Shayan Ali (`CodewithShayan456`)

## Architecture (4 Pillars)

- `src/frontend`: Next.js/React UI
- `src/api`: FastAPI gateway and orchestration
- `src/core_logic`: pure Python deterministic logic
- `src/database`: Supabase schema and query wrappers

## Current Feature Status

- Symptom triage and routing: implemented
- Appointment booking and retrieval: implemented
- Transcript -> SOAP parsing: implemented
- SOAP approval gate before export: implemented
- FHIR R4 bundle generation (`Consent`, `Composition`, optional `MedicationRequest`): implemented
- Internal audit data model (`department_logs`, versioning): implemented at schema level
- Real-time speech translation/transcription: in progress
- Live production EMR vendor endpoint push: deferred for hackathon

## Tech Stack

- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS
- API: FastAPI, Pydantic
- Core Logic: Python 3.12+ (`dataclasses`, deterministic processing)
- Database: Supabase (PostgreSQL)
- Interoperability: FHIR R4 JSON Bundle

## Local Setup

### 1) Backend

From repository project root:

```powershell
cd "C:\Users\praja\OneDrive\Projects\CareIT\hackathon-2026-projects\projects\Code-and-Cure"
python -m pip install -r src/api/requirements.txt
```

Create/update `.env` (or environment variables):

```env
SUPABASE_URL=<your_supabase_url>
SUPABASE_KEY=<your_supabase_key>
JWT_SECRET=<your_jwt_secret>
```

Run backend:

```powershell
python -m uvicorn src.api.main:app --reload
```

> Note: use `python -m uvicorn ...` to avoid PATH issues on Windows.

### 2) Frontend

```powershell
cd "C:\Users\praja\OneDrive\Projects\CareIT\hackathon-2026-projects\projects\Code-and-Cure\src\frontend"
npm install
npm run dev
```

Frontend local URL:
- `http://localhost:3000`

Backend local URL:
- `http://127.0.0.1:8000`

## Verification Pipeline

Run these checks before merge:

### A. Core logic tests

```powershell
cd "C:\Users\praja\OneDrive\Projects\CareIT\hackathon-2026-projects\projects\Code-and-Cure"
python -m pytest src/core_logic/test_logic.py
```

### B. API import sanity

```powershell
python -c "import src.api.main; print('api_import_ok')"
```

### C. Frontend production build

```powershell
cd "C:\Users\praja\OneDrive\Projects\CareIT\hackathon-2026-projects\projects\Code-and-Cure\src\frontend"
npm run build
```

### D. End-to-end smoke flow

1. Login as patient
2. Submit symptoms and get specialty recommendation
3. View doctors and book slot
4. Login as doctor
5. Generate SOAP from transcript
6. Approve SOAP
7. Export FHIR bundle

## Important Guardrails

- Do not claim CareIT is an EMR.
- Do not claim production Epic/Athena connectivity unless adapter + credentials are implemented.
- Use approved SOAP only for FHIR export.
- Controlled-substance policy remains blocked in telehealth prescription workflow.