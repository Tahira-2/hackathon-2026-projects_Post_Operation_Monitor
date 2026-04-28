# VitalsFlow — Backend Tasks
# Feed CONVENTIONS.md + ARCHITECTURE.md + API_CONTRACT.md + this file
# to your AI assistant to generate any backend file.

---

## Setup Commands (run once)

```bash
cd projects/vitalsflow/src/backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install fastapi uvicorn[standard] httpx python-dotenv pydantic
pip freeze > requirements.txt
```

Create `.env` (never commit):
```
FHIR_BASE_URL=http://hapi.fhir.org/baseR4
GEMINI_API_KEY=your_key_here
```

Create `.env.example` (commit this):
```
FHIR_BASE_URL=http://hapi.fhir.org/baseR4
GEMINI_API_KEY=your_key_here
```

Run locally:
```bash
uvicorn main:app --reload --port 8000
```

Swagger UI: `http://localhost:8000/docs`

---

## TASK B1 — models/schemas.py

**Paste this prompt into your AI:**

```
You are building the VitalsFlow FastAPI backend for the CareDevi AI Hackathon.
Read CONVENTIONS.md and API_CONTRACT.md for rules and exact model definitions.

Create: projects/vitalsflow/src/backend/models/schemas.py

Use the exact models from API_CONTRACT.md.
Add these extras:
- VitalsInput: add @field_validator for consciousness
  (must be one of: alert, voice, pain, unresponsive)
- TriageOutput: add @field_validator to clamp risk_score between 0 and 10
- PatientSummary: match API_CONTRACT.md exactly
- Add a module docstring explaining this is the single source of truth
  for all data models

Use Pydantic v2 syntax. Follow CONVENTIONS.md import order.
Generate the complete file.
```

---

## TASK B2 — services/fhir_client.py

**Paste this prompt into your AI:**

```
You are building the VitalsFlow FastAPI backend for the CareDevi AI Hackathon.
Read CONVENTIONS.md and ARCHITECTURE.md for rules and context.

Create: projects/vitalsflow/src/backend/services/fhir_client.py

FHIR base URL from environment variable FHIR_BASE_URL.
Default: http://hapi.fhir.org/baseR4

Implement these async functions:

1. get_patient(patient_id: str) -> dict
   GET /Patient/{patient_id}
   Raise exception with message "Patient {patient_id} not found" on 404

2. get_conditions(patient_id: str) -> list[dict]
   GET /Condition?patient={patient_id}&_count=10
   Return list of resource dicts from bundle entries
   Return [] if no entries

3. get_observations(patient_id: str) -> list[dict]
   GET /Observation?patient={patient_id}&category=vital-signs&_count=20&_sort=-date
   Return list of resource dicts from bundle entries
   Return [] if no entries

4. search_patients(name: str = "", count: int = 10) -> list[dict]
   GET /Patient?_count={count}&_summary=true
   Add name param only if name is not empty string
   Return list of Patient resource dicts from bundle entries
   Return [] if no entries

Rules from CONVENTIONS.md:
- async with httpx.AsyncClient(timeout=15.0) on every call
- try/except on every function
- Never use requests library
- Add LOINC code comment block explaining vital sign codes used in normalizer

Generate the complete file.
```

---

## TASK B3 — services/normalizer.py

**Paste this prompt into your AI:**

