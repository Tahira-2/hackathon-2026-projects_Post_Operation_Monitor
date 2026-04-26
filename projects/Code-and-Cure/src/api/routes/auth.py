from fastapi import APIRouter, HTTPException, Depends
from passlib.context import CryptContext
from src.api.models import UserLogin, UserRegister, AuthResponse
from src.api.jwt_handler import create_token
from src.api.dependencies import get_current_user
from src.database.db_client import get_user_by_email, insert_user, insert_doctor_profile

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/register")
async def register(user: UserRegister):
    """
    Registers a new user (Patient or Doctor).
    Hashes the password securely and persists via Person 4 DB wrapper.
    """
    if user.role not in ["patient", "doctor"]:
        raise HTTPException(status_code=400, detail="Role must be 'patient' or 'doctor'")

    existing = get_user_by_email(user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)

    row = insert_user(
        email=user.email,
        password_hash=hashed_password,  # DB column: password_hash
        full_name=user.full_name,
        role=user.role,
    )

    if not row or not row.get("id"):
        raise HTTPException(status_code=500, detail="Failed to register user.")

    # Auto-create a linked doctors table row for any doctor account
    if user.role == "doctor":
        try:
            insert_doctor_profile(
                user_id=row["id"],
                specialty="General Practice",
                license_no="PENDING",
                lat=37.7749,
                lng=-122.4194,
                address="To be updated",
            )
        except Exception:
            pass  # Non-blocking — doctor can still log in; profile can be seeded later

    return {
        "user_id": row["id"],
        "email": row.get("email"),
        "role": row.get("role"),
        "message": "User registered successfully",
    }


@router.post("/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    """
    Authenticates a user and issues a signed JWT.
    """
    user = get_user_by_email(credentials.email)

    # DB stores password_hash (not hashed_password)
    if not user or not pwd_context.verify(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_payload = {
        "user_id": user["id"],
        "role": user["role"],
    }
    token = create_token(token_payload)

    return AuthResponse(access_token=token, role=user["role"])


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Validates the JWT token and returns the current user's payload.
    """
    return current_user
