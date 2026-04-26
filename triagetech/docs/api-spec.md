# TriageTech API Specification

Base URL: `http://localhost:8000`

---

## `GET /`
Health check.
**Response:** `{ "message": "TriageTech API is running", "docs": "/docs" }`

---

## `POST /triage/assess`
Run symptom triage.

**Request Body:**
```json
{
  "symptoms": ["chest pain", "shortness of breath"],
  "age": 45,
  "gender": "male",
  "duration_days": 2,
  "language": "en"
}
```

**Response:**
```json
{
  "severity": "red",
  "severity_label": "Seek Emergency Care",
  "advice": "Your symptoms may indicate a serious condition...",
  "advice_ne": "तपाईंका लक्षणहरू गम्भीर...",
  "possible_conditions": [
    { "condition": "Possible Cardiac Event", "severity": "red", "confidence": 88 }
  ],
  "matched_symptoms": ["chest pain", "shortness of breath"],
  "risk_flags": ["chest pain"],
  "confidence": 95,
  "translated_symptoms": null
}
```

---

## `GET /triage/symptoms/list`
Returns categorized symptom vocabulary for autocomplete.

**Response:**
```json
{
  "emergency": ["chest pain", "seizure", ...],
  "moderate": ["fever", "vomiting", ...],
  "mild": ["runny nose", "mild cough", ...]
}
```

---

## `POST /translate/symptoms`
Translate Nepali/Romanized symptoms to English.

**Request Body:**
```json
{ "symptoms": ["ज्वरो", "खोकी", "jwaro"] }
```

**Response:**
```json
{
  "original": ["ज्वरो", "खोकी", "jwaro"],
  "translated": ["fever", "cough", "fever"],
  "detected_language": "ne"
}
```

---

## `GET /translate/vocabulary`
Returns the full Nepali→English symptom vocabulary.

---

## `GET /clinics/nearest`
Returns nearest clinics sorted by distance.

**Query Params:**
| Param | Type | Required | Description |
|---|---|---|---|
| `lat` | float | ✅ | User latitude |
| `lng` | float | ✅ | User longitude |
| `limit` | int | ❌ | Max results (1–20, default 5) |
| `emergency_only` | bool | ❌ | Filter emergency facilities |

**Response:**
```json
[
  {
    "name": "Bir Hospital",
    "type": "Hospital",
    "district": "Kathmandu",
    "lat": 27.706,
    "lng": 85.3138,
    "phone": "01-4221119",
    "emergency": true,
    "distance_km": 1.4
  }
]
```

---

## `GET /clinics/all`
Returns all clinic data unfiltered.

---

## Interactive Docs
Visit `/docs` (Swagger UI) or `/redoc` when the backend is running.