```
You are building the VitalsFlow FastAPI backend for the CareDevi AI Hackathon.
Read CONVENTIONS.md and ARCHITECTURE.md for rules and context.

Create: projects/vitalsflow/src/backend/services/normalizer.py

Main function:
normalize_patient(patient: dict, conditions: list, observations: list) -> str

Output format (exact):
PATIENT: {name}, {age}yo {gender}
CONDITIONS: {comma-separated condition display names}
RECENT VITALS: {key: value unit; key: value unit}

Rules:
- Extract name from patient["name"][0] — join given list + family
- Calculate age from patient["birthDate"] (format YYYY-MM-DD)
- Extract condition names from code.text first,
  fallback to code.coding[0].display
- Map these LOINC codes to vital names:
  8867-4  → heart_rate
  8480-6  → systolic_bp
  8462-4  → diastolic_bp
  59408-5 → spo2
  8310-5  → temperature
  9279-1  → respiratory_rate
- Extract value from valueQuantity.value and valueQuantity.unit
- Take only the FIRST (most recent) occurrence of each vital
  (observations already sorted by date descending from FHIR query)
- If conditions list is empty: use "none on record"
- If vitals dict is empty: use "none on record"
- Handle any missing field with graceful fallback — never raise
- Add helper: _calc_age(dob: str) -> int
- Add helper: _codings_text(codings: list) -> str
- Add docstring: explain why compact output saves LLM tokens

Generate the complete file.
```

---

## TASK B4 — services/llm_agent.py

**Paste this prompt into your AI:**

```
You are building the VitalsFlow FastAPI backend for the CareDevi AI Hackathon.
Read CONVENTIONS.md, ARCHITECTURE.md, and API_CONTRACT.md for rules.

Create: projects/vitalsflow/src/backend/services/llm_agent.py

Model: Google Gemini 1.5 Flash
API URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
API key: from environment variable GEMINI_API_KEY
Use httpx REST call — NOT the Google SDK

Main function:
score_patient(clinical_summary: str, vitals: VitalsInput) -> TriageOutput

System prompt (use exactly):
"You are a senior triage nurse with 15 years of emergency department experience.
You score patients using the NEWS2 (National Early Warning Score 2) protocol.
NEWS2 parameters: respiratory rate, SpO2, systolic BP, heart rate,
consciousness (ACVPU scale), temperature, supplemental O2.
You MUST respond with valid JSON only. No markdown. No explanation outside the JSON.
Schema: {risk_score: int 1-10, news2_score: int, triage_tier: critical|urgent|routine,
justification: 2-3 sentence clinical rationale, suggested_actions: [string array]}"

User message format:
"{clinical_summary}

CURRENT VITALS:
- Heart rate: {vitals.heart_rate} bpm
- BP: {vitals.systolic_bp}/{vitals.diastolic_bp} mmHg
- SpO2: {vitals.spo2}%
- Temperature: {vitals.temperature}°C
- Respiratory rate: {vitals.respiratory_rate}/min
- Consciousness: {vitals.consciousness}
- On supplemental O2: {vitals.on_supplemental_o2}

Calculate NEWS2 score, risk score 1-10, triage tier, and 3-5 suggested actions."

Gemini request config:
- temperature: 0.1
- maxOutputTokens: 512
- Three-turn conversation: system prompt → model acknowledgement → user message

Output parsing:
- Strip markdown code fences (```json ... ```) before parsing
- json.loads() the text
- TriageOutput(**data) to validate
- On ANY exception: return safe fallback from API_CONTRACT.md
- Never raise from this function — always return a TriageOutput

Generate the complete file.
```

---

## TASK B5 — routers/patients.py

**Paste this prompt into your AI:**

```
You are building the VitalsFlow FastAPI backend for the CareDevi AI Hackathon.
Read CONVENTIONS.md and API_CONTRACT.md for rules and exact response shapes.

Create: projects/vitalsflow/src/backend/routers/patients.py

APIRouter: prefix="/patients", tags=["patients"]

Endpoint 1: GET /patients/search
Query params: name (str, default ""), count (int, default 10)
- Call search_patients(name, count) from fhir_client
- For each patient resource, extract:
  id: patient.get("id", "")
  name: join given names + family from patient["name"][0]
  dob: patient.get("birthDate", "")
  gender: patient.get("gender", "")
- Return list of these dicts
- Return [] if no results (never 404)
- Wrap in try/except → HTTPException 500 on error

Endpoint 2: GET /patients/{patient_id}/summary
Path param: patient_id (str)
- Call get_patient, get_conditions, get_observations (all from fhir_client)
- Call normalize_patient from normalizer
- Extract name, dob, gender from patient dict
- Return PatientSummary shape from API_CONTRACT.md
- HTTPException 404 if get_patient raises "not found"
- HTTPException 500 on other errors

All functions async. Follow CONVENTIONS.md import order.
Generate the complete file.
```

