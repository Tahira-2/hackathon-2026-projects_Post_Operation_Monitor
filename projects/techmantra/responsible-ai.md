# Responsible AI Documentation
### MediTriage — AI Patient Triage Assistant
### CareDevi AI Innovation Hackathon 2026

---

## Overview

MediTriage uses artificial intelligence to assist patients in understanding their symptoms and determining the appropriate level of care. Because this application operates in a healthcare context where errors can have serious consequences, we have made deliberate design choices to maximize safety, minimize harm, and be transparent about the system's limitations.

This document covers our model choices, data sources, bias considerations, failure cases, privacy approach, and the safeguards we have built into every layer of the system.

---

## Model Choices and Rationale

### Primary LLM — MedGemma via Ollama
**Model:** alibayram/medgemma
**Inference:** Local via Ollama — runs entirely on-device

Why MedGemma:
- MedGemma is a medical-domain model fine-tuned specifically for healthcare 
  and clinical reasoning tasks — significantly more appropriate for symptom 
  triage than a general-purpose model like Mistral
- Runs locally without requiring an external API — patient symptom data 
  never leaves the device
- Open weights allow inspection and auditability
- Chosen specifically because medical fine-tuning reduces hallucination 
  risk on clinical content compared to general LLMs

**Why local inference:**
Patient symptoms are sensitive personal health information. Sending this data to an external LLM API creates privacy risks including data logging, breach exposure, and potential use for model training. Running inference locally eliminates these risks entirely. For a healthcare application, local inference is not just a technical choice — it is an ethical requirement.

**Safety constraint applied:**
The LLM is given a system prompt that instructs it to answer only from retrieved medical documents. It cannot draw on its training memory for medical facts. If retrieved documents do not contain enough information, the model is instructed to respond with a low confidence score rather than speculate. This is the most important safety guardrail in the system.

### Clinical NER — medspaCy with TargetRule

**Model:** medspaCy clinical pipeline with custom TargetRule symptom definitions

**Why medspaCy over general spaCy:**
General-purpose NLP models like spaCy's `en_core_web_sm` are trained on news articles and web text. They do not understand clinical language patterns. A general model will fail to correctly handle:
- Negation: "patient denies chest pain" → chest pain is NOT present
- Historical context: "had a heart attack last year" → not a current symptom
- Uncertainty: "might have a fever" → symptom is uncertain, not confirmed

medspaCy's ConText algorithm was designed specifically for clinical text and correctly handles all three patterns. Using the wrong NLP model in a medical context is a patient safety issue, not just an accuracy issue.

**Limitation acknowledged:**
Our symptom list in TargetRule is manually curated and covers approximately 25 common symptoms and conditions. Rare or highly specialized conditions outside this list may not be correctly extracted. In these cases the raw symptom text is still passed to the LLM, which provides a secondary extraction layer.

### Embedding Model — pritamdeka/S-PubMedBert-MS-MARCO

**Model selection process:**
- Initial trial: `all-MiniLM-L6-v2` (general-purpose embedding model, fast and lightweight)
- Observed issue: retrieval quality was not reliable enough for symptom-to-medical-document matching
- Final decision: switched to `pritamdeka/S-PubMedBert-MS-MARCO`

**Why this model:**
Standard sentence transformers are trained on general text. Medical retrieval requires understanding biomedical terminology. S-PubMedBert is fine-tuned on PubMed biomedical text and the MS-MARCO retrieval dataset, making it significantly more accurate at retrieving relevant medical documents for clinical queries than general embedding models.

**Why the switch improved results:**
- The model is trained on biomedical language (PubMed), so it better understands clinical terms and symptom phrasing
- It is also fine-tuned for retrieval (MS-MARCO), which directly matches our RAG use case
- It can be downloaded directly from Hugging Face without a token in our current setup

---

## Data Sources

### Medical Knowledge Base (RAG Sources)

All medical content used for diagnosis grounding comes from:

