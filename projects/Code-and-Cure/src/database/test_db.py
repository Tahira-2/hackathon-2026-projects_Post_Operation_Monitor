try:
    from src.database.db_client import (
        get_doctors,
        get_prescriptions_for_patient,
        get_user_by_email,
        list_allowed_medications,
        list_medication_policies,
    )
except ModuleNotFoundError:
    # Allows running as a script: python src/database/test_db.py
    from db_client import (
        get_doctors,
        get_prescriptions_for_patient,
        get_user_by_email,
        list_allowed_medications,
        list_medication_policies,
    )


def _assert_keys(payload: dict, required: set[str], label: str) -> None:
    missing = required - set(payload.keys())
    if missing:
        raise AssertionError(f"{label} missing keys: {sorted(missing)}")


def run_contract_checks() -> None:
    user = get_user_by_email("patient.one@test.com")
    if user is None:
        raise AssertionError("Expected seeded patient.one@test.com user.")
    _assert_keys(
        user,
        {"id", "email", "password_hash", "full_name", "role", "created_at", "updated_at"},
        "get_user_by_email",
    )

    doctors = get_doctors(None, None, None)
    if not doctors:
        raise AssertionError("Expected seeded doctors list to be non-empty.")
    _assert_keys(
        doctors[0],
        {
            "id",
            "user_id",
            "full_name",
            "specialty",
            "license_no",
            "provider_npi",
            "provider_dea",
            "credential_verification_status",
            "is_licensed",
            "rating",
            "review_count",
            "review_source",
            "lat",
            "lng",
            "address",
            "availability",
        },
        "get_doctors",
    )

    policies = list_medication_policies()
    if not policies:
        raise AssertionError("Expected seeded medication policies.")
    _assert_keys(
        policies[0],
        {"id", "medication_name", "category", "is_allowed", "reference_source", "notes", "created_at"},
        "list_medication_policies",
    )

    allowed = list_allowed_medications()
    if not allowed:
        raise AssertionError("Expected at least one allowed medication policy.")
    if not all(p.get("is_allowed") is True for p in allowed):
        raise AssertionError("list_allowed_medications returned non-allowed medications.")

    prescriptions = get_prescriptions_for_patient(user["id"])
    if prescriptions:
        _assert_keys(
            prescriptions[0],
            {
                "id",
                "requested_medication",
                "approval_status",
                "prescription_pdf_generated_at",
                "document_reference_id",
            },
            "get_prescriptions_for_patient",
        )

    print("test_db.py: all database contract checks passed.")


if __name__ == "__main__":
    run_contract_checks()
