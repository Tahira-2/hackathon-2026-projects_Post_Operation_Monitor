<div align="center">

# 🩺 DevCare

### AI-Powered Telerehabilitation Platform

*A virtual AI physiotherapist — available anytime, anywhere.*

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Django](https://img.shields.io/badge/Django-6.0-092E20?logo=django&logoColor=white)](https://www.djangoproject.com)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Pose-4285F4?logo=google&logoColor=white)](https://mediapipe.dev)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-8E75B2?logo=googlegemini&logoColor=white)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
demo : https://youtu.be/J2I6hjUJrFY?si=XvjDqZvL9-jpVbbL
</div> 

---

## 👥 Team Members

| Name | GitHub |
|---|---|
| **Safal Bhattarai** | [@safalbhattarai](https://github.com/safalbhattarai) |
| **Aaditya Sigdel** | [@aadityasigdel](https://github.com/aadityasigdel) |
| **Saksham Neupane** | [@sakshamneupane](https://github.com/sakshamneupane) |
| **Rupen Rana Magar** | [@rupenranamagar](https://github.com/rupenranamagar) |

---

## 🔴 Problem Statement

Patients recovering from injuries or surgeries are often prescribed physiotherapy exercises to perform at home. However, without direct clinical supervision:

- **Incorrect form** leads to slower recovery or re-injury
- **No real-time feedback** means patients don't know if they're doing exercises right
- **Low motivation** and lack of accountability reduce adherence to therapy plans
- **Doctor–patient communication gaps** make remote monitoring difficult
- **Limited access** to physiotherapy clinics, especially in rural or underserved areas

Traditional telehealth solutions offer video calls but cannot analyze body movement or provide automated, objective evaluations of exercise performance.

---

## ✅ Solution Description

**DevCare** is an AI-powered telerehabilitation platform that transforms any device with a camera into a smart physiotherapy assistant. It bridges the gap between clinical supervision and home-based recovery.

### How It Works

1. **Real-Time Pose Detection** — Using MediaPipe Pose, the system captures 33 body landmarks through the patient's webcam and calculates joint angles in real time. All processing happens **client-side** in the browser — no video is ever uploaded to a server.

2. **Intelligent Exercise Evaluation** — Custom rule-based evaluators analyze each exercise (Bicep Curl, Squat, Shoulder Raise, Knee Extension, Hip Abduction) with biomechanical thresholds. The system provides:
   - Rep counting with stage detection (up/down)
   - Dynamic accuracy scoring (0–100%)
   - Multi-layer corrections with severity levels (e.g., *"Keep elbow tucked closer"* — HIGH)
   - Voice coaching via Web Speech API with cooldown logic to avoid spamming

3. **Doctor–Patient Collaboration** — Doctors can:
   - Assign personalized rehabilitation plans with ordered exercises
   - Monitor patient session history, body-part scores, and progress trends
   - Provide clinical feedback with star ratings and guidance notes
   - Connect with patients via secure QR-code join links

4. **CareBot AI Assistant** — Powered by Google Gemini 2.5 Flash, CareBot helps doctors generate targeted rehab plans by:
   - Querying the exercise template database
   - Adapting intensity based on age, severity, and pain level
   - Producing editable todo lists that sync directly to patient plans
   - All outputs require doctor review before assignment (human-in-the-loop)

5. **Progress Analytics** — Patients and doctors can track:
   - Accuracy trends over time (area charts)
   - Activity volume (bar charts with pagination)
   - GitHub-style consistency heatmaps (28-day view)
   - Anatomical recovery progress with body-part score visualization
   - Session streaks and completion rates

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework with React Compiler |
| **Vite 8** | Build tool and dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **MediaPipe Pose** | Real-time body landmark detection (client-side) |
| **Recharts** | Data visualization (charts and graphs) |
| **React Webcam** | Camera capture for pose detection |
| **Web Speech API** | Voice coaching (text-to-speech) |
| **Lucide React** | Icon library |
| **React Router v7** | Client-side routing |
| **date-fns** | Date formatting utilities |

### Backend
| Technology | Purpose |
|---|---|
| **Django 6.0** | Web framework and ORM |
| **Django REST Framework** | RESTful API endpoints |
| **SimpleJWT** | JWT-based authentication |
| **Google Generative AI (Gemini 2.5 Flash)** | CareBot AI plan generation |
| **SQLite** | Development database |
| **Pillow** | Image processing (avatars) |
| **qrcode** | QR code generation for doctor–patient linking |
| **django-cors-headers** | Cross-origin request handling |

### AI / ML
| Technology | Purpose |
|---|---|
| **MediaPipe Pose (BlazePose)** | 33-landmark body pose estimation |
| **Custom Rule-Based Evaluators** | Deterministic exercise scoring with biomechanical thresholds |
| **Google Gemini 2.5 Flash** | Natural language plan generation |

---

## 🚀 Setup Instructions

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **npm** 9+
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/DevCare.git
cd DevCare/src
```

### 2. Backend Setup (Django)

```bash
cd devcare-server

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Create a .env file in devcare-server/ with:
echo GEMINI_API_KEY=your_gemini_api_key_here > .env

# Run migrations
python manage.py migrate

# (Optional) Create a superuser for admin access
python manage.py createsuperuser

# Start the backend server
python manage.py runserver
```

The API will be available at `http://localhost:8000`

### 3. Frontend Setup (React + Vite)

```bash
# Open a new terminal
cd devcare-client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Quick Start Guide

1. **Register** as a **Doctor** and a **Patient** (two separate accounts)
2. As the Doctor: go to **Connect** → generate a **QR / Join Link**
3. As the Patient: visit the join link to connect with the doctor
4. As the Doctor: go to **Assign Therapy** → create a rehabilitation plan with exercises
5. As the Patient: go to **My Sessions** → start a therapy session
6. Allow camera access and perform the exercises with real-time AI coaching
7. After completion, view your **Session Results** and **Progress** analytics
8. As the Doctor: review the patient's session in **Patient Detail** and submit feedback

---

## 📁 Project Structure

```
DevCare/
├── README.md
├── responsible-ai.md
├── demo/
└── src/
    ├── devcare-client/          # React Frontend
    │   ├── public/
    │   ├── src/
    │   │   ├── api/             # API client functions
    │   │   ├── assets/          # Static assets (logo, images)
    │   │   ├── components/      # Reusable UI components
    │   │   │   ├── Sidebar.jsx
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── CareBot.jsx  # AI Chatbot widget
    │   │   │   └── Modal.jsx
    │   │   ├── hooks/           # Custom React hooks
    │   │   │   └── usePose.js   # MediaPipe Pose hook
    │   │   ├── layouts/         # Page layouts
    │   │   ├── pages/
    │   │   │   ├── doctor/      # Doctor dashboard, patients, assign, feedback
    │   │   │   └── Patient/     # Patient dashboard, sessions, progress
    │   │   ├── utils/           # Utilities
    │   │   │   ├── exerciseEvaluators.js  # AI exercise scoring
    │   │   │   ├── angleUtils.js          # Joint angle math
    │   │   │   └── bodyEvaluation.js      # Body-part scoring
    │   │   ├── App.jsx
    │   │   └── main.jsx
    │   ├── index.html
    │   ├── package.json
    │   └── vite.config.js
    │
    └── devcare-server/          # Django Backend
        ├── config/              # Django settings, URLs
        ├── user/                # Authentication & user profiles
        ├── rehab/               # Rehab plans, sessions, exercises, feedback
        ├── connections/         # Doctor–patient linking (QR, join links)
        ├── carebot/             # Gemini AI chatbot service
        ├── ai_module/           # Legacy AI upload endpoint
        ├── api_docs.md          # Full API documentation
        ├── requirements.txt
        └── manage.py
```

---

## 📸 Demo

> Screenshots and demo video coming soon. Place media in the `demo/` directory.

<!--
To add screenshots, use:
![Screenshot Description](demo/screenshot-name.png)

To add a demo video link:
[🎬 Watch Demo Video](https://your-demo-link.com)
-->

| Screen | Description |
|---|---|
| Landing Page | Marketing page with feature overview and auth |
| Patient Dashboard | Session overview, therapy plans, quick actions |
| Live Session | Real-time pose detection with AI coaching overlay |
| Session Results | Post-session analytics with body-part heatmap |
| Progress Page | Historical trends, consistency calendar, anatomical recovery |
| Doctor Dashboard | Patient directory, session stats, quick actions |
| Patient Detail | AI insights, activity heatmap, clinical notes timeline |
| CareBot | AI-powered rehab plan generator with sync-to-patient |
| Assign Therapy | Drag-and-drop exercise plan builder |

---

## 📄 Additional Documentation

- [**API Documentation**](src/devcare-server/api_docs.md) — Full REST API reference with request/response examples
- [**Responsible AI**](responsible-ai.md) — Data sources, model choices, bias considerations, and failure cases

---

## 📜 License

This project was built for academic and hackathon purposes. All rights reserved by the team members.

---

<div align="center">

**Built with ❤️ by Team DevCare**

*Empowering recovery through intelligent technology*

</div>
