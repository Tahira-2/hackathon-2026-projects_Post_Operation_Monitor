# TriageTech — System Architecture

## Overview

TriageTech is a decoupled web application with a **FastAPI Python backend** and a **React PWA frontend**. It is designed for low-bandwidth conditions and runs fully in-browser without any login or data storage.

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                   USER DEVICE (Browser / PWA)            │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │              React Frontend (CRA + PWA)            │  │
│  │                                                    │  │
│  │  SymptomInput ──► App.jsx ──► TriageResult         │  │
│  │  (voice/text)    (state)    (color-coded card)     │  │
│  │                    │                               │  │
│  │  LanguageToggle    │         ClinicMap             │  │
│  │  (EN/नेपाली)       │         (Leaflet.js)          │  │
│  └────────────────────┼───────────────────────────────┘  │
│                       │ HTTP / JSON                       │
└───────────────────────┼──────────────────────────────────┘
                        │
           ┌────────────▼────────────┐
           │   FastAPI Backend       │
           │   (Python 3.11)         │
           │                         │
           │  POST /triage/assess    │
           │  ├── nepali_nlp.py      │◄── Nepali→English translate
           │  └── triage_engine.py   │◄── Rule engine (RED/YELLOW/GREEN)
           │                         │
           │  POST /translate/symptoms│◄── Vocabulary endpoint
           │                         │
           │  GET /clinics/nearest   │◄── Haversine distance sort
           │  └── nepal_clinics.json │◄── 20 public health facilities
           │                         │
           │  GET /triage/symptoms/list│◄ Autocomplete data
           └─────────────────────────┘
```

---

## Data Flow

1. **User** types or speaks symptoms in English or Nepali.
2. **Frontend** sends `POST /triage/assess` with symptoms, age, gender, duration.
3. **Backend** auto-detects language → translates Nepali to English → runs rule engine.
4. **Rule Engine** checks RED flags → matches condition patterns → classifies severity.
5. **Response** returns severity, advice (bilingual), conditions, confidence score.
6. **Frontend** renders color-coded result + clinic finder.
7. **Clinic Finder** uses browser geolocation → `GET /clinics/nearest` → renders Leaflet map.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Backend framework | FastAPI 0.111 |
| Language | Python 3.11 |
| Data validation | Pydantic v2 |
| Server | Uvicorn |
| Frontend framework | React 18 (CRA) |
| Map | Leaflet.js 1.9 |
| Styling | Vanilla CSS (dark mode, CSS variables) |
| i18n | Static JSON (en.json, ne.json) |
| PWA | Web App Manifest + Service Worker |
| Containerization | Docker |

---

## Key Design Decisions

- **No database**: All data is file-based (JSON). Keeps deployment simple and free of privacy concerns.
- **No auth**: Tool is anonymous. No PII collected or stored.
- **Rule-based engine**: Deterministic and auditable — critical for a medical triage context where explainability matters.
- **Offline-capable**: PWA manifest enables installation. Leaflet tiles cached after first load.
- **Bilingual at every layer**: Language detection at backend, UI strings at frontend, voice locale per language.
