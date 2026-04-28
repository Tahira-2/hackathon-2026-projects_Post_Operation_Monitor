from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    app_name: str = "BurnoutWatch Metrics API"
    app_version: str = "0.1.0"
    sqlite_db_path: str = str(Path(__file__).resolve().parents[1] / "burnoutwatch.db")
    llm_provider: str = "mock"
    llm_model: str = "google/gemma-2-2b-it"
    hf_api_token: str | None = None
    hf_api_base_url: str = "https://api-inference.huggingface.co"
    llm_timeout_seconds: float = 8.0


def get_settings() -> Settings:
    return Settings(
        sqlite_db_path=os.getenv(
            "BURNOUTWATCH_DB_PATH",
            str(Path(__file__).resolve().parents[1] / "burnoutwatch.db"),
        ),
        llm_provider=os.getenv("LLM_PROVIDER", "mock"),
        llm_model=os.getenv("LLM_MODEL", "google/gemma-2-2b-it"),
        hf_api_token=os.getenv("HF_API_TOKEN"),
        hf_api_base_url=os.getenv("HF_API_BASE_URL", "https://api-inference.huggingface.co"),
        llm_timeout_seconds=float(os.getenv("LLM_TIMEOUT_SECONDS", "8")),
    )
