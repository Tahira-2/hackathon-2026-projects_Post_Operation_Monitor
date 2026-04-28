# BurnoutWatch Demo

## Video Demo

https://www.youtube.com/shorts/0NzMpr7MgQw

## Description

This demo showcases the BurnoutWatch mobile application for healthcare worker burnout prediction.

### Features Shown

1. **User Login** - Simple role selection (Worker/Supervisor)
2. **Dashboard** - View burnout score and risk tier
3. **Check-in Flow** - Complete burnout assessment
4. **Questionnaire** - Manual input for shifts, overtime, fatigue/stress ratings
5. **Camera Face Scan** - Facial fatigue analysis
6. **Results** - Personalized burnout score and recommendations

### Demo Mode

The app runs in demo mode without requiring:
- Native HealthKit/Health Connect integration
- Backend server
- Physical device

Run with:
```bash
cd frontend
EXPO_PUBLIC_DEMO_MODE=1 npm start
```