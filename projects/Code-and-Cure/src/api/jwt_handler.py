import os
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import HTTPException

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "careit-hackathon-secret-key-2026")
ALGORITHM = "HS256"
TOKEN_EXPIRY_HOURS = 24

def create_token(payload: dict) -> str:
    """
    Takes a dictionary with user_id and role,
    adds an expiration timestamp, and returns
    a signed JWT string the frontend stores.
    """
    data = payload.copy()
    data["exp"] = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRY_HOURS)
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    """
    Takes a JWT string from the Authorization header,
    verifies the signature and expiration, and returns
    the payload (user_id, role). Raises 401 if invalid.
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
