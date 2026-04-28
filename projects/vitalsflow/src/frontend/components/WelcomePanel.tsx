"use client";

import { Search, ArrowRight, Database, Activity, Brain, CheckCircle } from "lucide-react";

interface WelcomePanelProps {
  onDismiss: () => void;
  onSearchFocus: () => void;
}

// Steps with Lucide icons instead of number circles for a more polished look
const steps = [
  {
    icon: Search,
    label: "Search for a patient",
    detail: "By name or patient ID in the FHIR system",
    color: "var(--accent-blue)",
    bg: "var(--accent-blue-dim)",
  },
  {
    icon: Activity,
    label: "Enter or paste vitals",
    detail: "Heart rate, blood pressure, SpO₂, temperature, and more",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
  },
  {
    icon: Brain,
    label: "Review AI triage & evidence",
    detail: "Risk score, NEWS2 breakdown, and clinical rationale",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
  },
  {
    icon: CheckCircle,
    label: "Approve actions",
    detail: "Draft FHIR ServiceRequests for clinical review",
    color: "#16a34a",
    bg: "rgba(34,197,94,0.12)",
  },
];

export function WelcomePanel({ onDismiss, onSearchFocus }: WelcomePanelProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border mb-6 animate-fade-in-up"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Decorative gradient strip at top */}
      <div
        className="h-1 w-full rounded-t-xl"
        style={{
          background: "linear-gradient(90deg, var(--accent-blue) 0%, #8b5cf6 50%, #16a34a 100%)",
        }}
        aria-hidden="true"
      />

      <div className="p-6">
        {/* Close button — min 44×44 touch target */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors press-scale"
          style={{ color: "var(--text-tertiary)" }}
          aria-label="Dismiss welcome panel"
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6 pr-12">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-5 w-5" style={{ color: "var(--accent-blue)" }} aria-hidden="true" />
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-outfit)", color: "var(--text-primary)" }}
            >
              Welcome to VitalsFlow
            </h2>
          </div>
          <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
            AI-assisted clinical triage using NEWS2 protocol and Gemini AI analysis.
            Select a patient to begin.
          </p>
        </div>

        {/* Steps — polished stepper with icons and connector line */}
        <ol
          className="space-y-3 mb-6"
          aria-label="How to use VitalsFlow"
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <li key={idx} className="flex gap-4 items-start stagger-card">
                {/* Icon circle */}
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ background: step.bg, border: "1.5px solid " + step.color + "22" }}
                  aria-hidden="true"
                >
                  <Icon className="h-4 w-4" style={{ color: step.color }} />
                </div>

                <div className="min-w-0 pt-1.5">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {step.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    {step.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {/* CTA Button — btn-primary style, min 44px */}
        <button
          onClick={onSearchFocus}
          className="btn-primary w-full"
          aria-label="Search for a patient to start triage"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Search for a patient to start
          <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
