
# MediTriage — AI Patient Triage Assistant
### CareDevi AI Innovation Hackathon 2026 | Track: AI Patient Triage

---

## Team Members

| Name | GitHub |
|---|---|
| Megha | [https://github.com/meghakr1] |
| Jahnavi | [https://github.com/JaanviR] |
| Harshini | [https://github.com/HarshiniReddy1324] |


---

## Problem Statement

Every day, patients with serious conditions sit in waiting rooms behind patients with minor complaints — not because doctors don't care, but because there is no intelligent system routing them to the right level of care at the right time.

A patient with bacterial meningitis — stiff neck, high fever, sensitivity to light — waits alongside a patient with a runny nose. Every minute of delay in a meningitis case is life-threatening. Every unnecessary ER visit for a common cold wastes resources and delays care for someone who truly needs it.

Existing triage systems are manual, slow, and inconsistent. Patients who call a clinic describe their symptoms to a receptionist with no clinical training. Patients who search online get generic results with no personalization. There is no tool that combines clinical NLP, grounded AI reasoning, and intelligent routing in a single accessible interface.

This problem is worst for the 60 million Americans in healthcare desert areas — people who can't easily call a doctor and have no trusted source to tell them how serious their symptoms are.

---

## Solution

MediTriage is an AI-powered patient triage assistant that analyzes symptoms using clinical NLP and RAG-grounded LLM inference to route patients to the right level of care — instantly, safely, and with full source citations.

### How It Works

**Step 1 — Patient Signup**
The patient enters their personal details, health history, allergies, and their doctor's contact information. This is stored locally in FHIR R4-compatible format — the international standard for healthcare data interoperability.

**Step 2 — Symptom Input**
The patient describes their symptoms via text or voice recording. Whisper STT transcribes voice input to text. medspaCy's clinical NER pipeline extracts confirmed symptoms, negated symptoms ("no fever"), and flags high-risk emergency keywords.

**Step 3 — RAG Retrieval**
LangChain queries a ChromaDB vector database indexed from MedlinePlus and CDC medical documents. The top 5 most relevant medical article chunks are retrieved based on semantic similarity to the patient's symptoms.

**Step 4 — AI Inference**
MedGemma (alibayram/medgemma via Ollama) runs entirely locally on-device. It receives the patient profile, confirmed symptoms, negated symptoms, and retrieved medical documents. It is instructed via system prompt to answer only from the retrieved documents — never from training memory. It returns a structured JSON diagnosis with top conditions, confidence score, risk tier, warnings, and cited sources.

**Step 5 — Risk Triage and Routing**
The triage engine combines LLM confidence, symptom severity, and duration-aware escalation rules:
- **LOW** — Home care with remedies cited from MedlinePlus and CDC
- **MEDIUM** — Automated doctor appointment booking via Google Calendar + email summary to doctor via Gmail
- **HIGH** — Full-screen emergency alert with direct 911 call button
- **UNCERTAIN** — Confidence below 40% triggers "please consult a doctor" fallback

**Step 6 — Doctor Dashboard**
A separate view for healthcare providers shows all patient sessions sorted by risk tier. High risk patients appear at the top. Receptionists can use this to reprioritize appointments based on clinical urgency rather than booking order.

### What Makes This Different

- **Patient data never leaves the device** — MedGemma runs locally via Ollama. No symptom data is sent to any external AI API.
- **RAG-grounded diagnosis** — The LLM cannot hallucinate because it can only answer from retrieved CDC and MedlinePlus documents.
- **Clinical NER** — medspaCy's ConText algorithm correctly handles negation ("patient denies chest pain") and historical context ("had a heart attack last year") — patterns that general NLP models completely miss.
- **Safety override** — Emergency keywords always escalate to HIGH risk regardless of LLM confidence score.
- **FHIR interoperability** — Patient data is stored in FHIR R4-compatible format, making MediTriage data compatible with real hospital systems.

---

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | Streamlit |
| Backend | Python |
| LLM | alibayram/medgemma via Ollama (local inference) |
| Clinical NER | medspaCy with TargetRule symptom matching |
| RAG Framework | LangChain + ChromaDB |
| Embeddings | pritamdeka/S-PubMedBert-MS-MARCO |
| Database | SQLite (FHIR-structured) |
| Speech to Text | OpenAI Whisper (base model, local) |
| Text to Speech | pyttsx3 (local) |
| Notifications | Gmail API |
| Appointments | Google Calendar API |
| Test Data | Manually curated synthetic triage scenarios (`src/test_data/test_cases.json`) |

---

## Project Structure

```
techmantra/
├── demo/
│   ├── evaluation.py              Demo/evaluation helper script
│   ├── evaluation_results.json    Structured evaluation output
│   ├── evaluation_results.md      Evaluation outputs and notes
│   └── test_demo.py               End-to-end demo test script
├── src/
│   ├── app/
│   │   ├── main.py                Streamlit entry point and navigation
│   │   └── session_state.py       Global session state management
│   ├── core/
│   │   ├── __init__.py
│   │   ├── llm.py                 MedGemma inference via Ollama
│   │   ├── ner.py                 medspaCy clinical NER pipeline
│   │   ├── preprocessing.py       Symptom payload builder
│   │   ├── rag.py                 ChromaDB retrieval via LangChain
│   │   └── triage.py              Risk engine and remedy lookup
│   ├── db/
│   │   ├── __init__.py
│   │   ├── db.py                  SQLite connection and queries
│   │   ├── remedy_db.json         Home remedy seed data
│   │   └── schema.sql             Database schema
│   ├── integrations/
│   │   ├── __init__.py
│   │   ├── calendar_api.py        Google Calendar appointment booking
│   │   ├── creds_verification.py  Google OAuth handler
│   │   ├── fhir_builder.py        FHIR resource constructors
│   │   └── notifications.py       Gmail API doctor notifications
│   ├── pages/
│   │   ├── doctor_dashboard.py    Provider view sorted by urgency
│   │   ├── results.py             Diagnosis output and risk routing
│   │   ├── signup.py              Patient profile form
│   │   └── symptoms.py            Symptom input and analysis
│   ├── rag_data/
│   │   ├── ingest.py              Document indexing into ChromaDB
│   │   └── sources/
│   │       ├── cdc/               CDC guideline text files
│   │       └── medlineplus/       MedlinePlus article text files
│   ├── test_data/
│   │   └── test_cases.json        Evaluation test cases
├── README.md                      This file
├── responsible-ai.md              Responsible AI documentation
├── requirements.txt               All Python dependencies
└── .gitignore
```

---

## Setup Instructions

### Prerequisites

- Python 3.10 or higher
- [Ollama](https://ollama.com/download) installed on your machine
- Google Cloud project with Calendar API and Gmail API enabled
- `credentials.json` downloaded from Google Cloud Console

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-team/techmantra.git
cd techmantra
```

### Step 2 — Create and Activate Virtual Environment

```bash
python -m venv hackathon

# Mac / Linux
source hackathon/bin/activate

# Windows
hackathon\Scripts\activate
```

### Step 3 — Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4 — Pull MedGemma via Ollama

```bash
# Pull the medical LLM
ollama pull alibayram/medgemma

# Start the Ollama server — keep this terminal open the entire time
ollama serve
```

### Step 5 — Set Up Environment Variables

Create a `.env` file in the project root:

```
DATABASE_PATH=src/db/triage.db
OLLAMA_MODEL=alibayram/medgemma
OLLAMA_HOST=http://localhost:11434
```

### Step 6 — Initialize the Database

```bash
python src/db/db.py
# Expected output: Database initialized successfully.
```

### Step 7 — Index Medical Documents into ChromaDB

```bash
python src/rag_data/ingest.py
# Expected output: All documents indexed into ChromaDB.
```

### Step 8 — Set Up Google Credentials

Place your `credentials.json` in the project root, then:

```bash
python src/integrations/creds_verification.py
# A browser window opens — log in with your Google account
# token.json is created automatically
```

### Step 9 — Run the App

```bash
streamlit run src/app/main.py
```

Open `http://localhost:8501` in your browser.

### Step 10 — Verify Each Component (Optional)

```bash
python src/core/ner.py            # Test clinical NER
python src/core/preprocessing.py  # Test payload builder
python src/core/rag.py            # Test RAG retrieval
python src/core/llm.py            # Test LLM inference
python src/core/triage.py         # Test risk engine
python demo/test_demo.py          # End-to-end demo flow
python demo/evaluation.py         # Batch evaluation on test cases
```

---

## Data Sources

All medical knowledge used for RAG retrieval comes from:

- **MedlinePlus** (National Institutes of Health) — `medlineplus.gov`
- **CDC** (Centers for Disease Control and Prevention) — `cdc.gov`
- **Internal synthetic evaluation set** — `src/test_data/test_cases.json` (20 curated triage scenarios across HIGH/MEDIUM/LOW)

---

## Demo

> Add your demo video link and screenshots here before final submission.

**Demo Video:** [Add link here]

**Recommended Demo Flow:**

1. Open the app at `http://localhost:8501`
2. Complete patient signup with name, age, diabetes as known condition, penicillin as allergy, and doctor details
3. Navigate to Check Symptoms and type:
   `"I have a sudden severe headache, high fever of 103, and my neck is very stiff. I also feel sensitive to light. No nausea."`
4. Click Analyze and show the four-step pipeline running
5. Show the HIGH RISK result with the 911 emergency prompt
6. Navigate to Doctor Dashboard — show patient sorted at top by risk
7. Start a second session with: `"I have a runny nose, mild cough, and a slight fever for 2 days"`
8. Show the LOW RISK result with home care remedies cited from MedlinePlus

---

## Known Limitations

- MedGemma inference speed depends on device hardware — 8GB+ RAM recommended
- medspaCy TargetRule currently covers approximately 25 curated symptom phrases — uncommon phrasings rely on raw text + LLM context
- Remedy database covers 10 common conditions — uncommon diagnoses fall back to LLM-generated suggestions
- Google Calendar booking defaults to 2 hours from current time — production would use proper scheduling
- Voice input requires clear audio — background noise reduces Whisper accuracy
- This is a triage tool, not a diagnostic tool — always consult a licensed physician

---

## Evaluation Results

We evaluated MediTriage on 50 curated test cases covering HIGH emergencies, MEDIUM outpatient cases, LOW home care, bias testing, and RAG fallback scenarios.

| Metric | Result |
|---|---|
| Overall Accuracy | 79.1% (43 regular cases) |
| HIGH Risk Recall | 100% — 14/14 emergencies caught |
| RAG Fallback Handling | 71.4% — graceful degradation on uncovered conditions |
| Age Bias | None detected — paired tests 38 vs 39 |
| Gender Bias | None detected — atypical female cardiac caught correctly |

Full report: [`demo/evaluation_results.md`](./demo/evaluation_results.md)

---

## Responsible AI

See [responsible-ai.md](./responsible-ai.md) for full documentation covering model choices, data sources, bias considerations, failure cases, and privacy approach.

**Key safeguards built into every layer:**
- LLM answers only from retrieved medical documents — cannot hallucinate
- Confidence below 40% triggers "please consult a doctor" fallback — no diagnosis shown
- Emergency keywords always escalate to HIGH risk regardless of LLM confidence score
- Patient data never leaves the device — all inference is local via Ollama
- Every single output includes a clinical disclaimer
- No real patient data was used at any point in development or testing