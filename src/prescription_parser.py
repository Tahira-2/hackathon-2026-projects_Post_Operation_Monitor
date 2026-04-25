"""Parse a clinician's plain-text prescription into the structured CSV-1 envelope.

Two paths:
  1. If ANTHROPIC_API_KEY is set, ask Claude to extract the envelope using a
     tool-call schema. This is the demo path.
  2. Otherwise, fall back to a deterministic parser that starts from the
     population defaults in vitals.py and applies overrides extracted by simple
     keyword + number rules. This keeps the demo runnable offline / in CI.
"""

from __future__ import annotations

import csv
import json
import os
import re
from dataclasses import dataclass, asdict
from pathlib import Path

from .vitals import VITALS, VITAL_BY_KEY, VitalSpec


@dataclass
class PrescriptionRow:
    vital: str
    unit: str
    baseline_low: float
    baseline_high: float
    warn_low: float
    warn_high: float
    critical_low: float
    critical_high: float
    notes: str = ""

    @classmethod
    def from_default(cls, spec: VitalSpec) -> "PrescriptionRow":
        return cls(
            vital=spec.key,
            unit=spec.unit,
            baseline_low=spec.default_baseline_low,
            baseline_high=spec.default_baseline_high,
            warn_low=spec.default_warn_low,
            warn_high=spec.default_warn_high,
            critical_low=spec.default_critical_low,
            critical_high=spec.default_critical_high,
            notes="",
        )


CSV1_HEADER = [
    "vital", "unit",
    "baseline_low", "baseline_high",
    "warn_low", "warn_high",
    "critical_low", "critical_high",
    "notes",
]


def write_csv1(rows: list[PrescriptionRow], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV1_HEADER)
        writer.writeheader()
        for r in rows:
            writer.writerow(asdict(r))


def read_csv1(path: Path) -> dict[str, PrescriptionRow]:
    with path.open("r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        out: dict[str, PrescriptionRow] = {}
        for row in reader:
            out[row["vital"]] = PrescriptionRow(
                vital=row["vital"],
                unit=row["unit"],
                baseline_low=float(row["baseline_low"]),
                baseline_high=float(row["baseline_high"]),
                warn_low=float(row["warn_low"]),
                warn_high=float(row["warn_high"]),
                critical_low=float(row["critical_low"]),
                critical_high=float(row["critical_high"]),
                notes=row.get("notes", ""),
            )
        return out


# ---------------------------------------------------------------------------
# Path 1: Claude API
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """You are GuardianPost-Op's prescription parser.

A clinician will describe a single post-operative patient's safe vital-sign
ranges in plain English. Your job is to convert that description into a
structured envelope for five vitals: heart_rate (bpm), hrv (ms),
respiratory_rate (bpm), spo2 (%), body_temp (C).

For each vital produce:
  - baseline_low / baseline_high  : the expected normal range
  - warn_low / warn_high          : threshold for a yellow/Warning alert
  - critical_low / critical_high  : threshold for a red/Critical alert

If the clinician does not mention a vital, use sensible post-operative defaults.
If the clinician only specifies an upper bound (e.g. "warn above 95"), keep the
default lower bounds and update only the upper.

Return your answer by calling the `set_envelope` tool exactly once."""


def _envelope_tool_schema() -> dict:
    vital_schema = {
        "type": "object",
        "properties": {
            "baseline_low":  {"type": "number"},
            "baseline_high": {"type": "number"},
            "warn_low":      {"type": "number"},
            "warn_high":     {"type": "number"},
            "critical_low":  {"type": "number"},
            "critical_high": {"type": "number"},
            "notes":         {"type": "string"},
        },
        "required": [
            "baseline_low", "baseline_high",
            "warn_low", "warn_high",
            "critical_low", "critical_high",
        ],
    }
    return {
        "name": "set_envelope",
        "description": "Record the per-vital envelope for this patient.",
        "input_schema": {
            "type": "object",
            "properties": {k: vital_schema for k in VITAL_BY_KEY.keys()},
            "required": list(VITAL_BY_KEY.keys()),
        },
    }


def parse_with_claude(prescription_text: str) -> list[PrescriptionRow] | None:
    """Returns parsed rows, or None if the API path is unavailable."""
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return None
    try:
        import anthropic  # type: ignore
    except ImportError:
        return None

    client = anthropic.Anthropic()
    resp = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=_SYSTEM_PROMPT,
        tools=[_envelope_tool_schema()],
        tool_choice={"type": "tool", "name": "set_envelope"},
        messages=[{"role": "user", "content": prescription_text}],
    )

    payload = None
    for block in resp.content:
        if getattr(block, "type", None) == "tool_use" and block.name == "set_envelope":
            payload = block.input
            break
    if payload is None:
        return None

    rows: list[PrescriptionRow] = []
    for spec in VITALS:
        d = payload.get(spec.key, {})
        rows.append(PrescriptionRow(
            vital=spec.key,
            unit=spec.unit,
            baseline_low=float(d.get("baseline_low", spec.default_baseline_low)),
            baseline_high=float(d.get("baseline_high", spec.default_baseline_high)),
            warn_low=float(d.get("warn_low", spec.default_warn_low)),
            warn_high=float(d.get("warn_high", spec.default_warn_high)),
            critical_low=float(d.get("critical_low", spec.default_critical_low)),
            critical_high=float(d.get("critical_high", spec.default_critical_high)),
            notes=str(d.get("notes", "")),
        ))
    return rows


# ---------------------------------------------------------------------------
# Path 2: deterministic fallback parser
# ---------------------------------------------------------------------------

