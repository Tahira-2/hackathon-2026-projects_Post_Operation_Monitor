from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from api.routes import chat

load_dotenv()

app = FastAPI(
    title="Health Assistant API",
    description="AI-powered health assistant with RAG",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Health Assistant API running"}
