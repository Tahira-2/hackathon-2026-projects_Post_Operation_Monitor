from dotenv import load_dotenv

load_dotenv()  # load .env before settings are instantiated

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.logging import setup_logging

setup_logging(settings.log_level)

app = FastAPI(
    title="VitalsFlow API",
    version="1.0.0",
    description="AI-powered clinical triage — HL7 FHIR + NEWS2",
    swagger_ui_parameters={"syntaxHighlight": False}
)

# CORS — allow the Next.js frontend (local dev + production Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def root() -> dict:
    return {"status": "API running", "service": "VitalsFlow API"}


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "VitalsFlow API"}


@app.on_event("startup")
async def on_startup() -> None:
    print("VitalsFlow API ready")
