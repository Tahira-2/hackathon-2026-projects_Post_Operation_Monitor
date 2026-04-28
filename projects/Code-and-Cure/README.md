# CareIT (CureIT)

Telehealth workflow + FHIR interoperability bridge for independent practitioners. Built over the CareDevi AI Innovation Hackathon 2026 weekend.

We want to be upfront about what this is: CareIT is **not** an EMR, and it is **not** a diagnostic tool. It is the connective tissue between a patient describing symptoms in plain English and a clean, FHIR-R4 bundle landing on the other side of a doctor's approval — with as little manual work in between as possible.

---

## Team

| Name | GitHub |
|---|---|
| Prajan Manoj Kumar Rekha | `PrajanManojKumarRekha` |
| Eric Cariaga | `eCarCodes` |
| Jessica C O'Bonna | `jessic-o` |
| Shayan Ali | `CodewithShayan456` |

---

## The Problem

Independent practitioners and small clinics live in a fragmented stack. Scheduling lives in one tool, transcription in another, charting somewhere else, and the EMR rarely talks cleanly to any of them. Three things fall out of that:

1. Patients struggle to figure out *which* specialist they actually need.
2. Doctors burn most of their post-visit time turning a conversation into a chart note.
3. The handoff to the downstream EMR — the part that's supposed to be standardized — is still mostly manual, mostly inconsistent, and mostly a source of error.

We picked this because every member of the team has either worked in or alongside a small clinic and watched this happen. The ambition for the weekend was narrow on purpose: pick the seam where things break the most, and make that seam standards-compliant.

---

## What We Built

A workflow that runs end-to-end, from a patient typing symptoms to a FHIR R4 bundle that an EMR could ingest. There are five moving pieces:

1. **Symptom triage.** Patient types free text. The system suggests a specialty.
2. **Doctor discovery + booking.** We pull live practitioner data from OpenStreetMap (Overpass + Nominatim) so we don't depend on a paid API. If the live lookup fails, we fall back to seeded doctors in Supabase.
3. **Transcript → SOAP.** The doctor uploads or pastes a transcript. The system parses it into a structured SOAP note.
4. **Approval gate.** Nothing leaves the system until the doctor explicitly approves the SOAP. This is enforced in code, not in policy.
5. **FHIR R4 bundle generation.** Approved SOAPs are serialized into a deterministic bundle (`Consent`, `Composition`, optional `MedicationRequest`).

We deferred live Epic / Cerner / Athena production endpoint integration for the hackathon. Building that adapter without real sandbox credentials would be theatre, so instead we made sure the FHIR output is correct and demoable through a synthetic submission flow.

---

## How It Works (Step by Step)

This is the actual flow we demo. Following these steps in order is the fastest way to understand the system.

### Step 1 — Patient signs in and describes symptoms

The patient logs in and lands on a single text box. They describe what's going on in their own words — no dropdowns, no checkboxes. We pass the text to the triage layer in `src/core_logic`, which returns a recommended specialty and a one-line rationale.

The patient sees the recommendation and can accept it or override it. We deliberately did not auto-route — humans confirm.

### Step 2 — Doctor discovery

Once a specialty is selected, the discovery layer queries OpenStreetMap via Overpass for practitioners tagged with the relevant specialty, geocoded through Nominatim. Results come back, get normalized, and render as a bookable list.

If Overpass is unreachable (it does go down occasionally — we hit this on Saturday afternoon), we silently fall back to the seeded doctor list in Supabase. The user doesn't see an error; they just see fewer results.

### Step 3 — Booking

The patient picks a slot. The booking record gets written to Supabase with patient ID, doctor ID, time, and status. Nothing fancy here — just CRUD with proper constraints. This was the easiest pillar to build and the one we touched the least over the weekend.

### Step 4 — Doctor signs in and runs the encounter

The doctor logs in and sees their schedule. They open a booked appointment, run the visit (in real life — for the demo, we paste a transcript), and trigger SOAP generation.

