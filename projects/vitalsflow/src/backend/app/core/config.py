from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Gemini
    gemini_api_key: str | None = None
    gemini_model: str = "models/gemini-2.0-flash"

    # Groq (LLM fallback provider)
    groq_api_key: str | None = None
    groq_model: str = "llama-3.3-70b-versatile"

    use_llm: bool = True

    # FHIR
    fhir_base_url: str = "http://hapi.fhir.org/baseR4"

    # CORS — comma-separated in env var, parsed by pydantic-settings
    cors_origins: list[str] = [
        "http://localhost:3000",
        "https://vitalsflow.vercel.app",
    ]

    # Logging
    log_level: str = "INFO"

 
settings = Settings()