# Map keywords in the clinician's text to vital keys.
_VITAL_ALIASES = {
    "heart_rate":       ["heart rate", "resting hr", " hr ", "tachycardic", "tachycardia", "bpm"],
    "hrv":              ["hrv", "heart rate variability"],
    "respiratory_rate": ["respiratory rate", "breaths", "respir"],
    "spo2":             ["spo2", "sp o2", "oxygen", "saturation"],
    "body_temp":        ["temperature", "temp", "fever"],
}

_RANGE_RE = re.compile(r"(\d+(?:\.\d+)?)\s*(?:-|to|–)\s*(\d+(?:\.\d+)?)")

# "stay/remain/keep/should-be above N" => N is a LOWER bound (the floor we want
# the value to stay above). "warn/exceed above N" => N is an UPPER bound.
_STAY_ABOVE_RE = re.compile(
    r"(?:stay|remain|keep|stays|remains|should(?:\s+\w+){0,2}\s+above|above\s+\d+(?:\.\d+)?\s+is\s+(?:fine|ok|good|normal))\s+above\s+(\d+(?:\.\d+)?)",
    re.I,
)
# Simpler version for "should stay above N", "remain above N":
_FLOOR_RE = re.compile(
    r"(?:stay|remain|keep|stays|remains|should\s+stay|should\s+remain|should\s+be|should)\s+above\s+(\d+(?:\.\d+)?)",
    re.I,
)
# Generic "above N" (interpreted as upper bound — warn/page when value exceeds N).
_ABOVE_RE = re.compile(r"(?:above|exceeds?|over|>\s*|greater than)\s*(\d+(?:\.\d+)?)", re.I)
_BELOW_RE = re.compile(r"(?:below|under|less than|<\s*|drop[s]?\s+below)\s*(\d+(?:\.\d+)?)", re.I)


def _which_vital(sentence: str) -> str | None:
    s = " " + sentence.lower() + " "
    for vital, aliases in _VITAL_ALIASES.items():
        if any(a in s for a in aliases):
            return vital
    return None


def _is_critical(sentence: str) -> bool:
    s = sentence.lower()
    return any(w in s for w in ("critical", "page", "immediate", "urgent", "call critical"))


def _is_warn(sentence: str) -> bool:
    s = sentence.lower()
    return any(w in s for w in ("warn", "concern", "watch", "trending"))


def parse_with_fallback(prescription_text: str) -> list[PrescriptionRow]:
    rows = {spec.key: PrescriptionRow.from_default(spec) for spec in VITALS}

    sentences = re.split(r"(?<=[.\!?])\s+|\n+", prescription_text)
    last_vital: str | None = None  # follow-on sentences ("Page critical below 90.")
                                    # inherit the prior sentence's vital.

    for sent in sentences:
        if not sent.strip():
            continue

        vital = _which_vital(sent) or last_vital
        if vital is None:
            continue
        last_vital = vital

        row = rows[vital]
        critical = _is_critical(sent)
        warn = _is_warn(sent) or not critical  # default to warn if unspecified

        # Numeric range "N-M" sets the baseline window.
        m = _RANGE_RE.search(sent)
        if m:
            lo, hi = float(m.group(1)), float(m.group(2))
            if lo < hi:
                row.baseline_low, row.baseline_high = lo, hi

        # Mark spans of the sentence already consumed by "stay above" so the
        # generic _ABOVE_RE doesn't double-count them as upper bounds.
        consumed: list[tuple[int, int]] = []

        for fm in _FLOOR_RE.finditer(sent):
            v = float(fm.group(1))
            if critical and not _is_warn(sent):
                row.critical_low = v
            else:
                row.warn_low = v
            consumed.append((fm.start(), fm.end()))

        def _in_consumed(pos: int) -> bool:
            return any(s <= pos < e for s, e in consumed)

        for am in _ABOVE_RE.finditer(sent):
            if _in_consumed(am.start()):
                continue
            v = float(am.group(1))
            if critical:
                row.critical_high = v
            elif warn:
                row.warn_high = v

        for bm in _BELOW_RE.finditer(sent):
            v = float(bm.group(1))
            if critical:
                row.critical_low = v
            elif warn:
                row.warn_low = v

        # Collapse any inconsistencies the heuristics produced (warn must sit
        # inside the critical band; baseline inside warn).
        if row.warn_high > row.critical_high:
            row.warn_high = row.critical_high
        if row.warn_low < row.critical_low:
            row.warn_low = row.critical_low
        if row.baseline_high > row.warn_high:
            row.baseline_high = row.warn_high
        if row.baseline_low < row.warn_low:
            row.baseline_low = row.warn_low
        if row.baseline_low > row.baseline_high:
            row.baseline_low = row.baseline_high
        row.notes = sent.strip()

    return list(rows.values())


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def parse_prescription(prescription_text: str) -> tuple[list[PrescriptionRow], str]:
    """Return (rows, source) where source is "llm" or "fallback"."""
    rows = parse_with_claude(prescription_text)
    if rows is not None:
        return rows, "llm"
    return parse_with_fallback(prescription_text), "fallback"


if __name__ == "__main__":
    # Standalone use: read text from data/sample_prescription.txt, write CSV-1.
    here = Path(__file__).resolve().parent.parent
    text = (here / "data" / "sample_prescription.txt").read_text(encoding="utf-8")
    rows, source = parse_prescription(text)
    out = here / "data" / "csv1_prescription.csv"
    write_csv1(rows, out)
    print(f"Parsed prescription via {source!r} -> {out}")
    print(json.dumps([asdict(r) for r in rows], indent=2))
