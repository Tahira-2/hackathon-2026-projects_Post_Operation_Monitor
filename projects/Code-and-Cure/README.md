Project Name - CureIT

Team Members - Prajan Manoj Kumar Rekha (PrajanManojKumarRekha), Eric Cariaga (eCarCodes), Jessica C O'Bonna (jessic-o), Shayan Ali (CodewithShayan456)

Problem Statement -
Access to timely care is often delayed when patients cannot instantly find available doctors in their preferred area or specialty. This challenge is especially high for individual clinics and independent licensed practitioners who do not have large hospital-style operations or full admin teams. Patients need rapid booking with trusted doctors, while practitioners need lightweight workflows for consultation, documentation, and prescriptions without increasing overhead.

Solution -
CureIT is a prototype telehealth workflow platform focused on one clean end-to-end demo path:
- Patient enters symptoms (example: headache).
- System maps symptoms to a recommended specialty (example: Neurology) and can suggest nearby available doctors.
- Patient can choose and book a preferred licensed practitioner from any area if that practitioner has availability.
- If the preferred doctor is unavailable, the system can recommend the next available option.
- Patient books a short 15-30 minute consultation slot for chat or video call.
- Doctor views appointment, runs a consultation simulation, and generates a structured SOAP note.
- Doctor can issue a compliant digital prescription from the consultation workflow (general/non-controlled medicines only).
- Controlled substances are hard-blocked by policy in the virtual prescription path.
- Consultation data is routed through internal systems for consent/compliance, clinical signer review, and care navigation coordination.
- SOAP note and prescription data are converted into FHIR R4-style JSON bundle resources, including `Consent`, `Composition`, and `MedicationRequest`, for interoperable EMR export.

This project is a workflow/documentation prototype and is not a diagnostic tool. It is designed for hackathon speed with clear team boundaries across frontend, API, core logic, and database layers, and it targets independent clinics and licensed practitioners rather than hospital system workflows.

Tech Stack -
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- API Gateway: FastAPI, Pydantic
- Core Logic: Pure Python 3.12, dataclasses, deterministic rule-based processing (care navigation mapping, SOAP parsing, compliance-safe FHIR bundling)
- Database: Supabase (PostgreSQL)
- Data Standard: FHIR R4 JSON bundle (`Consent`, `Composition`, `MedicationRequest`)
- Security/Compliance Approach: role-based route separation, mock auth for demo, HIPAA-aware handling principles, and controlled-substance prescription blocking