---

## TASK B6 — routers/triage.py

**Paste this prompt into your AI:**

```
You are building the VitalsFlow FastAPI backend for the CareDevi AI Hackathon.
Read CONVENTIONS.md and API_CONTRACT.md for rules and exact response shapes.

Create: projects/vitalsflow/src/backend/routers/triage.py

APIRouter: prefix="/triage", tags=["triage"]

Endpoint: POST /triage/{patient_id}
Path param: patient_id (str)
Request body: VitalsInput
Response model: TriageOutput

Steps in order:
1. get_patient(patient_id) from fhir_client
2. get_conditions(patient_id) from fhir_client
3. get_observations(patient_id) from fhir_client
4. normalize_patient(patient, conditions, observations) from normalizer
5. score_patient(clinical_summary, vitals) from llm_agent
6. Return TriageOutput

Error handling:
- If FHIR fetch raises: HTTPException 500 with detail
- score_patient never raises (returns fallback) — no need to catch it

Function must be async.
Follow CONVENTIONS.md import order.
Generate the complete file.
```

---

## TASK B7 — main.py

**Paste this prompt into your AI:**

```
You are building the VitalsFlow FastAPI backend for the CareDevi AI Hackathon.
Read CONVENTIONS.md for rules.

Create: projects/vitalsflow/src/backend/main.py

Requirements:
- FastAPI app: title="VitalsFlow API", version="1.0.0",
  description="AI-powered clinical triage — HL7 FHIR + NEWS2"
- load_dotenv() at top before anything else
- CORSMiddleware:
  allow_origins=["http://localhost:3000", "https://vitalsflow.vercel.app"]
  allow_credentials=True
  allow_methods=["*"]
  allow_headers=["*"]
- Include patients router from routers.patients
- Include triage router from routers.triage
- GET /health → {"status": "ok", "service": "VitalsFlow API"}
- Print "VitalsFlow API ready" on startup (use @app.on_event("startup"))

Generate the complete file.
```

---

## TASK B8 — Render Deployment Config

**Paste this prompt into your AI:**

```
Create the Render deployment config for VitalsFlow FastAPI backend.

File: projects/vitalsflow/src/backend/render.yaml

The backend is in a subdirectory of a monorepo:
projects/vitalsflow/src/backend/

Requirements:
- Service type: web
- Environment: python
- Build command: pip install -r requirements.txt
- Start command: uvicorn main:app --host 0.0.0.0 --port $PORT
- Environment variables to declare (values set in Render dashboard):
  GEMINI_API_KEY (secret)
  FHIR_BASE_URL (value: http://hapi.fhir.org/baseR4)

Also write step-by-step Render dashboard instructions:
1. How to set the root directory to projects/vitalsflow/src/backend
2. Where to add environment variables
3. How to find the deployed URL
4. How to check logs if it crashes on startup

Generate render.yaml and the instructions.
```

---

## Testing Commands

After each task, test immediately. Don't batch testing to the end.

```bash
# After B7 (main.py complete)
curl http://localhost:8000/health

# After B5 (patients router)
curl "http://localhost:8000/patients/search?name=Smith&count=3"

# After B6 (triage router) — replace ID with real one from search
curl -X POST http://localhost:8000/triage/592011 \
  -H "Content-Type: application/json" \
  -d '{
    "heart_rate": 118,
    "systolic_bp": 88,
    "diastolic_bp": 58,
    "spo2": 90.0,
    "temperature": 39.2,
    "respiratory_rate": 26,
    "consciousness": "voice",
    "on_supplemental_o2": false
  }'
```

Expected triage response: risk_score 9-10, triage_tier "critical"
