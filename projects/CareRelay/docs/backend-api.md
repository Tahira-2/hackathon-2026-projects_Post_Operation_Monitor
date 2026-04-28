# Backend API

This document tracks the backend API as it is built. Keep it updated when endpoint behavior or response shapes change.

## Run Locally

```bash
cd projects/CareRelay/src/backend
source venv/bin/activate
python app.py
```

The Flask server runs at:

```text
http://127.0.0.1:5000
```

## Implemented Endpoints

### GET `/api/patient/default`

Returns parsed Synthea FHIR R4 data for the demo patient.

The raw Synthea bundle is stored at:

```text
projects/CareRelay/src/data/patient.json
```

The parser converts the raw FHIR bundle into frontend-friendly sections:

- `patient`
- `snapshot`
- `conditions`
- `medications`
- `observations`
- `trends`
- `encounters`
- `timeline`
- `conditionThreads`
- `disclaimer`

Example test:

```bash
curl -s http://127.0.0.1:5000/api/patient/default -o /tmp/carerelay_patient_response.json
```

Quick summary check:

```bash
/tmp/check_carerelay_patient.sh
```

Expected summary:

```text
Patient: Emerald468 Botsford977
Age: 77
Conditions: 52
Medications: 28
Timeline: 300
Metrics: ['blood_pressure', 'egfr', 'glucose', 'hba1c', 'ldl', 'triglycerides', 'weight']
```

### GET `/api/drugs/interactions`

Checks a comma-separated medication list against the OpenFDA drug label API and returns warning/interaction text when label data is found.

Example:

```bash
curl "http://127.0.0.1:5000/api/drugs/interactions?meds=metformin,simvastatin,amlodipine"
```

Response sections:

- `warnings`: OpenFDA warning and drug interaction excerpts for matched medications
- `checked`: per-medication match status and normalized OpenFDA query
- `disclaimer`: demo safety note

Example summary:

```json
{
  "checked": [
    {"medication": "metformin", "query": "metformin", "matched": true}
  ],
  "warnings": [
    {
      "medication": "metformin",
      "source": "OpenFDA drug label API",
      "warning": "...",
      "interaction": "..."
    }
  ]
}
```

### GET `/api/qr/<patient_id>`

Generates a QR code PNG as a base64 data URL. By default, it points to the local frontend patient page.

Example:

```bash
curl "http://127.0.0.1:5000/api/qr/default"
```

Default QR target:

```text
http://localhost:5173/patient/default
```

Custom target URL:

```bash
curl "http://127.0.0.1:5000/api/qr/default?url=http://localhost:5173/snapshot/default"
```

Response sections:

- `patientId`: patient identifier used in the route
- `url`: URL encoded into the QR image
- `qr`: PNG image as `data:image/png;base64,...`
- `disclaimer`: demo safety note

Frontend rendering:

```js
const response = await fetch("http://127.0.0.1:5000/api/qr/default");
const data = await response.json();
// <img src={data.qr} alt="CareRelay QR code" />
```

### POST `/api/brief`

Generates a first-visit brief for the demo patient. If the request body is empty, the backend loads the default parsed Synthea patient. If Hugging Face is unavailable, the endpoint returns a deterministic fallback brief from structured patient data.

Example:

```bash
curl -X POST http://127.0.0.1:5000/api/brief
```

Optional request body:

```json
{
  "patientData": {
    "patient": {},
    "snapshot": {}
  }
}
```

Response sections:

- `brief`: generated or fallback first-visit summary
- `source`: `huggingface` or `fallback`
- `model`: Hugging Face model name when configured
- `warning`: null when Hugging Face succeeds, otherwise a fallback reason

## Planned Endpoints

### POST `/api/ner`

Planned: extract medical entities from clinical note text using a HuggingFace NER model.

## Frontend Notes

The React frontend should call:

```text
GET http://127.0.0.1:5000/api/patient/default
```

CORS is enabled in Flask, so local frontend calls from Vite should work while the Flask server is running.

Example JavaScript:

```js
const response = await fetch("http://127.0.0.1:5000/api/patient/default");
const data = await response.json();
console.log(data.patient.name);
console.log(data.snapshot.latestMetrics);
```

## Demo Data Note

All current data is synthetic Synthea FHIR R4 data. No real patient information or PHI is used.
