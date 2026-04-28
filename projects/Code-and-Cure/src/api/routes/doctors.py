import hashlib
import json
from datetime import datetime, timedelta, timezone
from math import asin, cos, radians, sin, sqrt
from typing import List, Optional
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, Query

from src.api.dependencies import require_role
from src.api.models import AppointmentSlot, Doctor
from src.database.db_client import get_doctors

router = APIRouter()

# ---------------------------------------------------------------------------
# Nationwide embedded doctor pool (telehealth-ready, all US regions)
# ---------------------------------------------------------------------------

_EMBEDDED_DOCTORS: list[dict] = [
    # Cardiology
    {"id": "emb:c01", "name": "Dr. Marcus Webb", "specialty": "Cardiology", "location": "450 Park Ave, New York, NY", "rating": 4.9, "review_count": 312, "lat": 40.7580, "lng": -73.9855},
    {"id": "emb:c02", "name": "Dr. Priya Nair", "specialty": "Cardiology", "location": "1200 Westheimer Rd, Houston, TX", "rating": 4.7, "review_count": 198, "lat": 29.7349, "lng": -95.4591},
    {"id": "emb:c03", "name": "Dr. James Osei", "specialty": "Cardiology", "location": "875 N Michigan Ave, Chicago, IL", "rating": 4.8, "review_count": 265, "lat": 41.8960, "lng": -87.6226},
    {"id": "emb:c04", "name": "Dr. Linda Park", "specialty": "Cardiology", "location": "200 Medical Center Dr, Los Angeles, CA", "rating": 4.6, "review_count": 143, "lat": 34.0653, "lng": -118.4453},
    {"id": "emb:c05", "name": "Dr. Robert Flores", "specialty": "Cardiology", "location": "1400 Jackson St, Dallas, TX", "rating": 4.5, "review_count": 89, "lat": 32.7900, "lng": -96.8077},
    {"id": "emb:c06", "name": "Dr. Susan Lee", "specialty": "Cardiology", "location": "3800 Reservoir Rd NW, Washington, DC", "rating": 4.8, "review_count": 234, "lat": 38.9104, "lng": -77.0714},
    # Neurology
    {"id": "emb:n01", "name": "Dr. Aisha Patel", "specialty": "Neurology", "location": "55 Fruit St, Boston, MA", "rating": 4.9, "review_count": 287, "lat": 42.3628, "lng": -71.0686},
    {"id": "emb:n02", "name": "Dr. Eric Lindqvist", "specialty": "Neurology", "location": "1959 NE Pacific St, Seattle, WA", "rating": 4.7, "review_count": 174, "lat": 47.6508, "lng": -122.3070},
    {"id": "emb:n03", "name": "Dr. Carmen Reyes", "specialty": "Neurology", "location": "1501 NW 9th Ave, Miami, FL", "rating": 4.6, "review_count": 156, "lat": 25.7889, "lng": -80.2101},
    {"id": "emb:n04", "name": "Dr. David Kim", "specialty": "Neurology", "location": "520 S Maple Ave, Minneapolis, MN", "rating": 4.8, "review_count": 221, "lat": 44.9736, "lng": -93.2680},
    {"id": "emb:n05", "name": "Dr. Fatima Hassan", "specialty": "Neurology", "location": "3663 Valley Centre Dr, San Diego, CA", "rating": 4.5, "review_count": 133, "lat": 32.9105, "lng": -117.1905},
    # Dermatology
    {"id": "emb:d01", "name": "Dr. Sofia Gupta", "specialty": "Dermatology", "location": "240 E 38th St, New York, NY", "rating": 4.9, "review_count": 445, "lat": 40.7490, "lng": -73.9716},
    {"id": "emb:d02", "name": "Dr. Thomas Ware", "specialty": "Dermatology", "location": "9090 Wilshire Blvd, Beverly Hills, CA", "rating": 4.8, "review_count": 389, "lat": 34.0680, "lng": -118.3924},
    {"id": "emb:d03", "name": "Dr. Michelle Tran", "specialty": "Dermatology", "location": "100 Peachtree St, Atlanta, GA", "rating": 4.7, "review_count": 276, "lat": 33.7490, "lng": -84.3902},
    {"id": "emb:d04", "name": "Dr. Samuel Ortiz", "specialty": "Dermatology", "location": "4500 W 69th St, Indianapolis, IN", "rating": 4.6, "review_count": 198, "lat": 39.7400, "lng": -86.2085},
    {"id": "emb:d05", "name": "Dr. Rachel Cohen", "specialty": "Dermatology", "location": "200 Brookline Ave, Boston, MA", "rating": 4.5, "review_count": 167, "lat": 42.3445, "lng": -71.0987},
    # Gastroenterology
    {"id": "emb:g01", "name": "Dr. Benjamin Shaw", "specialty": "Gastroenterology", "location": "1700 S Columbus Blvd, Philadelphia, PA", "rating": 4.8, "review_count": 234, "lat": 39.9155, "lng": -75.1403},
    {"id": "emb:g02", "name": "Dr. Nadia Williams", "specialty": "Gastroenterology", "location": "2323 W Morehead St, Charlotte, NC", "rating": 4.7, "review_count": 189, "lat": 35.2160, "lng": -80.8943},
    {"id": "emb:g03", "name": "Dr. Hiroshi Tanaka", "specialty": "Gastroenterology", "location": "1300 York Ave, New York, NY", "rating": 4.9, "review_count": 312, "lat": 40.7637, "lng": -73.9545},
    {"id": "emb:g04", "name": "Dr. Angela Martinez", "specialty": "Gastroenterology", "location": "11000 W Olympic Blvd, Los Angeles, CA", "rating": 4.6, "review_count": 145, "lat": 34.0350, "lng": -118.4321},
    {"id": "emb:g05", "name": "Dr. Kevin Pierce", "specialty": "Gastroenterology", "location": "2000 W Camelback Rd, Phoenix, AZ", "rating": 4.5, "review_count": 121, "lat": 33.5034, "lng": -112.0756},
    # Orthopedics
    {"id": "emb:o01", "name": "Dr. Christine Larson", "specialty": "Orthopedics", "location": "535 E 70th St, New York, NY", "rating": 4.9, "review_count": 356, "lat": 40.7657, "lng": -73.9540},
    {"id": "emb:o02", "name": "Dr. Daniel Brooks", "specialty": "Orthopedics", "location": "4200 E 9th Ave, Denver, CO", "rating": 4.7, "review_count": 245, "lat": 39.7352, "lng": -104.9396},
    {"id": "emb:o03", "name": "Dr. Maria Santos", "specialty": "Orthopedics", "location": "3001 SW 87th Ave, Miami, FL", "rating": 4.8, "review_count": 278, "lat": 25.7307, "lng": -80.3187},
    {"id": "emb:o04", "name": "Dr. Andrew Chen", "specialty": "Orthopedics", "location": "550 16th St, San Francisco, CA", "rating": 4.6, "review_count": 189, "lat": 37.7647, "lng": -122.4083},
    {"id": "emb:o05", "name": "Dr. Jessica Brown", "specialty": "Orthopedics", "location": "100 Euclid Ave, Cleveland, OH", "rating": 4.5, "review_count": 134, "lat": 41.4976, "lng": -81.6926},
    # ENT
    {"id": "emb:e01", "name": "Dr. Paul Nguyen", "specialty": "ENT", "location": "1275 York Ave, New York, NY", "rating": 4.8, "review_count": 267, "lat": 40.7637, "lng": -73.9545},
    {"id": "emb:e02", "name": "Dr. Grace Thompson", "specialty": "ENT", "location": "800 Washington Ave, Nashville, TN", "rating": 4.7, "review_count": 198, "lat": 36.1530, "lng": -86.7900},
    {"id": "emb:e03", "name": "Dr. Michael Chang", "specialty": "ENT", "location": "7750 SW Barnes Rd, Portland, OR", "rating": 4.6, "review_count": 156, "lat": 45.4932, "lng": -122.6827},
    {"id": "emb:e04", "name": "Dr. Leila Johnson", "specialty": "ENT", "location": "3800 Reservoir Rd NW, Washington, DC", "rating": 4.9, "review_count": 312, "lat": 38.9104, "lng": -77.0714},
    {"id": "emb:e05", "name": "Dr. Ryan McKenna", "specialty": "ENT", "location": "2910 N 3rd Ave, Phoenix, AZ", "rating": 4.5, "review_count": 134, "lat": 33.4712, "lng": -112.0857},
    # Psychiatry
    {"id": "emb:ps01", "name": "Dr. Nathan Rivers", "specialty": "Psychiatry", "location": "185 E 85th St, New York, NY", "rating": 4.9, "review_count": 456, "lat": 40.7784, "lng": -73.9567},
    {"id": "emb:ps02", "name": "Dr. Olivia Grant", "specialty": "Psychiatry", "location": "2901 Sutter St, San Francisco, CA", "rating": 4.8, "review_count": 334, "lat": 37.7839, "lng": -122.4461},
    {"id": "emb:ps03", "name": "Dr. Marcus Webb Jr.", "specialty": "Psychiatry", "location": "710 W Ogden Ave, Chicago, IL", "rating": 4.7, "review_count": 267, "lat": 41.8757, "lng": -87.6451},
    {"id": "emb:ps04", "name": "Dr. Sonia Kapoor", "specialty": "Psychiatry", "location": "5700 Fishers Lane, Rockville, MD", "rating": 4.6, "review_count": 189, "lat": 39.0916, "lng": -77.1538},
    {"id": "emb:ps05", "name": "Dr. Carlos Mendez", "specialty": "Psychiatry", "location": "1500 E Duarte Rd, Duarte, CA", "rating": 4.5, "review_count": 145, "lat": 34.1362, "lng": -117.9585},
    {"id": "emb:ps06", "name": "Dr. Amanda Foster", "specialty": "Psychiatry", "location": "1440 Canal St, New Orleans, LA", "rating": 4.7, "review_count": 201, "lat": 29.9501, "lng": -90.0665},
    # Endocrinology
    {"id": "emb:en01", "name": "Dr. Jennifer Wu", "specialty": "Endocrinology", "location": "4150 Clement St, San Francisco, CA", "rating": 4.8, "review_count": 234, "lat": 37.7818, "lng": -122.4988},
    {"id": "emb:en02", "name": "Dr. Patrick O'Brien", "specialty": "Endocrinology", "location": "250 E Superior St, Chicago, IL", "rating": 4.7, "review_count": 187, "lat": 41.8960, "lng": -87.6226},
    {"id": "emb:en03", "name": "Dr. Yasmin Al-Rashid", "specialty": "Endocrinology", "location": "5323 Harry Hines Blvd, Dallas, TX", "rating": 4.6, "review_count": 156, "lat": 32.8122, "lng": -96.8465},
    {"id": "emb:en04", "name": "Dr. Gregory Stone", "specialty": "Endocrinology", "location": "260 Stetson St, Boston, MA", "rating": 4.9, "review_count": 312, "lat": 42.3601, "lng": -71.0589},
    {"id": "emb:en05", "name": "Dr. Mei Lin Zhang", "specialty": "Endocrinology", "location": "1901 S First St, Austin, TX", "rating": 4.5, "review_count": 134, "lat": 30.2452, "lng": -97.7509},
    # Pulmonology
    {"id": "emb:pu01", "name": "Dr. Elena Volkov", "specialty": "Pulmonology", "location": "600 W 168th St, New York, NY", "rating": 4.8, "review_count": 289, "lat": 40.8398, "lng": -73.9397},
    {"id": "emb:pu02", "name": "Dr. James Holloway", "specialty": "Pulmonology", "location": "4502 Medical Dr, San Antonio, TX", "rating": 4.7, "review_count": 198, "lat": 29.5300, "lng": -98.5819},
    {"id": "emb:pu03", "name": "Dr. Susan Kim", "specialty": "Pulmonology", "location": "1600 N Capitol Ave, Indianapolis, IN", "rating": 4.6, "review_count": 167, "lat": 39.7967, "lng": -86.1518},
    {"id": "emb:pu04", "name": "Dr. Andre Laurent", "specialty": "Pulmonology", "location": "1450 NE 2nd Ave, Miami, FL", "rating": 4.5, "review_count": 134, "lat": 25.7831, "lng": -80.1854},
    {"id": "emb:pu05", "name": "Dr. William Zhang", "specialty": "Pulmonology", "location": "1400 Jackson St, Denver, CO", "rating": 4.8, "review_count": 212, "lat": 39.7391, "lng": -104.9847},
    # Nephrology
    {"id": "emb:ne01", "name": "Dr. Patricia Adams", "specialty": "Nephrology", "location": "8700 Beverly Blvd, Los Angeles, CA", "rating": 4.8, "review_count": 245, "lat": 34.0736, "lng": -118.3789},
    {"id": "emb:ne02", "name": "Dr. Victor Huang", "specialty": "Nephrology", "location": "101 E 15th St, Austin, TX", "rating": 4.7, "review_count": 189, "lat": 30.2731, "lng": -97.7403},
    {"id": "emb:ne03", "name": "Dr. Amelia Foster", "specialty": "Nephrology", "location": "2200 Pierce Ave, Nashville, TN", "rating": 4.6, "review_count": 156, "lat": 36.1490, "lng": -86.8045},
    {"id": "emb:ne04", "name": "Dr. Raymond Okafor", "specialty": "Nephrology", "location": "750 E Adams St, Jacksonville, FL", "rating": 4.5, "review_count": 123, "lat": 30.3284, "lng": -81.6450},
    # Urology
    {"id": "emb:ur01", "name": "Dr. Stephen Grant", "specialty": "Urology", "location": "520 E 72nd St, New York, NY", "rating": 4.8, "review_count": 267, "lat": 40.7681, "lng": -73.9601},
    {"id": "emb:ur02", "name": "Dr. Monica Singh", "specialty": "Urology", "location": "3400 Spruce St, Philadelphia, PA", "rating": 4.7, "review_count": 198, "lat": 39.9481, "lng": -75.1971},
    {"id": "emb:ur03", "name": "Dr. Jason Rivera", "specialty": "Urology", "location": "1801 Inwood Rd, Dallas, TX", "rating": 4.6, "review_count": 156, "lat": 32.8536, "lng": -96.8618},
    {"id": "emb:ur04", "name": "Dr. Laura Chen", "specialty": "Urology", "location": "2990 E Lake Rd, Salt Lake City, UT", "rating": 4.5, "review_count": 134, "lat": 40.6994, "lng": -111.8218},
    # Ophthalmology
    {"id": "emb:op01", "name": "Dr. Richard Goldstein", "specialty": "Ophthalmology", "location": "635 Madison Ave, New York, NY", "rating": 4.9, "review_count": 378, "lat": 40.7624, "lng": -73.9718},
    {"id": "emb:op02", "name": "Dr. Amy Nakamura", "specialty": "Ophthalmology", "location": "2900 Westlake Ave N, Seattle, WA", "rating": 4.7, "review_count": 234, "lat": 47.6416, "lng": -122.3404},
    {"id": "emb:op03", "name": "Dr. Jonathan Davis", "specialty": "Ophthalmology", "location": "11600 Wilshire Blvd, Los Angeles, CA", "rating": 4.8, "review_count": 312, "lat": 34.0521, "lng": -118.4657},
    {"id": "emb:op04", "name": "Dr. Sandra Hill", "specialty": "Ophthalmology", "location": "4300 Alton Rd, Miami Beach, FL", "rating": 4.6, "review_count": 178, "lat": 25.8017, "lng": -80.1402},
    # Gynecology
    {"id": "emb:gy01", "name": "Dr. Rebecca Stone", "specialty": "Gynecology", "location": "425 E 61st St, New York, NY", "rating": 4.9, "review_count": 445, "lat": 40.7609, "lng": -73.9606},
    {"id": "emb:gy02", "name": "Dr. Tamara Jackson", "specialty": "Gynecology", "location": "80 Jesse Hill Jr Dr, Atlanta, GA", "rating": 4.8, "review_count": 356, "lat": 33.7490, "lng": -84.3880},
    {"id": "emb:gy03", "name": "Dr. Chloe Bergmann", "specialty": "Gynecology", "location": "2850 Junipero Serra Blvd, San Francisco, CA", "rating": 4.7, "review_count": 267, "lat": 37.7250, "lng": -122.4729},
    {"id": "emb:gy04", "name": "Dr. Isabella Moore", "specialty": "Gynecology", "location": "1 Franklin Square, Washington, DC", "rating": 4.6, "review_count": 198, "lat": 38.8951, "lng": -77.0364},
    # Rheumatology
    {"id": "emb:rh01", "name": "Dr. Alexander Petrov", "specialty": "Rheumatology", "location": "535 E 70th St, New York, NY", "rating": 4.8, "review_count": 234, "lat": 40.7657, "lng": -73.9540},
    {"id": "emb:rh02", "name": "Dr. Diana Torres", "specialty": "Rheumatology", "location": "900 NW 17th Ave, Miami, FL", "rating": 4.7, "review_count": 178, "lat": 25.7837, "lng": -80.2150},
    {"id": "emb:rh03", "name": "Dr. William Parker", "specialty": "Rheumatology", "location": "1500 Massachusetts Ave, Boston, MA", "rating": 4.6, "review_count": 145, "lat": 42.3497, "lng": -71.0823},
    # Oncology
    {"id": "emb:on01", "name": "Dr. Theodore Walsh", "specialty": "Oncology", "location": "1275 York Ave, New York, NY", "rating": 4.9, "review_count": 312, "lat": 40.7637, "lng": -73.9545},
    {"id": "emb:on02", "name": "Dr. Kezia Campbell", "specialty": "Oncology", "location": "1515 Holcombe Blvd, Houston, TX", "rating": 4.8, "review_count": 267, "lat": 29.7065, "lng": -95.3991},
    {"id": "emb:on03", "name": "Dr. Felix Morrison", "specialty": "Oncology", "location": "450 Brookline Ave, Boston, MA", "rating": 4.7, "review_count": 234, "lat": 42.3382, "lng": -71.1059},
    # General Practice
    {"id": "emb:gp01", "name": "Dr. Alice Thompson", "specialty": "General Practice", "location": "505 E 70th St, New York, NY", "rating": 4.7, "review_count": 445, "lat": 40.7651, "lng": -73.9552},
    {"id": "emb:gp02", "name": "Dr. Brian Cooper", "specialty": "General Practice", "location": "7400 Fannin St, Houston, TX", "rating": 4.6, "review_count": 389, "lat": 29.7085, "lng": -95.3987},
    {"id": "emb:gp03", "name": "Dr. Mia Peterson", "specialty": "General Practice", "location": "251 E Huron St, Chicago, IL", "rating": 4.8, "review_count": 312, "lat": 41.8960, "lng": -87.6226},
    {"id": "emb:gp04", "name": "Dr. Omar Abdullah", "specialty": "General Practice", "location": "11380 Anderson St, Loma Linda, CA", "rating": 4.5, "review_count": 267, "lat": 34.0485, "lng": -117.2672},
    {"id": "emb:gp05", "name": "Dr. Lisa Franklin", "specialty": "General Practice", "location": "3600 Gaston Ave, Dallas, TX", "rating": 4.7, "review_count": 234, "lat": 32.7900, "lng": -96.7762},
    {"id": "emb:gp06", "name": "Dr. Mark Sanders", "specialty": "General Practice", "location": "3200 Burnet Ave, Cincinnati, OH", "rating": 4.6, "review_count": 198, "lat": 39.1500, "lng": -84.5155},
    {"id": "emb:gp07", "name": "Dr. Hannah Reid", "specialty": "General Practice", "location": "700 S Park Ave, Denver, CO", "rating": 4.9, "review_count": 356, "lat": 39.7262, "lng": -104.9870},
    {"id": "emb:gp08", "name": "Dr. Carlos Vega", "specialty": "General Practice", "location": "2500 N State St, Jackson, MS", "rating": 4.5, "review_count": 167, "lat": 32.3225, "lng": -90.1817},
    {"id": "emb:gp09", "name": "Dr. Yuki Tanaka", "specialty": "General Practice", "location": "1900 Pacific Ave, Tacoma, WA", "rating": 4.6, "review_count": 212, "lat": 47.2529, "lng": -122.4443},
    {"id": "emb:gp10", "name": "Dr. Diane Moreau", "specialty": "General Practice", "location": "1440 Canal St, New Orleans, LA", "rating": 4.7, "review_count": 278, "lat": 29.9501, "lng": -90.0665},
]


