import streamlit as st
from streamlit_mic_recorder import speech_to_text
import sys
import os
from pathlib import Path
import json

# --- CORE INTEGRATION IMPORTS ---
current_dir = Path(__file__).parent
root_path = current_dir.parent
if str(root_path) not in sys.path:
    sys.path.append(str(root_path))

try:
    from core.ner import extract_entities
    from core.preprocessing import preprocess
    from core.rag import get_rag_context
    from core.llm import run_inference
    from core.triage import triage
    from db.db import save_session
    CORE_READY = True
except ImportError as e:
    st.error(f"Core Engine Error: {e}")
    CORE_READY = False

def show():
    # 1. Initialize State
    if "transcript" not in st.session_state:
        st.session_state.transcript = ""
    
    if "diagnosis" not in st.session_state:
        st.session_state.diagnosis = None

    user_profile = st.session_state.get('user_profile', {})
    user_name = user_profile.get('name', 'Friend')
    patient_id = st.session_state.get('patient_id') 
    
    st.title("🌡️ Symptom Checker")
    st.markdown(f"Please describe what symptoms you are experiencing.")

    with st.container(border=True):
        st.subheader("Current Distress")
        captured_speech = speech_to_text(language='en', start_prompt="Record", stop_prompt="Stop", key='biomistral_mic')

        if captured_speech and captured_speech != st.session_state.transcript:
            st.session_state.transcript = captured_speech
            st.rerun()

        user_input = st.text_area("Describe symptoms:", value=st.session_state.transcript, height=150)
        st.session_state.transcript = user_input
        
        col1, col2 = st.columns(2)
        with col1:
            ui_severity = st.select_slider(
                "How bad is the pain?",
                options=["Mild", "Moderate", "Severe", "Unbearable"]
            )
        with col2:
            duration = st.selectbox(
                "Duration:",
                ["Just started", "A few hours", "1-2 days", "More than a week"]
            )

    # 5. Action Button & Integration Logic
    if st.button("Analyze with AI", type="primary", use_container_width=True):
        raw_text = st.session_state.transcript.strip()
        
        if not raw_text:
            st.warning("Please provide symptoms to analyze.")
        elif not CORE_READY:
            st.error("Medical Engine is not loaded correctly.")
        else:
            with st.spinner("Analyzing your symptoms with clinical context..."):
                try:
                    full_narrative = f"{raw_text}. Reported Severity: {ui_severity}. Duration: {duration}."
                    ner_results = extract_entities(full_narrative)
                    
                    # Included her duration/severity arguments for the backend
                    final_payload = preprocess(full_narrative, ner_results, user_profile, duration, ui_severity)
                    
                    context = get_rag_context(full_narrative, top_k=5)
                    ai_result = run_inference(final_payload, context)
                    
                    top_conds = ai_result.get('top_conditions', [])
                    top_name = top_conds[0].get('name', '') if top_conds else ''
                    
                    risk_tier = triage(
                        confidence_score=ai_result.get('confidence_score', 0.5), 
                        severity=ui_severity.lower(), 
                        duration=duration.lower(),
                        condition_name=top_name
                    )
                    
                    ai_result['risk_tier'] = risk_tier
                    st.session_state.diagnosis = ai_result
                    st.session_state.severity = risk_tier 
                    st.session_state.current_symptoms = raw_text

                    if patient_id:
                        full_symptom_record = f"{raw_text} (Severity: {ui_severity}, Duration: {duration})"
                        session_id = save_session(patient_id, full_symptom_record, ai_result, risk_tier)
                        st.session_state.session_id = session_id
                    
                    st.success("Analysis Complete!")

                except Exception as e:
                    st.error(f"Analysis Failed: {e}")

    # --- ADDED: HER UI BANNERS ---
    if st.session_state.diagnosis:
        risk = st.session_state.diagnosis.get('risk_tier', 'LOW').upper()

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
            st.link_button("📞 Call 911 Now", "tel:911", use_container_width=True, type="primary")

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

        st.markdown("---")
        if st.button("📋 Proceed to Full Medical Report ➡️", use_container_width=True, type="primary"):
            st.session_state["current_page"] = "Results"
            st.rerun()
            
        if st.button("🔄 Check New Symptoms", use_container_width=True):
            st.session_state.diagnosis = None
            st.session_state.transcript = ""
            st.rerun()