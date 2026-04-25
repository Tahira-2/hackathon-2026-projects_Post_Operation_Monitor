import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthSection from "../components/AuthSection";
import FeaturesSection from "../components/FeaturesSection";
import HeroSection from "../components/HeroSection";
import HowItWorksSection from "../components/HowItWorksSection";
import Navbar from "../components/Navbar";

const ACCESS_TOKEN_KEY = "devcare_access_token";
const REFRESH_TOKEN_KEY = "devcare_refresh_token";
const USERNAME_KEY = "devcare_username";
const ROLE_KEY = "devcare_role";

function getStoredAuth() {
    return {
        access: localStorage.getItem(ACCESS_TOKEN_KEY),
        refresh: localStorage.getItem(REFRESH_TOKEN_KEY),
        username: localStorage.getItem(USERNAME_KEY),
        role: localStorage.getItem(ROLE_KEY),
    };
}

function LandingPage() {
    const [auth, setAuth] = useState(getStoredAuth);
    const isAuthenticated = Boolean(auth.access);
    const navigate = useNavigate();

    function storeAuth(access, refresh, username, role) {
        localStorage.setItem(ACCESS_TOKEN_KEY, access);
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
        localStorage.setItem(USERNAME_KEY, username);
        localStorage.setItem(ROLE_KEY, role || "patient");
        setAuth({ access, refresh, username, role: role || "patient" });
    }

    const handleAuthSuccess = (access, refresh, username, role) => {
        const normalizedRole = (role || "patient").toLowerCase();
        storeAuth(access, refresh, username, normalizedRole);
        const dashboardPath = normalizedRole === "doctor" ? "/dashboard/doctor" : "/dashboard/patient";
        setTimeout(() => navigate(dashboardPath), 600);
    };

    return (
        <div className="app-shell">
            <Navbar/>

            <>
                <section id="home">
                    <HeroSection />
                </section>
                <section id="features">
                    <FeaturesSection />
                </section>
                <section id="how-it-works">
                    <HowItWorksSection />
                </section>
                <section className="site-container pb-20" id="auth">
                    <AuthSection onAuthSuccess={handleAuthSuccess} />
                </section>
            </>
        </div>
    );
}

export default LandingPage;
