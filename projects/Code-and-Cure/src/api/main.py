from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from src.api.jwt_handler import decode_token

# Import routes (Will be enabled as we build them)
from src.api.routes import auth, symptoms, doctors, appointments, intake
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

# --- AUDIT LOG MIDDLEWARE ---
# Intercepts every mutating request to log the action to the DB.
class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Let the request proceed through the router
        response = await call_next(request)
        
        # 2. Only log mutations (writes, updates, deletes)
        if request.method in ["POST", "PATCH", "DELETE"]:
            user_id = "anonymous"
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                try:
                    payload = decode_token(auth_header.split(" ")[1])
                    user_id = payload.get("user_id", "unknown")
                except Exception:
                    pass # Invalid tokens are handled by routes, we just log "anonymous"
            
            # Mock Person 4 DB Call
            # from src.database.db_client import log_action
            print(f"[AUDIT] User: {user_id} | Action: {request.method} {request.url.path} | IP: {request.client.host}")
            
        return response

app.add_middleware(AuditLogMiddleware)

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
app.include_router(symptoms.router, prefix="/api/v1/symptoms", tags=["Symptom Analysis"])
app.include_router(intake.router, prefix="/api/v1/intake", tags=["Intake Forms"])
app.include_router(doctors.router, prefix="/api/v1/doctors", tags=["Discovery"])
app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["Booking"])
app.include_router(soap.router, prefix="/api/v1/soap", tags=["Clinical Documentation"])
# app.include_router(prescriptions.router, prefix="/api/v1/prescriptions", tags=["Pharmacy"])
