"""Generate the 24-hour mock sensor stream described in the demo storyline.

Hours 0-17:  normal post-op recovery (gentle circadian dip overnight).
Hour  18:    arrhythmia onset — HR climbs 73 -> 88, HRV drops 45 -> 30, RR ticks up.
Hour  20:    sustained tachycardia ~118 bpm; SpO2 dips, RR elevated.
Hour  22+:   crisis continues until end of day (clinician would have intervened
             well before this in practice; we keep the signal so the dashboard
             clearly shows the deviation envelope).

Sample cadence is 2 minutes -> 720 samples per 24h.
"""

from __future__ import annotations

import csv
import math
import random
from dataclasses import dataclass
from pathlib import Path

SAMPLE_INTERVAL_MIN = 2
SAMPLES_PER_HOUR = 60 // SAMPLE_INTERVAL_MIN  # 30
TOTAL_HOURS = 24
TOTAL_SAMPLES = TOTAL_HOURS * SAMPLES_PER_HOUR  # 720

CRISIS_ONSET_HOUR = 18
TACHY_PEAK_HOUR = 20

SENSOR_HEADER = [
    "minute_offset", "hour",
    "heart_rate", "hrv", "respiratory_rate", "spo2", "body_temp",
]


@dataclass
class SensorSample:
    minute_offset: int
    hour: float
    heart_rate: float
    hrv: float
    respiratory_rate: float
    spo2: float
    body_temp: float


def _circadian_hr_offset(hour: float) -> float:
    """Mild overnight dip, gentle daytime rise. Peak around 16:00, trough ~04:00."""
    return 4.0 * math.sin((hour - 10.0) * math.pi / 12.0)


def _baseline_sample(hour: float, rng: random.Random) -> SensorSample:
    hr = 73 + _circadian_hr_offset(hour) + rng.gauss(0, 1.8)
    hrv = 45 + rng.gauss(0, 4.0)
    rr = 14 + rng.gauss(0, 0.7)
    spo2 = 97 + rng.gauss(0, 0.5)
    spo2 = min(100.0, spo2)
    temp = 36.7 + 0.2 * math.sin((hour - 6.0) * math.pi / 12.0) + rng.gauss(0, 0.08)
    return SensorSample(0, hour, hr, hrv, rr, spo2, temp, )


def _apply_crisis(sample: SensorSample, hour: float, rng: random.Random) -> SensorSample:
    """Bend a baseline sample toward the engineered cardiac crisis trajectory.

    From CRISIS_ONSET_HOUR..TACHY_PEAK_HOUR we ramp linearly to the peak,
    then hold. Effects:
      - HR rises smoothly toward 118 bpm
      - HRV collapses from ~45 to ~22 ms
      - RR climbs from ~14 to ~24 bpm
      - SpO2 drifts downward modestly (97 -> 92)
      - Body temp ticks up slightly (low-grade post-op response)
    """
    if hour < CRISIS_ONSET_HOUR:
        return sample

    # Ramp 0..1 across the onset window; clamp to 1 after the peak.
    span = max(1e-6, TACHY_PEAK_HOUR - CRISIS_ONSET_HOUR)
    t = min(1.0, (hour - CRISIS_ONSET_HOUR) / span)

    target_hr = 73 + (118 - 73) * t
    target_hrv = 45 + (22 - 45) * t
    target_rr = 14 + (24 - 14) * t
    target_spo2 = 97 + (92 - 97) * t
    target_temp = 36.7 + (37.6 - 36.7) * t

    return SensorSample(
        minute_offset=sample.minute_offset,
        hour=sample.hour,
        heart_rate=target_hr + rng.gauss(0, 1.6),
        hrv=max(10.0, target_hrv + rng.gauss(0, 2.5)),
        respiratory_rate=target_rr + rng.gauss(0, 0.9),
        spo2=min(100.0, target_spo2 + rng.gauss(0, 0.4)),
        body_temp=target_temp + rng.gauss(0, 0.07),
    )


def generate(seed: int = 42) -> list[SensorSample]:
    rng = random.Random(seed)
    out: list[SensorSample] = []
    for i in range(TOTAL_SAMPLES):
        minute_offset = i * SAMPLE_INTERVAL_MIN
        hour = minute_offset / 60.0
        sample = _baseline_sample(hour, rng)
        sample = SensorSample(minute_offset, hour,
                              sample.heart_rate, sample.hrv,
                              sample.respiratory_rate, sample.spo2,
                              sample.body_temp)
        sample = _apply_crisis(sample, hour, rng)
        out.append(sample)
    return out


def write_full_stream(samples: list[SensorSample], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(SENSOR_HEADER)
        for s in samples:
            w.writerow([
                s.minute_offset, f"{s.hour:.4f}",
                f"{s.heart_rate:.2f}", f"{s.hrv:.2f}",
                f"{s.respiratory_rate:.2f}", f"{s.spo2:.2f}",
                f"{s.body_temp:.3f}",
            ])


def write_csv2_window(samples: list[SensorSample], path: Path) -> None:
    """Write the rolling CSV-2 buffer for the last analysis window.

    The wearable would emit this 30-minute file, then the gateway would clear
    it after the analysis cycle. We rewrite the file each cycle in the demo.
    """
    write_full_stream(samples, path)


if __name__ == "__main__":
    here = Path(__file__).resolve().parent.parent
    samples = generate()
    out = here / "data" / "sensor_full_24h.csv"
    write_full_stream(samples, out)
    print(f"Wrote {len(samples)} samples (24h @ {SAMPLE_INTERVAL_MIN}-min cadence) -> {out}")
    crisis_idx = CRISIS_ONSET_HOUR * SAMPLES_PER_HOUR
    peak_idx = TACHY_PEAK_HOUR * SAMPLES_PER_HOUR
    print(f"Hour {CRISIS_ONSET_HOUR:>2} sample: HR={samples[crisis_idx].heart_rate:.1f} bpm")
    print(f"Hour {TACHY_PEAK_HOUR:>2} sample: HR={samples[peak_idx].heart_rate:.1f} bpm")
