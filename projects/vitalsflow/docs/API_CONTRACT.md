# VitalsFlow — API Contract
# Feed this to your AI when building frontend API calls, backend routes,
# or any code that crosses the frontend ↔ backend boundary.
# This is the single source of truth. Both sides must match exactly.

---

## Base URLs

| Environment | Frontend origin | Backend base URL |
|---|---|---|
| Local dev | http://localhost:3000 | http://localhost:8000 |
| Production | https://vitalsflow.vercel.app | https://vitalsflow-api.onrender.com |

Frontend reads backend URL from: `process.env.NEXT_PUBLIC_API_URL`

---

## Endpoints

### GET /health
Health check. Used by frontend keepalive ping.

**Request:** No body, no params

**Response 200:**
```json
{
  "status": "ok",
  "service": "VitalsFlow API"
}
```

---

### GET /patients/search

Search patients by name from HAPI FHIR.

**Query params:**
| Param | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | string | No | `""` | Patient name to search |
| `count` | integer | No | `10` | Max results to return |

**Request example:**
```
GET /patients/search?name=Smith&count=5
```

**Response 200:**
```json
[
  {
    "id": "592011",
    "name": "John Smith",
    "dob": "1957-03-14",
    "gender": "male"
  },
  {
    "id": "592012",
    "name": "Jane Smith",
    "dob": "1982-07-22",
    "gender": "female"
  }
]
```

**Response 200 (no results):** `[]`

**Response 500:**
```json
{ "detail": "FHIR search failed: <error message>" }
```

---

### GET /patients/{patient_id}/summary

Fetch and normalize a single patient's FHIR data.

**Path params:**
| Param | Type | Required | Description |
|---|---|---|---|
| `patient_id` | string | Yes | FHIR patient resource ID |

**Request example:**
```
GET /patients/592011/summary
```

**Response 200:**
```json
{
  "patient_id": "592011",
  "name": "John Smith",
  "dob": "1957-03-14",
  "gender": "male",
  "clinical_summary": "PATIENT: John Smith, 67yo male\nCONDITIONS: Hypertension, Type 2 Diabetes\nRECENT VITALS: heart_rate: 88 /min; spo2: 96 %"
}
```

**Response 404:**
```json
{ "detail": "Patient 592011 not found on FHIR server" }
```

**Response 500:**
```json
{ "detail": "Failed to fetch patient data: <error message>" }
```

---

### POST /triage/{patient_id}

Run AI triage for a patient with current vitals.
This is the core endpoint — fetches FHIR data, normalizes, calls Gemini.

**Path params:**
| Param | Type | Required | Description |
|---|---|---|---|
| `patient_id` | string | Yes | FHIR patient resource ID |

**Request body (VitalsInput):**
```json
{
  "heart_rate": 105,
  "systolic_bp": 88,
  "diastolic_bp": 58,
  "spo2": 91.0,
  "temperature": 38.9,
  "respiratory_rate": 24,
  "consciousness": "alert",
  "on_supplemental_o2": false
}
```

**VitalsInput field rules:**
| Field | Type | Valid values | Notes |
|---|---|---|---|
| `heart_rate` | int | 20–300 | beats per minute |
| `systolic_bp` | int | 50–300 | mmHg |
| `diastolic_bp` | int | 30–200 | mmHg |
| `spo2` | float | 50.0–100.0 | percentage |
| `temperature` | float | 30.0–45.0 | Celsius |
| `respiratory_rate` | int | 4–60 | breaths per minute |
| `consciousness` | string | `"alert"` \| `"voice"` \| `"pain"` \| `"unresponsive"` | ACVPU scale |
| `on_supplemental_o2` | boolean | true \| false | affects NEWS2 SpO2 scoring |

**Response 200 (TriageOutput):**
```json
{
  "risk_score": 9,
  "news2_score": 11,
  "triage_tier": "critical",
  "justification": "Patient presents with severe hypotension (88/58 mmHg), tachycardia, and low SpO2 of 91% without supplemental oxygen. Combined respiratory rate of 24/min yields a NEWS2 score of 11, indicating immediate clinical emergency.",
  "suggested_actions": [
    "Immediate senior clinician review — do not delay",
    "Apply high-flow oxygen via non-rebreather mask",
    "Insert two large-bore IV cannulas and commence fluid resuscitation",
    "Order urgent ABG, FBC, U&E, lactate",
    "Prepare for ICU escalation"
  ]
}
```

