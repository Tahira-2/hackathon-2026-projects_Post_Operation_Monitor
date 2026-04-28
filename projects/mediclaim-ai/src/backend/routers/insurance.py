"""
MediClaim AI — Insurance Router
GET /api/insurance/providers — list available insurance plans.
GET /api/insurance/coverage — calculate coverage for a given amount.
"""

from fastapi import APIRouter, Query
from backend.models.insurance import InsurancePlan, InsuranceCoverageResult, InsuranceListResponse
from backend.dependencies import get_insurance_plans, calculate_coverage

router = APIRouter(prefix="/api/insurance", tags=["Insurance"])


@router.get("/providers", response_model=InsuranceListResponse)
async def list_providers():
    """Return all available insurance providers."""
    plans = get_insurance_plans()
    return InsuranceListResponse(providers=list(plans.values()))


@router.get("/coverage", response_model=InsuranceCoverageResult)
async def get_coverage(
    provider: str = Query(..., description="Insurance provider key"),
    amount: float = Query(..., gt=0, description="Total bill amount"),
):
    """Calculate estimated coverage for a given provider and amount."""
    plans = get_insurance_plans()
    plan = plans.get(provider)
    if not plan:
        available = ", ".join(plans.keys())
        return InsuranceCoverageResult(
            plan_name="Unknown",
            covered_amount=0,
            patient_responsibility=amount,
            coverage_details=[f"Provider '{provider}' not found. Available: {available}"],
        )

    covered, patient_resp, details = calculate_coverage(amount, plan)
    return InsuranceCoverageResult(
        plan_name=plan.name,
        covered_amount=covered,
        patient_responsibility=patient_resp,
        deductible_remaining=plan.deductible,
        coverage_details=details,
    )
