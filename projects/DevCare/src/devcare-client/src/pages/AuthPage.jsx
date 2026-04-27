import React, { useState } from 'react';
import AuthSection from '../components/AuthSection';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate, Link } from 'react-router-dom';

import roomImage from '../assets/medical-room.png';
import loginImage from '../assets/login-image.png';

import logo from '../assets/Devcare-logo.png';

function AuthPage({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);

  const handleAuthSuccess = (access, refresh, username, role) => {
    const normalizedRole = (role || "patient").toLowerCase();
    const dashboardPath = normalizedRole === "doctor" ? "/dashboard/doctor" : "/dashboard/patient";
    setTimeout(() => navigate(dashboardPath), 600);
  };

  return (
    <div className="bg-[#f0f7ff] min-h-screen flex items-center justify-center p-6 relative">
      <Link 
        to="/" 
        className="absolute top-10 left-10 flex items-center gap-2 text-[var(--color-primary-strong)] font-bold hover:text-[var(--color-primary)] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </Link>

      <main className="w-full">
        <div className="site-container grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
          {/* Left Side: Branding */}
          <div className="hidden lg:block">
            <div className="mb-8">
              <img src={logo} alt="DevCare Logo" className="h-8 w-auto" />
            </div>
            <h1 className="text-3xl xl:text-4xl font-bold text-[var(--color-primary-strong)] leading-[1.1] mb-6">
              {mode === 'login' ? 'Welcome Back' : 'Join DevCare'}
            </h1>
            <p className="text-[var(--color-text-muted)] text-base mb-10 max-w-lg leading-relaxed">
              {mode === 'login' 
                ? 'Continue your recovery journey with DevCare.' 
                : 'Get started with smarter, guided recovery from the comfort of your home.'}
            </p>
            <div className="rounded-3xl overflow-hidden shadow-xl transition-all duration-500">
              <img 
                src={mode === 'login' ? loginImage : roomImage} 
                alt="Medical Branding" 
                className="w-full h-auto object-cover aspect-[16/10]"
              />
            </div>
          </div>

          {/* Right Side: Auth Card */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <AuthSection 
              onAuthSuccess={handleAuthSuccess} 
              mode={mode} 
              onModeChange={setMode} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default AuthPage;
