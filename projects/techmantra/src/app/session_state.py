import streamlit as st

def init_session():
    if "is_authenticated" not in st.session_state:
        st.session_state.is_authenticated = False
    if "user_profile" not in st.session_state:
        st.session_state.user_profile = {}