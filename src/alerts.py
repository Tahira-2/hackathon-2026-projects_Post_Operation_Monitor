"""Dual-alert payload generation.

A CRITICAL or WARNING cycle produces two payloads:

  1. device_payload : what the wearable's MCU would act on.
        - Yellow LED + 3 beeps for WARNING
        - Red LED + continuous beep for CRITICAL
     Format mirrors what we'd push over BLE to the on-device firmware.

  2. push_payload   : what the mobile gateway would forward to the clinician
     dashboard as a critical-priority push notification (the "bypasses Do Not
     Disturb" channel called out in the proposal).

Alerts are appended as JSON Lines so the dashboard / a downstream consumer can
replay the alert history.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, asdict
from pathlib import Path

from .analysis_engine import CycleResult, Status


@dataclass
class DevicePayload:
    led: str            # "off" | "yellow" | "red"
    buzzer: str         # "off" | "three_beeps" | "continuous"
    kill_switch_armed: bool


@dataclass
class PushPayload:
    priority: str       # "info" | "high" | "critical"
    bypass_dnd: bool
    title: str
    body: str
    triggering_vitals: list[str]


@dataclass
class Alert:
    cycle_index: int
    window_start_hour: float
    window_end_hour: float
    status: Status
    device: DevicePayload
    push: PushPayload


def _device_for_status(status: Status) -> DevicePayload:
    if status == Status.CRITICAL:
        return DevicePayload(led="red", buzzer="continuous", kill_switch_armed=True)
    if status == Status.WARNING:
        return DevicePayload(led="yellow", buzzer="three_beeps", kill_switch_armed=True)
    return DevicePayload(led="off", buzzer="off", kill_switch_armed=False)


def _push_for_cycle(cycle: CycleResult) -> PushPayload:
    triggering = [r.vital for r in cycle.readings if r.status != Status.NORMAL]
    detail = "; ".join(
        r.deviation_note for r in cycle.readings if r.status != Status.NORMAL
    )
    if cycle.overall_status == Status.CRITICAL:
        return PushPayload(
            priority="critical",
            bypass_dnd=True,
            title=f"CRITICAL — patient out of safe envelope (cycle {cycle.cycle_index})",
            body=detail or "Critical deviation detected.",
            triggering_vitals=triggering,
        )
    if cycle.overall_status == Status.WARNING:
        return PushPayload(
            priority="high",
            bypass_dnd=False,
            title=f"Warning — vitals trending out of range (cycle {cycle.cycle_index})",
            body=detail or "Warning trend detected.",
            triggering_vitals=triggering,
        )
    return PushPayload(
        priority="info",
        bypass_dnd=False,
        title=f"Cycle {cycle.cycle_index} normal",
        body="All vitals within prescribed envelope.",
        triggering_vitals=[],
    )


def build_alert(cycle: CycleResult) -> Alert:
    return Alert(
        cycle_index=cycle.cycle_index,
        window_start_hour=cycle.window_start_hour,
        window_end_hour=cycle.window_end_hour,
        status=cycle.overall_status,
        device=_device_for_status(cycle.overall_status),
        push=_push_for_cycle(cycle),
    )


def append_alert(path: Path, alert: Alert) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    record = {
        "cycle_index": alert.cycle_index,
        "window_start_hour": alert.window_start_hour,
        "window_end_hour": alert.window_end_hour,
        "status": alert.status.value,
        "device": asdict(alert.device),
        "push": asdict(alert.push),
    }
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record) + "\n")
