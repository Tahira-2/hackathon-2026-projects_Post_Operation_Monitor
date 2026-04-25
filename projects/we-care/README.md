# RefAI — AI Referral Management Portal

## Team
| Name | GitHub |
|---|---|
| Arjun Giri 
| Anil 

**Team Name:** We Care
**Hackathon:** CareDevi AI Innovation Hackathon 2026

---

## Problem Statement

Patient referrals in healthcare are largely manual — doctors write free-text notes, staff transcribe them, and there is no unified way to track whether a referral was received, accepted, or completed. This leads to delayed care, lost referrals, and poor patient outcomes.

---

## Solution

**RefAI** is an AI-powered referral management portal that:

1. **Auto-fills referral details** — Doctors type free-text clinical notes; AI extracts structured data (patient info, diagnosis, urgency, required specialty).
2. **Suggests the best specialist** — Based on extracted diagnosis and required specialty.
3. **Tracks referral status end-to-end** — From submission to specialist acceptance, every step is visible on a live dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, TailwindCSS |
| Backend | Node.js, TypeScript |
| Database | Supabase (PostgreSQL + Auth) |
| AI | Google Gemini API (Gemini 1.5 Flash) |

---

## Architecture

```
Doctor (Web App)
      ↓
React Frontend (TypeScript + TailwindCSS)
      ↓
Node.js Backend API
      ↓
Gemini API ←→ Free-text extraction & specialist suggestion
      ↓
Supabase (referral records, specialist profiles, status tracking)
```

---

## Setup Instructions

1. Clone this repository
2. Copy `.env.example` to `.env` and fill in:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
3. Install frontend dependencies:
   ```
   cd src/frontend && npm install
   ```
4. Install backend dependencies:
   ```
   cd src/backend && npm install
   ```
5. Run backend: `npm run dev` inside `src/backend`
6. Run frontend: `npm run dev` inside `src/frontend`

---

## Demo

> Demo video and screenshots will be added before submission deadline.

---

## Limitations

- Specialist availability is mocked — real scheduling integration is out of scope
- Not connected to real EHR systems; all patient data is synthetic/demo only
- AI extraction requires reasonably complete clinical notes to work well
