"""
MediClaim AI — LLM Bill Analysis via HuggingFace
Uses Llama3-OpenBioLLM for plain-English explanations and coverage analysis.
Falls back to template-based analysis if HF API is unavailable.
LLM used ONLY for language — never for numeric decisions.
"""

import json
import logging
import requests
from typing import List, Optional
from backend.models.bill import LineItem, ExtractedBillData
from backend.config import get_settings

logger = logging.getLogger(__name__)


async def analyze_bill(
    extracted: ExtractedBillData,
    insurance_provider: str
) -> str:
    """
    Generate plain-English analysis of the bill using LLM.
    Returns a summary text explaining charges and coverage.
    """
    settings = get_settings()

    # Build the prompt
    prompt = _build_prompt(extracted, insurance_provider)

    # Try LLM analysis
    if settings.hf_api_token:
        for model_id in [settings.hf_llm_model, settings.hf_llm_fallback]:
            result = _call_hf_model(prompt, model_id, settings.hf_api_token)
            if result:
                return result

    # Fallback: template-based analysis
    logger.info("Using template-based analysis (HF API unavailable)")
    return _template_analysis(extracted, insurance_provider)


def _build_prompt(extracted: ExtractedBillData, insurance_provider: str) -> str:
    """Build a structured prompt for the medical LLM."""
    items_text = ""
    for item in extracted.line_items:
        cpt = f" (CPT: {item.cpt_code})" if item.cpt_code else ""
        items_text += f"  - {item.description}{cpt}: ${item.amount:.2f}\n"

    if not items_text:
        items_text = "  No specific line items extracted.\n"

    total_text = f"${extracted.total_amount:.2f}" if extracted.total_amount else "Not specified"

    return f"""You are a medical billing expert. Analyze this medical bill and provide a clear, 
patient-friendly explanation. Do NOT make up numbers or invent charges.

BILL DETAILS:
Patient: {extracted.patient_name or 'Not specified'}
Provider: {extracted.provider_name or 'Not specified'}
Date: {extracted.date_of_service or 'Not specified'}
Insurance: {insurance_provider}
Total Charged: {total_text}

LINE ITEMS:
{items_text}

Please provide:
1. A brief summary of what services were provided
2. Any charges that seem unusual or may need verification
3. General guidance on insurance coverage for these services
4. Any items the patient should discuss with their provider

Keep your response concise (under 300 words), patient-friendly, and factual.
Do not guess specific coverage amounts — those are calculated separately."""


def _call_hf_model(prompt: str, model_id: str, token: str) -> Optional[str]:
    """Call HuggingFace Inference API with the given model."""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 500,
                "temperature": 0.3,
                "return_full_text": False
            }
        }
        resp = requests.post(
            f"https://api-inference.huggingface.co/models/{model_id}",
            headers=headers,
            json=payload,
            timeout=30
        )
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and data:
                return data[0].get("generated_text", "")
            elif isinstance(data, dict):
                return data.get("generated_text", "")
        else:
            logger.warning(f"HF model {model_id} returned {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        logger.warning(f"HF model {model_id} call failed: {e}")
    return None


def _template_analysis(extracted: ExtractedBillData, insurance_provider: str) -> str:
    """Generate analysis using templates when LLM is unavailable."""
    parts = []

    # Summary
    num_items = len(extracted.line_items)
    total = extracted.total_amount or sum(i.amount for i in extracted.line_items)
    parts.append(
        f"We analyzed your medical bill containing {num_items} line item(s) "
        f"totaling ${total:,.2f}."
    )

    # Categorize items
    categories = {}
    for item in extracted.line_items:
        cat = item.category
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(item)

    if categories:
        parts.append("\n**Services breakdown:**")
        for cat, items in sorted(categories.items()):
            cat_total = sum(i.amount for i in items)
            parts.append(f"- {cat}: {len(items)} item(s), ${cat_total:,.2f}")

    # Flag high-cost items
    high_cost = [i for i in extracted.line_items if i.amount > 500]
    if high_cost:
        parts.append("\n**Items to review:**")
        for item in high_cost:
            parts.append(
                f"- {item.description}: ${item.amount:,.2f} — "
                f"This is a significant charge. Verify with your provider."
            )

    # Insurance note
    parts.append(
        f"\n**Insurance ({insurance_provider}):** Coverage estimates are calculated "
        f"based on standard plan parameters. Actual coverage may vary. "
        f"Please verify with your insurer for exact benefits."
    )

    # Disclaimer
    parts.append(
        "\n*This analysis is for informational purposes only and does not "
        "constitute medical, legal, or financial advice. Always verify "
        "charges directly with your healthcare provider and insurance company.*"
    )

    return "\n".join(parts)
