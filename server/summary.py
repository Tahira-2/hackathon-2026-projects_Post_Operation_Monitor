"""Summary generation: take a window of vitals and a patient's prescription,
produce a structured summary row + a short human-readable narrative.

Reuses the existing analysis_engine for per-30-min classification, then rolls
the windowed cycles into one summary record matching the `summaries` table.
Also exposes helpers that render an envelope or a summary as CSV bytes for
the doctor-facing download (CSV opens in Excel by default).
"""

from __future__ import annotations

import csv
import io
import time
from dataclasses import dataclass

from src.analysis_engine import Status, analyze_window
from src.prescription_parser import (
    CSV1_HEADER, PrescriptionRow, parse_prescription, write_csv1,
)
from src.sensor_simulator import SAMPLE_INTERVAL_MIN
from src.vitals import VITAL_BY_KEY, VITAL_KEYS

from .config import SUMMARY_WINDOW_HOURS
from .db import standalone_connection
from .sim_runner import stream_for


CYCLE_MINUTES = 30
SAMPLES_PER_CYCLE = CYCLE_MINUTES // SAMPLE_INTERVAL_MIN  # 10 with 3-min cadence


@dataclass
class GeneratedSummary:
    summary_id: int
    patient_id: int
    sim_hour_start: float
    sim_hour_end: float
    status_overall: Status
    averages: dict[str, float]
    alert_count_warn: int
    alert_count_critical: int
    narrative: str


def _prescription_for(patient_row: dict) -> dict[str, PrescriptionRow]:
    """Resolve the patient's active envelope.

    Preference order:
      1. The pre-parsed envelope_csv stored on the patient row (set when a
         doctor saves a note via /api/doctor/patients/<id>/note).
      2. Re-parse the raw `prescription` text on the fly (e.g. seed data
         that has text but never had a doctor save it via the form).
      3. Population defaults if neither is set.
    """
    csv_text = patient_row.get("envelope_csv") or ""
    if csv_text.strip():
        return parse_envelope_csv(csv_text)

    text = patient_row.get("prescription") or ""
    rows, _ = parse_prescription(
        text or "Default post-op patient with no special instructions."
    )
    return {r.vital: r for r in rows}


def parse_envelope_csv(csv_text: str) -> dict[str, PrescriptionRow]:
    """Inverse of envelope_to_csv() — parse CSV-1 text back into PrescriptionRow."""
    out: dict[str, PrescriptionRow] = {}
    reader = csv.DictReader(io.StringIO(csv_text))
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


def envelope_to_csv(rows: list[PrescriptionRow]) -> str:
    """Render a parsed envelope as CSV-1 text (for storage and download)."""
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=CSV1_HEADER)
    writer.writeheader()
    for r in rows:
        writer.writerow({
            "vital": r.vital, "unit": r.unit,
            "baseline_low": r.baseline_low, "baseline_high": r.baseline_high,
            "warn_low": r.warn_low, "warn_high": r.warn_high,
            "critical_low": r.critical_low, "critical_high": r.critical_high,
            "notes": r.notes,
        })
    return buf.getvalue()


def parse_doctors_note(text: str) -> tuple[list[PrescriptionRow], str, str]:
    """Parse a doctor's free-text note into (envelope_rows, csv_text, source).

    `source` is "llm" or "fallback" — useful in the UI to indicate which
    parser ran. The CSV text is the canonical form stored on the patient row
    and offered as a download to the doctor.
    """
    rows, source = parse_prescription(text)
    return rows, envelope_to_csv(rows), source


def _build_narrative(
    patient_name: str,
    overall: Status,
    averages: dict[str, float],
    crit: int,
    warn: int,
    sim_hour_start: float,
    sim_hour_end: float,
) -> str:
    lines = []
    lines.append(
        f"12-hour summary for {patient_name or 'patient'} "
        f"(simulated hours {sim_hour_start:.1f}-{sim_hour_end:.1f})"
    )
    lines.append(f"Overall status: {overall.value}")
    lines.append(
        f"Critical cycles: {crit}    Warning cycles: {warn}    "
        f"Total cycles in window: ~{int(round((sim_hour_end - sim_hour_start) * 2))}"
    )
    lines.append("")
    lines.append("Averages over window:")
    label = lambda k: VITAL_BY_KEY[k].label
    unit = lambda k: VITAL_BY_KEY[k].unit
    for key in ("heart_rate", "hrv", "respiratory_rate", "spo2", "body_temp"):
        lines.append(f"  - {label(key)}: {averages[key]:.1f} {unit(key)}")

    if overall == Status.CRITICAL:
        lines.append("")
        lines.append(
            "ACTION: vitals exceeded the critical envelope. Recommend immediate "
            "clinical review."
        )
    elif overall == Status.WARNING:
        lines.append("")
        lines.append("Vitals trending out of the prescribed range. Recommend follow-up.")
    return "\n".join(lines)