def calc_distance_miles(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    earth_radius_miles = 3958.8
    d_lat = radians(lat2 - lat1)
    d_lng = radians(lng2 - lng1)
    a = sin(d_lat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lng / 2) ** 2
    return 2 * earth_radius_miles * asin(sqrt(a))


def _stable_rating(doctor_id: str) -> tuple[float, int]:
    """Generate a stable synthetic rating from a doctor ID hash."""
    h = int(hashlib.sha256(doctor_id.encode()).hexdigest()[:8], 16)
    rating = round(3.6 + (h % 15) * 0.1, 1)
    review_count = 12 + (h % 288)
    return rating, review_count


def _specialty_from_tags(tags: dict, fallback: str | None = None) -> str:
    if fallback:
        return fallback
    for key in ("healthcare:speciality", "speciality", "specialty"):
        value = tags.get(key)
        if value:
            return str(value).replace("_", " ").title()
    return "General Practice"


def _search_embedded(
    specialty: str | None,
    q: str | None,
    lat: float | None,
    lng: float | None,
    radius_miles: float | None,
) -> list[Doctor]:
    pool = list(_EMBEDDED_DOCTORS)

    # Filter by specialty
    if specialty:
        sp_lower = specialty.strip().lower()
        pool = [d for d in pool if sp_lower in d["specialty"].lower()]

    # Filter by text query (name, specialty, location)
    if q:
        q_lower = q.strip().lower()
        pool = [
            d for d in pool
            if q_lower in d["name"].lower()
            or q_lower in d["specialty"].lower()
            or q_lower in d["location"].lower()
        ]

    # Compute distances for display/sorting — never filter embedded pool by radius
    # (telehealth is nationwide; location only affects sort order)
    doctors: list[Doctor] = []
    for d in pool:
        distance: float | None = None
        if lat is not None and lng is not None:
            distance = round(calc_distance_miles(lat, lng, d["lat"], d["lng"]), 1)
        doctors.append(
            Doctor(
                id=d["id"],
                name=d["name"],
                specialty=d["specialty"],
                location=d["location"],
                rating=d["rating"],
                review_count=d["review_count"],
                lat=d["lat"],
                lng=d["lng"],
                distance_miles=distance,
            )
        )

    # Sort: by distance if available, else by rating descending
    if lat is not None and lng is not None:
        doctors.sort(key=lambda x: x.distance_miles if x.distance_miles is not None else 99_000)
    else:
        doctors.sort(key=lambda x: x.rating, reverse=True)

    return doctors


def _fetch_nominatim_search_doctors(
    search: str,
    specialty: str | None,
) -> list[Doctor]:
    query = {
        "q": f"{search} doctor clinic physician",
        "format": "jsonv2",
        "limit": 25,
        "addressdetails": 1,
    }
    url = f"https://nominatim.openstreetmap.org/search?{urlencode(query)}"
    req = Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "CareIT-Demo/1.0 (telehealth-discovery)",
        },
    )
    with urlopen(req, timeout=10) as response:
        payload = json.loads(response.read().decode("utf-8"))

    doctors: list[Doctor] = []
    for row in payload:
        name = (row.get("display_name") or "").split(",")[0].strip()
        if not name:
            continue
        doc_id = f"osm:{row.get('osm_type', 'node')}:{row.get('osm_id', name)}"
        rating, review_count = _stable_rating(doc_id)
        doctors.append(
            Doctor(
                id=doc_id,
                name=name,
                specialty=specialty or "General Practice",
                location=row.get("display_name", "Location unavailable"),
                rating=rating,
                review_count=review_count,
                lat=float(row["lat"]) if row.get("lat") else None,
                lng=float(row["lon"]) if row.get("lon") else None,
                distance_miles=None,
            )
        )
    return doctors


