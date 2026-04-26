"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { login, demoLogin } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [demoLoading, setDemoLoading] = useState<"patient" | "doctor" | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  const handleDemo = async (role: "patient" | "doctor") => {
    setError(null);
    setDemoLoading(role);
    try {
      await demoLogin(role);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Demo login failed");
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background hero-gradient overflow-x-hidden">
      {/* ── Top Nav ───────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between max-w-screen-2xl mx-auto rounded-xl m-4 px-6 py-3 glass-panel border border-white/20 shadow-[0_8px_32px_rgba(0,77,64,0.1)]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            health_and_safety
          </span>
          <span className="text-xl font-extrabold tracking-tight text-primary">careIT</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          <a className="text-primary font-semibold text-sm px-3 py-1.5 rounded-lg bg-primary-fixed/40">Home</a>
          <a
            onClick={() => document.getElementById("portal")?.scrollIntoView({ behavior: "smooth" })}
            className="text-on-surface-variant text-sm px-3 py-1.5 rounded-lg hover:bg-white/40 transition-all cursor-pointer"
          >
            Services
          </a>
          <a
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="text-on-surface-variant text-sm px-3 py-1.5 rounded-lg hover:bg-white/40 transition-all cursor-pointer"
          >
            Providers
          </a>
        </nav>
        <button
          onClick={() => document.getElementById("portal")?.scrollIntoView({ behavior: "smooth" })}
          className="px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-md"
        >
          Get Started
        </button>
      </header>

      <main className="pt-32">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-margin mb-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
            {/* Left: Text */}
            <div className="lg:col-span-5 space-y-md">
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-container font-bold text-caption uppercase tracking-wider">
                Precision Care
              </span>
              <h2 className="text-display-xl text-primary leading-tight">
                Your Health,<br />Guided by Intelligence.
              </h2>
              <p className="text-body-lg text-on-surface-variant max-w-lg">
                Seamlessly connect with top medical practitioners through AI-driven matching. Experience healthcare that's as precise as it is human.
              </p>
              <div className="flex flex-wrap gap-md pt-sm">
                <button
                  onClick={() => document.getElementById("portal")?.scrollIntoView({ behavior: "smooth" })}
                  className="px-lg py-md bg-primary text-on-primary rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-sm"
                >
                  Find a Specialist
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
                <button
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  className="px-lg py-md border-2 border-primary/10 bg-white/40 backdrop-blur-sm text-primary rounded-xl font-bold hover:bg-white/60 active:scale-95 transition-all"
                >
                  How it Works
                </button>
              </div>
            </div>

            {/* Right: Bento grid */}
            <div className="lg:col-span-7 grid grid-cols-6 grid-rows-6 gap-sm h-[520px]">
              {/* Main visual card */}
              <div className="col-span-4 row-span-4 rounded-3xl glass-panel border border-white/20 shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/60 via-secondary-fixed/30 to-primary/50" />
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: "220px", fontVariationSettings: "'FILL' 1" }}>
                    health_and_safety
                  </span>
                </div>
                <div className="absolute bottom-md left-md text-white">
                  <p className="font-semibold text-sm opacity-80 mb-1">Connected Network</p>
                  <h3 className="text-headline-md font-bold text-white">5,000+ Specialists</h3>
                </div>
              </div>
              {/* AI card */}
              <div className="col-span-2 row-span-3 rounded-3xl bg-secondary-fixed p-md flex flex-col justify-between shadow-lg">
                <span className="material-symbols-outlined text-on-secondary-container text-4xl">neurology</span>
                <h4 className="text-headline-md text-on-secondary-container leading-tight">AI Diagnostic Matching</h4>
              </div>
              {/* Safe card */}
              <div className="col-span-2 row-span-3 rounded-3xl bg-primary-fixed p-md flex flex-col justify-between shadow-lg">
                <span
                  className="material-symbols-outlined text-primary text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified_user
                </span>
                <h4 className="text-headline-md text-primary leading-tight">Certified Safe</h4>
              </div>
              {/* Trust banner */}
              <div className="col-span-4 row-span-2 rounded-3xl glass-panel border border-white/20 p-md flex items-center gap-md shadow-md">
                <div className="flex -space-x-3">
                  {(["#afefdd", "#94d3c1", "#004d40"] as const).map((bg, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: bg, color: i === 2 ? "#fff" : "#00342b" }}
                    >
                      {i === 2 ? "+12k" : ""}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-headline-md text-primary font-bold">Trust is everything</p>
                  <p className="text-body-md text-on-surface-variant text-sm">Joined this month</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it Works ─────────────────────────────────────────────────── */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-margin py-xl mb-xl">
          <div className="text-center mb-xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-fixed text-primary font-bold text-caption uppercase tracking-wider mb-md">
              How it Works
            </span>
            <h3 className="text-display-sm text-primary font-bold">From Symptom to Specialist in 3 Steps</h3>
            <p className="text-body-lg text-on-surface-variant mt-sm max-w-xl mx-auto">
              careIT removes the guesswork from healthcare. Here's how we get you to the right doctor, fast.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {[
              {
                step: "01",
                icon: "smart_toy",
                title: "Describe Your Symptoms",
                desc: "Chat with our AI Care Navigator. Describe how you're feeling in plain language — it identifies the right specialist category for your concern in seconds.",
                color: "bg-primary-fixed",
                iconColor: "text-primary",
              },
              {
                step: "02",
                icon: "search",
                title: "Browse Matched Specialists",
                desc: "See a curated list of verified doctors filtered to exactly the specialty you need. View ratings, locations, and real-time availability at a glance.",
                color: "bg-secondary-fixed",
                iconColor: "text-on-secondary-container",
              },
              {
                step: "03",
                icon: "calendar_month",
                title: "Book in Seconds",
                desc: "Pick a time slot, fill in a quick pre-visit form, and confirm. Your doctor receives your intake details before you even arrive.",
                color: "bg-tertiary-fixed",
                iconColor: "text-tertiary",
              },
            ].map(({ step, icon, title, desc, color, iconColor }) => (
              <div
                key={step}
                className="glass-card rounded-3xl p-xl shadow-md border border-white/20 flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className="absolute top-4 right-5 text-[64px] font-black text-primary/5 leading-none select-none">
                  {step}
                </div>
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-md shadow-sm`}>
                  <span
                    className={`material-symbols-outlined ${iconColor} text-3xl`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {icon}
                  </span>
                </div>
                <h4 className="text-headline-md text-primary font-bold mb-sm">{title}</h4>
                <p className="text-body-md text-on-surface-variant">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Portal Section ───────────────────────────────────────────────── */}
        <section id="portal" className="bg-white/40 backdrop-blur-xl border-y border-white/20 py-xl">
          <div className="max-w-6xl mx-auto px-margin grid grid-cols-1 md:grid-cols-2 gap-xl items-center">
            {/* Left: Features */}
            <div className="space-y-lg">
              <h3 className="text-headline-lg text-primary">Access Your Care Portal</h3>
              <p className="text-body-lg text-on-surface-variant">
                Whether you're a patient or a provider, our portal provides the tools you need for seamless health management.
              </p>
              <div className="space-y-md">
                {[
                  { icon: "calendar_month", bg: "bg-primary-fixed", iconColor: "text-primary", title: "Instant Booking", desc: "Schedule consultations in under 60 seconds." },
                  { icon: "lab_profile",   bg: "bg-secondary-fixed", iconColor: "text-on-secondary-container", title: "Unified Records",  desc: "All your medical history in one secure digital vault." },
                  { icon: "smart_toy",     bg: "bg-tertiary-fixed",  iconColor: "text-tertiary", title: "AI Care Navigator", desc: "Describe symptoms and get matched to the right specialist instantly." },
                ].map(({ icon, bg, iconColor, title, desc }) => (
                  <div key={title} className="flex items-start gap-md p-md rounded-2xl bg-white shadow-sm border border-outline-variant/30">
                    <div className={`p-2 ${bg} rounded-lg shrink-0`}>
                      <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-body-lg">{title}</h5>
                      <p className="text-body-md text-on-surface-variant">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Login card */}
            <div className="glass-panel p-xl rounded-[32px] border border-white shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-fixed blur-[100px] rounded-full opacity-60 pointer-events-none" />
              <div className="relative z-10">
                <div className="mb-lg">
                  <h4 className="text-headline-lg text-primary">Portal Login</h4>
                  <p className="text-body-md text-on-surface-variant mt-1">Select your portal to continue.</p>
                </div>

                {/* Patient login form */}
                <div className="mb-md">
                  <h5 className="text-headline-md text-primary">Patient Login</h5>
                  <p className="text-sm text-on-surface-variant">Manage your health</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-md">
                  <div>
                    <label className="block text-label-md text-on-surface mb-xs">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full px-md py-3 rounded-xl bg-white border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-body-md"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface mb-xs">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-md py-3 rounded-xl bg-white border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-body-md"
                    />
                  </div>
                  {error && (
                    <p className="text-error text-sm bg-error-container rounded-xl px-4 py-3">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold text-label-md hover:scale-[1.01] active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
                  >
                    {loading ? "Signing in…" : "Patient Sign In"}
                  </button>
                </form>

                {/* Provider login */}
                <div className="mt-xl pt-lg border-t border-outline-variant/30">
                  <div className="mb-md">
                    <h5 className="text-headline-md text-primary">Provider Login</h5>
                    <p className="text-sm text-on-surface-variant">Access clinical tools</p>
                  </div>
                  <button
                    onClick={() => handleDemo("doctor")}
                    disabled={demoLoading !== null}
                    className="w-full py-3 border-2 border-secondary text-secondary rounded-xl font-bold text-label-md hover:bg-secondary hover:text-on-secondary transition-all flex items-center justify-center gap-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">medical_services</span>
                    {demoLoading === "doctor" ? "Loading…" : "Provider Sign In"}
                  </button>
                </div>

                {/* Demo / sign up */}
                <div className="mt-lg text-center">
                  <p className="text-body-md text-on-surface-variant mb-md">New to careIT?</p>
                  <button
                    onClick={() => handleDemo("patient")}
                    disabled={demoLoading !== null}
                    className="w-full py-3 border-2 border-primary text-primary rounded-xl font-bold text-label-md hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50"
                  >
                    {demoLoading === "patient" ? "Loading…" : "Try Patient Demo"}
                  </button>
                  <p className="text-caption text-outline mt-sm">Demo accounts are auto-created on first use.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-white/40 border-t border-white/20 py-lg">
        <div className="max-w-7xl mx-auto px-margin flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              health_and_safety
            </span>
            <span className="text-lg font-black text-primary">careIT</span>
          </div>
          <div className="flex gap-lg">
            {["Privacy Policy", "Terms of Service", "Contact Support"].map((l) => (
              <a key={l} className="text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold">{l}</a>
            ))}
          </div>
          <p className="text-caption text-outline">© 2026 careIT Healthcare Technologies.</p>
        </div>
      </footer>
    </div>
  );
}
