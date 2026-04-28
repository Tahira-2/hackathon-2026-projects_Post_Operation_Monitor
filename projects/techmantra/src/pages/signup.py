import streamlit as st
import pandas as pd

from app.session_state import init_session
from db.db import (
    get_patient,
    get_patient_by_email,
    get_patient_as_fhir,
    get_patient_full_context,
    save_allergy,
    save_known_condition,
    save_patient,
    save_physician,
)

AUTH_MODE_KEY = "auth_mode_choice"
CURRENT_PAGE_KEY = "current_page"
LOGIN_OPTION = "Login (Patient)"
SIGNUP_OPTION = "Signup (New Patient)"
DOCTOR_LOGIN = "Doctor Access" 

def _extract_display_name(profile: dict) -> str:
    raw_name = profile.get("name", "User")
    if isinstance(raw_name, list) and raw_name:
        return raw_name[0].get("text", "User")
    return raw_name if isinstance(raw_name, str) else "User"

def _load_fhir_patient_profile(patient_id: str) -> dict:
    fhir_bundle = get_patient_as_fhir(patient_id)
    # Note: If get_patient_as_fhir returns a direct resource dict instead of a bundle,
    # you might need to adjust this. Assuming it returns a dict based on your db.py.
    if fhir_bundle and fhir_bundle.get("resourceType") == "Patient":
        return fhir_bundle
    return {}

def _render_patient_dashboard():
    patient_id = st.session_state.get("patient_id")
    if not patient_id:
        st.warning("No patient profile found in session.")
        return

    ctx = get_patient_full_context(patient_id)
    patient = ctx.get("patient", {})
    allergies = ctx.get("allergies", [])
    conditions = ctx.get("known_conditions", [])
    physician = ctx.get("physician", {})

    display_name = patient.get("name") or _extract_display_name(st.session_state.get("user_profile", {}))
    st.title(f"👋 Welcome, {display_name}!")
    st.caption(f"Patient ID: `{patient_id}`")
    st.subheader("Patient Dashboard")

    col1, col2 = st.columns(2)
    with col1:
        st.write(f"**Email:** {patient.get('email', 'NA')}")
        st.write(f"**Age:** {patient.get('age', 'NA')}")
        st.write(f"**Sex:** {patient.get('sex', 'NA')}")
        st.write(f"**Location:** {patient.get('place', 'NA')}")
    with col2:
        st.write(f"**Height (cm):** {patient.get('height_cm', 'NA')}")
        st.write(f"**Weight (kg):** {patient.get('weight_kg', 'NA')}")

    allergies_text = ", ".join([str(a.get("allergen", "")) for a in allergies]) or "None"
    conditions_text = ", ".join([str(c.get("condition_name", "")) for c in conditions]) or "None"
    st.write(f"**Allergies:** {allergies_text}")
    st.write(f"**Known Conditions:** {conditions_text}")

    st.subheader("Primary Physician")
    # Swapping the keys here to ensure the right data shows in the right place
    st.write(f"**Doctor Name:** {physician.get('email', 'Not Provided')}")
    st.write(f"**Email:** {physician.get('doctor_name', 'Not Provided')}")

    with st.expander("View FHIR Patient Data (Table)", expanded=True):
        from db.db import get_patient_as_fhir
        fhir_patient = get_patient_as_fhir(patient_id)
        
        extensions = fhir_patient.get("extension", [])
        h_val = next((f"{ext['valueQuantity']['value']} cm" for ext in extensions if "height" in ext["url"]), "N/A")
        w_val = next((f"{ext['valueQuantity']['value']} kg" for ext in extensions if "weight" in ext["url"]), "N/A")

        summary_rows = [
            {"Field": "Resource Type", "Value": fhir_patient.get("resourceType", "Patient")},
            {"Field": "FHIR ID", "Value": fhir_patient.get("id", "N/A")},
            {"Field": "Full Name", "Value": fhir_patient["name"][0].get("text", "N/A") if fhir_patient.get("name") else "N/A"},
            {"Field": "Gender", "Value": fhir_patient.get("gender", "N/A").capitalize()},
            {"Field": "Birth Date", "Value": fhir_patient.get("birthDate", "N/A")},
            {"Field": "Location", "Value": fhir_patient["address"][0].get("text", "N/A") if fhir_patient.get("address") else "N/A"},
            {"Field": "Height", "Value": h_val},
            {"Field": "Weight", "Value": w_val},
        ]

        st.dataframe(pd.DataFrame(summary_rows), use_container_width=True, hide_index=True)
    
    col_a, col_b = st.columns(2)
    with col_a:
        if st.button("Go to Symptom Checker", type="primary", use_container_width=True):
            st.session_state[CURRENT_PAGE_KEY] = "Symptom Checker"
            st.rerun()
    with col_b:
        if st.button("Logout", use_container_width=True):
            _set_logged_out_state()
            st.rerun()