def _fetch_overpass_nearby_doctors(
    latitude: float,
    longitude: float,
    radius: int,
    specialty: str | None,
    search: str | None,
) -> list[Doctor]:
    radius_meters = min(max(radius * 1609, 1000), 75000)
    overpass_query = f"""
    [out:json][timeout:20];
    (
      node(around:{radius_meters},{latitude},{longitude})["amenity"="doctors"];
      way(around:{radius_meters},{latitude},{longitude})["amenity"="doctors"];
      node(around:{radius_meters},{latitude},{longitude})["healthcare"="doctor"];
      way(around:{radius_meters},{latitude},{longitude})["healthcare"="doctor"];
      node(around:{radius_meters},{latitude},{longitude})["healthcare"="clinic"];
      way(around:{radius_meters},{latitude},{longitude})["healthcare"="clinic"];
      node(around:{radius_meters},{latitude},{longitude})["office"="physician"];
    );
    out center tags;
    """
    req = Request(
        "https://overpass-api.de/api/interpreter",
        data=urlencode({"data": overpass_query}).encode("utf-8"),
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
            "User-Agent": "CareIT-Demo/1.0 (telehealth-discovery)",
        },
        method="POST",
    )
    with urlopen(req, timeout=12) as response:
        payload = json.loads(response.read().decode("utf-8"))

    places = payload.get("elements", [])
    doctors: list[Doctor] = []
    for place in places:
        tags = place.get("tags", {})
        place_lat = place.get("lat") or place.get("center", {}).get("lat")
        place_lng = place.get("lon") or place.get("center", {}).get("lon")
        if place_lat is None or place_lng is None:
            continue
        display_name = tags.get("name") or "Practice"
        if search and search.strip().lower() not in display_name.lower():
            continue
        distance = round(calc_distance_miles(latitude, longitude, float(place_lat), float(place_lng)), 1)
        if distance > radius:
            continue
        location_parts = [
            tags.get("addr:housenumber", ""),
            tags.get("addr:street", ""),
            tags.get("addr:city", ""),
        ]
        location = " ".join(p for p in location_parts if p).strip() or tags.get("addr:full") or "Nearby practice"
        doc_id = f"osm:{place.get('type', 'node')}:{place.get('id', display_name)}"
        rating, review_count = _stable_rating(doc_id)
        doctors.append(
            Doctor(
                id=doc_id,
                name=display_name,
                specialty=_specialty_from_tags(tags, specialty),
                location=location,
                rating=rating,
                review_count=review_count,
                lat=float(place_lat),
                lng=float(place_lng),
                distance_miles=distance,
            )
        )
    doctors.sort(key=lambda d: d.distance_miles if d.distance_miles is not None else 10_000)
    return doctors


