Project Name - CureIT

HEAD
Team Members - Prajan Manoj Kumar Rekha (PrajanManojKumarRekha), Eric Cariaga (eCarCodes), Jessica C O'Bonna (jessic-o), Shayan Ali (CodewithShayan456)

Problem Statement -
Access to timely care is often delayed when patients cannot instantly find available doctors in their preferred area or specialty. This challenge is especially high for individual clinics and independent licensed practitioners who do not have large hospital-style operations or full admin teams. Patients need rapid booking with trusted doctors, while practitioners need lightweight workflows for consultation, documentation, and prescriptions without increasing overhead.

Solution -
CureIT is a prototype telehealth workflow platform focused on one clean end-to-end demo path:
- Patient enters a detailed free-text symptom description in the AI chatbox (for example headache, cold, rash, or mixed symptoms).
- System performs pattern-based triage on symptom cues and recommends an appropriate specialty/department with rationale.
- Patient can choose and book a preferred licensed practitioner from any area if that practitioner has availability.
- If the preferred doctor is unavailable, the system can recommend the next available option.
- Patient books a short 15-30 minute consultation slot for chat or video call.
- Doctor views appointment, runs a consultation simulation, and generates a structured SOAP note.
- Doctor can issue a compliant digital prescription from the consultation workflow (general/non-controlled medicines only).
- Controlled substances are hard-blocked by policy in the virtual prescription path.
- Consultation data is routed through internal systems for consent/compliance, clinical signer review, and care navigation coordination.
- SOAP notes are rendered into PDF review artifacts for cross-system clinical/legal review.
- Prescription artifacts can be generated as PDF with clinic/provider headstamp metadata (for example clinic name and licensed provider display details).
- SOAP note and prescription data are converted into FHIR R4-style JSON bundle resources, including `Consent`, `Composition`, and `MedicationRequest`, for interoperable EMR export.

Healthcare providers, especially small clinics and independent practitioners, face increasing administrative overload do to inefficient documentation, fragmented scheduling tools, and inconsistent clinical note-taking workflows.

Patient records are often scattered across multiple systems or stored in unstructured formats, making it difficult for providers to quickly access and interpret relevant medical history.
Scheduling appointments is frequently handled through disconnected platforms, leading to inefficiencies and double-booking risks. Additionally, clinicians spend a significant portion of their time manually writing or refining clinical notes, reducing time available for patient care.

These challenges reduce workflow efficiency, increased cognitive load for providers, and inconsistent clinical documentation quality across patient visits.
refs/rewritten/origin-Eric-2

This project is a workflow/documentation prototype and is not a diagnostic tool. It is designed for hackathon speed with clear team boundaries across frontend, API, core logic, and database layers, and it targets independent clinics and licensed practitioners rather than hospital system workflows.

HEAD
Tech Stack -
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- API Gateway: FastAPI, Pydantic
- Core Logic: Pure Python 3.12, dataclasses, deterministic rule-based processing (free-text triage, SOAP parsing, in-memory PDF rendering, compliance-safe FHIR bundling)
- Database: Supabase (PostgreSQL)
- Data Standard: FHIR R4 JSON bundle (`Consent`, `Composition`, `MedicationRequest`)
- Security/Compliance Approach: role-based route separation, mock auth for demo, HIPAA-aware handling principles, and controlled-substance prescription blocking