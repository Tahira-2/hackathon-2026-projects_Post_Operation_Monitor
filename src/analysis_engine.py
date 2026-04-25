"""The 30-minute analysis cycle — the AI 'referee' from the proposal.

A cycle takes the rolling CSV-2 buffer, computes per-vital averages, compares
against the patient's CSV-1 envelope, and classifies each vital as
NORMAL / WARNING / CRITICAL. The per-vital classifications are reduced to a
single overall cycle status (worst-case wins). Cycle results are appended to
the long-term Recovery Log for the clinician dashboard.
"""

from __future__ import annotations

import csv
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from statistics import mean

from .prescription_parser import PrescriptionRow
from .sensor_simulator import SensorSample
from .vitals import VITAL_KEYS, VITAL_BY_KEY


class Status(str, Enum):
    NORMAL = "NORMAL"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"

    @classmethod
    def worst(cls, statuses: list["Status"]) -> "Status":
        if any(s == cls.CRITICAL for s in statuses):
            return cls.CRITICAL
        if any(s == cls.WARNING for s in statuses):
            return cls.WARNING
        return cls.NORMAL


@dataclass
class VitalReading:
    vital: str
    average: float
    status: Status
    deviation_note: str  # short human-readable reason ("HR 118.2 > critical_high 110")


@dataclass
class CycleResult:
    cycle_index: int
    window_start_hour: float
    window_end_hour: float
    overall_status: Status
    readings: list[VitalReading] = field(default_factory=list)


def _classify_vital(vital_key: str, value: float, rule: PrescriptionRow) -> VitalReading:
    if value < rule.critical_low:
        return VitalReading(vital_key, value, Status.CRITICAL,
                            f"{vital_key} {value:.1f} < critical_low {rule.critical_low}")
    if value > rule.critical_high:
        return VitalReading(vital_key, value, Status.CRITICAL,
                            f"{vital_key} {value:.1f} > critical_high {rule.critical_high}")
    if value < rule.warn_low:
        return VitalReading(vital_key, value, Status.WARNING,
                            f"{vital_key} {value:.1f} < warn_low {rule.warn_low}")
    if value > rule.warn_high:
        return VitalReading(vital_key, value, Status.WARNING,
                            f"{vital_key} {value:.1f} > warn_high {rule.warn_high}")
    return VitalReading(vital_key, value, Status.NORMAL,
                        f"{vital_key} {value:.1f} within {rule.baseline_low}-{rule.baseline_high}")


def analyze_window(
    cycle_index: int,
    window: list[SensorSample],
    prescription: dict[str, PrescriptionRow],
) -> CycleResult:
    if not window:
        raise ValueError("cannot analyze empty window")

    averages = {
        "heart_rate":       mean(s.heart_rate for s in window),
        "hrv":              mean(s.hrv for s in window),
        "respiratory_rate": mean(s.respiratory_rate for s in window),
        "spo2":             mean(s.spo2 for s in window),
        "body_temp":        mean(s.body_temp for s in window),
    }

    readings = [
        _classify_vital(key, averages[key], prescription[key])
        for key in VITAL_KEYS
    ]

    return CycleResult(
        cycle_index=cycle_index,
        window_start_hour=window[0].hour,
        window_end_hour=window[-1].hour,
        overall_status=Status.worst([r.status for r in readings]),
        readings=readings,
    )


# ---------------------------------------------------------------------------
# Recovery Log persistence
# ---------------------------------------------------------------------------

RECOVERY_LOG_HEADER = [
    "cycle_index", "window_start_hour", "window_end_hour", "overall_status",
    "heart_rate_avg", "hrv_avg", "respiratory_rate_avg", "spo2_avg", "body_temp_avg",
    "heart_rate_status", "hrv_status", "respiratory_rate_status", "spo2_status", "body_temp_status",
]


def init_recovery_log(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        csv.writer(f).writerow(RECOVERY_LOG_HEADER)


def append_to_recovery_log(path: Path, cycle: CycleResult) -> None:
    by_vital = {r.vital: r for r in cycle.readings}
    row = [
        cycle.cycle_index,
        f"{cycle.window_start_hour:.4f}",
        f"{cycle.window_end_hour:.4f}",
        cycle.overall_status.value,
        f"{by_vital['heart_rate'].average:.2f}",
        f"{by_vital['hrv'].average:.2f}",
        f"{by_vital['respiratory_rate'].average:.2f}",
        f"{by_vital['spo2'].average:.2f}",
        f"{by_vital['body_temp'].average:.3f}",
        by_vital['heart_rate'].status.value,
        by_vital['hrv'].status.value,
        by_vital['respiratory_rate'].status.value,
        by_vital['spo2'].status.value,
        by_vital['body_temp'].status.value,
    ]
    with path.open("a", newline="", encoding="utf-8") as f:
        csv.writer(f).writerow(row)


def cycle_summary_line(cycle: CycleResult) -> str:
    by_vital = {r.vital: r for r in cycle.readings}
    spec_label = lambda key: VITAL_BY_KEY[key].label
    return (
        f"[cycle {cycle.cycle_index:02d} | "
        f"hr {cycle.window_start_hour:5.2f}-{cycle.window_end_hour:5.2f}] "
        f"{cycle.overall_status.value:<8} "
        f"HR={by_vital['heart_rate'].average:5.1f} "
        f"HRV={by_vital['hrv'].average:4.1f} "
        f"RR={by_vital['respiratory_rate'].average:4.1f} "
        f"SpO2={by_vital['spo2'].average:4.1f} "
        f"T={by_vital['body_temp'].average:4.2f}"
    )
