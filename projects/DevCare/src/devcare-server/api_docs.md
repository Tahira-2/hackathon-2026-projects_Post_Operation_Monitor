# Dev Care — API Endpoint Documentation

**Base URL:** `http://localhost:8000`
**Authentication:** JWT (via `Authorization: Bearer <access_token>`)

---

## 1. Authentication Endpoints (`/api/auth/`)

### 1.1 Register

| | |
|---|---|
| **URL** | `POST /api/auth/register/` |
| **Auth** | ❌ None |
| **Description** | Register a new user (patient or doctor). Returns JWT tokens immediately so the user is logged in on registration. |

**Request Body:**
```json
{
  "username": "Robert811",
  "email": "bhattarairobert@example.com",
  "password": "StrongPass123",
  "password_confirm": "StrongPass",
  "first_name": "Robert",
  "last_name": "Bhattarai",
  "role": "patient"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `username` | string | ✅ | Unique username |
| `email` | string | ✅ | Unique email |
| `password` | string | ✅ | Min 8 characters |
| `password_confirm` | string | ✅ | Must match `password` |
| `first_name` | string | ❌ | |
| `last_name` | string | ❌ | |
| `role` | string | ❌ | `"patient"` (default) or `"doctor"` |

**Success Response (`201 Created`):**
```json
{
  "message": "Registration successful.",
  "user": {
    "id": 1,
    "username": "Robert811",
    "email": "bhattarairobert@example.com",
    "role": "patient"
  },
  "refresh": "eyJhbGciOiJIUzI1NiIs...",
  "access": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Response (`400 Bad Request`):**
```json
{
  "password_confirm": ["Passwords do not match."],
  "email": ["Email is already in use."]
}
```

---

### 1.2 Login

| | |
|---|---|
| **URL** | `POST /api/auth/login/` |
| **Auth** | ❌ None |
| **Description** | Authenticate a user and return JWT tokens along with user info including role. |

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securePass123"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `username` | string | ✅ | |
| `password` | string | ✅ | |

**Success Response (`200 OK`):**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIs...",
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

**Error Response (`401 Unauthorized`):**
```json
{
  "detail": "No active account found with the given credentials"
}
```

---

### 1.3 Refresh Token

| | |
|---|---|
| **URL** | `POST /api/auth/refresh/` |
| **Auth** | ❌ None |
| **Description** | Get a new access token using a valid refresh token. |

**Request Body:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `refresh` | string | ✅ | A valid refresh token |

**Success Response (`200 OK`):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Response (`401 Unauthorized`):**
```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```
---

## 3. AI Module Endpoints (`/api/ai/`)

> [!IMPORTANT]
> This is a legacy/utility endpoint. The primary rehab flow uses the `/api/rehab/` endpoints above.

### 3.1 Upload Session (Legacy)

| | |
|---|---|
| **URL** | `POST /api/ai/upload-session/` |
| **Auth** | ✅ Doctor or Patient |
| **Description** | Upload a standalone exercise session result. If called by a doctor, `patient_id` is required. If called by a patient, the session is automatically assigned to them. |

**Request Body (as Patient):**
```json
{
  "exercise": "bicep curl",
  "reps": 10,
  "avg_range": 130.5,
  "form_accuracy": 88.0,
  "duration": 45.0
}
```

**Request Body (as Doctor):**
```json
{
  "patient_id": 3,
  "exercise": "bicep curl",
  "reps": 10,
  "avg_range": 130.5,
  "form_accuracy": 88.0,
  "duration": 45.0
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `patient_id` | integer | Only for doctors | Must reference a patient user |
| `exercise` | string | ✅ | Exercise name (lowercased) |
| `reps` | integer | ✅ | ≥ 0 |
| `avg_range` | float | ✅ | Average range of motion (≥ 0) |
| `form_accuracy` | float | ✅ | 0.0–100.0 |
| `duration` | float | ✅ | Duration in seconds (≥ 0) |

**Success Response (`201 Created`):**
```json
{ "status": "saved" }
```

**Error Response (`400 Bad Request`):**
```json
{ "detail": "exercise is required." }
```

---

## Quick Reference

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register/` | ❌ | Any | Register a new user |
| `POST` | `/api/auth/login/` | ❌ | Any | Login and get JWT tokens |
| `POST` | `/api/auth/refresh/` | ❌ | Any | Refresh an access token |
| `POST` | `/api/ai/upload-session/` | ✅ | Doctor/Patient | Upload standalone session (legacy) |

---

## Responsible AI

### 1. Data Sources

DevCare uses the following data sources for its AI-powered features:

| Source | Usage | Data Type | Privacy |
|---|---|---|---|
| **MediaPipe Pose (Google)** | Real-time body landmark detection during exercise sessions | 33 body landmarks (x, y, z, visibility) per frame | All processing happens **client-side** in the browser. No video or image data is ever sent to a server. |
| **Webcam Feed** | Captured locally via `react-webcam` and passed frame-by-frame to MediaPipe | Raw video frames | Frames are processed in-memory only. No frames are stored, recorded, or transmitted. |
| **ExerciseTemplate Database** | Stores doctor-defined exercise definitions (name, target joint, angle ranges) | Structured relational data (SQLite) | Stored locally on the Django server. No patient-identifiable data in templates. |
| **Google Gemini API (`gemini-2.5-flash`)** | Powers the CareBot assistant for generating rehabilitation plan suggestions | Text-only prompts containing anonymized clinical context (condition, severity, recovery stage) | Patient names or identifiers are **never** sent to the Gemini API. Only clinical parameters are transmitted. |
| **Session Results** | Reps completed, accuracy scores, duration, and body-part evaluations submitted by the frontend after each session | Structured JSON | Stored server-side and linked to patient accounts. Accessible only by the patient and their connected doctor. |

> [!IMPORTANT]
> **No video, image, or biometric data ever leaves the patient's browser.** MediaPipe runs entirely on-device using WebAssembly + GPU acceleration. The only data sent to the backend are aggregated exercise metrics (reps, accuracy %, duration).

---

### 2. Model Choices

DevCare employs two distinct AI models, each selected for a specific purpose:

#### 2.1 MediaPipe Pose (Client-Side — Real-Time Inference)

| Property | Detail |
|---|---|
| **Model** | MediaPipe Pose (BlazePose GHUM 3D) |
| **Provider** | Google (open-source, Apache 2.0 license) |
| **Complexity** | `modelComplexity: 1` (balanced speed vs. accuracy) |
| **Confidence Thresholds** | `minDetectionConfidence: 0.5`, `minTrackingConfidence: 0.5` |
| **Why this model?** | MediaPipe Pose is the industry standard for real-time, browser-based human pose estimation. It runs at 30+ FPS on consumer hardware without requiring a GPU server, making it ideal for a telerehabilitation app where patients exercise at home. It outputs 33 standardized body landmarks, which our custom evaluators use to calculate joint angles. |
| **Alternatives considered** | TensorFlow.js PoseNet (lower accuracy, fewer landmarks), OpenPose (requires server-side GPU, not suitable for browser), MoveNet (similar performance but fewer community resources for medical applications). |

#### 2.2 Google Gemini 2.5 Flash (Server-Side — Plan Generation)

| Property | Detail |
|---|---|
| **Model** | `gemini-2.5-flash` |
| **Provider** | Google Generative AI |
| **Purpose** | CareBot assistant — generates structured rehabilitation plan suggestions for doctors to review |
| **Why this model?** | Fast inference speed, strong structured JSON output compliance, and cost-effectiveness for a clinical support tool. The Flash variant provides adequate reasoning for exercise plan generation without the latency of larger models. |
| **Safety constraints** | The system prompt explicitly prohibits the model from prescribing medication, providing diagnoses, or suggesting high-risk movements. All outputs are presented as **suggestions** that require doctor review and approval before being assigned to a patient. |

#### 2.3 Custom Rule-Based Evaluators (Client-Side — Exercise Scoring)

| Property | Detail |
|---|---|
| **Type** | Deterministic, rule-based algorithms (not ML) |
| **Purpose** | Real-time form correction, rep counting, and accuracy scoring |
| **Why rules over ML?** | For safety-critical rehab feedback, deterministic rules based on physiotherapy guidelines are more predictable and auditable than black-box ML models. Each correction has an explicit angle threshold that a physiotherapist can verify and adjust. |
| **Exercises covered** | Bicep Curl, Squat, Shoulder Raise, Knee Extension, Hip Abduction |
| **Feedback structure** | Each evaluator returns: `{ feedback, corrections: [{ feedback, severity, joint }], currentAngle, accuracyScore }` |

---

### 3. Bias Considerations

#### 3.1 Pose Detection Bias

| Concern | Mitigation |
|---|---|
| **Skin tone bias** | MediaPipe Pose has been validated across diverse skin tones by Google's research team. However, detection confidence may vary in low-contrast lighting conditions (dark skin + dark background). We set detection confidence to `0.5` (not higher) to avoid excluding users in suboptimal conditions. |
| **Body type bias** | MediaPipe was trained on a broad dataset, but extreme body proportions (e.g., very tall/short individuals, amputees, wheelchair users) may produce less accurate landmark placement. Our evaluators use **relative** angle calculations (joint-to-joint), not absolute positions, which reduces sensitivity to body shape. |
| **Clothing occlusion** | Loose or baggy clothing can obscure joint positions, degrading landmark accuracy. The UI provides a "Tracking Active / Camera Paused" indicator so patients know when detection quality is sufficient. |
| **Camera angle dependency** | Exercises are evaluated assuming a roughly frontal or side-facing camera angle. Non-standard angles may produce inaccurate angle readings. The app provides setup tips but does not currently auto-detect camera orientation. |

#### 3.2 AI Plan Generation Bias (Gemini)

| Concern | Mitigation |
|---|---|
| **Cultural bias in exercise selection** | The Gemini model may favor Western physiotherapy practices. We constrain the model to only suggest exercises from our **curated ExerciseTemplate database**, which is defined by the treating doctor. The model cannot invent exercises outside the database. |
| **Age/severity adaptation** | The system prompt explicitly instructs the model to adapt intensity based on patient age, injury severity, and pain level. However, the model's interpretation of "elderly" or "severe" may vary. All plans **require doctor review** before assignment. |
| **Language bias** | The system currently operates in English only. Non-English-speaking patients may have difficulty interpreting real-time voice coaching feedback. |

#### 3.3 Evaluation Bias

| Concern | Mitigation |
|---|---|
| **Fixed angle thresholds** | Exercise evaluators use hardcoded angle thresholds (e.g., bicep curl "up" at <45°). These thresholds assume a standard range of motion and may penalize patients with limited mobility. Future versions should allow doctors to customize thresholds per patient. |
| **Right-side bias** | Some evaluators (e.g., Hip Abduction) track only right-side landmarks by default. Patients needing left-side rehabilitation may receive inaccurate scoring. |

---

### 4. Failure Cases

#### 4.1 Pose Detection Failures

| Failure Scenario | Impact | Handling |
|---|---|---|
| **MediaPipe CDN unavailable** | Pose detection will not initialize; exercises cannot be tracked | `usePose` hook logs an error: `"MediaPipe Pose not loaded from CDN"`. The session UI still renders but with no tracking. |
| **Webcam permission denied** | No video feed available for pose estimation | The browser's native permission prompt is shown. If denied, the webcam component renders a black feed with no crash. |
| **Poor lighting / no person visible** | MediaPipe returns no landmarks or low-confidence results | Evaluators return the previous state unchanged (`if (!shoulder || !elbow || ...) return state`), preventing false rep counts or erroneous feedback. |
| **Landmark jitter / noise** | Rapid fluctuations in angle calculations cause flickering feedback | `smoothLandmarks: true` is enabled in MediaPipe options. Additionally, UI updates are gated to only fire when angle changes exceed 2° (`Math.abs(newState.currentAngle - exerciseStateRef.current.currentAngle) > 2`). |
| **Multiple people in frame** | MediaPipe may track the wrong person | The app uses single-person mode by default. In multi-person scenarios, landmark assignment may be unpredictable. A "single user" advisory is shown. |

#### 4.2 AI Service Failures (Gemini / CareBot)

| Failure Scenario | Impact | Handling |
|---|---|---|
| **Gemini API key missing or invalid** | CareBot cannot generate plans | The backend catches the exception and returns: `{"error": "..."}`. The frontend displays: `"Sorry, I'm having trouble connecting to the Care AI service."` |
| **Gemini returns non-JSON response** | Plan parsing fails | `clean_json_response()` strips markdown code fences and extracts the first `{...}` block. If parsing still fails, the error is caught and a user-friendly message is returned. |
| **Gemini safety filter triggered** | The model refuses to generate content | The backend checks `response.candidates[0].content.parts` and returns: `"I apologize, but I cannot process this request due to safety guidelines."` |
| **Gemini returns exercise not in database** | The suggested exercise cannot be synced to a patient plan | The CareBot sync logic filters exercises by `exercise_id` extracted from metadata. Exercises without a valid database ID are silently excluded (`.filter(ex => ex.exercise_id !== null)`). |

#### 4.3 Voice Feedback Failures

| Failure Scenario | Impact | Handling |
|---|---|---|
| **Browser lacks `speechSynthesis` support** | No audio coaching is provided | The `speak()` utility checks `if (!window.speechSynthesis) return` and silently degrades to visual-only feedback. |
| **Speech overlapping / stutter** | Multiple utterances queue up and create noise | `window.speechSynthesis.cancel()` is called before every new utterance. A 5-second cooldown prevents repeated speaking of the same feedback. |
| **Session paused or ended** | Orphaned speech continues playing | A `useEffect` cleanup cancels all speech when `sessionActive` becomes `false`. |

#### 4.4 Accuracy Scoring Edge Cases

| Failure Scenario | Impact | Handling |
|---|---|---|
| **Accuracy shows 0% despite correct form** | Occurs if the patient's natural range of motion falls outside the hardcoded "optimal" window | The `calculateAccuracy()` function uses tolerance bands around the optimal range, but patients with atypical mobility may still score low. Scores are clamped to `[0, 100]`. |
| **Rep counted without full motion** | If the patient briefly crosses the angle threshold and immediately returns | The stage-based logic (`up` → `down` transitions) requires the angle to cross both thresholds, reducing but not eliminating false positives. |

---

> [!NOTE]
> **Human-in-the-loop principle:** DevCare is designed as a *support tool*, not a replacement for clinical judgment. All AI-generated rehabilitation plans require explicit doctor approval before patient assignment. Real-time pose feedback supplements — but does not replace — supervision by a licensed physiotherapist.
