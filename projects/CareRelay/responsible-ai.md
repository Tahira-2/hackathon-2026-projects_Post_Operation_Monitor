# Responsible AI & Compliance Strategy

CareRelay is explicitly engineered with patient safety, data privacy, and regulatory adherence as foundational pillars. As a platform operating in the high-stakes healthcare environment, we implemented strict safeguards to prevent AI-induced clinical errors and to comply with US healthcare policy frameworks.

## 1. Data Sources & Privacy (HIPAA Compliance)
* **Synthetic Data by Design:** The entire CareRelay data ecosystem—both the structured FHIR payloads and the unstructured PDF clinical notes—is generated using **Synthea™** (an open-source synthetic patient generator). 
* **Safe Harbor Adherence:** Because the data is synthetic from birth, CareRelay inherently meets the HIPAA Safe Harbor de-identification standard. No real Protected Health Information (PHI) or Personally Identifiable Information (PII) is ever processed, stored, or transmitted by our system.
* **Security:** The system is designed around a "Minimum Necessary" data access principle. By default, the RAG (Retrieval-Augmented Generation) pipeline processes documents locally via `scikit-learn`'s `TF-IDF` vectorizer, minimizing the surface area for data exposure.

## 2. Model Choices & Zero-Hallucination RAG Architecture
To avoid the profound risks associated with Large Language Model (LLM) hallucinations in a clinical setting, we made intentional architectural constraints:

* **Strict Extraction, Not Diagnosis:** CareRelay is designed as a structurer of existing facts. The AI generates an "AI First Visit Brief" which is rigidly prompted to *only* summarize documented conditions, never to recommend a diagnostic path.
* **Lexical Document Grounding (TF-IDF vs Embeddings):** While semantic embeddings (like OpenAI's Ada) are powerful, they are prone to semantic "drift" and can falsely correlate unrelated medical terms. By utilizing `TF-IDF` for document retrieval in the PDF chat, the system performs a strict lexical match against the specific patient EHR.
* **Source Citations:** Every claim made by the clinical chat is required to supply a direct page citation to the source PDF. Clicking the citation opens the browser-native PDF viewer to the exact page, enforcing that a human physician remains the ultimate arbiter of truth.

## 3. Regulatory Posture: Software as a Medical Device (SaMD)
We rigorously enforce the boundary between **Clinical Decision Support (CDS)** and a Medical Device (which requires FDA clearance).
* Because CareRelay does not independently draw diagnostic conclusions or prompt the clinician to alter medication unprompted, it falls safely under the informational CDS umbrella.
* **OpenFDA Guardrails:** Our safety alert system pulls from the immutable **OpenFDA API**. It statically reports documented Black-box warnings and known interactions rather than relying on an LLM to "guess" drug incompatibilities. 

## 4. Bias Considerations & Failure Cases
* **Bias in Summarization:** Even when strictly extracting text, LLMs can exhibit demographic bias (e.g., summarizing pain differently based on the patient's documented race or gender). To mitigate this, our prompts are instructed to use objective, clinical terminology and adhere strictly to the ingested Synthea FHIR records.
* **Failure Cases (Extractive limits):** If the RAG pipeline fails to find a high-confidence match in the PDF or if the external LLM is unreachable, the system gracefully degrades. It explicitly outputs an *Extractive (LLM unavailable)* state, retrieving the raw snippet of text without attempting to smooth it into conversational language.
* **Visual Disclaimers:** All AI-summarized UI components (the Chat, the Brief) are explicitly branded with a visible "AI" icon and a persistent disclaimer stating the data is unverified and not for clinical action without human review.
