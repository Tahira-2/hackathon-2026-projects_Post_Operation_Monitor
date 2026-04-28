"""
MediClaim AI — External API Enrichment
RxNorm (drug normalization) + OpenFDA (drug info/recalls) + NLM Clinical Tables (CPT validation).
All free, no API key required.
"""

import logging
import requests
from typing import Optional, Dict, Any, List
from backend.models.bill import LineItem
from backend.config import get_settings

logger = logging.getLogger(__name__)

TIMEOUT = 8  # seconds — keep demos fast


# ── RxNorm API ──

def normalize_drug_name(drug_name: str) -> Optional[str]:
    """Look up a drug in RxNorm and return its RxCUI (normalized ID)."""
    settings = get_settings()
    try:
        resp = requests.get(
            f"{settings.rxnorm_base}/rxcui.json",
            params={"name": drug_name, "search": 1},
            timeout=TIMEOUT
        )
        if resp.status_code == 200:
            data = resp.json()
            group = data.get("idGroup", {})
            ids = group.get("rxnormId", [])
            if ids:
                return ids[0]
    except Exception as e:
        logger.warning(f"RxNorm lookup failed for '{drug_name}': {e}")
    return None


def get_rxnorm_info(rxcui: str) -> Dict[str, Any]:
    """Get drug properties from RxNorm by RxCUI."""
    settings = get_settings()
    try:
        resp = requests.get(
            f"{settings.rxnorm_base}/rxcui/{rxcui}/properties.json",
            timeout=TIMEOUT
        )
        if resp.status_code == 200:
            props = resp.json().get("properties", {})
            return {
                "name": props.get("name", ""),
                "synonym": props.get("synonym", ""),
                "tty": props.get("tty", ""),
            }
    except Exception as e:
        logger.warning(f"RxNorm info failed for RxCUI {rxcui}: {e}")
    return {}


# ── OpenFDA API ──

def check_drug_fda(drug_name: str) -> Dict[str, Any]:
    """Check OpenFDA for drug information and active recalls."""
    settings = get_settings()
    result = {"verified": False, "recall_alert": False, "recall_info": None}
    try:
        # Drug label search
        resp = requests.get(
            f"{settings.openfda_base}/drug/label.json",
            params={"search": f'openfda.brand_name:"{drug_name}"', "limit": 1},
            timeout=TIMEOUT
        )
        if resp.status_code == 200:
            data = resp.json()
            if data.get("results"):
                result["verified"] = True

        # Check for active recalls
        recall_resp = requests.get(
            f"{settings.openfda_base}/drug/enforcement.json",
            params={
                "search": f'reason_for_recall:"{drug_name}"+AND+status:"Ongoing"',
                "limit": 1
            },
            timeout=TIMEOUT
        )
        if recall_resp.status_code == 200:
            recall_data = recall_resp.json()
            if recall_data.get("results"):
                result["recall_alert"] = True
                r = recall_data["results"][0]
                result["recall_info"] = {
                    "reason": r.get("reason_for_recall", ""),
                    "classification": r.get("classification", ""),
                    "status": r.get("status", ""),
                }
    except Exception as e:
        logger.warning(f"OpenFDA lookup failed for '{drug_name}': {e}")
    return result


# ── NLM Clinical Tables API ──

def validate_cpt_code(cpt_code: str) -> Dict[str, Any]:
    """Validate a CPT code against NLM Clinical Tables."""
    settings = get_settings()
    try:
        resp = requests.get(
            f"{settings.nlm_base}/CPT/v3/search",
            params={"terms": cpt_code, "maxList": 5},
            timeout=TIMEOUT
        )
        if resp.status_code == 200:
            data = resp.json()
            # NLM returns [total_count, codes, extra, descriptions]
            if isinstance(data, list) and len(data) >= 4:
                codes = data[1] if data[1] else []
                descriptions = data[3] if len(data) > 3 else []
                for i, code_list in enumerate(codes):
                    code_val = code_list[0] if isinstance(code_list, list) else code_list
                    if str(code_val) == cpt_code:
                        desc = ""
                        if descriptions and i < len(descriptions):
                            d = descriptions[i]
                            desc = d[0] if isinstance(d, list) else str(d)
                        return {"valid": True, "description": desc}
        return {"valid": False, "description": ""}
    except Exception as e:
        logger.warning(f"NLM CPT validation failed for '{cpt_code}': {e}")
        return {"valid": False, "description": ""}


# ── Orchestrator ──

async def enrich_line_items(items: List[LineItem]) -> List[LineItem]:
    """
    Enrich extracted line items with external API data.
    - Drugs → RxNorm normalization + OpenFDA verification
    - CPT codes → NLM Clinical Tables validation
    """
    enriched = []
    for item in items:
        # Enrich drug items
        if item.category == "Pharmacy" or _looks_like_drug(item.description):
            rxcui = normalize_drug_name(item.description)
            if rxcui:
                item.rxnorm_id = rxcui
            fda = check_drug_fda(item.description)
            item.fda_verified = fda.get("verified", False)

        # Validate CPT codes
        if item.cpt_code:
            cpt_info = validate_cpt_code(item.cpt_code)
            if cpt_info["valid"] and not item.description:
                item.description = cpt_info["description"]
            item.fda_verified = cpt_info["valid"] if item.fda_verified is None else item.fda_verified

        enriched.append(item)
    return enriched


def _looks_like_drug(desc: str) -> bool:
    """Heuristic: does this description look like a drug/medication?"""
    drug_indicators = ["mg", "ml", "tablet", "capsule", "injection",
                        "solution", "cream", "ointment", "patch", "inhaler",
                        "suspension", "syrup", "drops"]
    desc_lower = desc.lower()
    return any(indicator in desc_lower for indicator in drug_indicators)
