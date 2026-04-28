"""
MediClaim AI — FHIR ExplanationOfBenefit R4 Models
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone


class FHIRCoding(BaseModel):
    system: str
    code: str
    display: Optional[str] = None


class FHIRCodeableConcept(BaseModel):
    coding: List[FHIRCoding] = []
    text: Optional[str] = None


class FHIRMoney(BaseModel):
    value: float
    currency: str = "USD"


class FHIRReference(BaseModel):
    reference: str
    display: Optional[str] = None


class FHIRAdjudication(BaseModel):
    category: FHIRCodeableConcept
    amount: FHIRMoney


class FHIRItem(BaseModel):
    sequence: int
    productOrService: FHIRCodeableConcept
    net: FHIRMoney
    adjudication: List[FHIRAdjudication] = []


class FHIRTotal(BaseModel):
    category: FHIRCodeableConcept
    amount: FHIRMoney


class FHIRExplanationOfBenefit(BaseModel):
    resourceType: str = "ExplanationOfBenefit"
    id: str
    status: str = "active"
    type: FHIRCodeableConcept
    use: str = "claim"
    patient: FHIRReference
    created: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    insurer: FHIRReference
    provider: FHIRReference
    outcome: str = "complete"
    item: List[FHIRItem] = []
    total: List[FHIRTotal] = []
