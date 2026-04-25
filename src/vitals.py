"""Vital-sign definitions used across the pipeline.

The proposal lists six clinically-relevant vitals. We model the five that the
specified hardware (MAX30102 + MLX90614) can sample continuously at 2-minute
cadence. Sleep and BP would arrive via separate channels (sleep staging from
HR/HRV/movement post-hoc; BP from a paired cuff) and are out of scope for the
live-streaming demo.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class VitalSpec:
    key: str
    label: str
    unit: str
    # Population-default envelope. The clinician's prescription overrides these
    # per-patient via the LLM parser.
    default_baseline_low: float
    default_baseline_high: float
    default_warn_low: float
    default_warn_high: float
    default_critical_low: float
    default_critical_high: float


VITALS: list[VitalSpec] = [
    VitalSpec("heart_rate",       "Heart Rate",       "bpm", 60,   80,   55,   95,   50,   110),
    VitalSpec("hrv",              "HRV",              "ms",  35,   55,   28,   70,   20,   90),
    VitalSpec("respiratory_rate", "Respiratory Rate", "bpm", 12,   18,   10,   22,   8,    28),
    VitalSpec("spo2",             "SpO2",             "%",   95,   100,  93,   100,  90,   100),
    VitalSpec("body_temp",        "Body Temp",        "C",   36.2, 37.2, 35.8, 37.8, 35.0, 38.5),
]

VITAL_KEYS: list[str] = [v.key for v in VITALS]
VITAL_BY_KEY: dict[str, VitalSpec] = {v.key: v for v in VITALS}
