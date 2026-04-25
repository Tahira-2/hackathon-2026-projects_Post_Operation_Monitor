import streamlit as st
from session_state import init_session
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from pages import signup  # Make sure signup.py is in the same folder

# 1. Start the memory
init_session()

# 2. Navigation
st.sidebar.title("🏥 CareDevi Triage")
if not st.session_state.get("is_authenticated"):
    # Force user to stay on Signup until they finish
    page = "Signup"
    st.sidebar.info("Please sign up to begin.")
else:
    page = st.sidebar.radio("Navigation", ["My Profile", "Symptom Checker"])

# 3. Page Logic
if page == "Signup":
    signup.show()

elif page == "My Profile":
    st.title("👤 Your Profile")
    st.write("This data is currently stored in session memory:")
    st.json(st.session_state.user_profile)
    if st.button("Reset Profile"):
        st.session_state.clear()
        st.rerun()

elif page == "Symptom Checker":
    st.title("🌡️ Symptom Checker")
    st.write(f"Hello {st.session_state.user_profile['name']}, tell me what's wrong.")
    # This is where we will put the BioMistral code next!