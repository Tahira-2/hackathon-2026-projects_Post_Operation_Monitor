"""
MediClaim AI — Insurance Plan Models
"""

from pydantic import BaseModel
from typing import Dict, List, Optional


class InsurancePlan(BaseModel):
    name: str
    provider: str
    plan_type: str
    coverage_percentage: float
    deductible: float
    max_out_of_pocket: float
    copay: Dict[str, float] = {}
    covered_categories: List[str] = []
    excluded_categories: List[str] = []


class InsuranceCoverageResult(BaseModel):
    plan_name: str
    covered_amount: float
    patient_responsibility: float
    deductible_remaining: float = 0.0
    coverage_details: List[str] = []


class InsuranceListResponse(BaseModel):
    providers: List[InsurancePlan] = []
