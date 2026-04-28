"""
MediClaim AI — Application Configuration
Loads environment variables and provides app-wide settings.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from pathlib import Path

# Resolve .env path relative to the src/ directory
_env_path = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # HuggingFace
    hf_api_token: str = ""
    hf_llm_model: str = "aaditya/Llama3-OpenBioLLM-70B"
    hf_llm_fallback: str = "aaditya/Llama3-OpenBioLLM-8B"
    hf_ner_model: str = "d4data/biomedical-ner-all"

    # App
    app_name: str = "MediClaim AI"
    app_version: str = "1.0.0"
    debug: bool = True

    # Overcharge thresholds
    overcharge_high: float = 1.5     # > 50% above benchmark → HIGH
    overcharge_medium: float = 1.2   # > 20% above benchmark → MEDIUM

    # External API base URLs (all free, no key required)
    rxnorm_base: str = "https://rxnav.nlm.nih.gov/REST"
    openfda_base: str = "https://api.fda.gov"
    nlm_base: str = "https://clinicaltables.nlm.nih.gov/api"

    model_config = {"env_file": str(_env_path), "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings singleton."""
    return Settings()
