"""End-to-end demo: prescription -> 24h sensor stream -> 48 analysis cycles ->
recovery log + alerts -> clinician dashboard PNG.

Run:
    python -m src.run_demo

Outputs (under data/ and demo_output/):
    data/csv1_prescription.csv     parsed envelope
    data/sensor_full_24h.csv       full 24h simulated stream
    data/csv2_buffer.csv           the rolling buffer for the FINAL cycle
                                   (overwritten each cycle in production)
    data/recovery_log.csv          one row per 30-min cycle
    data/alerts.jsonl              one row per non-normal cycle
    demo_output/dashboard.png      clinician visualization
    demo_output/transcript.txt     human-readable cycle-by-cycle log
"""

from __future__ import annotations

import sys
from dataclasses import asdict
from pathlib import Path

from .alerts import append_alert, build_alert
from .analysis_engine import (
    Status,
    analyze_window,
    append_to_recovery_log,
    cycle_summary_line,
    init_recovery_log,
)
from .prescription_parser import parse_prescription, write_csv1
from .sensor_simulator import (
    SAMPLES_PER_HOUR,
    SAMPLE_INTERVAL_MIN,
    TOTAL_SAMPLES,
    generate,
    write_csv2_window,
    write_full_stream,
)


CYCLE_MINUTES = 30
SAMPLES_PER_CYCLE = CYCLE_MINUTES // SAMPLE_INTERVAL_MIN  # 15
TOTAL_CYCLES = TOTAL_SAMPLES // SAMPLES_PER_CYCLE        # 48


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    data_dir = root / "data"
    out_dir = root / "demo_output"
    data_dir.mkdir(exist_ok=True)
    out_dir.mkdir(exist_ok=True)

    csv1_path = data_dir / "csv1_prescription.csv"
    sensor_full_path = data_dir / "sensor_full_24h.csv"
    csv2_path = data_dir / "csv2_buffer.csv"
    recovery_log_path = data_dir / "recovery_log.csv"
    alerts_path = data_dir / "alerts.jsonl"
    transcript_path = out_dir / "transcript.txt"

    # ---- 1. Prescription -------------------------------------------------
    prescription_text = (data_dir / "sample_prescription.txt").read_text(encoding="utf-8")
    rows, source = parse_prescription(prescription_text)
    write_csv1(rows, csv1_path)
    prescription = {r.vital: r for r in rows}
    print(f"[1/4] Parsed prescription via {source!r} -> {csv1_path.name}")

    # ---- 2. Sensor stream ------------------------------------------------
    samples = generate(seed=42)
    write_full_stream(samples, sensor_full_path)
    print(f"[2/4] Generated {len(samples)} samples ({len(samples)//SAMPLES_PER_HOUR}h "
          f"@ {SAMPLE_INTERVAL_MIN}-min cadence) -> {sensor_full_path.name}")

    # ---- 3. 30-min analysis cycles --------------------------------------
    init_recovery_log(recovery_log_path)
    if alerts_path.exists():
        alerts_path.unlink()  # start fresh

    transcript_lines: list[str] = []
    transcript_lines.append("Per-cycle analysis transcript")
    transcript_lines.append("=" * 80)
    counts = {Status.NORMAL: 0, Status.WARNING: 0, Status.CRITICAL: 0}

    for cycle_index in range(TOTAL_CYCLES):
        start = cycle_index * SAMPLES_PER_CYCLE
        end = start + SAMPLES_PER_CYCLE
        window = samples[start:end]

        # Mirror the wearable's behavior: the device writes the rolling buffer,
        # the analysis cycle reads it, then the buffer is cleared.
        write_csv2_window(window, csv2_path)

        cycle = analyze_window(cycle_index, window, prescription)
        append_to_recovery_log(recovery_log_path, cycle)
        alert = build_alert(cycle)
        if cycle.overall_status != Status.NORMAL:
            append_alert(alerts_path, alert)

        counts[cycle.overall_status] += 1
        line = cycle_summary_line(cycle)
        transcript_lines.append(line)
        if cycle.overall_status != Status.NORMAL:
            transcript_lines.append(
                f"        -> device: LED={alert.device.led}, buzzer={alert.device.buzzer}"
            )
            transcript_lines.append(
                f"        -> push:   priority={alert.push.priority}, "
                f"bypass_dnd={alert.push.bypass_dnd}, vitals={alert.push.triggering_vitals}"
            )
            transcript_lines.append(f"        -> body:   {alert.push.body}")

        # Stream a compact line to stdout so the demo feels live.
        print(line)

    print(
        f"[3/4] Ran {TOTAL_CYCLES} cycles -> "
        f"NORMAL={counts[Status.NORMAL]} "
        f"WARNING={counts[Status.WARNING]} "
        f"CRITICAL={counts[Status.CRITICAL]}"
    )

    transcript_lines.append("")
    transcript_lines.append("Summary")
    transcript_lines.append("-" * 80)
    transcript_lines.append(
        f"NORMAL={counts[Status.NORMAL]}  "
        f"WARNING={counts[Status.WARNING]}  "
        f"CRITICAL={counts[Status.CRITICAL]}"
    )
    transcript_path.write_text("\n".join(transcript_lines) + "\n", encoding="utf-8")

    # ---- 4. Dashboard ----------------------------------------------------
    from . import dashboard  # local import to keep matplotlib optional for tests
    dash_path = dashboard.render(
        csv1_path=csv1_path,
        recovery_log_path=recovery_log_path,
        alerts_path=alerts_path,
        out_png=out_dir / "dashboard.png",
    )
    print(f"[4/4] Rendered clinician dashboard -> {dash_path.relative_to(root)}")
    print(f"      Transcript: {transcript_path.relative_to(root)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
