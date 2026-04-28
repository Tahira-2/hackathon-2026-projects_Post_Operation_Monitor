"""
MediClaim AI — CMS Rate Benchmarking
Compares charged amounts to CMS Medicare benchmark rates.
Pure Python — 100% deterministic, no LLM.
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from backend.models.bill import LineItem, Flag, Severity
from backend.config import get_settings

logger = logging.getLogger(__name__)

# Load CMS rates at module level
_CMS_RATES: Dict = {}
_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "cms_rates.json"


def _load_cms_rates() -> Dict:
    """Load CMS rates from JSON file."""
    global _CMS_RATES
    if not _CMS_RATES:
        try:
            with open(_DATA_PATH, "r") as f:
                _CMS_RATES = json.load(f)
            logger.info(f"Loaded {len(_CMS_RATES)} CMS benchmark rates")
        except Exception as e:
            logger.error(f"Failed to load CMS rates: {e}")
            _CMS_RATES = {}
    return _CMS_RATES


def get_benchmark(cpt_code: str) -> Optional[Dict]:
    """Get the CMS benchmark rate for a given CPT code."""
    rates = _load_cms_rates()
    return rates.get(cpt_code)


def benchmark_line_items(items: List[LineItem]) -> List[Flag]:
    """
    Compare each line item against CMS benchmarks.
    Returns a list of flags for items that exceed benchmarks.
    """
    rates = _load_cms_rates()
    settings = get_settings()
    flags: List[Flag] = []

    for item in items:
        if not item.cpt_code:
            # Try to match by description keywords for facility charges
            flag = _check_facility_charge(item, rates, settings)
            if flag:
                flags.append(flag)
            continue

        benchmark = rates.get(item.cpt_code)
        if not benchmark:
            # Unknown CPT code — flag as informational
            if item.amount > 100:
                flags.append(Flag(
                    item=item.description,
                    charged=item.amount,
                    benchmark=None,
                    severity=Severity.LOW,
                    reason=f"CPT code {item.cpt_code} not found in CMS benchmark database. "
                           f"Verify this charge with your provider.",
                    covered_by_insurance=True,
                ))
            continue

        bench_rate = benchmark["rate"]
        ratio = item.amount / bench_rate if bench_rate > 0 else 0
        flag = _evaluate_ratio(item, bench_rate, ratio, settings)
        if flag:
            flags.append(flag)

    return flags


def _evaluate_ratio(
    item: LineItem, bench_rate: float, ratio: float, settings
) -> Optional[Flag]:
    """Evaluate the charge-to-benchmark ratio and create a flag if needed."""
    if ratio > settings.overcharge_high:
        pct = (ratio - 1) * 100
        return Flag(
            item=item.description,
            charged=item.amount,
            benchmark=bench_rate,
            severity=Severity.HIGH,
            reason=f"Charged {pct:.0f}% above CMS Medicare benchmark "
                   f"(${bench_rate:.2f}). This is a significant overcharge.",
            covered_by_insurance=True,
        )
    elif ratio > settings.overcharge_medium:
        pct = (ratio - 1) * 100
        return Flag(
            item=item.description,
            charged=item.amount,
            benchmark=bench_rate,
            severity=Severity.MEDIUM,
            reason=f"Charged {pct:.0f}% above CMS Medicare benchmark "
                   f"(${bench_rate:.2f}). May warrant review.",
            covered_by_insurance=True,
        )
    elif ratio > 1.05:
        pct = (ratio - 1) * 100
        return Flag(
            item=item.description,
            charged=item.amount,
            benchmark=bench_rate,
            severity=Severity.LOW,
            reason=f"Charged {pct:.0f}% above CMS Medicare benchmark "
                   f"(${bench_rate:.2f}). Minor discrepancy.",
            covered_by_insurance=True,
        )
    return None


def _check_facility_charge(
    item: LineItem, rates: Dict, settings
) -> Optional[Flag]:
    """Check facility charges (room, OR, etc.) against benchmarks."""
    desc_lower = item.description.lower()

    # Map description keywords to benchmark codes
    facility_map = {
        "room": "ROOM",
        "private room": "ROOM-P",
        "operating room": "OPER",
        "recovery": "RECOV",
        "iv setup": "IV-SET",
        "iv supplies": "IV-SET",
        "pharmacy": "PHARM",
        "dispensing": "PHARM",
    }

    for keyword, code in facility_map.items():
        if keyword in desc_lower:
            benchmark = rates.get(code)
            if benchmark:
                bench_rate = benchmark["rate"]
                ratio = item.amount / bench_rate if bench_rate > 0 else 0
                return _evaluate_ratio(item, bench_rate, ratio, settings)

    return None


def get_all_benchmarks() -> Dict:
    """Return the full CMS rates dictionary."""
    return _load_cms_rates()
