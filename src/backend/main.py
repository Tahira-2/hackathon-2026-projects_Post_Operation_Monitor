from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional, List, Any
import sys
import os
sys.path.append('..')
from ml_service.predictor import DiseasePredictor
from ml_service.casual_engine import CasualEngine as CausalEngine
import sqlite3
from datetime import datetime

app = FastAPI(title="CausalCare AI API", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML components
predictor = DiseasePredictor()
causal_engine = CausalEngine()

# Database connection
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'causalcare.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Request Models
class PredictRequest(BaseModel):
    symptoms: Dict[str, int]
    lifestyle: Dict[str, Any]

class SimulateRequest(BaseModel):
    disease: str
    base_probability: float
    current_lifestyle: Dict[str, Any]

# Response Models
class Factor(BaseModel):
    name: str
    impact: str
    description: str

class RecommendationResponse(BaseModel):
    urgency: str
    urgency_message: str
    lifestyle: List[str]
    risk_awareness: List[str]
    disease_specific: List[str]
    disclaimer: str

class RiskBreakdownItem(BaseModel):
    name: str
    value: float
    type: str
    color: str

class PredictResponse(BaseModel):
    disease: str
    base_risk: float
    adjusted_risk: float
    base_risk_percent: float
    adjusted_risk_percent: float
    severity: str
    disease_severity: str
    factors: List[Factor]
    recommendations: RecommendationResponse
    risk_breakdown: List[RiskBreakdownItem]

class Scenario(BaseModel):
    name: str
    risk: float
    risk_percent: float
    severity: str
    reduction: Optional[float] = None

class SimulateResponse(BaseModel):
    scenarios: List[Scenario]
    current_risk: float
    best_case_risk: float
    max_reduction: float

# Endpoints
@app.get("/")
def root():
    return {
        "message": "CausalCare AI - Root-Cause Health Intelligence Engine",
        "tagline": "Most AI predicts disease. CausalCare AI explains why—and how to reduce risk.",
        "version": "2.0.0"
    }

@app.get("/symptoms")
def get_symptoms():
    """Get list of all available symptoms"""
    return {"symptoms": predictor.get_symptoms()}

@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    """
    Predict disease from symptoms and calculate risk with lifestyle factors
    """
    try:
        # Get disease prediction
        prediction = predictor.predict(request.symptoms)

        # Calculate risk with causal factors
        risk_analysis = causal_engine.calculate_risk(
            base_probability=prediction['confidence'],
            lifestyle_factors=request.lifestyle,
            disease=prediction['disease']
        )

        # Store in database
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO predictions (disease, base_probability, adjusted_risk, lifestyle_factors, timestamp)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                risk_analysis['disease'],
                risk_analysis['base_risk'],
                risk_analysis['adjusted_risk'],
                str(request.lifestyle),
                datetime.now().isoformat()
            ))
            conn.commit()
            conn.close()
        except Exception as db_error:
            print(f"Database error: {db_error}")
            # Continue even if database fails

        return risk_analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/simulate", response_model=SimulateResponse)
def simulate(request: SimulateRequest):
    """
    Simulate what happens when lifestyle factors change
    """
    try:
        # Simulate interventions
        simulation = causal_engine.simulate_intervention(
            base_probability=request.base_probability,
            current_lifestyle=request.current_lifestyle,
            disease=request.disease,
            interventions={}
        )

        # Store simulation
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO simulations (disease, before_risk, after_risk, interventions, timestamp)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                request.disease,
                simulation['current_risk'],
                simulation['best_case_risk'],
                'all_improvements',
                datetime.now().isoformat()
            ))
            conn.commit()
            conn.close()
        except Exception as db_error:
            print(f"Database error: {db_error}")

        return simulation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
def get_history(limit: int = 10):
    """Get recent predictions"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM predictions ORDER BY timestamp DESC LIMIT ?
        ''', (limit,))
        rows = cursor.fetchall()
        conn.close()

        return {
            "predictions": [dict(row) for row in rows]
        }
    except Exception as e:
        # Return empty if database doesn't exist yet
        return {"predictions": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)