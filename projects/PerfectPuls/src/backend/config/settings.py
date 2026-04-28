from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Gemini AI
    google_ai_api_key: str = ""
    
    # Neo4j Database
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_username: str = "neo4j"
    neo4j_password: str = ""
    neo4j_database: str = "policy_pilot"
    
    # API Settings
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "*"
    
    # File Processing
    upload_dir: str = "./uploads"
    max_file_size: str = "10MB"
    allowed_extensions: str = "pdf"
    
    # Gemini PDF Processing
    gemini_max_pdf_size: str = "20MB"
    gemini_timeout_seconds: int = 60
    
    # Extension Integration
    extension_endpoint: str = "http://localhost:8000/api/analyze"
    fallback_response: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields in .env for flexibility

    def get_cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    def get_max_file_size_bytes(self) -> int:
        """Convert file size string to bytes"""
        size_str = self.max_file_size.upper()
        if size_str.endswith("MB"):
            return int(size_str[:-2]) * 1024 * 1024
        elif size_str.endswith("KB"):
            return int(size_str[:-2]) * 1024
        else:
            return int(size_str)

# Global settings instance
settings = Settings()