The transcript is passed through the SOAP parser in `src/core_logic`. The output is a structured note with the four standard sections: Subjective, Objective, Assessment, Plan.

### Step 5 — Doctor reviews and approves the SOAP

This is the gate. The doctor sees the parsed SOAP, edits anything the model got wrong (or anything they want to change for any reason), and clicks approve. The note's state moves from `draft` to `approved`.

We enforce the gate at the API layer, not the UI layer. The export endpoint refuses any SOAP that isn't `approved`. We tested this by trying to call it directly — it rejects.

### Step 6 — FHIR bundle generation

Once approved, the doctor can export. The export endpoint takes the approved SOAP and produces a FHIR R4 JSON bundle:

- `Consent` — patient consent record for the encounter
- `Composition` — the SOAP note itself, structured
- `MedicationRequest` — only if a prescription was part of the plan

The serializer is deterministic — same input, byte-identical output. We did this on purpose so the bundle is testable and reviewable. Controlled substances are blocked at this layer regardless of what the SOAP says.

### Step 7 — Handoff (synthetic)

For the hackathon, the bundle is written to disk and viewable in the UI. In production, this is where the EMR vendor adapter would push it.

---

## Architecture

We organized the codebase into four pillars under `src/`. Each pillar has one job and one owner during the weekend.

| Pillar | Path | What lives here |
|---|---|---|
| Frontend | `src/frontend` | Next.js 14 / React 18 / TypeScript / Tailwind UI |
| API | `src/api` | FastAPI gateway, Pydantic schemas, route orchestration |
| Core Logic | `src/core_logic` | Pure Python — triage, SOAP parsing, FHIR serialization |
| Database | `src/database` | Supabase schema, query wrappers, audit tables |

The reason `core_logic` is pure Python with no framework dependencies is so we can unit-test it without spinning up a server. That paid off — most of our weekend tests live there.

### Where each feature stands

| Feature | Status |
|---|---|
| Symptom triage and routing | ✅ Implemented |
| Appointment booking and retrieval | ✅ Implemented |
| Transcript → SOAP parsing | ✅ Implemented |
| SOAP approval gate before export | ✅ Implemented |
| FHIR R4 bundle generation | ✅ Implemented |
| Internal audit data model (`department_logs`, versioning) | ✅ Schema-level |
| Real-time speech translation/transcription | 🟡 In progress |
| Live production EMR vendor endpoint push | ⏸️ Deferred |

---

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **API:** FastAPI, Pydantic
- **Core Logic:** Python 3.12+ (`dataclasses`, deterministic processing)
- **Database:** Supabase (PostgreSQL)
- **Interoperability:** FHIR R4 JSON Bundle

---

## Data Sources

| Source | What it provides | Notes |
|---|---|---|
| OpenStreetMap (Overpass + Nominatim) | Live practitioner lookup and geocoding | No paid API key. Falls back to seeded data when unavailable. |
| Supabase (PostgreSQL) | Patient records, bookings, SOAP notes, audit logs | All persistent state. Includes `department_logs` for versioning. |
| User-supplied transcripts | Input to SOAP parsing | Not retained beyond the approval workflow. |
| **No external clinical datasets** | — | Nothing was trained on or bundled with the project. |

---

## Limitations

We'd rather call these out ourselves than have a judge call them out for us.

- **Not an EMR.** No longitudinal record. No chart history. We don't replace anything; we feed something.
- **Not a diagnostic system.** Triage suggests a specialty. SOAP parses a transcript. Neither makes a clinical decision — the doctor does.
- **No live EMR connectivity.** Epic / Cerner / Athena production push is deferred. We generate and validate the bundle locally.
- **Speech transcription is in progress** and is *not* on the demo critical path. If we don't finish it, the demo still works end-to-end via pasted transcripts.
- **Controlled substances are blocked.** The prescription workflow refuses to issue them, regardless of input. This is a deliberate guardrail, not a missing feature.

---

## Setup Instructions