def generate_summary_for_patient(patient_row: dict) -> GeneratedSummary | None:
    """Generate a 12h summary using the patient's current simulated stream.

    Returns None if not enough simulated time has elapsed yet to produce a
    meaningful summary (we require at least one complete 30-min cycle).
    """
    patient_id = int(patient_row["id"])
    stream = stream_for(patient_id)
    pos = stream.position()

    sim_end = pos.sim_hour_now
    sim_start = max(0.0, sim_end - SUMMARY_WINDOW_HOURS)
    samples = stream.samples_in_window(hour_start=sim_start, hour_end=sim_end)
    if len(samples) < SAMPLES_PER_CYCLE:
        return None

    prescription = _prescription_for(patient_row)

    # Roll the window into 30-min sub-cycles so we get warn/critical counts.
    crit = warn = 0
    cycles = []
    for i in range(0, len(samples) - SAMPLES_PER_CYCLE + 1, SAMPLES_PER_CYCLE):
        sub = samples[i:i + SAMPLES_PER_CYCLE]
        cycle = analyze_window(i // SAMPLES_PER_CYCLE, sub, prescription)
        cycles.append(cycle)
        if cycle.overall_status == Status.CRITICAL:
            crit += 1
        elif cycle.overall_status == Status.WARNING:
            warn += 1

    # One overall analyze_window across the full window for averages + status.
    full = analyze_window(0, samples, prescription)
    averages = {r.vital: r.average for r in full.readings}
    overall = Status.CRITICAL if crit else (Status.WARNING if warn else Status.NORMAL)

    narrative = _build_narrative(
        patient_name=patient_row.get("full_name", ""),
        overall=overall,
        averages=averages,
        crit=crit,
        warn=warn,
        sim_hour_start=sim_start,
        sim_hour_end=sim_end,
    )

    conn = standalone_connection()
    try:
        cur = conn.execute(
            """INSERT INTO summaries
               (patient_id, generated_at, sim_hour_start, sim_hour_end, status_overall,
                hr_avg, hrv_avg, rr_avg, spo2_avg, temp_avg,
                alert_count_warn, alert_count_critical, narrative)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               RETURNING id""",
            (
                patient_id, int(time.time()), sim_start, sim_end, overall.value,
                averages["heart_rate"], averages["hrv"], averages["respiratory_rate"],
                averages["spo2"], averages["body_temp"],
                warn, crit, narrative,
            ),
        )
        summary_id = cur.fetchone()["id"]
        conn.commit()
    finally:
        conn.close()

    return GeneratedSummary(
        summary_id=summary_id,
        patient_id=patient_id,
        sim_hour_start=sim_start,
        sim_hour_end=sim_end,
        status_overall=overall,
        averages=averages,
        alert_count_warn=warn,
        alert_count_critical=crit,
        narrative=narrative,
    )


def summary_to_csv(summary_row: dict, patient_row: dict) -> str:
    """Render a stored summary as a doctor-friendly CSV download.

    Two sections:
      1. metadata KEY,VALUE rows at the top (patient, window, overall status,
         alert counts, narrative);
      2. a blank line and then a per-vital table with the average value, the
         per-vital classification, and the envelope ranges that drove it.
    """
    prescription = _prescription_for(patient_row)
    buf = io.StringIO()
    w = csv.writer(buf)

    avg_for = {
        "heart_rate":       summary_row["hr_avg"],
        "hrv":              summary_row["hrv_avg"],
        "respiratory_rate": summary_row["rr_avg"],
        "spo2":             summary_row["spo2_avg"],
        "body_temp":        summary_row["temp_avg"],
    }

    w.writerow(["GuardianPost-Op summary"])
    w.writerow(["patient", patient_row.get("full_name") or patient_row.get("phone") or ""])
    w.writerow(["sim_hour_start", f"{summary_row['sim_hour_start']:.2f}"])
    w.writerow(["sim_hour_end",   f"{summary_row['sim_hour_end']:.2f}"])
    w.writerow(["overall_status", summary_row["status_overall"]])
    w.writerow(["critical_cycles_in_window", summary_row["alert_count_critical"]])
    w.writerow(["warning_cycles_in_window",  summary_row["alert_count_warn"]])
    w.writerow([])
    w.writerow([
        "vital", "unit", "average", "classification", "deviation_note",
        "baseline_low", "baseline_high",
        "warn_low", "warn_high",
        "critical_low", "critical_high",
    ])
    for key in VITAL_KEYS:
        rule = prescription.get(key)
        if rule is None:
            continue
        avg = float(avg_for[key])
        if avg < rule.critical_low:
            cls, note = "CRITICAL", f"{avg:.2f} below critical_low {rule.critical_low}"
        elif avg > rule.critical_high:
            cls, note = "CRITICAL", f"{avg:.2f} above critical_high {rule.critical_high}"
        elif avg < rule.warn_low:
            cls, note = "WARNING", f"{avg:.2f} below warn_low {rule.warn_low}"
        elif avg > rule.warn_high:
            cls, note = "WARNING", f"{avg:.2f} above warn_high {rule.warn_high}"
        else:
            cls, note = "NORMAL", f"within baseline {rule.baseline_low}-{rule.baseline_high}"
        w.writerow([
            key, rule.unit, f"{avg:.2f}", cls, note,
            rule.baseline_low, rule.baseline_high,
            rule.warn_low, rule.warn_high,
            rule.critical_low, rule.critical_high,
        ])
    w.writerow([])
    w.writerow(["narrative"])
    for line in (summary_row["narrative"] or "").splitlines():
        w.writerow([line])
    return buf.getvalue()


def deliver_to_consenting_doctors(
    summary: GeneratedSummary, *, trigger: str,
) -> list[int]:
    """Insert summary_sends rows for every doctor with permission_granted=1.

    Returns the list of doctor_ids the summary was delivered to.
    """
    if trigger not in ("auto", "manual"):
        raise ValueError(trigger)
    conn = standalone_connection()
    try:
        rows = conn.execute(
            """SELECT doctor_id FROM care_links
               WHERE patient_id = ? AND permission_granted = 1""",
            (summary.patient_id,),
        ).fetchall()
        doctor_ids = [int(r["doctor_id"]) for r in rows]
        now = int(time.time())
        for did in doctor_ids:
            conn.execute(
                """INSERT INTO summary_sends
                   (summary_id, doctor_id, trigger, sent_at)
                   VALUES (?, ?, ?, ?)""",
                (summary.summary_id, did, trigger, now),
            )
        conn.commit()
        return doctor_ids
    finally:
        conn.close()
