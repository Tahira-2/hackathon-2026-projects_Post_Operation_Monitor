"""Auth primitives: password/device-secret hashing, session tokens, decorators.

Uses pbkdf2_hmac (stdlib) so we don't pull in bcrypt — important on Windows
where bcrypt sometimes needs build tools. PBKDF2-SHA256 with 200k iterations
is comparable in safety for hackathon-grade use.
"""

from __future__ import annotations

import hashlib
import hmac
import secrets
import time
from functools import wraps
from typing import Callable

from flask import g, jsonify, request

from .config import SESSION_TTL_SECONDS
from .db import get_db


_PBKDF2_ITERATIONS = 200_000


def _hash_secret(secret: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac(
        "sha256", secret.encode("utf-8"), salt.encode("utf-8"),
        _PBKDF2_ITERATIONS,
    ).hex()


def make_secret(secret: str) -> tuple[str, str]:
    """Return (hash, salt) suitable for storing alongside the user."""
    salt = secrets.token_hex(16)
    return _hash_secret(secret, salt), salt


def verify_secret(secret: str, expected_hash: str, salt: str) -> bool:
    return hmac.compare_digest(_hash_secret(secret, salt), expected_hash)


# ---------------------------------------------------------------------------
# Sessions
# ---------------------------------------------------------------------------

def issue_session(role: str, user_id: int) -> str:
    if role not in ("patient", "doctor"):
        raise ValueError(f"unknown role: {role}")
    token = secrets.token_urlsafe(32)
    expires_at = int(time.time()) + SESSION_TTL_SECONDS
    db = get_db()
    db.execute(
        "INSERT INTO sessions (token, role, user_id, expires_at) VALUES (?, ?, ?, ?)",
        (token, role, user_id, expires_at),
    )
    db.commit()
    return token


def revoke_session(token: str) -> None:
    db = get_db()
    db.execute("DELETE FROM sessions WHERE token = ?", (token,))
    db.commit()


def lookup_session(token: str | None) -> dict | None:
    if not token:
        return None
    db = get_db()
    row = db.execute(
        "SELECT role, user_id, expires_at FROM sessions WHERE token = ?",
        (token,),
    ).fetchone()
    if row is None:
        return None
    if row["expires_at"] < time.time():
        db.execute("DELETE FROM sessions WHERE token = ?", (token,))
        db.commit()
        return None
    return {"role": row["role"], "user_id": row["user_id"]}


def _bearer_token() -> str | None:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[len("Bearer "):].strip()
    # Also accept ?token= for convenience in dev / curl.
    return request.args.get("token")


def require_role(role: str) -> Callable:
    """Decorator: only allow the given role; populate g.user with the row."""

    def decorator(view: Callable) -> Callable:
        @wraps(view)
        def wrapped(*args, **kwargs):
            session = lookup_session(_bearer_token())
            if session is None or session["role"] != role:
                return jsonify({"error": "unauthorized"}), 401

            db = get_db()
            table = "patients" if role == "patient" else "doctors"
            row = db.execute(
                f"SELECT * FROM {table} WHERE id = ?", (session["user_id"],),
            ).fetchone()
            if row is None:
                return jsonify({"error": "user no longer exists"}), 401

            g.user = dict(row)
            g.role = role
            return view(*args, **kwargs)

        return wrapped

    return decorator
