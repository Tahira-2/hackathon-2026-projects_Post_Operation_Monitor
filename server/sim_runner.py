"""Per-patient wearable simulator.

Each patient gets a `PatientStream` that owns a 24h pre-generated trace from
src.sensor_simulator. Wall-clock time is mapped to simulated time via
DEMO_TIME_SCALE so the demo plays back fast.

The patient app polls /api/patient/vitals/live which reads the rolling window
(`window_ending_at_now`) from the stream — exactly the role the BLE-to-mobile
gateway will play once real hardware exists.
"""

from __future__ import annotations

import threading
import time
from dataclasses import dataclass
from typing import Iterable

from src.sensor_simulator import (
    SAMPLE_INTERVAL_MIN,
    SAMPLES_PER_HOUR,
    SensorSample,
    TOTAL_HOURS,
    generate,
)

from .config import DEMO_TIME_SCALE


@dataclass
class StreamPosition:
    sim_hour_now: float       # current simulated hour
    last_sample_sim_hour: float
    samples_total: int


class PatientStream:
    """24h pre-generated trace played back in wall-clock time, scaled."""

    def __init__(self, patient_id: int, *, seed: int = 42, time_scale: float = DEMO_TIME_SCALE):
        self.patient_id = patient_id
        self.seed = seed
        self.time_scale = time_scale
        self.samples: list[SensorSample] = generate(seed=seed)
        self._wall_started_at = time.time()

    # ---- Time mapping -------------------------------------------------

    def sim_hour_now(self) -> float:
        elapsed_wall = time.time() - self._wall_started_at
        sim_minutes = elapsed_wall * (self.time_scale / 60.0) * 60.0
        # i.e. sim_seconds = wall_seconds * time_scale -> sim_hours = wall_seconds * time_scale / 3600.
        sim_hours = elapsed_wall * self.time_scale / 3600.0
        return min(sim_hours, float(TOTAL_HOURS))

    def reset(self) -> None:
        self._wall_started_at = time.time()

    # ---- Sample access ------------------------------------------------

    def _index_for_hour(self, hour: float) -> int:
        # Each sample sits at minute_offset = i * SAMPLE_INTERVAL_MIN
        # so hour = i * SAMPLE_INTERVAL_MIN / 60 -> i = hour * 60 / SAMPLE_INTERVAL_MIN
        i = int(hour * 60 / SAMPLE_INTERVAL_MIN)
        return max(0, min(i, len(self.samples) - 1))

    def samples_in_window(self, *, hour_start: float, hour_end: float) -> list[SensorSample]:
        if hour_end <= hour_start:
            return []
        i0 = self._index_for_hour(hour_start)
        i1 = self._index_for_hour(hour_end)
        if i1 < i0:
            i0, i1 = i1, i0
        return self.samples[i0:i1 + 1]

    def recent_window(self, *, window_minutes: int = 30) -> list[SensorSample]:
        end = self.sim_hour_now()
        start = max(0.0, end - window_minutes / 60.0)
        return self.samples_in_window(hour_start=start, hour_end=end)

    def position(self) -> StreamPosition:
        now = self.sim_hour_now()
        last_idx = self._index_for_hour(now)
        return StreamPosition(
            sim_hour_now=now,
            last_sample_sim_hour=self.samples[last_idx].hour,
            samples_total=len(self.samples),
        )


# ---------------------------------------------------------------------------
# Registry: one stream per patient_id. Spawned lazily on first access.
# ---------------------------------------------------------------------------

_streams: dict[int, PatientStream] = {}
_lock = threading.Lock()


def stream_for(patient_id: int) -> PatientStream:
    with _lock:
        if patient_id not in _streams:
            # Use the patient_id as a seed nudge so multiple demo patients have
            # plausibly-different traces but identical engineered crisis shape.
            _streams[patient_id] = PatientStream(patient_id, seed=42 + patient_id)
        return _streams[patient_id]


def all_streams() -> Iterable[PatientStream]:
    with _lock:
        return list(_streams.values())


def reset_all() -> None:
    with _lock:
        _streams.clear()
