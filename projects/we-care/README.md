# RefAI — AI-Powered Referral Management Portal

**Team:** We Care
**Hackathon:** CareDevi AI Innovation Hackathon 2026

| Name       | GitHub |
| ---------- | ------ |
| Arjun Giri | [@arjungiri1234](https://github.com/arjungiri1234) |
| Anil       | [@aniloli42](https://github.com/aniloli42) |

---

## Problem

Patient referrals in healthcare are still largely manual. Doctors write free-text notes, staff transcribe them by hand, and there is no unified system to track whether a referral was received, accepted, or completed. The result: delayed care, lost referrals, and poor patient outcomes — all from a process that has not meaningfully changed in decades.

---

## Proposed Solution

**RefAI** is a web-based referral management portal that uses AI to remove friction from the referral workflow for both doctors and patients.

**For doctors:**

- Write a free-text clinical note as they normally would
- AI (Google Gemini 2.5 Flash) extracts structured data automatically — patient details, diagnosis, urgency level, and required specialty
- Doctor reviews, edits if needed, selects the best-matched specialist, and submits in one flow
- Live dashboard tracks every referral from submission to completion

**For patients:**

- Receive an email or SMS with a secure link — no account or password needed
- View their referral status in real time
- Book an appointment directly with the referred specialist by selecting a date and time slot
- Referral status updates automatically when appointment is booked and confirmed

---

## Key Features

| Feature             | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| AI Extraction       | Gemini parses clinical notes into structured fields               |
| Specialist Matching | Filters available specialists by extracted required specialty     |
| Status Timeline     | Real-time tracking: Pending → Sent → Accepted → Completed         |
| Patient Portal      | Token-gated, no-login page for patients to track and book         |
| Appointment Booking | Patient picks date and time slot; triggers referral status update |
| Audit Trail         | Every status change recorded with timestamp                       |

---

## Tech Stack

| Layer            | Technology                                                    |
| ---------------- | ------------------------------------------------------------- |
| Frontend         | Vite, React, TypeScript, TailwindCSS, Zustand, TanStack Query |
| Backend          | Node.js, TypeScript                                           |
| Database & Auth  | Supabase (PostgreSQL)                                         |
| AI               | Google Gemini API (Gemini 2.5 Flash)                          |
| Design           | Google Stitch                                                 |
| Containerization | Docker                                                        |

---

## Architecture

```
Doctor (Browser)
      ↓
React Frontend — Vite + TypeScript + TailwindCSS
      ↓
Node.js REST API
      ├── Gemini API — clinical note extraction
      └── Supabase — doctors, patients, specialists,
                     referrals, appointments, status history

Patient (Email / SMS link)
      ↓
Token-gated Patient Portal (/p/:token)
      ↓
Node.js REST API (public routes, token-validated)
      └── Supabase — referral read, appointment booking
```

---

## Database Design

Core tables: `doctors`, `specialists`, `patients`, `referrals`, `referral_status_history`, `appointments`, `patient_tokens`

Notable design decisions:

- Doctor profiles now persist presentation metadata such as specialty, license number, hospital affiliation, and avatar URL
- `referral_status_history` stores a timestamped record per status change, powering the timeline UI
- `appointments` has a UNIQUE constraint on `referral_id` — one appointment per referral
- Patient portal access is stateless: a signed token maps to a referral, expires after use

Schema: `backend/supabase/schema.sql`

---

## Setup

1. Clone this repository
2. Copy `.env.example` to `.env` and fill in:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `FRONTEND_URL` (e.g. `http://localhost:5173` for password reset redirects)
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
3. Run schema and seed against your Supabase project:
   ```
   backend/supabase/schema.sql
    backend/supabase/migrations/*.sql
   backend/supabase/seed.sql
   ```
4. Install and run backend:
   ```
   cd backend && pnpm install && pnpm dev
   ```
5. Install and run frontend:
   ```
   cd frontend && pnpm install && pnpm dev
   ```

---

## Demo

> Demo video and screenshots will be added before the submission deadline.

---

## Limitations

- Specialist availability is mocked — no real scheduling system integration
- Not connected to real EHR systems — all patient data is synthetic
- AI extraction quality depends on completeness of clinical notes
- Email delivery uses Resend when credentials are configured
