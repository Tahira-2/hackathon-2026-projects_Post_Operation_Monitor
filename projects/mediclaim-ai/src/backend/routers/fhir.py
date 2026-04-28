"""
MediClaim AI — FHIR Export Router
GET /api/fhir/eob/{bill_id} — export analysis as FHIR ExplanationOfBenefit.
POST /api/fhir/eob — generate FHIR EOB from analysis results.
"""

import re
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from backend.models.bill import BillAnalysisResponse
from backend.models.fhir_models import FHIRExplanationOfBenefit
from backend.services.fhir_output import build_eob

router = APIRouter(prefix="/api/fhir", tags=["FHIR"])

# In-memory store for demo purposes
_eob_cache: dict = {}


def _validate_bill_id(bill_id: str):
    """Sanitize and validate the bill ID format."""
    if len(bill_id) > 64:
        raise HTTPException(status_code=400, detail="Bill ID too long")
    if not re.match(r'^[a-zA-Z0-9\-]+$', bill_id):
        raise HTTPException(status_code=400, detail="Invalid bill ID format")

@router.post("/eob", response_model=FHIRExplanationOfBenefit)
async def create_eob(
    analysis: BillAnalysisResponse,
    insurance_provider: str = "BlueCross",
):
    """Generate a FHIR ExplanationOfBenefit from bill analysis results."""
    eob = build_eob(analysis, insurance_provider)
    _eob_cache[eob.id] = eob
    return eob


@router.get("/eob/{bill_id}")
async def get_eob(bill_id: str):
    """Retrieve a previously generated FHIR ExplanationOfBenefit."""
    _validate_bill_id(bill_id)
    eob = _eob_cache.get(bill_id)
    if not eob:
        raise HTTPException(status_code=404, detail="FHIR EOB not found for this bill ID")
    return JSONResponse(
        content=eob.model_dump(),
        media_type="application/fhir+json"
    )


@router.get("/eob/{bill_id}/download")
async def download_eob(bill_id: str):
    """Download FHIR EOB as a JSON file."""
    _validate_bill_id(bill_id)
    eob = _eob_cache.get(bill_id)
    if not eob:
        raise HTTPException(status_code=404, detail="FHIR EOB not found")
    return JSONResponse(
        content=eob.model_dump(),
        media_type="application/fhir+json",
        headers={"Content-Disposition": f'attachment; filename="eob-{bill_id}.json"'}
    )