def _render_doctor_login():
    st.subheader("👨‍⚕️ Provider Portal")
    st.caption("Doctors: Enter your email to see patients who have assigned you.")
    
    doc_email = st.text_input("Professional Email", placeholder="doctor@hospital.com")
    doc_name = st.text_input("Your Name (Optional)", placeholder="Dr. Smith")

    if st.button("Access Dashboard", type="primary", use_container_width=True):
        clean_email = doc_email.strip().lower()
        if not clean_email:
            st.warning("Please enter your professional email.")
            return

        st.session_state.is_authenticated = True
        st.session_state.user_profile = {
            "name": doc_name if doc_name else "Provider",
            "email": clean_email,
            "role": "doctor"
        }
        st.session_state[CURRENT_PAGE_KEY] = "Doctor Dashboard"
        st.success(f"Access granted for {clean_email}")
        st.rerun()

def _set_logged_out_state():
    st.session_state.is_authenticated = False
    st.session_state.user_profile = {}
    st.session_state.patient_id = None
    st.session_state[AUTH_MODE_KEY] = LOGIN_OPTION
    st.session_state[CURRENT_PAGE_KEY] = "Dashboard"
    st.rerun()

def _render_login_tab():
    st.subheader("Patient Login")
    login_email = st.text_input("Patient Email", placeholder="you@example.com")

    if st.button("Login", type="primary", use_container_width=True):
        clean_login_email = login_email.strip().lower()
        patient_data = get_patient_by_email(clean_login_email)
        if not patient_data:
            st.error("Email not found.")
            return

        patient_id = patient_data["id"]
        fhir_profile = _load_fhir_patient_profile(patient_id)
        
        st.session_state.is_authenticated = True
        st.session_state.patient_id = patient_id
        
        # --- FIX: Ensure email is persisted in the profile ---
        profile = fhir_profile if fhir_profile else dict(patient_data)
        profile["role"] = "patient"
        profile["email"] = clean_login_email # CRITICAL FIX
        
        st.session_state.user_profile = profile
        st.session_state[CURRENT_PAGE_KEY] = "Dashboard"
        st.rerun()

def _render_signup_tab():
    st.subheader("New Patient Signup")
    with st.form("signup_form_main"):
        patient_email = st.text_input("Email")
        name = st.text_input("Full Name")
        age = st.number_input("Age", 1, 120, 25)
        sex = st.selectbox("Sex", ["Male", "Female", "Other"])
        place = st.text_input("Location")

        col1, col2 = st.columns(2)
        with col1:
            height_cm = st.number_input("Height (cm)", 50.0, 250.0, 170.0)
        with col2:
            weight_kg = st.number_input("Weight (kg)", 20.0, 300.0, 70.0)

        st.divider()
        allergies_text = st.text_input("Allergies (comma separated)")
        conditions_text = st.text_input("Conditions (comma separated)")

        st.divider()
        st.markdown("**Your Physician (Used for Doctor Dashboard Link)**")
        doctor_name = st.text_input("Doctor's Name")
        dr_email = st.text_input("Doctor's Email (Required for Dashboard link)")

        submitted = st.form_submit_button("Create Profile", type="primary")
        if submitted:
            clean_email = patient_email.strip().lower()
            if not clean_email or not name.strip():
                st.error("Required fields missing.")
                return

            pid = save_patient(clean_email, name.strip(), int(age), sex, float(height_cm), float(weight_kg), place.strip())
            
            for a in [x.strip() for x in allergies_text.split(",") if x.strip()]:
                save_allergy(pid, a)
            for c in [x.strip() for x in conditions_text.split(",") if x.strip()]:
                save_known_condition(pid, c)
            if dr_email.strip():
                save_physician(pid, doctor_name.strip() or "Provider", "Clinic", dr_email.strip())

            # --- FIX: Ensure email is persisted in the profile ---
            st.session_state.is_authenticated = True
            st.session_state.patient_id = pid
            
            st.session_state.user_profile = {
                "name": name.strip(),
                "email": clean_email, # CRITICAL FIX
                "id": pid,
                "role": "patient"
            }
            
            st.session_state[CURRENT_PAGE_KEY] = "Dashboard"
            st.rerun()

def show():
    init_session()

    if st.session_state.get("is_authenticated"):
        if st.session_state.user_profile.get("role") == "doctor":
             st.info("You are logged in as a provider. Use the sidebar to view the Doctor Dashboard.")
        else:
            _render_patient_dashboard()
        return

    st.title("🏥 MediTriage")
    
    auth_mode = st.radio(
        "Who are you?",
        [LOGIN_OPTION, SIGNUP_OPTION, DOCTOR_LOGIN],
        key=AUTH_MODE_KEY,
        horizontal=True,
    )
    st.divider()

    if auth_mode == LOGIN_OPTION:
        _render_login_tab()
    elif auth_mode == SIGNUP_OPTION:
        _render_signup_tab()
    else:
        _render_doctor_login()