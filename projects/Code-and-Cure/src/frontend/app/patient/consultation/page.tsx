"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";

export default function PatientConsultationPage() {
  return (
    <ProtectedRoute role="patient">
      <div className="min-h-screen bg-background">
        <div className="fixed inset-0 hero-gradient z-0 pointer-events-none" />

        <header className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 px-6 py-3 glass-panel border-b border-white/20 shadow-[0_4px_24px_rgba(0,77,64,0.08)]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
            <h1 className="font-black text-primary">careIT</h1>
          </div>
          <div className="h-5 w-px bg-outline-variant" />
          <span className="text-caption text-outline font-semibold uppercase tracking-wider">Video Consultation</span>
        </header>

        <main className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="glass-card rounded-2xl p-xl shadow-md text-center max-w-sm w-full">
            <span
              className="material-symbols-outlined text-primary mb-md block"
              style={{ fontSize: "56px", fontVariationSettings: "'FILL' 1" }}
            >
              videocam
            </span>
            <h2 className="text-headline-md text-primary font-bold mb-xs">Video Consultation</h2>
            <p className="text-body-md text-on-surface-variant">
              Join your doctor when the session starts.
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
