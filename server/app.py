"""Flask app — single process serving the JSON API + the PWA static bundle.

Run:
    python -m server.app

Browse:
    http://127.0.0.1:5050/

Demo seed (one doctor, one patient, both pre-verified, summary permission ON):
    curl -X POST http://127.0.0.1:5050/api/admin/seed
"""

from __future__ import annotations

import time
from pathlib import Path

from flask import Flask, g, jsonify, request, send_from_directory

from .auth import (
    issue_session,
    make_secret,
    require_role,
    revoke_session,
    verify_secret,
    lookup_session,
)
from .config import (
    AUTO_SUMMARY_PERIOD_HOURS,
    DEMO_TIME_SCALE,
    SUMMARY_WINDOW_HOURS,
    WEBAPP_DIR,
)
from .db import close_db, get_db, init_db
from .id_verification import get_verifier
from . import scheduler
from .sim_runner import reset_all, stream_for
from .summary import deliver_to_consenting_doctors, generate_summary_for_patient


def create_app() -> Flask:
    init_db()
    app = Flask(__name__, static_folder=None)
    app.teardown_appcontext(close_db)

    # ---------------------------------------------------------------- static
    @app.get("/")
    def root():
        return send_from_directory(WEBAPP_DIR, "index.html")

    @app.get("/<path:path>")
    def static_files(path: str):
        # SPA-style: any non-API path that doesn't exist in webapp/ falls back
        # to index.html so the client-side router can handle it.
        target = Path(WEBAPP_DIR) / path
        if target.is_file():
            return send_from_directory(WEBAPP_DIR, path)
        return send_from_directory(WEBAPP_DIR, "index.html")

    # =================================================================
    # Patient auth
    # =================================================================

    @app.post("/api/auth/patient/signup")
    def patient_signup():
        body = request.get_json(force=True, silent=True) or {}
        phone = (body.get("phone") or "").strip()
        device_number = (body.get("device_number") or "").strip()
        full_name = (body.get("full_name") or "").strip()
        prescription = (body.get("prescription") or "").strip()
        if not phone or not device_number:
            return jsonify({"error": "phone and device_number are required"}), 400

        db = get_db()
        existing = db.execute("SELECT id FROM patients WHERE phone = ?", (phone,)).fetchone()
        if existing:
            return jsonify({"error": "phone already registered"}), 409

        device_hash, device_salt = make_secret(device_number)
        cur = db.execute(
            """INSERT INTO patients
               (phone, device_number, device_secret, device_salt, full_name,
                prescription, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (phone, device_number, device_hash, device_salt, full_name,
             prescription, int(time.time())),
        )
        db.commit()
        token = issue_session("patient", cur.lastrowid)
        return jsonify({"token": token, "patient_id": cur.lastrowid})

    @app.post("/api/auth/patient/login")
    def patient_login():
        body = request.get_json(force=True, silent=True) or {}
        phone = (body.get("phone") or "").strip()
        device_number = (body.get("device_number") or "").strip()
        if not phone or not device_number:
            return jsonify({"error": "phone and device_number are required"}), 400

        db = get_db()
        row = db.execute("SELECT * FROM patients WHERE phone = ?", (phone,)).fetchone()
        if row is None or not verify_secret(device_number, row["device_secret"], row["device_salt"]):
            return jsonify({"error": "invalid phone or device number"}), 401

        token = issue_session("patient", int(row["id"]))
        return jsonify({"token": token, "patient_id": int(row["id"])})

    # =================================================================
    # Doctor auth + ID verification
    # =================================================================

    @app.post("/api/auth/doctor/signup")
    def doctor_signup():
        body = request.get_json(force=True, silent=True) or {}
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""
        full_name = (body.get("full_name") or "").strip()
        phone = (body.get("phone") or "").strip()
        if not email or not password:
            return jsonify({"error": "email and password are required"}), 400
        if len(password) < 8:
            return jsonify({"error": "password must be at least 8 characters"}), 400

        db = get_db()
        if db.execute("SELECT id FROM doctors WHERE email = ?", (email,)).fetchone():
            return jsonify({"error": "email already registered"}), 409

        pwd_hash, pwd_salt = make_secret(password)
        cur = db.execute(
            """INSERT INTO doctors
               (email, password_hash, password_salt, full_name, phone,
                verified, created_at)
               VALUES (?, ?, ?, ?, ?, 0, ?)""",
            (email, pwd_hash, pwd_salt, full_name, phone, int(time.time())),
        )
        db.commit()
        token = issue_session("doctor", cur.lastrowid)
        return jsonify({
            "token": token,
            "doctor_id": cur.lastrowid,
            "needs_verification": True,
        })

    @app.post("/api/auth/doctor/login")
    def doctor_login():
        body = request.get_json(force=True, silent=True) or {}
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""
        if not email or not password:
            return jsonify({"error": "email and password are required"}), 400

        db = get_db()
        row = db.execute("SELECT * FROM doctors WHERE email = ?", (email,)).fetchone()
        if row is None or not verify_secret(password, row["password_hash"], row["password_salt"]):
            return jsonify({"error": "invalid email or password"}), 401

        token = issue_session("doctor", int(row["id"]))
        return jsonify({
            "token": token,
            "doctor_id": int(row["id"]),
            "verified": bool(row["verified"]),
        })

    @app.post("/api/auth/logout")
    def logout():
        token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
        if token:
            revoke_session(token)
        return jsonify({"ok": True})

    # ---- ID verification (third-party mock)

    @app.post("/api/doctor/verify/start")
    @require_role("doctor")
    def doctor_verify_start():
        verifier = get_verifier()
        sess = verifier.start_session(
            user_email=g.user["email"],
            user_name=g.user["full_name"] or g.user["email"],
        )
        db = get_db()
        db.execute(
            "UPDATE doctors SET verification_id = ? WHERE id = ?",
            (sess.provider_session_id, g.user["id"]),
        )
        db.commit()
        return jsonify({
            "provider": verifier.name,
            "provider_session_id": sess.provider_session_id,
            "hosted_url": sess.hosted_url,
        })

    @app.post("/api/doctor/verify/poll")
    @require_role("doctor")
    def doctor_verify_poll():
        verifier = get_verifier()
        db = get_db()
        sid = g.user["verification_id"]
        if not sid:
            return jsonify({"verified": False, "status": "no_session"})
        result = verifier.fetch_result(sid)
        if result is None:
            return jsonify({"verified": False, "status": "pending"})
        if result.verified:
            db.execute(
                "UPDATE doctors SET verified = 1 WHERE id = ?", (g.user["id"],),
            )
            db.commit()
            return jsonify({"verified": True, "status": "approved"})
        return jsonify({
            "verified": False,
            "status": "rejected",
            "reason": result.failure_reason,
        })

    # ---- Mock-only hosted page support (the "hosted_url" the doctor visits)

    @app.post("/api/verify/mock/<sid>/decision")
    def mock_verify_decision(sid: str):
        body = request.get_json(force=True, silent=True) or {}
        accept = bool(body.get("accept", True))
        reason = (body.get("reason") or "").strip()
        verifier = get_verifier()
        try:
            verifier.mock_complete(sid, accept=accept, reason=reason)  # type: ignore[attr-defined]
        except (AttributeError, KeyError):
            return jsonify({"error": "unknown session"}), 404
        return jsonify({"ok": True})

    @app.get("/api/verify/mock/<sid>/info")
    def mock_verify_info(sid: str):
        verifier = get_verifier()
        info = verifier.mock_session_info(sid) if hasattr(verifier, "mock_session_info") else None  # type: ignore[attr-defined]
        if info is None:
            return jsonify({"error": "unknown session"}), 404
        return jsonify({
            "user_email": info["user_email"],
            "user_name": info["user_name"],
            "decided": info["verified"] is not None,
            "verified": info["verified"],
        })

    # =================================================================
    # Patient API
    # =================================================================

    @app.get("/api/patient/me")
    @require_role("patient")
    def patient_me():
        return jsonify(_public_patient(g.user))

    @app.post("/api/patient/prescription")
    @require_role("patient")
    def patient_set_prescription():
        body = request.get_json(force=True, silent=True) or {}
        text = (body.get("prescription") or "").strip()
        db = get_db()
        db.execute(
            "UPDATE patients SET prescription = ? WHERE id = ?",
            (text, g.user["id"]),
        )
        db.commit()
        return jsonify({"ok": True})

    @app.get("/api/patient/vitals/live")
    @require_role("patient")
    def patient_live_vitals():
        stream = stream_for(int(g.user["id"]))
        window_min = int(request.args.get("window_minutes", "30"))
        samples = stream.recent_window(window_minutes=window_min)
        pos = stream.position()
        return jsonify({
            "sim_hour_now": pos.sim_hour_now,
            "time_scale": DEMO_TIME_SCALE,
            "window_minutes": window_min,
            "samples": [{
                "minute_offset": s.minute_offset,
                "hour": s.hour,
                "heart_rate": s.heart_rate,
                "hrv": s.hrv,
                "respiratory_rate": s.respiratory_rate,
                "spo2": s.spo2,
                "body_temp": s.body_temp,
            } for s in samples],
        })

    @app.get("/api/patient/doctors")
    @require_role("patient")
    def patient_my_doctors():
        db = get_db()
        rows = db.execute(
            """SELECT d.id, d.email, d.full_name, d.verified,
                      cl.permission_granted, cl.permission_changed_at
               FROM care_links cl
               JOIN doctors d ON d.id = cl.doctor_id
               WHERE cl.patient_id = ?
               ORDER BY d.full_name, d.email""",
            (g.user["id"],),
        ).fetchall()
        return jsonify({"doctors": [dict(r) for r in rows]})

    @app.get("/api/patient/summaries")
    @require_role("patient")
    def patient_my_summaries():
        db = get_db()
        rows = db.execute(
            """SELECT * FROM summaries WHERE patient_id = ?
               ORDER BY generated_at DESC LIMIT 50""",
            (g.user["id"],),
        ).fetchall()
        return jsonify({"summaries": [dict(r) for r in rows]})

    @app.post("/api/patient/summaries/send")
    @require_role("patient")
    def patient_manual_send():
        """Generate a fresh summary and deliver it to all consenting doctors.

        If the patient has no doctor with permission_granted=1, returns 403.
        This is the explicit consent gate the proposal calls for.
        """
        db = get_db()
        consenting = db.execute(
            """SELECT doctor_id FROM care_links
               WHERE patient_id = ? AND permission_granted = 1""",
            (g.user["id"],),
        ).fetchall()
        if not consenting:
            return jsonify({
                "error": "no consenting doctor",
                "detail": ("You don't yet have a doctor who has approved receiving "
                           "summaries from you. Ask your clinician to enable "
                           "summary permission for this patient."),
            }), 403

        summary = generate_summary_for_patient(dict(g.user))
        if summary is None:
            return jsonify({"error": "not enough data yet — wait for the buffer to fill"}), 400
        delivered_to = deliver_to_consenting_doctors(summary, trigger="manual")
        return jsonify({
            "summary_id": summary.summary_id,
            "delivered_to_doctor_ids": delivered_to,
        })

    # =================================================================
    # Doctor API
    # =================================================================

    @app.get("/api/doctor/me")
    @require_role("doctor")
    def doctor_me():
        return jsonify(_public_doctor(g.user))

    @app.get("/api/doctor/patients")
    @require_role("doctor")
    def doctor_list_patients():
        db = get_db()
        rows = db.execute(
            """SELECT p.id, p.phone, p.full_name,
                      cl.permission_granted, cl.permission_changed_at
               FROM care_links cl
               JOIN patients p ON p.id = cl.patient_id
               WHERE cl.doctor_id = ?
               ORDER BY p.full_name, p.phone""",
            (g.user["id"],),
        ).fetchall()
        return jsonify({"patients": [dict(r) for r in rows]})

    @app.post("/api/doctor/patients/add")
    @require_role("doctor")
    def doctor_add_patient():
        if not g.user["verified"]:
            return jsonify({"error": "doctor must complete ID verification first"}), 403
        body = request.get_json(force=True, silent=True) or {}
        phone = (body.get("phone") or "").strip()
        if not phone:
            return jsonify({"error": "patient phone is required"}), 400

        db = get_db()
        patient = db.execute(
            "SELECT id, full_name FROM patients WHERE phone = ?", (phone,),
        ).fetchone()
        if patient is None:
            return jsonify({
                "error": "no patient with that phone number",
                "detail": "Ask the patient to sign up first; then add them here.",
            }), 404

        existing_link = db.execute(
            "SELECT id FROM care_links WHERE doctor_id = ? AND patient_id = ?",
            (g.user["id"], patient["id"]),
        ).fetchone()
        if existing_link:
            return jsonify({"error": "patient already in your list"}), 409

        now = int(time.time())
        db.execute(
            """INSERT INTO care_links
               (doctor_id, patient_id, permission_granted, permission_changed_at, created_at)
               VALUES (?, ?, 0, ?, ?)""",
            (g.user["id"], patient["id"], now, now),
        )
        db.commit()
        return jsonify({
            "patient_id": int(patient["id"]),
            "full_name": patient["full_name"],
            "permission_granted": False,
            "needs_permission_decision": True,
        })

    @app.post("/api/doctor/patients/<int:patient_id>/permission")
    @require_role("doctor")
    def doctor_set_permission(patient_id: int):
        body = request.get_json(force=True, silent=True) or {}
        if "granted" not in body:
            return jsonify({"error": "granted (bool) required"}), 400
        granted = 1 if bool(body["granted"]) else 0

        db = get_db()
        link = db.execute(
            "SELECT id FROM care_links WHERE doctor_id = ? AND patient_id = ?",
            (g.user["id"], patient_id),
        ).fetchone()
        if link is None:
            return jsonify({"error": "patient not in your list"}), 404

        db.execute(
            """UPDATE care_links
               SET permission_granted = ?, permission_changed_at = ?
               WHERE id = ?""",
            (granted, int(time.time()), link["id"]),
        )
        db.commit()
        return jsonify({"ok": True, "permission_granted": bool(granted)})

    @app.delete("/api/doctor/patients/<int:patient_id>")
    @require_role("doctor")
    def doctor_remove_patient(patient_id: int):
        db = get_db()
        cur = db.execute(
            "DELETE FROM care_links WHERE doctor_id = ? AND patient_id = ?",
            (g.user["id"], patient_id),
        )
        db.commit()
        return jsonify({"removed": cur.rowcount > 0})

    @app.get("/api/doctor/inbox")
    @require_role("doctor")
    def doctor_inbox():
        db = get_db()
        rows = db.execute(
            """SELECT s.*, ss.trigger, ss.sent_at, ss.read_at,
                      p.full_name AS patient_name, p.phone AS patient_phone
               FROM summary_sends ss
               JOIN summaries s ON s.id = ss.summary_id
               JOIN patients   p ON p.id = s.patient_id
               WHERE ss.doctor_id = ?
               ORDER BY ss.sent_at DESC LIMIT 100""",
            (g.user["id"],),
        ).fetchall()
        return jsonify({"items": [dict(r) for r in rows]})

    @app.post("/api/doctor/inbox/<int:summary_send_id>/read")
    @require_role("doctor")
    def doctor_mark_read(summary_send_id: int):
        db = get_db()
        db.execute(
            "UPDATE summary_sends SET read_at = ? WHERE id = ? AND doctor_id = ?",
            (int(time.time()), summary_send_id, g.user["id"]),
        )
        db.commit()
        return jsonify({"ok": True})

    # =================================================================
    # Admin / demo helpers (no auth — bind to localhost only in production)
    # =================================================================

    @app.post("/api/admin/seed")
    def admin_seed():
        """Wipe + reseed: 1 verified doctor, 1 patient, link granted.

        Demo credentials returned in the response body.
        """
        init_db(reset=True)
        reset_all()
        db = get_db()

        # Doctor
        d_pwd_hash, d_pwd_salt = make_secret("demopass1!")
        cur = db.execute(
            """INSERT INTO doctors
               (email, password_hash, password_salt, full_name, phone, verified, created_at)
               VALUES (?, ?, ?, ?, ?, 1, ?)""",
            ("dr.singh@example.com", d_pwd_hash, d_pwd_salt,
             "Dr. Anita Singh", "+1-555-0100", int(time.time())),
        )
        doctor_id = cur.lastrowid

        # Patient with the proposal's sample prescription
        sample_prescription = (
            Path(__file__).resolve().parent.parent / "data" / "sample_prescription.txt"
        ).read_text(encoding="utf-8")
        p_dev_hash, p_dev_salt = make_secret("GPO-2026-0001")
        cur = db.execute(
            """INSERT INTO patients
               (phone, device_number, device_secret, device_salt, full_name,
                prescription, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            ("+1-555-0200", "GPO-2026-0001", p_dev_hash, p_dev_salt,
             "Jordan Rivera", sample_prescription, int(time.time())),
        )
        patient_id = cur.lastrowid

        now = int(time.time())
        db.execute(
            """INSERT INTO care_links
               (doctor_id, patient_id, permission_granted, permission_changed_at, created_at)
               VALUES (?, ?, 1, ?, ?)""",
            (doctor_id, patient_id, now, now),
        )
        db.commit()
        return jsonify({
            "ok": True,
            "doctor": {"email": "dr.singh@example.com", "password": "demopass1!"},
            "patient": {"phone": "+1-555-0200", "device_number": "GPO-2026-0001"},
        })

    @app.post("/api/admin/tick")
    def admin_tick():
        """Force one pass of the auto-summary scheduler — useful in demos
        when you don't want to wait the full 12 simulated hours."""
        summarized = scheduler.tick_once()
        return jsonify({"summarized_patient_ids": summarized})

    @app.post("/api/admin/force-summary/<int:patient_id>")
    def admin_force_summary(patient_id: int):
        """Generate + deliver a summary right now for one patient, bypassing
        the 12h cadence. Doctor permissions still apply."""
        db = get_db()
        patient_row = db.execute(
            "SELECT * FROM patients WHERE id = ?", (patient_id,),
        ).fetchone()
        if patient_row is None:
            return jsonify({"error": "no such patient"}), 404
        summary = generate_summary_for_patient(dict(patient_row))
        if summary is None:
            return jsonify({"error": "not enough data yet"}), 400
        delivered = deliver_to_consenting_doctors(summary, trigger="auto")
        return jsonify({
            "summary_id": summary.summary_id,
            "delivered_to_doctor_ids": delivered,
        })

    @app.get("/api/admin/config")
    def admin_config():
        return jsonify({
            "demo_time_scale": DEMO_TIME_SCALE,
            "auto_summary_period_hours": AUTO_SUMMARY_PERIOD_HOURS,
            "summary_window_hours": SUMMARY_WINDOW_HOURS,
        })

    return app


# ---------------------------------------------------------------------------
# Public-shape helpers (strip secret columns).
# ---------------------------------------------------------------------------

def _public_patient(row: dict) -> dict:
    return {
        "id": row["id"],
        "phone": row["phone"],
        "full_name": row["full_name"],
        "device_number": row["device_number"],
        "prescription": row["prescription"],
        "created_at": row["created_at"],
    }


def _public_doctor(row: dict) -> dict:
    return {
        "id": row["id"],
        "email": row["email"],
        "full_name": row["full_name"],
        "phone": row["phone"],
        "verified": bool(row["verified"]),
        "verification_id": row["verification_id"],
        "created_at": row["created_at"],
    }


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

app = create_app()


def main() -> None:
    scheduler.start()
    print(
        f"GuardianPost-Op gateway running on http://127.0.0.1:5050  "
        f"(time scale x{DEMO_TIME_SCALE:g}, auto-summary every "
        f"{AUTO_SUMMARY_PERIOD_HOURS:g} sim-hours)"
    )
    app.run(host="127.0.0.1", port=5050, debug=False, use_reloader=False)


if __name__ == "__main__":
    main()
