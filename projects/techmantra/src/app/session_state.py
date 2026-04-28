import streamlit as st


def init_session():
    defaults = {
        "is_authenticated": False,
        "patient_id": None,
        "user_profile": {},
        "auth_mode_choice": "Login (Returning Patient)",
        "current_page": "Dashboard",
        "transcript": "",
        "current_symptoms": "",
        "symptoms": "",
        "live_transcription": "",
        "symptom_input_mode": "Type my symptoms",
        "ner_results": {},
        "diagnosis": {},
        "risk_tier": None,
        "rag_sources": [],
        "email_sent": False,
        "appointment_booked": False,
    }

    for key, val in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = val