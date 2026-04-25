import streamlit as st

def show():
    st.title("🏥 Patient Signup")
    st.markdown("Enter your details to initialize your clinical profile.")

    # SECTION 1: Bio Data
    col1, col2 = st.columns(2)
    with col1:
        name = st.text_input("Full Name", placeholder="John Doe")
    with col2:
        age = st.number_input("Age", 1, 120, 25)
    
    sex = st.selectbox("Sex", ["Male", "Female", "Other"])

    # SECTION 2: Medical Context
    st.divider()
    col3, col4 = st.columns(2)
    with col3:
        height = st.number_input("Height (cm)", value=170)
    with col4:
        weight = st.number_input("Weight (kg)", value=70)

    allergies = st.text_area("Known Allergies", placeholder="Penicillin, Nuts, etc.")
    conditions = st.text_area("Pre-existing Conditions", placeholder="Diabetes, Asthma, etc.")

    # SECTION 3: Physician Info
    st.divider()
    st.subheader("Primary Physician")
    dr_name = st.text_input("Doctor Name")
    dr_email = st.text_input("Doctor Email")

    if st.button("Save Profile", type="primary", use_container_width=True):
        if not name or not dr_email:
            st.error("Please fill in at least your Name and Doctor's Email.")
        else:
            # Instead of fhir_builder (which you don't have yet), 
            # we store it as a simple dictionary.
            user_data = {
                "name": name,
                "age": age,
                "sex": sex,
                "height": height,
                "weight": weight,
                "allergies": allergies if allergies else "None",
                "conditions": conditions if conditions else "None",
                "dr_name": dr_name,
                "dr_email": dr_email
            }
            
            # Save to our session memory
            st.session_state.user_profile = user_data
            st.session_state.is_authenticated = True
            
            st.success(f"Profile for {name} saved locally!")
            st.balloons()