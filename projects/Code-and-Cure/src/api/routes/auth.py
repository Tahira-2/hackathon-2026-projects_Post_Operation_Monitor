from fastapi import APIRouter, HTTPException, Response
from src.api.models import UserLogin, AuthResponse

router = APIRouter()

# --- MOCK DATA ---
# In our "Clinic-in-a-box" for solo practitioners, we provide
# these default roles for the hackathon demo.
MOCK_USERS = {
    "patient_user": {"password": "password123", "role": "patient"},
    "doctor_user": {"password": "password123", "role": "doctor"}
}

@router.post("/login", response_model=AuthResponse)
async def login(credentials: UserLogin, response: Response):
    """
    Mock login for Solo Practitioners & Patients.
    Sets the 'user_role' cookie required for the Two-Portal system.
    """
    user = MOCK_USERS.get(credentials.username)
    
    # 1. Validation (Gateway Concern)
    if not user or user["password"] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # 2. Response Preparation
    # We follow the context.md requirement for role-based routing enforcement
    response.set_cookie(
        key="user_role", 
        value=user["role"],
        httponly=False  # Allows Frontend (Person 1) to read it for UI logic
    )
    
    # 3. Return the AuthResponse contract
    return AuthResponse(
        access_token=f"mock-jwt-for-{user['role']}",
        role=user["role"]
    )

@router.post("/logout")
async def logout(response: Response):
    """Clears the session cookie"""
    response.delete_cookie("user_role")
    return {"message": "Logged out successfully"}
