"""
MediClaim AI — FastAPI Dependencies
Shared dependencies injected into route handlers.
"""

import json
import logging
from pathlib import Path
from typing import Dict
from functools import lru_cache
from backend.config import get_settings, Settings
from backend.models.insurance import InsurancePlan

logger = logging.getLogger(__name__)

_INSURANCE_PATH = Path(__file__).resolve().parent / "data" / "insurance_plans.json"


def get_config() -> Settings:
    """Dependency: return app settings."""
    return get_settings()


@lru_cache
def get_insurance_plans() -> Dict[str, InsurancePlan]:
    """Load and cache insurance plans from JSON."""
    try:
        with open(_INSURANCE_PATH, "r") as f:
            raw = json.load(f)
        plans = {}
        for key, data in raw.items():
            plans[key] = InsurancePlan(**data)
        logger.info(f"Loaded {len(plans)} insurance plans")
        return plans
    except Exception as e:
        logger.error(f"Failed to load insurance plans: {e}")
        return {}


def calculate_coverage(
    total_charged: float,
    plan: InsurancePlan,
    categories: Dict[str, float] = None,
) -> tuple:
    """
    Calculate estimated insurance coverage.
    Returns (covered_amount, patient_responsibility, coverage_details).
    """
    details = []
    deductible = plan.deductible
    coverage_pct = plan.coverage_percentage

    # After deductible
    after_deductible = max(0, total_charged - deductible)
    details.append(f"Annual deductible: ${deductible:,.2f}")

    # Apply coverage percentage
    covered = after_deductible * coverage_pct
    patient_share = total_charged - covered

    # Cap at max out-of-pocket (if set)
    if plan.max_out_of_pocket > 0 and patient_share > plan.max_out_of_pocket:
        patient_share = plan.max_out_of_pocket
        covered = total_charged - patient_share
        details.append(f"Max out-of-pocket cap applied: ${plan.max_out_of_pocket:,.2f}")

    details.append(f"Plan covers {coverage_pct * 100:.0f}% after deductible")
    details.append(f"Estimated covered: ${covered:,.2f}")
    details.append(f"Your responsibility: ${patient_share:,.2f}")

    return round(covered, 2), round(patient_share, 2), details
