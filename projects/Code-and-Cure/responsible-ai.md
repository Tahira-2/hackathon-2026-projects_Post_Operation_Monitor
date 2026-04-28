# CareIT - Responsible AI Documentation

CareIT is a telehealth platform that connects solo medical practitioners with patients, and we use AI to streamline triage, clinical documentation, and interoperability. Because we operate in healthcare, we hold our AI work to a higher bar than we would in most other domains. Safety, fairness, and transparency are not nice-to-haves here. They are the baseline.

This document covers our Responsible AI posture across the four pillars of our architecture: Frontend, API Gateway, Core AI/Medical Logic, and Database/Security.

---

## 1. Data Sources

We took a deliberately conservative position on data, and the short version is that no real patient information was used at any point in this project.

* **Zero-shot and few-shot prompting.** Our AI Care Navigator (Symptom NLP) and our SOAP Note generator do not train on patient data. We rely on pre-trained foundation models (for example, Google Gemini or OpenAI) using strict zero-shot or few-shot prompts with synthetic examples.

* **Transcription audio.** Audio data processed for clinical documentation is held entirely in ephemeral memory. No audio recordings are permanently stored, and none are used to train acoustic models.

* **Simulated clinical data.** All FHIR R4 bundling and testing during development was conducted using synthetic patient data (MOCK_DB). No Real World Data (RWD) and no Protected Health Information (PHI) was used in the creation of our AI logic.

---

## 2. Model Choices

We picked each model for a specific job, and we kept the role of each one narrow on purpose.

* **Symptom triage (NLP).** We use a lightweight, high-speed LLM for initial symptom parsing to extract cues (for example, "headache" or "fever"). It acts strictly as a classifier that maps symptoms to specialties such as Neurology or General Practice. It is not a diagnostic tool, and we do not present it as one.

* **Speech-to-text (transcription).** We use a local Whisper-style model (or an equivalent secure API) for transcription. This gives us high accuracy on medical terminology while keeping data processing tightly controlled.

* **SOAP note generation.** We use an advanced LLM specifically prompted for medical summarization. The constraint is hard-coded into the system prompt: the model may only use information present in the transcript. It is explicitly forbidden from hallucinating medical advice or inferring symptoms that the patient did not say out loud.

---

## 3. Bias Considerations

We are a small team, so rather than make sweeping claims about bias mitigation we prefer to name the specific bias surfaces we have and describe what we put in place for each one.

* **Transcription bias.** Speech-to-text models are known to struggle with accents, dialects, and non-native speakers.

    *Mitigation:* We implemented a Human-in-the-loop (HITL) approval gate. The AI only produces a draft SOAP note. The doctor must manually review and edit the transcription and the SOAP draft before it can be approved and exported to the EMR.

* **Triage bias.** NLP symptom checkers can misread colloquial descriptions of pain, which carries a real risk of under-triaging marginalized groups.

    *Mitigation:* Our triage system acts only as a recommendation engine to help patients find the right specialist. It does not block care and it does not deny appointments. Patients can always manually select a doctor through the Mapbox Discovery tool regardless of what the AI recommends.

---

## 4. Failure Cases and Fallbacks

We tested the system against the failures we expected to actually encounter, and we list them here with the mitigation we put in place.

* **Mapbox / geolocation failures (patient portal).**

    *The failure:* The patient denies browser location permissions, has a strict ad-blocker that breaks Mapbox, or is on a slow 3G connection that causes the interactive map to fail. If the map is the only way to find a doctor, the patient is blocked from care.

    *Fallback / mitigation:* The UI is built on a split-screen layout. The text-based list of doctors on the left side always loads instantly from the API. The map is a progressive enhancement. If the map fails or if location access is denied, the UI gracefully falls back to showing doctors based on a manual zip code search.

* **Silent upload failures (clinical documentation).**

    *The failure:* A doctor drags and drops a two-hour video file (around 1 GB) into the upload zone, but the API has a 25 MB limit. If the UI just spins endlessly or throws a generic "Error 500", the doctor gets frustrated and abandons the platform.

    *Fallback / mitigation:* The drag-and-drop UI component performs immediate client-side validation. Before the request ever touches the backend API, the frontend checks the file size and type. If the file is too large, the UI instantly turns red and shows: *"File too large. Please upload an audio clip under 25MB."*
