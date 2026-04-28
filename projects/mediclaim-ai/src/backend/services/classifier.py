"""
MediClaim AI — Severity Classification
Assigns HIGH / MEDIUM / LOW severity to each flagged issue.
Pure Python — 100% deterministic, no LLM.
"""

from typing import List
from backend.models.bill import Flag, Severity, LineItem


def classify_flags(flags: List[Flag], line_items: List[LineItem]) -> List[Flag]:
    """
    Review and possibly upgrade/downgrade flag severity based on rules.

    Rules:
    - HIGH:   overcharge >50% OR unrecognized charge >$200
    - MEDIUM: overcharge 20-50% OR vague description
    - LOW:    minor discrepancy OR informational
    """
    classified = []
    for flag in flags:
        # Upgrade: unrecognized charge with high amount
        if flag.benchmark is None and flag.charged > 200:
            flag.severity = Severity.HIGH
            if "not found" in flag.reason.lower():
                flag.reason = (
                    f"Unrecognized charge of ${flag.charged:,.2f}. "
                    f"This CPT code is not in the CMS benchmark database. "
                    f"Request an itemized explanation from your provider."
                )

        # Check for vague descriptions
        if _is_vague_description(flag.item):
            if flag.severity == Severity.LOW:
                flag.severity = Severity.MEDIUM
            flag.reason += " Description is vague — request itemized details."

        classified.append(flag)

    # Check for duplicate charges
    dup_flags = _detect_duplicates(line_items)
    classified.extend(dup_flags)

    return classified


def _is_vague_description(description: str) -> bool:
    """Check if a line item description is too vague."""
    vague_terms = [
        "miscellaneous", "misc", "other", "supplies", "general",
        "charges", "services", "fee", "additional", "sundry",
        "various", "materials", "items"
    ]
    desc_lower = description.lower().strip()

    # Very short descriptions are suspicious
    if len(desc_lower) < 5:
        return True

    # Single vague word
    words = desc_lower.split()
    if len(words) <= 2 and any(v in desc_lower for v in vague_terms):
        return True

    return False


def _detect_duplicates(items: List[LineItem]) -> List[Flag]:
    """Detect potential duplicate charges."""
    flags = []
    seen = {}
    for item in items:
        key = (item.description.lower().strip(), item.amount)
        if key in seen:
            seen[key] += 1
            if seen[key] == 2:  # Flag on second occurrence
                flags.append(Flag(
                    item=item.description,
                    charged=item.amount,
                    benchmark=None,
                    severity=Severity.HIGH,
                    reason=f"Potential duplicate charge: '{item.description}' "
                           f"for ${item.amount:,.2f} appears multiple times.",
                    covered_by_insurance=True,
                ))
        else:
            seen[key] = 1
    return flags


def generate_summary(flags: List[Flag], total_charged: float) -> str:
    """Generate a human-readable summary of all flagged issues."""
    if not flags:
        return (
            "No significant billing issues were detected. "
            "All charges appear to be within normal ranges."
        )

    high = [f for f in flags if f.severity == Severity.HIGH]
    medium = [f for f in flags if f.severity == Severity.MEDIUM]
    low = [f for f in flags if f.severity == Severity.LOW]

    parts = [f"We found {len(flags)} issue(s) with your bill"]

    if high:
        parts.append(f", including {len(high)} critical concern(s)")
    parts.append(".")

    # Potential savings
    total_overcharge = sum(
        (f.charged - f.benchmark) for f in flags
        if f.benchmark and f.charged > f.benchmark
    )
    if total_overcharge > 0:
        parts.append(
            f" You may be overcharged by approximately ${total_overcharge:,.2f} "
            f"compared to CMS Medicare benchmark rates."
        )

    if high:
        parts.append(f" Review the {len(high)} HIGH severity item(s) first.")

    return "".join(parts)
