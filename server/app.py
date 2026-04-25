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

from flask import Response

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
from .summary import (
    deliver_to_consenting_doctors,
    generate_summary_for_patient,
    parse_doctors_note,
    summary_to_csv,
)


def _normalize_phone(s: str) -> str:
    """Reduce a phone number to its digit-only canonical form.

    Lets a doctor add a patient regardless of how the patient typed their
    phone number on signup ("+1-555-0200", "(555) 020-0", "1 555 020 0"
    all collapse to "15550200"). Also used for patient login + uniqueness
    enforcement.
    """
    return "".join(c for c in (s or "") if c.isdigit())


def create_app() -> Flask:
    init_db()
    app = Flask(__name__, static_folder=None)
    app.teardown_appcontext(close_db)

    # Start the auto-summary background thread on app boot. Calling start()
    # is idempotent within a process. This is what lets the scheduler run
    # under gunicorn / any WSGI host that just imports `app` and never
    # calls our main() function.
    scheduler.start()

    # ---------------------------------------------------------------- static
    @app.get("/")
    def root():
        return send_from_directory(WEBAPP_DIR, "index.html")

    @app.get("/<path:path>")
    def static_files(path: str):
        # SPA-style fallback: serve the requested file if it exists in
        # webapp/, otherwise hand back index.html so the client-side router
        # can handle the URL. API paths are explicitly excluded so that a
        # typo in an /api/... call returns JSON 404, not HTML.
        if path.startswith("api/"):
            return jsonify({"error": "not found", "path": path}), 404
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
        phone_norm = _normalize_phone(phone)
        if not phone_norm:
            return jsonify({"error": "phone must contain digits"}), 400

        db = get_db()
        existing = db.execute(
            "SELECT id FROM patients WHERE phone_normalized = ?", (phone_norm,),
        ).fetchone()
        if existing:
            return jsonify({"error": "phone already registered"}), 409

        # If the patient pasted a prescription on signup, parse it now so
        # the AI envelope is ready for the first analysis cycle. If they
        # left it blank, a doctor will write the note later via
        # /api/doctor/patients/<id>/note.
        envelope_csv = ""
        if prescription:
            _, envelope_csv, _ = parse_doctors_note(prescription)

        device_hash, device_salt = make_secret(device_number)
        cur = db.execute(
            """INSERT INTO patients
               (phone, phone_normalized, device_number, device_secret, device_salt,
                full_name, prescription, envelope_csv, envelope_set_at, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (phone, phone_norm, device_number, device_hash, device_salt,
             full_name, prescription, envelope_csv,
             int(time.time()) if envelope_csv else None, int(time.time())),
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
        row = db.execute(
            "SELECT * FROM patients WHERE phone_normalized = ?",
            (_normalize_phone(phone),),
        ).fetchone()
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

    @app.get("/api/patient/doctor-note")
    @require_role("patient")
    def patient_doctor_note():
        """The latest clinician-written note attached to this patient.
        Patient sees the note text, NEVER the parsed envelope CSV."""
        db = get_db()
        row = db.execute(
            """SELECT p.prescription, p.envelope_set_at,
                      d.full_name AS doctor_name, d.email AS doctor_email
               FROM patients p
               LEFT JOIN doctors d ON d.id = p.envelope_set_by
               WHERE p.id = ?""",
            (g.user["id"],),
        ).fetchone()
        if row is None:
            return jsonify({"doctors_note": "", "doctor_name": None, "set_at": None})
        return jsonify({
            "doctors_note": row["prescription"] or "",
            "doctor_name":  row["doctor_name"],
            "doctor_email": row["doctor_email"],
            "set_at":       row["envelope_set_at"],
        })

    @app.get("/api/patient/alerts/active")
    @require_role("patient")
    def patient_active_alerts():
        """Live alerts emitted in the last hour and not yet acked by the
        patient — drives the in-app notification banner."""
        db = get_db()
        rows = db.execute(
            """SELECT * FROM live_alerts
               WHERE patient_id = ? AND acked_by_patient_at IS NULL
               ORDER BY created_at DESC LIMIT 20""",
            (g.user["id"],),
        ).fetchall()
        return jsonify({"alerts": [dict(r) for r in rows]})

    @app.post("/api/patient/alerts/ack")
    @require_role("patient")
    def patient_ack_alerts():
        """Mark all current unacked alerts as seen by the patient."""
        db = get_db()
        db.execute(
            """UPDATE live_alerts
               SET acked_by_patient_at = ?
               WHERE patient_id = ? AND acked_by_patient_at IS NULL""",
            (int(time.time()), g.user["id"]),
        )
        db.commit()
        return jsonify({"ok": True})

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
        did = g.user["id"]
        # Patient list enriched with summary + live-alert metadata for this
        # doctor. Lets the master list show "needs attention" badges without
        # the client having to fetch every patient's data upfront.
        rows = db.execute(
            """SELECT p.id, p.phone, p.full_name,
                      cl.permission_granted, cl.permission_changed_at,
                      (SELECT COUNT(*) FROM summary_sends ss
                         JOIN summaries s ON s.id = ss.summary_id
                        WHERE ss.doctor_id = ?
                          AND s.patient_id = p.id
                          AND ss.read_at IS NULL) AS unread_count,
                      (SELECT s.status_overall FROM summary_sends ss
                         JOIN summaries s ON s.id = ss.summary_id
                        WHERE ss.doctor_id = ? AND s.patient_id = p.id
                        ORDER BY ss.sent_at DESC LIMIT 1) AS last_status,
                      (SELECT MAX(ss.sent_at) FROM summary_sends ss
                         JOIN summaries s ON s.id = ss.summary_id
                        WHERE ss.doctor_id = ? AND s.patient_id = p.id) AS last_received_at,
                      (SELECT COUNT(*) FROM live_alerts la
                        WHERE la.patient_id = p.id
                          AND la.acked_by_doctor_at IS NULL) AS open_alerts_count,
                      (SELECT MAX(la.created_at) FROM live_alerts la
                        WHERE la.patient_id = p.id) AS last_alert_at
               FROM care_links cl
               JOIN patients p ON p.id = cl.patient_id
               WHERE cl.doctor_id = ?
               ORDER BY (CASE WHEN cl.permission_granted = 1 THEN 0 ELSE 1 END),
                        p.full_name, p.phone""",
            (did, did, did, did),
        ).fetchall()
        return jsonify({"patients": [dict(r) for r in rows]})

    @app.get("/api/doctor/patients/<int:patient_id>/live-alerts")
    @require_role("doctor")
    def doctor_patient_live_alerts(patient_id: int):
        db = get_db()
        link = db.execute(
            "SELECT id FROM care_links WHERE doctor_id = ? AND patient_id = ?",
            (g.user["id"], patient_id),
        ).fetchone()
        if link is None:
            return jsonify({"error": "patient not in your list"}), 404
        rows = db.execute(
            """SELECT * FROM live_alerts
               WHERE patient_id = ?
               ORDER BY created_at DESC LIMIT 50""",
            (patient_id,),
        ).fetchall()
        return jsonify({"alerts": [dict(r) for r in rows]})

    @app.post("/api/doctor/patients/<int:patient_id>/live-alerts/ack")
    @require_role("doctor")
    def doctor_ack_live_alerts(patient_id: int):
        db = get_db()
        link = db.execute(
            "SELECT id FROM care_links WHERE doctor_id = ? AND patient_id = ?",
            (g.user["id"], patient_id),
        ).fetchone()
        if link is None:
            return jsonify({"error": "patient not in your list"}), 404
        now = int(time.time())
        db.execute(
            """UPDATE live_alerts
               SET acked_by_doctor_id = ?, acked_by_doctor_at = ?
               WHERE patient_id = ? AND acked_by_doctor_at IS NULL""",
            (g.user["id"], now, patient_id),
        )
        db.commit()
        return jsonify({"ok": True})

    @app.get("/api/doctor/patients/<int:patient_id>/summaries")
    @require_role("doctor")
    def doctor_patient_summaries(patient_id: int):
        """Summaries delivered to this doctor for one specific patient.
        Replaces the old /api/doctor/inbox view."""
        db = get_db()
        link = db.execute(
            "SELECT id FROM care_links WHERE doctor_id = ? AND patient_id = ?",
            (g.user["id"], patient_id),
        ).fetchone()
        if link is None:
            return jsonify({"error": "patient not in your list"}), 404
        rows = db.execute(
            """SELECT s.*, ss.id AS send_id, ss.trigger, ss.sent_at, ss.read_at,
                      p.full_name AS patient_name, p.phone AS patient_phone
               FROM summary_sends ss
               JOIN summaries s ON s.id = ss.summary_id
               JOIN patients   p ON p.id = s.patient_id
               WHERE ss.doctor_id = ? AND s.patient_id = ?
               ORDER BY ss.sent_at DESC""",
            (g.user["id"], patient_id),
        ).fetchall()
        return jsonify({
            "patient_id": patient_id,
            "items": [dict(r) for r in rows],
        })

    @app.post("/api/doctor/patients/<int:patient_id>/mark-read")
    @require_role("doctor")
    def doctor_mark_patient_read(patient_id: int):
        """Mark all of one patient's deliveries to this doctor as read.
        Called when the doctor opens a patient's detail panel."""
        db = get_db()
        db.execute(
            """UPDATE summary_sends
               SET read_at = ?
               WHERE doctor_id = ? AND read_at IS NULL
                 AND summary_id IN (SELECT id FROM summaries WHERE patient_id = ?)""",
            (int(time.time()), g.user["id"], patient_id),
        )
        db.commit()
        return jsonify({"ok": True})

    @app.post("/api/doctor/patients/add")
    @require_role("doctor")
    def doctor_add_patient():
        if not g.user["verified"]:
            return jsonify({"error": "doctor must complete ID verification first"}), 403
        body = request.get_json(force=True, silent=True) or {}
        phone = (body.get("phone") or "").strip()
        doctors_note = (body.get("doctors_note") or "").strip()
        if not phone:
            return jsonify({"error": "patient phone is required"}), 400

        db = get_db()
        patient = db.execute(
            "SELECT id, full_name FROM patients WHERE phone_normalized = ?",
            (_normalize_phone(phone),),
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
        # If the doctor wrote a note while adding, parse it into the
        # envelope and store both on the patient (so analysis picks it up
        # immediately).
        envelope_source = None
        if doctors_note:
            _, envelope_csv, envelope_source = parse_doctors_note(doctors_note)
            db.execute(
                """UPDATE patients
                   SET prescription = ?, envelope_csv = ?,
                       envelope_set_by = ?, envelope_set_at = ?
                   WHERE id = ?""",
                (doctors_note, envelope_csv, g.user["id"], now, patient["id"]),
            )
        db.commit()
        return jsonify({
            "patient_id": int(patient["id"]),
            "full_name": patient["full_name"],
            "permission_granted": False,
            "needs_permission_decision": True,
            "doctors_note_saved": bool(doctors_note),
            "envelope_source": envelope_source,
        })

    @app.get("/api/doctor/patients/<int:patient_id>/note")
    @require_role("doctor")
    def doctor_get_note(patient_id: int):
        db = get_db()
        link = db.execute(
            "SELECT id FROM care_links WHERE doctor_id = ? AND patient_id = ?",
            (g.user["id"], patient_id),
        ).fetchone()
        if link is None:
            return jsonify({"error": "patient not in your list"}), 404
        row = db.execute(
            """SELECT prescription, envelope_csv, envelope_set_by,
                      envelope_set_at, full_name, phone
               FROM patients WHERE id = ?""",
            (patient_id,),
        ).fetchone()
        return jsonify({
            "patient_id": patient_id,
            "patient_name": row["full_name"],
            "patient_phone": row["phone"],
            "doctors_note": row["prescription"],
            "envelope_csv": row["envelope_csv"],
            "envelope_set_by": row["envelope_set_by"],
            "envelope_set_at": row["envelope_set_at"],
        })

    @app.put("/api/doctor/patients/<int:patient_id>/note")
    @require_role("doctor")
    def doctor_set_note(patient_id: int):
        body = request.get_json(force=True, silent=True) or {}
        note = (body.get("doctors_note") or "").strip()
        db = get_db()
        link = db.execute(
            "SELECT id FROM care_links WHERE doctor_id = ? AND patient_id = ?",
            (g.user["id"], patient_id),
        ).fetchone()
        if link is None:
            return jsonify({"error": "patient not in your list"}), 404
        envelope_csv = ""
        source = None
        if note:
            _, envelope_csv, source = parse_doctors_note(note)
        now = int(time.time())
        db.execute(
            """UPDATE patients
               SET prescription = ?, envelope_csv = ?,
                   envelope_set_by = ?, envelope_set_at = ?
               WHERE id = ?""",
            (note, envelope_csv, g.user["id"], now, patient_id),
        )
        db.commit()
        return jsonify({"ok": True, "envelope_source": source})

    @app.get("/api/doctor/patients/<int:patient_id>/envelope.csv")
    @require_role("doctor")
    def doctor_download_envelope(patient_id: int):
        db = get_db()
        link = db.execute(
            "SELECT id FROM care_links WHERE doctor_id = ? AND patient_id = ?",
            (g.user["id"], patient_id),
        ).fetchone()
        if link is None:
            return jsonify({"error": "patient not in your list"}), 404
        row = db.execute(
            "SELECT envelope_csv, full_name FROM patients WHERE id = ?",
            (patient_id,),
        ).fetchone()
        text = row["envelope_csv"] or ""
        if not text.strip():
            return jsonify({"error": "no envelope set yet — write a doctor's note first"}), 404
        slug = (row["full_name"] or f"patient-{patient_id}").replace(" ", "_")
        return Response(
            text,
            mimetype="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{slug}-envelope.csv"'},
        )

    @app.get("/api/doctor/summaries/<int:summary_id>/download.csv")
    @require_role("doctor")
    def doctor_download_summary(summary_id: int):
        """Doctor-side download of the summary as a CSV that opens in Excel.
        Verifies the doctor was a recipient of this summary."""
        db = get_db()
        send = db.execute(
            "SELECT id FROM summary_sends WHERE summary_id = ? AND doctor_id = ?",
            (summary_id, g.user["id"]),
        ).fetchone()
        if send is None:
            return jsonify({"error": "summary not delivered to you"}), 404
        s = db.execute("SELECT * FROM summaries WHERE id = ?", (summary_id,)).fetchone()
        if s is None:
            return jsonify({"error": "no such summary"}), 404
        p = db.execute("SELECT * FROM patients WHERE id = ?", (s["patient_id"],)).fetchone()
        if p is None:
            return jsonify({"error": "patient gone"}), 404
        text = summary_to_csv(dict(s), dict(p))
        slug = (p["full_name"] or f"patient-{p['id']}").replace(" ", "_")
        return Response(
            text,
            mimetype="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{slug}-summary-{summary_id}.csv"'},
        )

    @app.get("/api/patient/summaries/<int:summary_id>/download.csv")
    @require_role("patient")
    def patient_download_summary(summary_id: int):
        """Patient-side download of one of their own summaries."""
        db = get_db()
        s = db.execute(
            "SELECT * FROM summaries WHERE id = ? AND patient_id = ?",
            (summary_id, g.user["id"]),
        ).fetchone()
        if s is None:
            return jsonify({"error": "no such summary"}), 404
        text = summary_to_csv(dict(s), dict(g.user))
        slug = (g.user["full_name"] or f"patient-{g.user['id']}").replace(" ", "_")
        return Response(
            text,
            mimetype="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{slug}-summary-{summary_id}.csv"'},
        )

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
        scheduler.reset_state()
        db = get_db()

        # Doctor
        doctor_email    = "doctor.one@example.com"
        doctor_password = "demopass1!"
        d_pwd_hash, d_pwd_salt = make_secret(doctor_password)
        cur = db.execute(
            """INSERT INTO doctors
               (email, password_hash, password_salt, full_name, phone, verified, created_at)
               VALUES (?, ?, ?, ?, ?, 1, ?)""",
            (doctor_email, d_pwd_hash, d_pwd_salt,
             "Doctor One", "+1-555-0100", int(time.time())),
        )
        doctor_id = cur.lastrowid

        # Patient with the proposal's sample prescription. Parse the note
        # immediately so the analysis pipeline has an envelope on first run.
        sample_prescription = (
            Path(__file__).resolve().parent.parent / "data" / "sample_prescription.txt"
        ).read_text(encoding="utf-8")
        _, sample_envelope_csv, _ = parse_doctors_note(sample_prescription)
        patient_phone  = "+1-555-0200"
        patient_device = "GPO-2026-0001"
        p_dev_hash, p_dev_salt = make_secret(patient_device)
        now_ts = int(time.time())
        cur = db.execute(
            """INSERT INTO patients
               (phone, phone_normalized, device_number, device_secret, device_salt,
                full_name, prescription, envelope_csv, envelope_set_by,
                envelope_set_at, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (patient_phone, _normalize_phone(patient_phone),
             patient_device, p_dev_hash, p_dev_salt,
             "Patient One", sample_prescription, sample_envelope_csv,
             doctor_id, now_ts, now_ts),
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
            "doctor":  {"email": doctor_email, "password": doctor_password},
            "patient": {"phone": patient_phone, "device_number": patient_device},
        })

    @app.post("/api/admin/tick")
    def admin_tick():
        """Force one pass of the scheduler — useful in demos when you
        don't want to wait for new samples or the full 12-hour summary
        cadence to elapse on its own."""
        result = scheduler.tick_once()
        return jsonify(result)

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

    @app.get("/api/admin/demo-devices")
    def admin_demo_devices():
        """Return the pool of demo device numbers from the `demo-devices` file,
        minus any that are already paired with a patient. Used by the patient
        signup view to render clickable chips so the demo presenter doesn't
        have to read off serials by hand."""
        path = Path(__file__).resolve().parent.parent / "demo-devices"
        all_ids: list[str] = []
        if path.is_file():
            for raw in path.read_text(encoding="utf-8").splitlines():
                line = raw.split("#", 1)[0].strip()
                if line:
                    all_ids.append(line)

        db = get_db()
        used_rows = db.execute("SELECT device_number FROM patients").fetchall()
        used = {r["device_number"] for r in used_rows}

        return jsonify({
            "all":       all_ids,
            "available": [d for d in all_ids if d not in used],
            "used":      [d for d in all_ids if d in used],
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
    # The scheduler is already started by create_app(); this entrypoint only
    # exists for local dev so we can use Flask's built-in dev server. In
    # production we run via gunicorn (see render.yaml).
    print(
        f"GuardianPost-Op gateway running on http://127.0.0.1:5050  "
        f"(time scale x{DEMO_TIME_SCALE:g}, auto-summary every "
        f"{AUTO_SUMMARY_PERIOD_HOURS:g} sim-hours)"
    )
    app.run(host="127.0.0.1", port=5050, debug=False, use_reloader=False)


if __name__ == "__main__":
    main()
