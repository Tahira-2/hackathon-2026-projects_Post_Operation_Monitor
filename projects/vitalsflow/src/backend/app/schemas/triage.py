"""
Single source of truth for all Pydantic models in VitalsFlow.
— News2* models are used by the deterministic scoring engine (services/news2.py)
— VitalsInput / TriageOutput / Patient* models implement the API contract
"""

from typing import Literal

from pydantic import BaseModel, Field, field_validator

# ---------------------------------------------------------------------------
# Legacy / internal models — used by deterministic NEWS2 engine
# ---------------------------------------------------------------------------


class FHIRBundle(BaseModel):
    data: dict = Field(..., description="FHIR Bundle or resource payload")


class News2Subscores(BaseModel):
    respiratory_rate: int | None = None
    spo2: int | None = None
    supplemental_o2: int | None = None
    systolic_bp: int | None = None
    heart_rate: int | None = None
    consciousness: int | None = None
    temperature: int | None = None


class News2Result(BaseModel):
    score: int | None
    risk: Literal[
        "low",
        "low_medium",
        "medium",
        "high",
        "critical",
        "insufficient_data",
    ]
    subscores: News2Subscores
    spo2_scale_used: int | None
    missing_parameters: list[
        Literal[
            "respiratory_rate",
            "spo2",
            "supplemental_o2",
            "systolic_bp",
            "heart_rate",
            "consciousness",
            "temperature",
        ]
    ]
    reason: str
    actions: list[str]
    data_confidence: Literal["complete", "partial", "insufficient"]


class News2Response(BaseModel):
    news2: News2Result


# ---------------------------------------------------------------------------
# API-contract models — used by the HTTP layer (routers) and LLM agent
# ---------------------------------------------------------------------------


_VALID_CONSCIOUSNESS = {"alert", "voice", "pain", "unresponsive"}


class VitalsInput(BaseModel):
    """Current patient vitals entered by the clinician."""

    heart_rate: int = Field(..., ge=20, le=300, description="bpm")
    systolic_bp: int = Field(..., ge=50, le=300, description="mmHg")
    diastolic_bp: int = Field(..., ge=30, le=200, description="mmHg")
    spo2: float = Field(..., ge=50.0, le=100.0, description="percentage")
    temperature: float = Field(..., ge=30.0, le=45.0, description="Celsius")
    respiratory_rate: int = Field(..., ge=4, le=60, description="breaths/min")
    consciousness: str = Field(..., description="ACVPU: alert|voice|pain|unresponsive")
    on_supplemental_o2: bool = Field(..., description="Is patient on supplemental O2?")

    @field_validator("consciousness")
    @classmethod
    def validate_consciousness(cls, v: str) -> str:
        if v.lower() not in _VALID_CONSCIOUSNESS:
            raise ValueError(
                f"consciousness must be one of {sorted(_VALID_CONSCIOUSNESS)}"
            )
        return v.lower()


class TriageOutput(BaseModel):
    """
    Full triage result returned by POST /triage/{patient_id}.
    Includes the minimum API-contract fields AND richer diagnostic data.
    """

    # --- Minimum contract fields (frontend must handle these) ---
    risk_score: int = Field(
        ..., ge=0, le=10, description="AI composite risk score (0 = analysis failed)"
    )
    news2_score: int = Field(..., ge=0, description="Raw NEWS2 total")
    triage_tier: Literal["critical", "urgent", "routine", "unknown"]
    justification: str = Field(..., description="Plain-English clinical rationale")
    suggested_actions: list[str] = Field(..., description="Ordered by clinical priority")

    # --- Rich bonus fields (deterministic data, always present) ---
    subscores: News2Subscores | None = None
    missing_parameters: list[str] = []
    data_confidence: Literal["complete", "partial", "insufficient"] = "complete"


# ---------------------------------------------------------------------------
# Patient models — used by /patients/* endpoints
# ---------------------------------------------------------------------------


class PatientSearchResult(BaseModel):
    id: str
    name: str
    dob: str
    gender: str


class PatientSummary(BaseModel):
    patient_id: str
    name: str
    dob: str
    gender: str
    clinical_summary: str