**TriageOutput field rules:**
| Field | Type | Valid values | Notes |
|---|---|---|---|
| `risk_score` | int | 1–10 (0 if analysis failed) | AI composite risk score |
| `news2_score` | int | 0–20 (0 if analysis failed) | Raw NEWS2 total |
| `triage_tier` | string | `"critical"` \| `"urgent"` \| `"routine"` \| `"unknown"` | `"unknown"` = AI failed |
| `justification` | string | 2–3 sentences | Plain English clinical rationale |
| `suggested_actions` | string[] | 2–5 items | Ordered by clinical priority |

**Response when AI fails (graceful fallback — still 200, not 500):**
```json
{
  "risk_score": 0,
  "news2_score": 0,
  "triage_tier": "unknown",
  "justification": "Analysis unavailable. Manual assessment required.",
  "suggested_actions": ["Manual clinical assessment required"]
}
```

**Response 500 (FHIR fetch failed):**
```json
{ "detail": "Triage failed: <error message>" }
```

---

## TypeScript Interfaces (frontend/lib/api.ts)

Copy these exactly into `lib/api.ts`:

```typescript
export interface Patient {
  id: string
  name: string
  dob: string
  gender: string
}

export interface VitalsPayload {
  heart_rate: number
  systolic_bp: number
  diastolic_bp: number
  spo2: number
  temperature: number
  respiratory_rate: number
  consciousness: string
  on_supplemental_o2: boolean
}

export interface TriageResult {
  risk_score: number
  news2_score: number
  triage_tier: string
  justification: string
  suggested_actions: string[]
}

export interface PatientSummary {
  patient_id: string
  name: string
  dob: string
  gender: string
  clinical_summary: string
}
```

---

## Python Models (backend/models/schemas.py)

Copy these exactly into `models/schemas.py`:

```python
from pydantic import BaseModel, field_validator
from typing import Optional

class VitalsInput(BaseModel):
    heart_rate: int
    systolic_bp: int
    diastolic_bp: int
    spo2: float
    temperature: float
    respiratory_rate: int
    consciousness: str
    on_supplemental_o2: bool

    @field_validator("consciousness")
    @classmethod
    def validate_consciousness(cls, v):
        valid = {"alert", "voice", "pain", "unresponsive"}
        if v not in valid:
            raise ValueError(f"consciousness must be one of {valid}")
        return v

    @field_validator("risk_score", mode="before")
    @classmethod
    def clamp_risk(cls, v):
        return max(0, min(10, int(v)))


class TriageOutput(BaseModel):
    risk_score: int
    news2_score: int
    triage_tier: str
    justification: str
    suggested_actions: list[str]


class PatientSummary(BaseModel):
    patient_id: str
    name: str
    dob: str
    gender: str
    clinical_summary: str
```

---

## Default Vitals (demo pre-fill)

Use these as default values in the VitalsForm for a high-risk demo:

```typescript
export const DEFAULT_VITALS: VitalsPayload = {
  heart_rate: 118,
  systolic_bp: 88,
  diastolic_bp: 58,
  spo2: 90.0,
  temperature: 39.2,
  respiratory_rate: 26,
  consciousness: "voice",
  on_supplemental_o2: false,
}
```

Expected result: NEWS2 ~11, risk_score 9–10, triage_tier "critical"

---

## CORS Configuration

Backend must allow these origins:

```python
allow_origins = [
  "http://localhost:3000",
  "https://vitalsflow.vercel.app"
]
```

If Vercel assigns a different URL, add it here and redeploy Render.

---

## Error Handling Contract

Frontend must handle these cases for every API call:

| Scenario | HTTP status | Frontend behaviour |
|---|---|---|
| Patient not found | 404 | Show "Patient not found" in search results |
| FHIR server down | 500 | Show red error banner: "FHIR server unavailable" |
| Triage AI failed | 200 (fallback) | Show "Pending analysis" badge, no ActionCenter |
| Network timeout | (fetch throws) | Show red error banner: "Connection failed. Retry?" |
| Render cold start | (fetch slow) | Show spinner for up to 35 seconds before timeout error |

Frontend fetch wrapper pattern:
```typescript
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}
```
