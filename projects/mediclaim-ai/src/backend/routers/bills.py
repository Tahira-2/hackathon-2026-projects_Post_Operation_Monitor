"""
MediClaim AI — Bill Analysis Router
POST /api/bills/analyze — main analysis endpoint.
"""

import logging
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from backend.models.bill import BillAnalysisResponse, ExtractedBillData
from backend.services.extractor import extract_text_from_pdf
from backend.services.ner_service import extract_entities, enhance_with_hf_ner
from backend.services.enrichment import enrich_line_items
from backend.services.analyzer import analyze_bill
from backend.services.benchmarker import benchmark_line_items
from backend.services.classifier import classify_flags, generate_summary
from backend.dependencies import get_insurance_plans, calculate_coverage

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/bills", tags=["Bills"])


@router.get("/demo/{bill_type}")
async def get_demo_bill(bill_type: str):
    """Return a pre-generated demo PDF bill."""
    valid_types = ["mixed", "severe", "clean"]
    if bill_type not in valid_types:
        raise HTTPException(status_code=400, detail="Invalid demo bill type")
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.abspath(os.path.join(current_dir, "../../demo", f"demo_bill_{bill_type}.pdf"))
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Demo bill not found.")
        
    return FileResponse(
        path=file_path, 
        media_type="application/pdf", 
        filename=f"Demo_Bill_{bill_type.title()}.pdf"
    )


@router.post("/analyze", response_model=BillAnalysisResponse)
async def analyze_bill_endpoint(
    file: UploadFile = File(...),
    insurance_provider: str = Form("BlueCross"),
):
    """
    Analyze a medical bill PDF.
    1. Extract text from PDF
    2. NER entity extraction
    3. Enrich with external APIs
    4. LLM analysis
    5. CMS benchmarking
    6. Severity classification
    7. Insurance coverage calculation
    """
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    content_type = file.content_type or ""
    if "pdf" not in content_type and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        pdf_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {e}")

    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    logger.info(f"Analyzing bill: {file.filename} ({len(pdf_bytes)} bytes)")

    # ── Step 1: Extract text ──
    raw_text = extract_text_from_pdf(pdf_bytes)
    if not raw_text.strip():
        raise HTTPException(
            status_code=422,
            detail="Could not extract text from this PDF. "
                   "The file may be image-only without OCR support."
        )

    # ── Step 2: NER extraction ──
    extracted = extract_entities(raw_text)

    # Optional HF NER enhancement
    extracted.entities = await enhance_with_hf_ner(raw_text, extracted.entities)

    # ── Step 3: Enrich with external APIs ──
    extracted.line_items = await enrich_line_items(extracted.line_items)

    # ── Step 4: LLM analysis ──
    summary_text = await analyze_bill(extracted, insurance_provider)

    # ── Step 5: CMS benchmarking ──
    flags = benchmark_line_items(extracted.line_items)

    # ── Step 6: Severity classification ──
    flags = classify_flags(flags, extracted.line_items)
    flag_summary = generate_summary(
        flags,
        extracted.total_amount or sum(i.amount for i in extracted.line_items)
    )

    # ── Step 7: Insurance coverage ──
    plans = get_insurance_plans()
    plan = plans.get(insurance_provider)
    total_charged = extracted.total_amount or sum(i.amount for i in extracted.line_items)

    if plan:
        covered, out_of_pocket, coverage_details = calculate_coverage(total_charged, plan)
        # Mark flags with coverage info
        for flag in flags:
            cat = _get_item_category(flag.item, extracted.line_items)
            flag.covered_by_insurance = cat not in plan.excluded_categories
    else:
        covered = 0.0
        out_of_pocket = total_charged
        coverage_details = ["Insurance provider not found in database"]

    # ── Build response ──
    full_summary = f"{flag_summary}\n\n{summary_text}"

    return BillAnalysisResponse(
        total_charged=round(total_charged, 2),
        estimated_covered=covered,
        out_of_pocket=out_of_pocket,
        flags=flags,
        line_items=extracted.line_items,
        fhir_available=True,
        summary_text=full_summary,
    )


def _get_item_category(item_name: str, line_items: list) -> str:
    """Find the category of a line item by description."""
    for li in line_items:
        if li.description.lower() == item_name.lower():
            return li.category
    return "General"