These are the exact steps we used. They assume Windows + PowerShell because that's the dev box, but they translate directly to macOS/Linux — just swap the path style.

### Step 1 — Clone the repo

```powershell
git clone https://github.com/<your-fork>/hackathon-2026-projects.git
cd "C:\Users\praja\OneDrive\Projects\CareIT\hackathon-2026-projects\projects\Code-and-Cure"
```

### Step 2 — Install backend dependencies

```powershell
python -m pip install -r src/api/requirements.txt
```

### Step 3 — Set environment variables

Create a `.env` file at the project root (or set these as system env vars):

```env
SUPABASE_URL=<your_supabase_url>
SUPABASE_KEY=<your_supabase_key>
JWT_SECRET=<your_jwt_secret>
```

> Doctor discovery does **not** need an API key — it uses public OpenStreetMap endpoints. If those are unreachable, the app falls back to the seeded doctors in Supabase automatically.

### Step 4 — Run the backend

```powershell
python -m uvicorn src.api.main:app --reload
```

Backend will be at `http://127.0.0.1:8000`.

> We use `python -m uvicorn ...` instead of just `uvicorn ...` to dodge PATH issues on Windows. Lost about 20 minutes to this on Saturday morning.

### Step 5 — Install frontend dependencies

In a second terminal:

```powershell
cd "C:\Users\praja\OneDrive\Projects\CareIT\hackathon-2026-projects\projects\Code-and-Cure\src\frontend"
npm install
```

### Step 6 — Run the frontend

```powershell
npm run dev
```

Frontend will be at `http://localhost:3000`. Open it in a browser. The frontend talks to the backend on port 8000.

### Step 7 — Verify it actually works

You should be able to:

1. Sign in as a patient
2. Submit symptoms and get a specialty back
3. See doctors and book a slot
4. Sign out, sign in as a doctor
5. Generate a SOAP from a pasted transcript
6. Approve the SOAP
7. Export a FHIR bundle

If any step fails, run the verification pipeline below before assuming it's a code bug.

---

## Verification Pipeline

We run these in order before merging any branch. They catch about 90% of problems before they hit `main`.

### A. Core logic tests

```powershell
cd "C:\Users\praja\OneDrive\Projects\CareIT\hackathon-2026-projects\projects\Code-and-Cure"
python -m pytest src/core_logic/test_logic.py
```

If this fails, the bug is in pure logic — triage, SOAP parsing, or FHIR serialization. Fastest tests in the project.

### B. API import sanity

```powershell
python -c "import src.api.main; print('api_import_ok')"
```

Catches silly things like a bad import or a circular dependency before you even start the server. Takes a second.

### C. Frontend production build

```powershell
cd "C:\Users\praja\OneDrive\Projects\CareIT\hackathon-2026-projects\projects\Code-and-Cure\src\frontend"
npm run build
```

`npm run dev` is forgiving. `npm run build` is not. If this fails, the build is broken and nothing is shippable.

### D. End-to-end smoke

Walk through the seven steps in the setup section above. If you can complete the loop, the system is working.

---

## Demo

Demo video and screenshots live in `demo/`. We'll be presenting live during the Sunday demo session.

---

## Project Guardrails (non-negotiable)

- We don't describe CareIT as an EMR. Anywhere.
- We don't claim production EMR connectivity unless an adapter is implemented and credentials are real.
- Only **approved** SOAPs are eligible for FHIR export. The check is in the API layer.
- Controlled-substance prescriptions are blocked in the prescription workflow.

---

## Repository Layout

```
projects/Code-and-Cure/
├── README.md            # This file
├── responsible-ai.md    # Bias, failure cases, data-source posture (hackathon requirement)
├── AI.md                # Working notes on AI components (temporary)
├── src/
│   ├── frontend/        # Next.js / React UI
│   ├── api/             # FastAPI gateway
│   ├── core_logic/      # Deterministic Python logic
│   └── database/        # Supabase schema and wrappers
└── demo/                # Demo video / screenshots
```
