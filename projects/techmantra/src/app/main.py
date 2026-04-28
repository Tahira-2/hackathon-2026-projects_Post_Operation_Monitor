import streamlit as st
import os
import sys

# --- 1. PAGE CONFIG ---
st.set_page_config(page_title="MediTriage", layout="wide", initial_sidebar_state="expanded")

# --- 2. HIDE DEFAULT NAVIGATION ---
st.markdown("""
    <style>
        [data-testid="stSidebarNav"] { display: none !important; }
        [data-testid="stSidebarContent"] { padding-top: 2rem; }
    </style>
""", unsafe_allow_html=True)

# Path Setup
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.session_state import init_session
from pages import signup, symptoms, doctor_dashboard, results
from db.db import init_db

AUTH_MODE_KEY = "auth_mode_choice"
CURRENT_PAGE_KEY = "current_page"

# Initialize everything
init_session()
init_db()

if not st.session_state.get("is_authenticated"):
    signup.show() 
else:
    st.sidebar.title("🏥 MediTriage")
    user_profile = st.session_state.get("user_profile", {})
    user_name = user_profile.get("name", "User")
    
    # Get the role (Default to 'patient' if not found)
    user_role = user_profile.get("role", "patient").lower()
    
    if isinstance(user_name, list) and len(user_name) > 0:
        user_name = user_name[0].get("text", "User")
    
    st.sidebar.success(f"✅ Active: {user_name} ({user_role.capitalize()})")
    
    # --- 3. DYNAMIC NAVIGATION LIST (Role-Based) ---
    if user_role == "doctor":
        # Doctors strictly see clinical management tools
        pages = ["Doctor Dashboard", "Logout"]
    else:
        # Patients strictly see personal health tools
        pages = ["Dashboard", "Symptom Checker", "Results", "Logout"]
    
    # --- 4. NAVIGATION SELECTION & AUTO-REDIRECT ---
    current_pg = st.session_state.get(CURRENT_PAGE_KEY)
    
    # Force doctors to land on their dashboard if they are on a patient page
    if user_role == "doctor" and current_pg not in pages:
        current_pg = "Doctor Dashboard"
    # Force patients to land on Dashboard if they are lost
    elif user_role == "patient" and current_pg not in pages:
        current_pg = "Dashboard"

    try:
        default_idx = pages.index(current_pg)
    except ValueError:
        default_idx = 0
    
    nav = st.sidebar.radio("Navigation Menu", pages, index=default_idx)
    
    # --- 5. PAGE ROUTING ---
    if nav == "Dashboard":
        st.session_state[CURRENT_PAGE_KEY] = "Dashboard"
        signup.show()
    elif nav == "Symptom Checker":
        st.session_state[CURRENT_PAGE_KEY] = "Symptom Checker"
        symptoms.show()
    elif nav == "Doctor Dashboard":
        # Extra security check
        if user_role == "doctor":
            st.session_state[CURRENT_PAGE_KEY] = "Doctor Dashboard"
            doctor_dashboard.show()
        else:
            st.session_state[CURRENT_PAGE_KEY] = "Dashboard"
            st.rerun()
    elif nav == "Results":
        st.session_state[CURRENT_PAGE_KEY] = "Results"
        results.show()
    elif nav == "Logout":
        st.session_state.is_authenticated = False
        st.session_state.user_profile = {}
        st.session_state[CURRENT_PAGE_KEY] = "Dashboard"
        st.rerun()