"""12-hour auto-summary scheduler.

A background daemon thread wakes up every few seconds, asks each patient
stream what its current simulated time is, and if at least
AUTO_SUMMARY_PERIOD_HOURS of simulated time have passed since that patient's
last summary_send (regardless of trigger), it generates a summary and delivers
it to every consenting doctor.

Per the proposal, doctor-side delivery is gated on `permission_granted=1` in
care_links. A patient with no doctors / no granted permissions still gets
summaries generated (so the patient app can show them) — they just don't get
sent anywhere.
"""

from __future__ import annotations

import threading
import time

from .config import AUTO_SUMMARY_PERIOD_HOURS
from .db import standalone_connection
from .sim_runner import all_streams, stream_for
from .summary import deliver_to_consenting_doctors, generate_summary_for_patient


_thread: threading.Thread | None = None
_stop = threading.Event()
_TICK_SECONDS = 5.0


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


def tick_once() -> list[int]:
    """One pass: generate any due summaries. Returns patient_ids summarized."""
    summarized: list[int] = []
    conn = standalone_connection()
    try:
        patient_ids = _all_patient_ids(conn)
    finally:
        conn.close()

    for pid in patient_ids:
        # Touch the stream so it exists in the registry; the simulated clock
        # then keeps advancing for the rest of the run.
        stream_for(pid)

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
    return summarized


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