| Source | Type | URL |
|---|---|---|
| MedlinePlus (NIH) | Consumer health information | medlineplus.gov |
| CDC | Disease guidelines and emergency symptoms | cdc.gov |

These sources were selected because they are peer-reviewed, maintained by credible government health institutions, freely available for educational use, and regularly updated with current medical consensus.

**No proprietary clinical databases, private patient records, or unverified internet sources are used.**

### Patient Data

All patient data entered into the app is:
- Stored locally in SQLite on the device running the app
- Never transmitted to external servers
- Never used for model training
- Structured in FHIR R4 format for interoperability

### Test Data

Testing during development uses internally curated synthetic triage scenarios in `src/test_data/test_cases.json` (20 cases covering HIGH/MEDIUM/LOW risk tiers), plus pipeline evaluation outputs in `demo/evaluation_results.json` and `demo/evaluation_results.md`.

These cases are designed to stress key triage behaviors such as emergency escalation, negation handling ("no chest pain"), noisy/typo input, and moderate-risk outpatient routing.

No real patient data was used at any point in development or testing.

---

## Bias Considerations

### Training Data Bias in the LLM

MedGemma and biomedical foundation models are still influenced by upstream medical literature and web-scale corpora. Those sources can underrepresent certain populations:

- Symptoms of heart attack in women differ from classic presentations and are less well-documented
- Certain conditions present differently across ethnic groups but this variation is underrepresented in training data
- Non-English symptom descriptions may be less accurately processed

**Mitigation:** By grounding the LLM in RAG-retrieved documents from MedlinePlus and CDC — sources that explicitly include diverse population guidance — we reduce the model's reliance on potentially biased training memory.

### Symptom Description Bias

Patients describe symptoms differently based on language proficiency, cultural background, education level, and familiarity with medical terminology. A patient who says "my head is pounding" and a patient who says "cephalgia" are describing the same symptom. Our medspaCy TargetRule list covers colloquial descriptions but may miss culturally specific symptom descriptions.

**Mitigation:** The raw symptom text is always passed to the LLM in addition to extracted entities, allowing the LLM to process descriptions that medspaCy did not extract.

**Evaluation signal:** In our curated evaluation set, a typo-heavy input ("aaa my stomch hrts rly bad") was under-triaged (expected MEDIUM, got LOW). This indicates robustness gaps for misspellings/informal text and motivates adding spelling normalization and broader symptom synonym coverage.

### Demographic Bias in Risk Assessment

The triage engine applies rule-based thresholds (confidence, severity, and symptom duration). However, risk profiles differ significantly by age, sex, and medical history. A confidence score of 0.7 for chest pain in a 55-year-old male with diabetes represents different clinical urgency than the same score in a 25-year-old female with no risk factors.

**Mitigation:** Patient age, known conditions, and allergies are included in every LLM prompt, giving the model demographic context for its assessment. This does not fully resolve the issue but reduces its impact.

### Acknowledged Limitation

We are a team of three developers building a hackathon prototype. We are not clinical experts. The bias analysis above reflects our best understanding but a production system would require review by licensed clinicians, medical ethicists, and representatives from diverse patient populations before deployment.

---

## Failure Cases and Safeguards

### Failure Case 1 — LLM Returns Low Confidence

**Scenario:** The retrieved medical documents do not closely match the patient's symptoms. The LLM returns a confidence score below 0.4.

**Safeguard:** The triage engine returns UNCERTAIN for any confidence score below 0.4. The app displays "We were unable to make a confident assessment — please consult a doctor directly." No diagnosis is shown. No remedy is suggested.

### Failure Case 2 — High Risk Keyword in Negated Context

**Scenario:** Patient types "I don't have chest pain." medspaCy correctly identifies "chest pain" as negated. However, the raw text still contains the words "chest pain."

**Safeguard:** medspaCy's ConText algorithm removes negated entities from the confirmed symptom list. The severity escalation check runs only on confirmed symptoms, not negated ones. The raw text includes the negation which the LLM also reads.

