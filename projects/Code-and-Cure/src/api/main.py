import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from src.api.jwt_handler import decode_token
from src.database.db_client import insert_log

logger = logging.getLogger(__name__)

# Import routes
from src.api.routes import auth, symptoms, doctors, appointments, intake, soap, fhir, prescriptions

app = FastAPI(
    title="CareIT Telehealth API",
    description="The Interoperable Bridge for Solo Practitioners (Discovery -> EHR Export)",
    version="0.1.0"
)

# --- CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


# --- AUDIT LOG MIDDLEWARE ---
class AuditLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        if request.method in ["POST", "PATCH", "DELETE"]:
            user_id = None
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                try:
                    payload = decode_token(auth_header.split(" ")[1])
                    user_id = payload.get("user_id")
                except Exception as exc:
                    logger.debug("Audit middleware: token decode skipped: %s", exc)

            client_ip = request.client.host if request.client else "unknown"
            action = f"{request.method} {request.url.path}"
            print(f"[AUDIT] User: {user_id or 'anonymous'} | Action: {action} | IP: {client_ip}")

            # Persist to DB only for authenticated users (logs.user_id is NOT NULL FK)
            if user_id:
                try:
                    insert_log(
                        user_id=user_id,
                        action=action,
                        resource=request.url.path,
                        ip_address=client_ip,
                    )
                except Exception as exc:
                    # Non-blocking: log failure must not affect business response
                    print(f"[AUDIT] DB log failed (non-blocking): {exc}")

        return response


app.add_middleware(AuditLogMiddleware)


# --- DB-UNAVAILABLE EXCEPTION HANDLER ---
# Converts RuntimeError from _UnavailableDB sentinel to HTTP 503 so callers
# get a structured JSON error instead of an unhandled 500 traceback.
@app.exception_handler(RuntimeError)
async def db_unavailable_handler(request: Request, exc: RuntimeError) -> JSONResponse:
    msg = str(exc)
    if "Database client unavailable" in msg:
        return JSONResponse(status_code=503, content={"detail": msg})
    return JSONResponse(status_code=500, content={"detail": msg})


@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "CareIT API Gateway is active",
        "niche": "Solo Practitioners & Individual Doctors",
        "bridge_ready": True,
    }


# --- ROUTER INCLUSIONS ---
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(symptoms.router, prefix="/api/v1/symptoms", tags=["Symptom Analysis"])
app.include_router(intake.router, prefix="/api/v1/intake", tags=["Intake Forms"])
app.include_router(doctors.router, prefix="/api/v1/doctors", tags=["Discovery"])
app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["Booking"])
app.include_router(soap.router, prefix="/api/v1/soap", tags=["Clinical Documentation"])
app.include_router(fhir.router, prefix="/api/v1/fhir", tags=["EMR Export"])
app.include_router(prescriptions.router, prefix="/api/v1/prescriptions", tags=["Prescriptions"])
