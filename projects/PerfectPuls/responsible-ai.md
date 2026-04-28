## 1. Data Sources & Privacy
Policy Pilot relies on high-integrity, structured data to provide healthcare advice.
- **Primary Data:** The system processes official **Summary of Benefits and Coverage (SBC)** documents provided by insurance carriers (e.g., Cigna). These are legal documents that serve as the "Ground Truth" for the Knowledge Graph.
- **Website Context:** The Chrome Extension extracts visible text from healthcare provider websites to identify intent (e.g., "Acupuncture") without accessing sensitive user browsing history or personal identifiers.
- **Privacy Policy:** No Personal Health Information (PHI) is stored. The system analyzes the *plan's* rules, not the *user's* medical records. All data in Neo4j is categorized by anonymized Policy IDs.

## 2. Model Choices & Rationale
We utilize a multi-model strategy to balance reasoning capability with operational speed:
- **Gemini 2.5 Pro (Extraction):** Chosen for its superior spatial reasoning and "Native JSON Mode." This is critical for accurately parsing complex, multi-page insurance tables where a single row misinterpretation could lead to financial errors.
- **Gemini-Embedding-2 (Search):** We utilize **3072-dimensional vectors** to ensure maximum semantic density. This high resolution is necessary to distinguish between similar medical terms (e.g., "Occupational Therapy" vs. "Physical Therapy") that have different coverage rules. Also removes complexity to run sentence transformer locally.
- **Gemini 1.5 Flash (Synthesizer):** Used for generating the final user advice. Its low-latency performance ensures the Chrome Extension side-panel feels responsive and "live."

## 3. Bias Considerations & Mitigations
AI in healthcare must be strictly grounded to avoid systemic bias or misinformation.
- **Grounding in Knowledge Graphs:** Unlike standard LLMs that "guess" based on training data, Policy Pilot is grounded in a **Neo4j Knowledge Graph**. If a service is not found in the graph, the model is instructed to state "I don't know" rather than hallucinating coverage.
- **Demographic Neutrality:** The system does not request or utilize user age, gender, or ethnicity for its analysis, ensuring that insurance advice remains purely based on the contract's legal terms.
- **Linguistic Bias:** We use standardized medical terminology mapping (e.g., mapping "Physical Therapy" to "Physiotherapy") to ensure consistency regardless of how a provider phrases a service on their website.

## 4. Failure Cases & Safeguards
We have identified potential failure points and implemented specific mitigations:
- **Edge Case Misinterpretation:** Complex legal "notes" in a PDF (e.g., "limit does not apply in specific counties") may be missed by the extraction. 
    - *Mitigation:* Every piece of advice includes a "Confidence Score" and a recommendation to verify with the provider.
- **PDF Extraction Errors:** If a PDF is password-protected or uses non-standard formatting, Gemini may return an empty graph. 
    - *Mitigation:* The backend includes validation checks to ensure the graph population is 100% before allowing analysis.
- **Ambiguous Intent:** If a website offers both "Medical Spa" and "Dermatology" services, the AI might get confused. 
    - *Mitigation:* The system identifies a "Matched Service" and displays it prominently so the user knows exactly what the AI is analyzing.

## 5. Transparency & Accountability
- **Human-in-the-loop:** The "Match Checklist" allows users to verify the AI's logic step-by-step.
- **Visual Evidence:** The interactive graph visualization provides a transparent window into the AI's "brain," showing exactly how the service connects to the payment requirement.
"""