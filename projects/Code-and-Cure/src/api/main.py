from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routes (Will be enabled as we build them)
from src.api.routes import auth, symptoms, doctors, appointments
# from src.api.routes import soap, prescriptions, fhir

app = FastAPI(
    title="CareIT Telehealth API",
    description="The Interoperable Bridge for Solo Practitioners (Discovery -> EHR Export)",
    version="0.1.0"
)

# --- CORS CONFIGURATION ---
# Necessary for the Next.js frontend (localhost:3000) to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint reflecting the project's refined scope"""
    return {
        "status": "online",
        "message": "CareIT API Gateway is active",
        "niche": "Solo Practitioners & Individual Doctors",
        "bridge_ready": True
    }

# --- ROUTER INCLUSIONS (Plug-and-Play) ---
# We will enable these one by one as we build the individual files.
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(symptoms.router, prefix="/api/v1/intake", tags=["Symptom Analysis"])
app.include_router(doctors.router, prefix="/api/v1/doctors", tags=["Discovery"])
app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["Booking"])
# app.include_router(soap.router, prefix="/api/v1/soap", tags=["Clinical Documentation"])
# app.include_router(prescriptions.router, prefix="/api/v1/prescriptions", tags=["Pharmacy"])
