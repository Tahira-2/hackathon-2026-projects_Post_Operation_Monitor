# BurnoutWatch

**Team Members:** Lena (codedbylena), Munamadan

## Problem Statement

Healthcare worker burnout is a critical issue affecting patient care and hospital safety. Current solutions fail to provide early intervention or personalized insights. BurnoutWatch addresses this by predicting burnout risk using shift patterns, overtime, recovery trends, and facial fatigue analysis, enabling proactive interventions before burnout escalates.

## Solution

BurnoutWatch is an AI-powered mobile application that:

1. **Tracks Health Metrics** - Integrates with HealthKit (iOS) and Health Connect (Android) to capture sleep duration, sleep quality, step count, heart rate, HRV, activity minutes, and workouts.

2. **Captures Workload Data** - Allows manual entry of shift counts, overtime hours, fatigue ratings, and stress ratings specific to healthcare workers.

3. **Analyzes Facial Fatigue** - Uses camera-based facial analysis to detect signs of physical fatigue through eye openness, facial tension, engagement levels, and negative affect.

4. **Generates Burnout Scores** - Calculates a deterministic burnout risk score (0-100) using weighted categories: recovery (35%), workload (25%), physiological strain (20%), and self-report (20%).

5. **Provides Recommendations** - Delivers personalized, actionable recommendations to help healthcare workers manage burnout risk.

## Tech Stack

### Backend
- **Framework:** FastAPI (Python)
- **Database:** SQLite
- **ML Pipeline:** Facial fatigue analysis with mock/real model support
- **LLM Integration:** Hugging Face (Gemma 2B) with mock fallback

### Frontend
- **Framework:** React Native with Expo SDK 54
- **Health Integrations:** 
  - iOS: `react-native-health` (HealthKit)
  - Android: `react-native-health-connect`, `expo-health-connect`
- **Storage:** `expo-secure-store`
- **Camera:** `expo-image-picker`

### Key Libraries
- `lucide-react-native` - Icons
- `react-native-svg` - Graphics
- `pydantic` - Data validation

## Architecture

```
BurnoutWatch/
├── backend/
│   ├── app/
│   │   ├── api/          # API route handlers
│   │   ├── ml/           # Facial fatigue ML pipeline
│   │   ├── scoring/      # Burnout scoring logic
│   │   ├── services/     # Business logic
│   │   └── main.py       # FastAPI entry point
│   ├── requirements.txt
│   └── burnoutwatch.db
│
└── frontend/
    ├── src/
    │   ├── burnout/
    │   │   ├── components/    # UI components
    │   │   ├── navigation/    # App flow
    │   │   └── screens/       # App screens
    │   ├── metrics/
    │   │   ├── providers/     # HealthKit/HealthConnect adapters
    │   │   ├── native/        # Native module adapters
    │   │   └── manualForm.js  # Manual entry
    │   └── services/          # API clients
    └── package.json
```

## Data Sources

### Device Health (via HealthKit/Health Connect)
- Sleep duration (hours)
- Sleep quality proxy (when available)
- Step count
- Resting heart rate (BPM)
- Heart rate variability (ms)
- Activity minutes
- Workout count

### Manual Entry
- Sleep duration (hours)
- Sleep quality (manual)
- Shift count
- Overtime hours
- Fatigue rating (1-10)
- Stress rating (1-10)

### ML Pipeline Inputs
- Facial images captured during check-in
- Analyzes: eye fatigue, facial tension, engagement, negative affect

## Scoring Model

The burnout score (0-100) is calculated using weighted risk categories:

| Category | Weight | Metrics |
|----------|--------|---------|
| Recovery | 35% | Sleep duration, sleep quality |
| Workload | 25% | Shifts, overtime, activity minutes |
| Physiological | 20% | Resting HR, HRV, step count |
| Self-report | 20% | Fatigue rating, stress rating |

Time decay weighting (0.9 factor) gives more weight to recent days. Missing fields reduce confidence without being treated as zero-risk.

**Risk Tiers:**
- Low: 0-34
- Moderate: 35-64
- High: 65-100

## Limitations

1. Expo development builds required for native HealthKit/Health Connect (Expo Go insufficient)
2. Default API URL assumes local backend (127.0.0.1:8000 on iOS, 10.0.2.2:8000 on Android)
3. Android watch coverage depends on Health Connect sync behavior from source apps
4. Sleep quality proxy is null when source sleep stage detail is absent
5. ML pipeline uses mock models for demo stability (MediaPipe/ONNX replacement planned)
6. Gemma LLM may require accepting Google's model terms on Hugging Face

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- Expo CLI

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start in demo mode (no backend/health APIs required)
EXPO_PUBLIC_DEMO_MODE=1 npm start

# OR start with backend
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000 npm start
```

### Physical Device (Real Health APIs)

```bash
# Create Expo development build
npx expo prebuild

# iOS
npx expo run:ios

# Android
npx expo run:android
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/metrics/ingest` | Ingest daily metric summaries |
| GET | `/metrics/daily-summaries` | Retrieve canonical summaries |
| GET | `/scoring/burnout` | Calculate burnout score |
| POST | `/ml/facial-fatigue/analyze-photo` | Analyze facial fatigue |
| POST | `/recommendations/generate` | Generate recommendations |

## Demo

Run the app in demo mode for a reliable hackathon demo without native health APIs:

```bash
cd frontend
EXPO_PUBLIC_DEMO_MODE=1 npm start
```

Demo mode uses seeded phone-health summaries and works offline.

## Future Enhancements

- Replace mock ML models with MediaPipe face landmarks and ONNX expression models
- Add authentication and user management
- Real-time notifications for high burnout risk
- Supervisor dashboard for team-wide burnout monitoring
- Integration with hospital scheduling systems