"""Mock third-party ID-verification provider.

Real-world equivalents are Persona, Stripe Identity, Onfido, Veriff, etc.
Each exposes roughly the same shape:
  1. Server creates a verification session for a user, gets back a session id
     and a hosted URL the user opens to upload their ID.
  2. User completes the flow on the provider's site (selfie + ID document).
  3. Provider posts a webhook back to us (or we poll) with `verified: bool`.

We wrap that contract behind a `IdVerifier` abstract class so the whole module
can be swapped out for a real provider later by editing one factory function.

For the demo we ship a `MockIdVerifier` that completes synchronously when the
user clicks a button on a fake hosted page we serve from /api/verify/mock/...
The session id is deterministic-looking ('mock_verif_<hex>') so the demo can
talk about a real-looking integration without needing real credentials.
"""

from __future__ import annotations

import secrets
import time
from dataclasses import dataclass
from typing import Protocol


@dataclass
class VerificationSession:
    provider_session_id: str  # opaque id from the provider
    hosted_url: str           # URL the user opens to complete verification
    created_at: int


@dataclass
class VerificationResult:
    provider_session_id: str
    verified: bool
    failure_reason: str = ""


class IdVerifier(Protocol):
    name: str

    def start_session(self, *, user_email: str, user_name: str) -> VerificationSession: ...

    def fetch_result(self, provider_session_id: str) -> VerificationResult | None: ...


# In a real integration this would be backed by the provider's database.
# Here we keep it in-process — fine for a single-server demo.
_SESSIONS: dict[str, dict] = {}


class MockIdVerifier:
    name = "MOCK (demo only — replace with Persona/Stripe Identity for prod)"

    def start_session(self, *, user_email: str, user_name: str) -> VerificationSession:
        sid = "mock_verif_" + secrets.token_hex(8)
        _SESSIONS[sid] = {
            "user_email": user_email,
            "user_name": user_name,
            "verified": None,        # None = pending, True/False = decided
            "failure_reason": "",
            "created_at": int(time.time()),
        }
        return VerificationSession(
            provider_session_id=sid,
            hosted_url=f"/verify/mock?session={sid}",
            created_at=int(time.time()),
        )

    def fetch_result(self, provider_session_id: str) -> VerificationResult | None:
        s = _SESSIONS.get(provider_session_id)
        if s is None or s["verified"] is None:
            return None
        return VerificationResult(
            provider_session_id=provider_session_id,
            verified=bool(s["verified"]),
            failure_reason=s["failure_reason"],
        )

    # Mock-only helpers used by the fake hosted-page endpoint:
    def mock_complete(self, provider_session_id: str, *, accept: bool, reason: str = "") -> None:
        if provider_session_id not in _SESSIONS:
            raise KeyError(provider_session_id)
        _SESSIONS[provider_session_id]["verified"] = accept
        _SESSIONS[provider_session_id]["failure_reason"] = reason

    def mock_session_info(self, provider_session_id: str) -> dict | None:
        return _SESSIONS.get(provider_session_id)


_default_verifier: IdVerifier = MockIdVerifier()


def get_verifier() -> IdVerifier:
    """Factory hook. Swap in a real verifier here."""
    return _default_verifier
