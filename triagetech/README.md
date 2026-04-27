# TriageTech ⚕️

> AI-powered medical triage for Nepal — bilingual English & Nepali, offline-capable PWA.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)](https://python.org)

---

## Problem Statement

Nepal's healthcare system faces critical gaps in accessibility, especially in remote and rural areas. Patients often do not know whether their symptoms require immediate emergency care, a doctor visit, or simple home rest — leading to either dangerous under-treatment or unnecessary overcrowding of emergency departments.

**TriageTech** solves this by providing an AI-powered, bilingual (English + Nepali) symptom triage system that:
- Classifies symptoms into 🟢 Home Care / 🟡 See Doctor / 🔴 Emergency
- Explains the recommendation in both English and Nepali
- Finds the nearest clinic or hospital using the device's GPS
- Works as a PWA — installable on Android/iOS without an app store

---

## Architecture

```
User (Voice/Text Input)
        │
        ▼
React PWA Frontend (bilingual, offline-capable)
        │  POST /triage/assess
        ▼
FastAPI Backend ──► Nepali NLP ──► Triage Rule Engine
        │                                  │
        └── GET /clinics/nearest ◄── GeoJSON data (Nepal MoHP)
```

See [docs/architecture.md](docs/architecture.md) for full diagram and data flow.

---

## Data Sources

| Dataset | Source |
|---|---|
| Symptom–condition mapping | WHO ICD-10, NICE Guidelines |
| Red-flag clinical rules | WHO ETAT, AHA Emergency Guidelines |
| Nepal clinic coordinates | Nepal MoHP Health Facility Register |
| Nepali symptom vocabulary | NHRC documents + Unicode Devanagari standard |

---

## Limitations

- Rule-based engine — not a trained ML model (no patient data available)
- Nepali dialect support limited to standard Devanagari and common Romanized forms
- Clinic database contains 20 representative facilities — not exhaustive
- Voice recognition quality depends on browser and microphone

---

## Setup Guide

### Backend

```bash
cd src/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

### Docker
```bash
cd src/backend
docker build -t triagetech-api .
docker run -p 8000:8000 triagetech-api
```

### Frontend
```bash
cd src/frontend
npm install
npm start
```
App runs at: http://localhost:3000

---

## Team Credits

**Team TriageTech** — Hackathon 2025

| Role | Name | Contribution |
|---|---|---|
| Lead / Backend | **Sonam Acharya** | FastAPI triage engine, Nepali NLP, clinic API |
| Frontend Dev | **Dammaru Ballav Koirala** | React PWA, bilingual UI, Leaflet maps |
| AI/ML Lead | **Akash Dhimal** | Rule engine design, bias audit, responsible AI |
| UX / Docs | **Aaska Ghimere** | Architecture, clinical references, API spec |

---

## Responsible AI

See [responsible-ai.md](responsible-ai.md) for training data sources, bias analysis, failure modes, Nepali language equity, and misuse scenarios.

> ⚠️ This tool is for guidance only. Always consult a qualified healthcare professional.
