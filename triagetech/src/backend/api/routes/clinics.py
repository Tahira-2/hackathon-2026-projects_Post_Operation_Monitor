"""
TriageTech Clinics Router
GET /clinics/nearest — returns nearest clinics sorted by distance from user lat/lng
"""
import json
import math
import os
from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/clinics", tags=["clinics"])

DATA_PATH = os.path.join(os.path.dirname(__file__), "../../data/nepal_clinics.json")


def _load_clinics():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return distance in km between two lat/lng points."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


class ClinicResult(BaseModel):
    name: str
    type: str
    district: str
    lat: float
    lng: float
    phone: str
    emergency: bool
    distance_km: float


@router.get("/nearest", response_model=list[ClinicResult])
def nearest_clinics(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    limit: int = Query(5, ge=1, le=20),
    emergency_only: Optional[bool] = Query(False, description="Filter to emergency facilities only"),
):
    """Return nearest clinics sorted by distance from user location."""
    clinics = _load_clinics()
    if emergency_only:
        clinics = [c for c in clinics if c.get("emergency")]

    for clinic in clinics:
        clinic["distance_km"] = round(_haversine(lat, lng, clinic["lat"], clinic["lng"]), 2)

    clinics.sort(key=lambda c: c["distance_km"])
    return clinics[:limit]


@router.get("/all")
def all_clinics():
    """Return all clinic data."""
    return _load_clinics()