@router.get("/", response_model=List[Doctor], dependencies=[Depends(require_role("patient"))])
async def list_doctors(
    specialty: Optional[str] = Query(None, description="Filter by specialty"),
    q: Optional[str] = Query(None, description="Search term for doctor name/specialty/address"),
    location: Optional[str] = Query(None, description="Free-text location search"),
    latitude: Optional[float] = Query(None, description="Patient latitude for proximity search"),
    longitude: Optional[float] = Query(None, description="Patient longitude for proximity search"),
    radius: Optional[int] = Query(50, ge=5, le=500, description="Search radius in miles"),
    source: Optional[str] = Query(
        "auto",
        description="Doctor data source: auto|db|live|embedded. 'auto' tries embedded first then OSM.",
    ),
):
    """
    Doctor Discovery. Returns doctors from embedded nationwide pool, DB, or live OSM data.
    Embedded pool covers all 50 US states across all major specialties — ideal for telehealth.
    """
    search_value = q or location

    # --- Force live OSM only ---
    if source == "live":
        try:
            live_doctors: list[Doctor] = []
            if latitude is not None and longitude is not None:
                live_doctors = _fetch_overpass_nearby_doctors(
                    latitude=latitude, longitude=longitude,
                    radius=radius or 50, specialty=specialty, search=search_value,
                )
            elif search_value:
                live_doctors = _fetch_nominatim_search_doctors(search=search_value, specialty=specialty)
            return live_doctors
        except Exception:
            return []

    # --- Embedded pool (primary) — nationwide, never radius-gated ---
    embedded = _search_embedded(
        specialty=specialty,
        q=search_value,
        lat=latitude,
        lng=longitude,
        radius_miles=None,  # always return all matching embedded doctors; radius only gates OSM
    )

    # --- DB doctors (merge in) ---
    try:
        db_rows = get_doctors(
            specialty=specialty,
            lat=latitude,
            lng=longitude,
            radius_miles=radius,
            search=search_value,
        )
        db_doctors: list[Doctor] = []
        for row in db_rows:
            row_lat = row.get("lat")
            row_lng = row.get("lng")
            distance_miles: Optional[float] = None
            if latitude is not None and longitude is not None and row_lat and row_lng:
                distance_miles = round(calc_distance_miles(latitude, longitude, float(row_lat), float(row_lng)), 1)
                if radius is not None and distance_miles > radius:
                    continue
            db_doctors.append(
                Doctor(
                    id=row["id"],
                    name=row.get("full_name", ""),
                    specialty=row.get("specialty", ""),
                    location=row.get("address", ""),
                    rating=float(row.get("rating") or 0.0),
                    review_count=int(row.get("review_count") or 0),
                    lat=float(row_lat) if row_lat else None,
                    lng=float(row_lng) if row_lng else None,
                    distance_miles=distance_miles,
                )
            )
    except Exception:
        db_doctors = []

    # --- Supplement with OSM when user has location + no specialty filter ---
    osm_doctors: list[Doctor] = []
    if source == "auto" and latitude is not None and longitude is not None and not specialty:
        try:
            osm_doctors = _fetch_overpass_nearby_doctors(
                latitude=latitude, longitude=longitude,
                radius=min(radius or 50, 25),
                specialty=specialty, search=search_value,
            )
        except Exception:
            osm_doctors = []

    # Merge: DB first (verified), then embedded, then OSM — deduplicate by name+specialty
    seen: set[str] = set()
    merged: list[Doctor] = []
    for doc in db_doctors + embedded + osm_doctors:
        key = f"{doc.name.lower()}::{doc.specialty.lower()}"
        if key not in seen:
            seen.add(key)
            merged.append(doc)

    # Sort: by distance if coords provided, else by rating
    if latitude is not None and longitude is not None:
        merged.sort(key=lambda d: d.distance_miles if d.distance_miles is not None else 99_000)
    else:
        merged.sort(key=lambda d: d.rating, reverse=True)

    return merged[:50]


