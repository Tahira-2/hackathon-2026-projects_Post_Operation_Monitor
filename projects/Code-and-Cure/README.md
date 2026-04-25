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

CureIT is a lightweight, AI-assisted clinical documentation and scheduling platform designed specifically for small healthcare practices and independent practitioners. It streamlines patient management, enhances clinical note-taking, and improves overall workflow efficiency without requiring complex enterprise-level infrastructure.

The system enables:

Doctor Discovery & Scheduling
Patients can search for doctors using location filters and availability data, then book appointments through an integrated scheduling system.
Structured Patient Intake
Patients provide medical history, allergies, and symptoms through guided input forms before consultations.
Real-Time Consultation Support
Consultation sessions are recorded as structured notes during the session, improving documentation consistency.
Standardized Medical Record Formatting
Consultation data is organized into structured formats compatible with healthcare data standards such as FHIR.
Calendar Synchronization
Booked appointments are automatically reflected in both patient and doctor calendars.

Tech Stack – Technologies, frameworks, and tools used.

Frontend
TypeScript
React / Next.js
Tailwind CSS
Google Maps API - Doctor search and location visualization
Calendly API - Appointment scheduling

Backend
Python (FastAPI)
Node.js
OAuth 2.0 Authentication
WebRTC - Real-time communication support

Healthcare Data Integration
FHIR (Fast Healthcare Interoperability Resources) - Primary standard
HL7 (Optional) - Legacy compatibility support

Database
Supabase (PostgreSQL)

Security Considerations

The system follows secure design practices aligned with healthcare software expectations.

Key measures:
OAuth based authentication
Role-based access control
Encrypted data transmission
Secure API communication
Activity logging for traceability

Designed with awareness of regulations such as:
HIPAA
Setup Instructions - How to run your project locally.

1) Environment variables
- Copy `.env.example` to `.env`.
- Fill in:
  - `SUPABASE_URL`
  - `SUPABASE_KEY`
  - `JWT_SECRET`
  - `GOOGLE_MAPS_KEY`
  - `NEXT_PUBLIC_API_URL`

2) Create database schema in Supabase
- Open Supabase SQL Editor.
- Run `src/database/schema.sql`.
- This creates all project tables, indexes, and permissive RLS policies.

3) Seed demo data
- Run `src/database/seed.sql` in Supabase SQL Editor.
- Seed includes:
  - 3 doctor accounts and profiles (Dermatology, Cardiology, Neurology)
  - 2 patient accounts
  - 1 completed appointment
  - 1 intake form
  - 1 approved SOAP note
  - 1 FHIR record

4) Database client wrappers
- Shared client and wrappers are in `src/database/db_client.py`.
- Backend routes should call wrapper functions from this file (not direct SQL).

5) Quick verification
- Confirm you can read a doctor list and a user by email from Python:
  - `get_doctors(None, None, None)`
  - `get_user_by_email("patient.one@test.com")`

Demo - Link to a demo video, live deployment, or screenshots.
refs/rewritten/origin-Eric-2
