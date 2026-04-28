"""
VitalsFlow API — entry point for uvicorn.

Run locally:
    uvicorn main:app --reload --port 8000

The .env file is loaded HERE, before any app module is imported,
so settings.gemini_api_key and settings.fhir_base_url are available
immediately when app.core.config.Settings is instantiated.
"""

# Load .env first — must come before any app import
from dotenv import load_dotenv

load_dotenv()

# Re-export the FastAPI application so uvicorn can find `main:app`
from app.main import app  # noqa: E402, F401
