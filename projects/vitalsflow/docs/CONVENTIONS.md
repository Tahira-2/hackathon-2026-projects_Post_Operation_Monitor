# VitalsFlow — Conventions
# Feed this file to your AI assistant before writing ANY code in this project.

---

## Project Identity

- **Project name:** VitalsFlow
- **Purpose:** AI-powered clinical triage using HL7 FHIR + NEWS2 protocol
- **Hackathon:** CareDevi AI Innovation Hackathon 2026
- **Track:** AI Patient Triage
- **Deadline:** April 27, 2026 at 2:45 AM NPT

---

## Repository Structure

```
projects/vitalsflow/
├── README.md
├── responsible-ai.md
├── src/
│   ├── backend/        ← FastAPI (Python 3.12)
│   └── frontend/       ← Next.js 14 App Router (TypeScript)
└── demo/               ← Screenshots and video
```

All code lives inside `projects/vitalsflow/src/`.
Never put code in the repo root.

---

## Backend Conventions (FastAPI + Python)

### Language & Runtime
- Python 3.12
- FastAPI with Pydantic v2
- httpx for all HTTP calls (async only — never use requests)
- python-dotenv for environment variables

### File Naming
- snake_case for all Python files and functions
- PascalCase for Pydantic model class names
- Files map 1:1 to their responsibility — no catch-all utils.py

### Function Rules
- Every route function must be `async def`
- Every httpx call must use `async with httpx.AsyncClient(timeout=15.0)`
- Every function must have a try/except — never let exceptions bubble unhandled to the client
- Never use `requests` library — always `httpx`

### Error Handling
- Route errors → raise `HTTPException(status_code=..., detail=str(e))`
- Service errors → catch, log with print(), raise descriptive exception
- LLM parse failures → return safe fallback TriageOutput (never crash)
- FHIR fetch failures → raise with message including the patient_id

### Environment Variables
- Read with `os.getenv("VAR_NAME", "default")`
- Load at app startup with `load_dotenv()` in main.py
- Never hardcode API keys or URLs
- `.env` is gitignored — only `.env.example` is committed

### Pydantic Rules
- Use Pydantic v2 syntax (`model_validator`, `field_validator`)
- All models in `models/schemas.py` only
- Response models always declared on route decorator

### Imports Order (follow this exactly)
```python
# 1. Standard library
import os
import json
from datetime import datetime
from typing import Optional

# 2. Third-party
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# 3. Internal
from models.schemas import VitalsInput, TriageOutput
from services.fhir_client import get_patient
```

---

## Frontend Conventions (Next.js + TypeScript)

### Language & Runtime
- TypeScript strict mode — no `any` types
- Next.js 14 App Router — no Pages Router patterns
- Tailwind CSS only — no custom CSS files, no inline styles
- Shadcn/UI for all UI primitives
- Lucide React for all icons
- Recharts for all charts

### File Naming
- PascalCase for component files: `RiskBadge.tsx`
- camelCase for utility files: `api.ts`
- All components in `frontend/components/`
- All API calls in `frontend/lib/api.ts` only

### Component Rules
- Every interactive component needs `"use client"` at the top
- Server components (no interactivity) do NOT get `"use client"`
- Props interfaces defined at top of each file, named `[ComponentName]Props`
- Named exports only — no default exports except `page.tsx` and `layout.tsx`

### TypeScript Rules
- No `any` — use `unknown` and narrow, or define proper interfaces
- All API response shapes defined as interfaces in `lib/api.ts`
- All async functions return typed Promises
- Use optional chaining `?.` and nullish coalescing `??` liberally

### Styling Rules
- Dark theme: base background `bg-slate-950`, cards `bg-slate-900`
- Primary accent: blue (`blue-500`, `blue-600`)
- Critical/danger: red (`red-500`, `red-100`, `red-800`)
- Warning/urgent: amber (`amber-500`, `amber-100`, `amber-800`)
- Success/routine: green (`green-500`, `green-100`, `green-800`)
- All text on dark: `text-slate-100` primary, `text-slate-400` muted
- Border color: `border-slate-800`
- Never use purple gradients or generic AI aesthetics

### State Management
- useState and useCallback only — no Redux, no Zustand
- Lift state to page.tsx — components receive props, don't fetch their own data
- Loading states: always show Skeleton or spinner, never blank UI

### Import Order (follow this exactly)
```typescript
// 1. React
import { useState, useCallback } from "react"

// 2. Next.js
import { useRouter } from "next/navigation"

// 3. Third-party
import { Activity } from "lucide-react"
import { LineChart } from "recharts"

// 4. Shadcn
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// 5. Internal
import { RiskBadge } from "@/components/RiskBadge"
import { runTriage, VitalsPayload } from "@/lib/api"
```

---

## Shared Conventions

### Git Commit Messages
Always use this format: `type: short description`

Types: `feat`, `fix`, `docs`, `deploy`, `refactor`, `test`

Examples:
```
feat: FHIR client — async Patient and Observation fetch
feat: normalizer — FHIR JSON to clinical summary string
feat: Gemini agent — NEWS2 triage scoring with structured output
fix: Pydantic fallback on malformed LLM JSON
deploy: Render backend live — health check passing
docs: README updated with live Vercel and Render URLs
```

Commit every 45–60 minutes. Commit history is scored by judges.

### What Never Gets Committed
- `.env` files (only `.env.example`)
- `venv/` folder
- `node_modules/`
- `.next/` build output
- Any file with real API keys

### Clinical Safety Rule
Every AI-generated suggestion requires explicit clinician
Approve or Dismiss action. Nothing happens autonomously.
This must be maintained in all UI implementations.
