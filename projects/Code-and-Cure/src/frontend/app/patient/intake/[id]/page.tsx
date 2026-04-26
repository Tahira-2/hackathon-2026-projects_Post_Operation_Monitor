"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

function IntakeFormContent({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();

  const [symptoms, setSymptoms]           = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [medications, setMedications]     = useState("");
  const [allergies, setAllergies]         = useState("");
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [submitted, setSubmitted]         = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError("Please describe your symptoms.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await api.intake.submit({
        appointment_id: appointmentId,
        symptoms:       symptoms.trim(),
        medical_history: medicalHistory.trim() || undefined,
        medications:    medications.trim() || undefined,
        allergies:      allergies.trim() || undefined,
      });
      setSubmitted(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to submit intake form.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-16 px-4 text-center">
        <span
          className="material-symbols-outlined text-primary mb-md block"
          style={{ fontSize: "64px", fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
        <h2 className="text-headline-lg text-primary font-bold mb-xs">Intake Form Submitted!</h2>
        <p className="text-body-md text-on-surface-variant mb-lg">
          Your doctor will review this before your appointment.
        </p>
        <button
          onClick={() => router.push("/patient/dashboard")}
          className="bg-primary text-on-primary rounded-2xl px-lg py-3 text-label-md font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-md"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-8 px-4 pb-xl">
      <button
        onClick={() => router.push("/patient/dashboard")}
        className="flex items-center gap-1 text-primary text-label-md font-semibold mb-md hover:bg-white/40 px-3 py-1.5 rounded-xl transition-all"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Back to Dashboard
      </button>

      <div className="glass-card rounded-2xl p-md shadow-md">
        <div className="mb-md">
          <h2 className="text-headline-md text-primary font-bold mb-xs flex items-center gap-xs">
            <span className="material-symbols-outlined text-[20px]">lab_profile</span>
            Pre-Visit Intake Form
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Help your doctor prepare by sharing some details before your visit.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-md">
          <div>
            <label className="block text-label-md text-on-surface font-semibold mb-xs">
              Chief Complaint / Symptoms <span className="text-error">*</span>
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe your main symptoms (e.g. sharp chest pain for 2 days, worse on exertion)…"
              rows={4}
              className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-white"
            />
          </div>

          <div>
            <label className="block text-label-md text-on-surface font-semibold mb-xs">Medical History</label>
            <textarea
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder="Any past conditions, surgeries, or hospitalizations (e.g. Type 2 diabetes, appendectomy 2019)…"
              rows={3}
              className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-white"
            />
          </div>

          <div>
            <label className="block text-label-md text-on-surface font-semibold mb-xs">Current Medications</label>
            <textarea
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              placeholder="List any medications you're currently taking (name + dosage if known)…"
              rows={2}
              className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-white"
            />
          </div>

          <div>
            <label className="block text-label-md text-on-surface font-semibold mb-xs">Allergies</label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Penicillin, Latex, Shellfish (or 'None known')…"
              className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            />
          </div>

          {error && (
            <div className="bg-error-container border border-error/20 rounded-xl px-md py-sm">
              <p className="text-error text-label-md">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !symptoms.trim()}
            className="w-full bg-primary text-on-primary font-bold rounded-xl py-3 text-label-md hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md disabled:opacity-40"
          >
            {submitting ? "Submitting…" : "Submit Intake Form"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/patient/dashboard")}
            className="w-full text-on-surface-variant hover:text-on-surface text-label-md py-2 transition-colors"
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PatientIntakePage({ params }: { params: { id: string } }) {
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
          <span className="text-caption text-outline font-semibold uppercase tracking-wider">Pre-Visit Intake</span>
          <div className="ml-auto hidden md:block">
            <p className="text-caption text-outline">Your responses help your doctor prepare for the appointment</p>
          </div>
        </header>

        <main className="relative z-10 pt-20">
          <Suspense fallback={<div className="p-8 text-outline text-body-md">Loading…</div>}>
            <IntakeFormContent appointmentId={params.id} />
          </Suspense>
        </main>
      </div>
    </ProtectedRoute>
  );
}
