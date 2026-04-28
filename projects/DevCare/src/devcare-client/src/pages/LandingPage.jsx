import { useState } from "react";
import { useNavigate } from "react-router-dom";

import CTASection from "../components/CTASection";
import AuthSection from "../components/AuthSection";
import FeaturesSection from "../components/FeaturesSection";
import HowItWorksSection from "../components/HowItWorksSection";
import HeroSection from "../components/HeroSection";
import FAQSection from "../components/FAQSection";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[var(--color-bg)] w-full">
            <Navbar />

            <main className="flex-1 w-full">
                <HeroSection />
                <FeaturesSection />
                <HowItWorksSection />
                <CTASection />
                <FAQSection />
            </main>
            
            <Footer />
        </div>
    );
}

export default LandingPage;
