"""
MediClaim AI — Bill Analysis Pydantic Models
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
import uuid


class Severity(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class LineItem(BaseModel):
    description: str
    cpt_code: Optional[str] = None
    amount: float
    category: str = "General"
    rxnorm_id: Optional[str] = None
    ndc_code: Optional[str] = None
    fda_verified: Optional[bool] = None


class Flag(BaseModel):
    item: str
    charged: float
    benchmark: Optional[float] = None
    severity: Severity
    reason: str
    covered_by_insurance: bool = False


class BillAnalysisResponse(BaseModel):
    bill_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    total_charged: float = 0.0
    estimated_covered: float = 0.0
    out_of_pocket: float = 0.0
    flags: List[Flag] = []
    line_items: List[LineItem] = []
    fhir_available: bool = True
    summary_text: str = ""


class ExtractedEntity(BaseModel):
    text: str
    label: str
    confidence: float = 1.0
    start: Optional[int] = None
    end: Optional[int] = None


class ExtractedBillData(BaseModel):
    raw_text: str
    entities: List[ExtractedEntity] = []
    line_items: List[LineItem] = []
    total_amount: Optional[float] = None
    patient_name: Optional[str] = None
    provider_name: Optional[str] = None
    date_of_service: Optional[str] = None
