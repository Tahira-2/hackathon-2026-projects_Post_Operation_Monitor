from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import triage, translate, clinics

app = FastAPI(
    title="TriageTech API",
    description="AI-Based Symptom Checker, Triage, Translation & Clinic Lookup for Nepal",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(triage.router)
app.include_router(translate.router)
app.include_router(clinics.router)

@app.get("/")
def root():
    return {"message": "TriageTech API is running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
