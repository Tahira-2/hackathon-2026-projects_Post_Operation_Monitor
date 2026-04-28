# VitalsFlow — Deployment Guide
# Feed this file to your AI when deploying to Render or Vercel.
# Do this during Hours 26–30 of the hackathon.

---

## Overview

| Service | Platform | Root directory | URL |
|---|---|---|---|
| Backend (FastAPI) | Render (free) | `projects/vitalsflow/src/backend` | `https://vitalsflow-api.onrender.com` |
| Frontend (Next.js) | Vercel (free) | `projects/vitalsflow/src/frontend` | `https://vitalsflow.vercel.app` |

Both auto-deploy on every push to your GitHub fork.

---

## Step 1 — Deploy Backend to Render

### 1.1 Create account
Go to render.com → Sign up with GitHub

### 1.2 New Web Service
Dashboard → New → Web Service → Connect GitHub → Select `hackathon-2026-projects`

### 1.3 Configure
| Setting | Value |
|---|---|
| Name | `vitalsflow-api` |
| Root Directory | `projects/vitalsflow/src/backend` |
| Environment | `Python 3` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Instance Type | Free |

### 1.4 Environment Variables
In Render dashboard → Environment tab → Add:

| Key | Value |
|---|---|
| `GEMINI_API_KEY` | your actual Gemini key |
| `FHIR_BASE_URL` | `http://hapi.fhir.org/baseR4` |

### 1.5 Deploy
Click "Create Web Service" → wait 3–5 minutes for first deploy

### 1.6 Verify
```bash
curl https://vitalsflow-api.onrender.com/health
# Expected: {"status":"ok","service":"VitalsFlow API"}
```

### 1.7 Get your URL
Copy the URL from Render dashboard — looks like:
`https://vitalsflow-api.onrender.com`

---

## Step 2 — Deploy Frontend to Vercel

### 2.1 Create account
Go to vercel.com → Sign up with GitHub

### 2.2 Import project
Dashboard → Add New → Project → Import `hackathon-2026-projects`

### 2.3 Configure
| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Root Directory | `projects/vitalsflow/src/frontend` |
| Build Command | `npm run build` (auto-detected) |
| Output Directory | `.next` (auto-detected) |

### 2.4 Environment Variables
Before clicking Deploy, add:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://vitalsflow-api.onrender.com` |

### 2.5 Deploy
Click Deploy → wait 2–3 minutes

### 2.6 Verify
Visit your Vercel URL → app should load
Search for a patient → results should appear
Run triage → result should appear

### 2.7 Get your URL
Copy from Vercel dashboard — looks like:
`https://vitalsflow.vercel.app`

---

## Step 3 — Update CORS on Backend

After Vercel gives you the real URL, update `backend/main.py`:

```python
allow_origins = [
    "http://localhost:3000",
    "https://vitalsflow.vercel.app",        # update if different
    "https://vitalsflow-abc123.vercel.app", # add preview URL if needed
]
```

Commit and push → Render auto-redeploys.

---

## Step 4 — Update README with Live URLs

In `projects/vitalsflow/README.md`, update:
```markdown
> **Live URL:** https://vitalsflow.vercel.app
> **API:** https://vitalsflow-api.onrender.com/docs
```

---

## Critical: Render Cold Start Problem

Render free tier **sleeps after 15 minutes of inactivity**.
First request after sleep takes **25–35 seconds**.

**Fix already in the frontend** (TASK F9 adds keepalive ping).

**Before your demo:** manually ping the backend 5 minutes before your slot:
```bash
curl https://vitalsflow-api.onrender.com/health
```

If it's slow, wait 35 seconds and try again. It will wake up.

---

## Troubleshooting

### Backend won't start on Render
Check Render logs (Dashboard → your service → Logs tab)

Common causes:
- Missing `GEMINI_API_KEY` env var → add in Render dashboard
- Import error in Python files → check logs for traceback
- Wrong root directory → verify it's `projects/vitalsflow/src/backend`

### Frontend can't reach backend (CORS error)
Browser devtools → Network tab → look for red requests → check Response headers

Fix: add your Vercel URL to `allow_origins` in `main.py` → push → wait for Render redeploy

### Vercel build fails
Check build logs in Vercel dashboard
Common cause: TypeScript errors → fix the error shown in logs

### Patient search returns empty
HAPI FHIR public server may be slow or down.
Test directly: `http://hapi.fhir.org/baseR4/Patient?name=Smith&_count=3`
If that's empty too, the server is down — use hardcoded fallback patients.

---

## Hardcoded Fallback Patients (if HAPI is slow during demo)

Add this to `frontend/lib/api.ts` as a backup:

```typescript
export const FALLBACK_PATIENTS: Patient[] = [
  { id: "592011", name: "John Smith", dob: "1957-03-14", gender: "male" },
  { id: "592012", name: "Mary Johnson", dob: "1965-07-22", gender: "female" },
  { id: "592013", name: "Robert Davis", dob: "1948-11-05", gender: "male" },
]
```

In `page.tsx` handleSearch, if searchPatients returns [], use FALLBACK_PATIENTS.

---

## Pre-Demo Checklist (Hour 35 — 1 hour before presenting)

```
□ curl https://vitalsflow-api.onrender.com/health → 200 ok
□ Visit https://vitalsflow.vercel.app → page loads
□ Search "Smith" → patient list appears
□ Select patient → summary loads
□ Submit vitals → triage result appears with risk badge
□ Approve one action → turns green
□ Dismiss one action → fades out
□ No console errors in browser devtools
□ Demo rehearsed on THIS device with THIS browser
□ Fallback patient IDs written down on paper
□ Render backend pinged — awake and fast
```
