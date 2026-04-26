from fastapi import APIRouter

from app.api.patients import router as patients_router
from app.api.system import router as system_router
from app.api.triage import router as triage_router

api_router = APIRouter()
api_router.include_router(patients_router, prefix="/patients", tags=["patients"])
api_router.include_router(triage_router, prefix="/triage", tags=["triage"])
api_router.include_router(system_router, prefix="/system", tags=["system"])

