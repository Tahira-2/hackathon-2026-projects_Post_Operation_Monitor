Project Name - CureIT
Team Members- Prajan Manoj Kumar Rekha (PrajanManojKumarRekha), Eric Cariaga (eCarCodes), Jessica C O'Bonna (jessic-o), Shayan Ali (CodewithShayan456)
Problem Statement – What problem are you solving?

Healthcare systems face operational challenges due to fragmented patient records, inefficient scheduling workflows, and inconsistent clinical documentation.

Patient records are often stored across different Electronic Medical Record (EMR) systems, such as those provided by Oracle Health and Epic Systems, resulting in data silos.
Patients frequently experience difficulty scheduling appointments with available or preferred doctors.
Important medical details may be missed during consultations due to incomplete intake information.
Manual documentation increases workload for healthcare providers and reduces consultation efficiency.

These challenges reduce accessibility, continuity of care, and overall healthcare workflow efficiency.

Solution – Describe your solution and how it works.

This project introduces a web-based telehealth and medical documentation platform designed to streamline appointment scheduling, improve consultation workflows, and support standardized clinical record generation.

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

### Backend Setup 🚀

1. **Navigate to the Backend Folder**
   ```bash
   cd projects/Code-and-Cure
   ```

2. **Set Up Virtual Environment**
   ```powershell
   # Create the environment
   python -m venv .venv

   # Activate (Windows)
   .\.venv\Scripts\activate

   # Activate (Mac/Linux)
   source .venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Server**
   ```bash
   uvicorn main:app --reload
   ```

Demo - Link to a demo video, live deployment, or screenshots.