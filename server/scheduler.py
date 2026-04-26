"""Background scheduler: runs the AI comparison + alert delivery cadence.

Cadence (per the proposal + the doctor's spec):

  - Wearable transmits every 3 simulated minutes.
  - The AI compares each completed 30-minute window to the patient's
    envelope (this is the "cycle" classification — same engine the 12h
    summaries use).
  - At most one warning notification per simulated hour: if any of the
    two cycles in that hour was non-NORMAL, one live_alerts row is
    inserted summarizing the worst classification + offending vitals.
    Both the patient app and doctor app poll live_alerts.
  - Independently, every AUTO_SUMMARY_PERIOD_HOURS of simulated time we
    generate a fresh 12-hour summary and deliver it to every consenting
    doctor.

Per-patient timing state lives in process memory (dict guarded by a
lock). On a server restart that state is rebuilt from the highest
already-emitted sim_hour we find in the DB, so we don't double-emit.
"""

from __future__ import annotations

import threading
import time
from dataclasses import dataclass, field

from src.analysis_engine import Status, analyze_window
from src.sensor_simulator import SAMPLE_INTERVAL_MIN

from .config import AUTO_SUMMARY_PERIOD_HOURS
from .db import standalone_connection
from .sim_runner import stream_for
from .summary import (
    _prescription_for,
    deliver_to_consenting_doctors,
    generate_summary_for_patient,
)


_thread: threading.Thread | None = None
_stop = threading.Event()
_TICK_SECONDS = 5.0

# Cadence constants (in simulated hours).
CYCLE_MINUTES        = 30
CYCLE_HOURS          = CYCLE_MINUTES / 60.0          # 0.5
SAMPLES_PER_CYCLE    = CYCLE_MINUTES // SAMPLE_INTERVAL_MIN   # 10 with 3-min cadence
ALERT_PERIOD_HOURS   = 1.0                            # batch warnings hourly


@dataclass
class _PatientCadence:
    # End of the most recent 30-min window we've already classified.
    last_cycle_end: float = 0.0
    # Sim hour at which we last considered emitting a hourly alert.
    last_alert_emit: float = 0.0
    # Pending non-NORMAL cycle results since last hourly emit.
    pending: list = field(default_factory=list)


_state: dict[int, _PatientCadence] = {}
_state_lock = threading.Lock()


def _cadence_for(pid: int) -> _PatientCadence:
    with _state_lock:
        return _state.setdefault(pid, _PatientCadence())


def _last_summary_sim_hour(conn, patient_id: int) -> float | None:
    row = conn.execute(
        "SELECT MAX(sim_hour_end) AS h FROM summaries WHERE patient_id = ?",
        (patient_id,),
    ).fetchone()
    if row is None or row["h"] is None:
        return None
    return float(row["h"])


def _all_patient_ids(conn) -> list[int]:
    rows = conn.execute("SELECT id FROM patients").fetchall()
    return [int(r["id"]) for r in rows]


# ---------------------------------------------------------------------------
# 30-min cycle classification + hourly alert batching
# ---------------------------------------------------------------------------

def _summarize_pending(pending: list) -> tuple[Status, str, str, float]:
    """Reduce a list of non-NORMAL cycle results into a single live_alert
    payload — worst status wins; message lists the offending vitals across
    the hour. Returns (status, vital_label, message, last_sim_hour)."""
    worst = Status.WARNING
    bullets: list[str] = []
    last_hour = pending[-1].window_end_hour
    for cycle in pending:
        if cycle.overall_status == Status.CRITICAL:
            worst = Status.CRITICAL
        offenders = [r.deviation_note for r in cycle.readings
                     if r.status != Status.NORMAL]
        if offenders:
            bullets.append(
                f"Sim hour {cycle.window_end_hour:.1f} ({cycle.overall_status.value}): "
                + "; ".join(offenders)
            )
    message = "Hourly check found " + str(len(pending)) + (
        " non-normal cycle: " if len(pending) == 1 else " non-normal cycles: "
    ) + " | ".join(bullets)
    return worst, "hourly_review", message, last_hour