@router.get("/{doctor_id}/slots", response_model=List[AppointmentSlot], dependencies=[Depends(require_role("patient"))])
async def get_available_slots(doctor_id: str):
    """
    Returns deterministic time slots for the next 7 days (9 AM–5 PM, 30 min each).
    Each day has a different pseudo-random unavailability pattern based on the doctor_id.
    """
    now = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    base_h = int(hashlib.sha256(doctor_id.encode()).hexdigest()[:8], 16)

    slots: list[AppointmentSlot] = []
    for day_offset in range(1, 8):  # next 7 days
        # Start at 14:00 UTC = 9 AM US Eastern / 10 AM Central / 11 AM Mountain / 12 PM Pacific
        day_start = (now + timedelta(days=day_offset)).replace(hour=14, minute=0, second=0, microsecond=0)
        # Different unavailable pattern each day using XOR with day offset
        day_h = base_h ^ (day_offset * 0x5A5A5A5A)
        unavailable_indices = {day_h % 16, (day_h >> 4) % 16, (day_h >> 8) % 16}
        for i in range(16):  # 9:00 AM to 4:30 PM (16 × 30-min slots)
            slots.append(
                AppointmentSlot(
                    id=f"slot-{doctor_id}-d{day_offset}-{i + 1}",
                    doctor_id=doctor_id,
                    start_time=day_start + timedelta(minutes=30 * i),
                    is_available=(i not in unavailable_indices),
                )
            )
    return slots
