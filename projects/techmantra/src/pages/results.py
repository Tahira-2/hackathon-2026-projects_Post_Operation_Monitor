import streamlit as st
import json
import pandas as pd
from datetime import datetime
from db.db import save_diagnostic_report, get_recent_sessions, get_patient_full_context, save_appointment

# --- INTEGRATION IMPORTS ---
from integrations.notifications import send_summary
from integrations.calendar_api import get_doctor_availability, book_appointment

def show():
    patient_id = st.session_state.get('patient_id')
    scroll_to = st.session_state.pop("scroll_to", None) 

    # 1. AUTO-LOAD PREVIOUS RECORD IF STATE IS EMPTY
    if not st.session_state.get('diagnosis'):
        if patient_id:
            recent = get_recent_sessions(patient_id, limit=1)
            if recent:
                entry = recent[0]
                st.session_state.diagnosis = json.loads(entry['diagnosis'])
                st.session_state.session_id = entry['id']
                st.session_state.severity = entry['risk_tier']
                st.session_state.current_symptoms = entry['symptoms']
            else:
                st.warning("Please run the symptom checker first.")
                if st.button("Go Back"):
                    st.session_state.current_page = "Symptoms"
                    st.rerun()
                return
        else:
            st.error("Please log in to view results.")
            return

    diag = st.session_state.diagnosis
    risk = diag.get('risk_tier', 'LOW').upper()
    session_id = st.session_state.get('session_id')
    user_profile = st.session_state.get('user_profile', {})

    # --- 2. RISK BANNERS (Her Styled Version) ---
    if risk == "HIGH":
        st.markdown("""
            <div style="background:#ff000020; border:2px solid #ff0000;
                 border-radius:12px; padding:24px; text-align:center; margin:16px 0;">
                <h2 style="color:#cc0000; margin:0;">🚨 EMERGENCY</h2>
                <p style="color:#cc0000; font-size:18px; margin:8px 0;">
                    Your symptoms require <strong>immediate medical attention.</strong>
                </p>
            </div>
        """, unsafe_allow_html=True)
        col1, col2 = st.columns(2)
        with col1:
            st.link_button("📞 Call 911 Now", "tel:911", use_container_width=True, type="primary")
        with col2:
            st.link_button("🗺️ Find Nearest ER", "https://www.google.com/maps/search/emergency+room+near+me", use_container_width=True)

    elif risk == "MEDIUM":
        st.markdown("""
            <div style="background:#fff3cd; border:2px solid #ffc107;
                 border-radius:12px; padding:24px; text-align:center; margin:16px 0;">
                <h2 style="color:#856404; margin:0;">⚠️ MEDICAL ATTENTION NEEDED</h2>
                <p style="color:#856404; font-size:16px; margin:8px 0;">
                    You should see a doctor within <strong>24 hours.</strong>
                </p>
            </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown("""
            <div style="background:#d4edda; border:2px solid #28a745;
                 border-radius:12px; padding:24px; text-align:center; margin:16px 0;">
                <h2 style="color:#155724; margin:0;">✅ LOW RISK</h2>
                <p style="color:#155724; font-size:16px; margin:8px 0;">
                    Your symptoms can be managed at home.
                </p>
            </div>
        """, unsafe_allow_html=True)

    st.title("📋 Diagnostic Report")

    # --- 3. NOTIFICATIONS ---
    if not st.session_state.get('email_sent'):
        with st.spinner("📧 Notifying your doctor via email..."):
            email_success = send_summary(user_profile, diag, risk)
            if email_success:
                st.session_state['email_sent'] = True
                st.toast("Doctor has been notified.")

    # --- 4. APPOINTMENT BOOKING (Manual Selection - Your Logic) ---
    st.markdown('<div id="appointment"></div>', unsafe_allow_html=True) 

    if risk == "MEDIUM":
        st.divider()
        st.subheader("📅 Schedule Follow-up Appointment")
        
        if not st.session_state.get('appointment_booked'):
            ctx = get_patient_full_context(patient_id)
            physician_data = ctx.get("physician", {})
            doctor_email = physician_data.get("email")

            if doctor_email:
                if 'available_slots' not in st.session_state:
                    with st.spinner("Checking doctor availability..."):
                        from integrations.calendar_api import get_doctor_availability
                        st.session_state.available_slots = get_doctor_availability(doctor_email)

                if st.session_state.available_slots:
                    selected_slot = st.selectbox(
                        f"Pick a time with Dr. {physician_data.get('doctor_name', 'Provider')}:",
                        options=st.session_state.available_slots,
                        format_func=lambda x: datetime.fromisoformat(x).strftime("%A, %b %d at %I:%M %p")
                    )
                    
                    if st.button("Confirm Appointment", type="primary", use_container_width=True):
                        with st.spinner("Booking..."):
                            result = book_appointment(
                                doctor_email=doctor_email,
                                patient_email=user_profile.get("email"),
                                patient_name=user_profile.get("name", "Patient"),
                                start_time_iso=selected_slot,
                                risk_summary=f"MEDIUM Risk - {diag.get('summary', '')[:30]}"
                            )
                            if result:
                                save_appointment(patient_id, doctor_email, selected_slot, diag.get('summary', ''))
                                st.session_state.appointment_booked = True
                                st.success("Appointment Confirmed!")
                                st.rerun()
                else:
                    st.warning("No open slots found for the next 3 days.")
            else:
                st.error("No doctor assigned to your profile.")
        else:
            st.success("✅ Appointment scheduled and synced.")
        st.divider()

    # --- 5. FHIR & ANALYSIS ---
    if patient_id and session_id:
        with st.spinner("Generating FHIR R4 Record..."):
            fhir_data = save_diagnostic_report(patient_id, session_id, diag)
        with st.expander("📂 View FHIR R4 JSON (Interoperability)"):
            st.json(fhir_data)

    st.subheader("Summary")
    st.write(diag.get('summary', 'Analysis provided by MedGemma.'))

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("### 🧬 Potential Conditions")
        for cond in diag.get('top_conditions', []):
            st.markdown(f"- **{cond['name']}** ({int(cond['probability']*100)}%)")
    with col2:
        st.markdown('<div id="remedies"></div>', unsafe_allow_html=True)
        st.markdown("### 💊 Recommended Remedies")
        for rem in diag.get('remedies', []):
            st.markdown(f"- {rem}")

    # --- 6. AUTO SCROLL (Her Logic) ---
    if scroll_to:
        st.markdown(f"""
            <script>
                window.addEventListener('load', function() {{
                    const el = document.getElementById('{scroll_to}');
                    if (el) el.scrollIntoView({{behavior: 'smooth'}});
                }});
            </script>
        """, unsafe_allow_html=True)

    # --- 7. HISTORY & FOOTER ---
    st.divider()
    st.subheader("📜 Recent Medical History")
    if patient_id:
        recent_data = get_recent_sessions(patient_id, limit=3)
        for i, entry in enumerate(recent_data or []):
            try:
                past_diag = json.loads(entry['diagnosis'])
                with st.expander(f"Visit: {entry['created_at'][:10]} | Risk: {entry['risk_tier']}"):
                    st.write(f"**Symptoms:** {entry['symptoms']}")
                    if st.button("Reload This Report", key=f"rel_{i}"):
                        st.session_state.update({"diagnosis": past_diag, "session_id": entry['id'], "email_sent": False, "appointment_booked": False})
                        st.rerun()
            except: continue

    st.divider()
    if st.button("🏠 Return to Dashboard", use_container_width=True):
        st.session_state.update({"diagnosis": None, "email_sent": False, "appointment_booked": False, "current_page": "Symptoms"})
        st.rerun()