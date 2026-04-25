"""Background scheduler that drives both real-time monitoring and the
12-hour auto-summary delivery.

Each tick (every _TICK_SECONDS wall seconds):

  1. For each known patient stream, classify any newly-arrived 3-minute
     samples against the patient's envelope. WARNING / CRITICAL readings
     are inserted as live_alerts rows so the patient app and doctor app
     can show in-app notifications without polling the analysis engine.

  2. For each patient, if AUTO_SUMMARY_PERIOD_HOURS of simulated time
     have passed since the last summary, generate a fresh 12h summary
     and deliver it to every consenting doctor (permission_granted=1).

A patient with no doctors / no granted permissions still gets summaries
generated and live alerts emitted (so the patient app can show them) —
they just don't get sent to a clinician inbox.
"""

from __future__ import annotations

import threading
import time

from src.analysis_engine import Status

from .config import AUTO_SUMMARY_PERIOD_HOURS
from .db import standalone_connection
from .sim_runner import all_streams, stream_for
from .summary import (
    _prescription_for,
    deliver_to_consenting_doctors,
    generate_summary_for_patient,
)


_thread: threading.Thread | None = None
_stop = threading.Event()
_TICK_SECONDS = 5.0

# Per-patient bookkeeping: highest sim hour we've already classified for
# live-alert generation. Lets the scheduler scan only the *new* samples
# each tick (idempotent if the tick fires faster than samples arrive).
_last_classified_sim_hour: dict[int, float] = {}
_classify_lock = threading.Lock()


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


def _classify_new_samples(pid: int, patient_row: dict) -> int:
    """Scan any samples that arrived since the last tick; emit live_alerts
    for any that fall outside the patient's envelope. Returns the number
    of alert rows inserted."""
    stream = stream_for(pid)
    sim_now = stream.position().sim_hour_now
    with _classify_lock:
        last_hour = _last_classified_sim_hour.get(pid, 0.0)
        if sim_now <= last_hour:
            return 0
        _last_classified_sim_hour[pid] = sim_now

    new_samples = stream.samples_in_window(
        hour_start=last_hour, hour_end=sim_now,
    )
    if not new_samples:
        return 0
    # Drop the boundary sample we already saw last tick.
    if last_hour > 0.0:
        new_samples = [s for s in new_samples if s.hour > last_hour]
    if not new_samples:
        return 0

    prescription = _prescription_for(patient_row)
    inserted = 0
    conn = standalone_connection()
    try:
        for s in new_samples:
            for vital_key, value in (
                ("heart_rate",       s.heart_rate),
                ("hrv",              s.hrv),
                ("respiratory_rate", s.respiratory_rate),
                ("spo2",             s.spo2),
                ("body_temp",        s.body_temp),
            ):
                rule = prescription.get(vital_key)
                if rule is None:
                    continue
                if value < rule.critical_low:
                    status, msg = Status.CRITICAL, (
                        f"{vital_key} {value:.2f} below critical_low {rule.critical_low}"
                    )
                elif value > rule.critical_high:
                    status, msg = Status.CRITICAL, (
                        f"{vital_key} {value:.2f} above critical_high {rule.critical_high}"
                    )
                elif value < rule.warn_low:
                    status, msg = Status.WARNING, (
                        f"{vital_key} {value:.2f} below warn_low {rule.warn_low}"
                    )
                elif value > rule.warn_high:
                    status, msg = Status.WARNING, (
                        f"{vital_key} {value:.2f} above warn_high {rule.warn_high}"
                    )
                else:
                    continue
                conn.execute(
                    """INSERT INTO live_alerts
                       (patient_id, sim_hour, status, vital, value, message,
                        created_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?)""",
                    (pid, s.hour, status.value, vital_key, value, msg,
                     int(time.time())),
                )
                inserted += 1
        conn.commit()
    finally:
        conn.close()
    return inserted


def tick_once() -> dict:
    """One pass: classify new samples + generate any due 12h summaries.
    Returns a dict with the patient_ids that got new alerts and summaries."""
    conn = standalone_connection()
    try:
        patient_ids = _all_patient_ids(conn)
    finally:
        conn.close()

    for pid in patient_ids:
        # Touch the stream so it exists in the registry; the simulated clock
        # then keeps advancing for the rest of the run.
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
        n = _classify_new_samples(pid, dict(row))
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
                # First summary is also due only after AUTO_SUMMARY_PERIOD_HOURS
                # of simulated time has accumulated.
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
    """Clear per-patient classification cursors (called on seed/reset so
    stale patient_ids don't bleed across DB rebuilds)."""
    with _classify_lock:
        _last_classified_sim_hour.clear()