def _process_patient(pid: int, patient_row: dict) -> int:
    """Classify any newly-completed 30-min cycles; if a hour has elapsed
    and there's anything pending, emit ONE live_alert row. Returns 1 if we
    emitted, 0 otherwise."""
    stream = stream_for(pid)
    sim_now = stream.position().sim_hour_now
    cadence = _cadence_for(pid)

    # Bootstrap from DB on cold-start so we don't double-emit after a
    # process restart. live_alerts.sim_hour holds the *end* of the window
    # the alert covered.
    if cadence.last_alert_emit == 0.0 and cadence.last_cycle_end == 0.0:
        conn = standalone_connection()
        try:
            row = conn.execute(
                "SELECT MAX(sim_hour) AS h FROM live_alerts WHERE patient_id = ?",
                (pid,),
            ).fetchone()
        finally:
            conn.close()
        if row and row["h"] is not None:
            cadence.last_alert_emit = float(row["h"])
            cadence.last_cycle_end  = float(row["h"])

    # Classify any completed 30-min cycles that have arrived since last tick.
    prescription = _prescription_for(patient_row)
    next_end = cadence.last_cycle_end + CYCLE_HOURS
    cycles_added = 0
    while next_end <= sim_now + 1e-9:
        window = stream.samples_in_window(
            hour_start=next_end - CYCLE_HOURS, hour_end=next_end,
        )
        if len(window) >= SAMPLES_PER_CYCLE - 1:  # tolerate ±1 sample
            cycle = analyze_window(0, window, prescription)
            if cycle.overall_status != Status.NORMAL:
                cadence.pending.append(cycle)
                cycles_added += 1
        cadence.last_cycle_end = next_end
        next_end += CYCLE_HOURS

    # Hourly emit: if 1 sim-hour has elapsed and we have non-NORMAL cycles
    # in the buffer, emit one consolidated live_alerts row.
    emitted = 0
    if sim_now - cadence.last_alert_emit >= ALERT_PERIOD_HOURS:
        if cadence.pending:
            status, vital_label, message, last_hour = _summarize_pending(cadence.pending)
            conn = standalone_connection()
            try:
                conn.execute(
                    """INSERT INTO live_alerts
                       (patient_id, sim_hour, status, vital, value, message,
                        created_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?)""",
                    (pid, last_hour, status.value, vital_label,
                     float(len(cadence.pending)), message, int(time.time())),
                )
                conn.commit()
            finally:
                conn.close()
            emitted = 1
        cadence.pending.clear()
        cadence.last_alert_emit = sim_now
    return emitted


# ---------------------------------------------------------------------------
# Tick orchestrator
# ---------------------------------------------------------------------------

def tick_once() -> dict:
    """One pass: process the live-alert cadence + generate any due 12h
    summaries. Returns a dict describing what was emitted this tick."""
    conn = standalone_connection()
    try:
        patient_ids = _all_patient_ids(conn)
    finally:
        conn.close()

    for pid in patient_ids:
        # Touch the stream so the simulated clock starts advancing.
        stream_for(pid)

    alerts_by_patient: dict[int, int] = {}
    for pid in patient_ids:
        conn = standalone_connection()
        try:
            row = conn.execute(
                "SELECT * FROM patients WHERE id = ?", (pid,),
            ).fetchone()
        finally:
            conn.close()
        if row is None:
            continue
        n = _process_patient(pid, dict(row))
        if n:
            alerts_by_patient[pid] = n

    summarized: list[int] = []
    for pid in patient_ids:
        conn = standalone_connection()
        try:
            patient_row = conn.execute(
                "SELECT * FROM patients WHERE id = ?", (pid,),
            ).fetchone()
            if patient_row is None:
                continue
            stream = stream_for(pid)
            sim_now = stream.position().sim_hour_now
            last = _last_summary_sim_hour(conn, pid)
            if last is not None and (sim_now - last) < AUTO_SUMMARY_PERIOD_HOURS:
                continue
            if last is None and sim_now < AUTO_SUMMARY_PERIOD_HOURS:
                continue
        finally:
            conn.close()

        summary = generate_summary_for_patient(dict(patient_row))
        if summary is None:
            continue
        deliver_to_consenting_doctors(summary, trigger="auto")
        summarized.append(pid)

    return {
        "summarized_patient_ids": summarized,
        "live_alerts_by_patient": alerts_by_patient,
    }


def _loop() -> None:
    while not _stop.wait(_TICK_SECONDS):
        try:
            tick_once()
        except Exception as exc:  # background thread must not die silently
            print(f"[scheduler] tick error: {exc}")


def start() -> None:
    global _thread
    if _thread is not None and _thread.is_alive():
        return
    _stop.clear()
    _thread = threading.Thread(target=_loop, name="auto-summary", daemon=True)
    _thread.start()


def stop() -> None:
    _stop.set()


def reset_state() -> None:
    """Clear per-patient cadence state (called on seed/reset so stale
    patient_ids don't bleed across DB rebuilds)."""
    with _state_lock:
        _state.clear()