### Failure Case 3 — LLM Hallucinates Medical Information

**Scenario:** The LLM generates a diagnosis or remedy not supported by the retrieved documents.

**Safeguard:** The system prompt explicitly instructs the LLM: "Answer ONLY based on the retrieved medical documents provided. Never invent symptoms, treatments, or medical facts not in the documents." The confidence score and cited sources allow users to see what the diagnosis is based on. Every output includes a disclaimer.

### Failure Case 4 — Ollama Server Not Running

**Scenario:** User opens the app but forgot to start Ollama.

**Safeguard:** The app checks Ollama connection on startup and displays a clear error message with instructions. The app does not crash — it shows "Ollama is not running. Open a terminal and run: ollama serve."

### Failure Case 5 — RAG Returns No Documents

**Scenario:** ChromaDB has not been indexed yet or the symptom query matches nothing in the knowledge base.

**Safeguard:** If RAG returns empty docs, the LLM prompt includes a note that no documents were retrieved. The LLM is instructed to return a low confidence score in this case, triggering the UNCERTAIN fallback.

### Failure Case 6 — Patient Describes a True Emergency

**Scenario:** Patient has a heart attack and uses the app instead of calling 911.

**Safeguard:** Emergency keyword detection in medspaCy immediately escalates severity to HIGH regardless of LLM output. The results page shows a full-screen red emergency banner, a "Call 911" button (tel: link), and explicit text: "Do not drive yourself. Call emergency services now." The app never replaces emergency services — it routes to them.

### Failure Case 7 — Email or Calendar Integration Fails

**Scenario:** Google API is unavailable or credentials have expired.

**Safeguard:** All integration calls are wrapped in try/except blocks. If notification or calendar booking fails, the app logs the error and continues — the patient still sees their diagnosis and next steps. Integration failures are non-blocking.

### Failure Case 8 — Medium-Risk Under-Triage in Edge Presentations

**Scenario:** In evaluation, some moderate-risk cases were predicted as LOW (for example UTI-like symptom wording and typo-heavy abdominal pain text).

**Safeguard:** We treat these as known model limitations, surface clinical disclaimers on every output, and recommend medical follow-up whenever symptoms persist/worsen. We also use these misses to expand test coverage and improve symptom vocabulary/rules for future iterations.

---

## Privacy and Data Handling

| Data Type | Storage | Transmission | Retention |
|---|---|---|---|
| Patient name, age, health info | Local SQLite only | Never transmitted | Persists in local DB |
| Symptom text | Local SQLite only | Never transmitted | Saved per session |
| LLM inference (symptoms sent to Ollama) | Local process only | Never leaves device | Not persisted by Ollama |
| Diagnosis output | Local SQLite only | Never transmitted | Saved per session |
| Doctor email summary | Sent via Gmail API | Gmail servers | Per Google's retention policy |

**Patient health information is never sent to any external AI service.**

---

## Disclaimer

MediTriage is an AI-assisted triage tool built for educational and demonstration purposes at a hackathon. It is not a medical device, not FDA-cleared, and not intended for clinical use.

Every output from MediTriage includes the following disclaimer: "This is not a substitute for clinical judgment. Always consult a licensed healthcare professional."

MediTriage is designed to help patients understand their symptoms and get appropriate guidance on next steps. It is not designed to replace physicians, diagnose disease, or prescribe treatment.

In the event of a medical emergency, always call 911.

---

## Team Attestation

We the development team of MediTriage attest that:

- All medical content in our knowledge base comes from publicly available, credible health institutions
- No real patient data was used in development or testing
- We have made reasonable efforts to identify and mitigate bias and failure modes
- We understand this system requires clinical review before any real-world deployment
- Every AI output in our system includes a clinical disclaimer

**Team:** Jahnavi, Harshini, Megha
**Hackathon:** CareDevi AI Innovation Hackathon 2026
**Date:** April 2026