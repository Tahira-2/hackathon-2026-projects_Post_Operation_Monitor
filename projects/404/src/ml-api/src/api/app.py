from fastapi import FastAPI
from pydantic import BaseModel, Field

from src.inference.pipeline import MedicalExtractionPipeline


app = FastAPI(title="MediNote ML API", version="1.0.0")
pipeline = MedicalExtractionPipeline()


class TranscriptRequest(BaseModel):
    transcript: str = Field(..., min_length=1)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/extract")
def extract_medical_info(request: TranscriptRequest) -> dict:
    return pipeline.extract(request.transcript)
