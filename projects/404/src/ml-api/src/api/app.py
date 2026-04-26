from pathlib import Path
import sys

import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel, Field

try:
    # Works when run as a module from the project root (e.g., uvicorn src.api.app:app)
    from src.inference.pipeline import MedicalExtractionPipeline
except ModuleNotFoundError:
    # Supports direct execution from src/api with `python app.py`.
    project_root = Path(__file__).resolve().parents[2]
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))
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


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)