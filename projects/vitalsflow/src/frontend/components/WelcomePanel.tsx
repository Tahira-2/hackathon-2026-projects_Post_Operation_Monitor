"use client";

import { Search, CheckCircle2, Brain, ArrowRight } from "lucide-react";

interface WelcomePanelProps {
  onDismiss: () => void;
  onSearchFocus: () => void;
}

export function WelcomePanel({ onDismiss, onSearchFocus }: WelcomePanelProps) {
  return (
    <div
      className="relative overflow-hidden rounded-lg border p-6 mb-6 animate-fade-in"
      style={{
        background: "linear-gradient(135deg, rgba(13,21,38,0.8) 0%, rgba(15,31,61,0.6) 100%)",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        boxShadow: "0 8px 32px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(148,163,184,0.1)",
      }}
    >
      {/* Close button */}
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        aria-label="Dismiss welcome"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Header */}
      <div className="mb-6">
        <h2
          className="text-xl font-bold mb-1"
          style={{
            background: "linear-gradient(135deg, #f1f5f9, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Welcome to VitalsFlow
        </h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          AI-assisted clinical triage using NEWS2 protocol and Gemini AI analysis
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-4 mb-6">
        {/* Step 1 */}
        <div className="flex gap-4">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }}
          >
            1
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Search for a patient
            </p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              By name or patient ID in the FHIR system
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24" }}
          >
            2
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Enter or paste vitals
            </p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              Heart rate, blood pressure, SpO2, temperature, and more
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-4">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{ background: "rgba(139, 92, 246, 0.15)", color: "#c4b5fd" }}
          >
            3
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Review AI triage and evidence
            </p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              Risk score, NEWS2 breakdown, and clinical rationale
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex gap-4">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{ background: "rgba(34, 197, 94, 0.15)", color: "#4ade80" }}
          >
            4
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Approve actions
            </p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              Draft FHIR ServiceRequests for clinical review
            </p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onSearchFocus}
        className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-sm transition-all"
        style={{
          background: "rgba(59, 130, 246, 0.2)",
          border: "1px solid rgba(59, 130, 246, 0.4)",
          color: "#60a5fa",
        }}
        onMouseEnter={(e) => {
          const target = e.currentTarget as HTMLElement;
          target.style.background = "rgba(59, 130, 246, 0.3)";
          target.style.borderColor = "rgba(59, 130, 246, 0.6)";
        }}
        onMouseLeave={(e) => {
          const target = e.currentTarget as HTMLElement;
          target.style.background = "rgba(59, 130, 246, 0.2)";
          target.style.borderColor = "rgba(59, 130, 246, 0.4)";
        }}
      >
        <Search className="h-4 w-4" />
        Search for a patient to start
        <ArrowRight className="h-4 w-4 ml-1" />
      </button>
    </div>
  );
}
