"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, IntakeForm } from "@/lib/api";

export default function AppointmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const appointmentId = params.id;

  const [intake, setIntake]               = useState<IntakeForm | null>(null);
  const [intakeLoading, setIntakeLoading] = useState(true);
  const [intakeError, setIntakeError]     = useState<string | null>(null);

  useEffect(() => {
    api.intake.get(appointmentId)
      .then(setIntake)
      .catch((e: Error) => setIntakeError(e.message))
      .finally(() => setIntakeLoading(false));
  }, [appointmentId]);

  return (
    <ProtectedRoute role="doctor">
      <div className="min-h-screen bg-background">
        <div className="fixed inset-0 hero-gradient z-0 pointer-events-none" />

        {/* Nav */}
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 px-6 py-3 glass-panel border-b border-white/20 shadow-[0_4px_24px_rgba(0,77,64,0.08)]">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-xs text-primary text-label-md font-semibold hover:bg-white/40 px-3 py-1.5 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Dashboard
          </button>
          <div className="h-5 w-px bg-outline-variant" />
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
            <h1 className="font-black text-primary">careIT</h1>
          </div>
          <span className="text-caption text-outline font-semibold uppercase tracking-wider ml-1">Appointment Detail</span>
        </header>

        <main className="relative z-10 max-w-2xl mx-auto pt-24 px-4 pb-xl space-y-gutter">
          {/* Appointment ID */}
          <div className="glass-card rounded-2xl px-md py-sm shadow-md">
            <p className="text-caption text-outline font-bold uppercase tracking-wider mb-xs">Appointment ID</p>
            <p className="text-label-md text-primary font-mono">{appointmentId}</p>
          </div>

          {/* Patient Intake Form */}
          <div className="glass-card rounded-2xl p-md shadow-md">
            <h2 className="text-headline-md text-primary mb-md flex items-center gap-xs">
              <span className="material-symbols-outlined text-[20px]">lab_profile</span>
              Patient Intake Form
            </h2>

            {intakeLoading && (
              <div className="space-y-2">
                {[1, 2].map((i) => <div key={i} className="h-12 bg-surface-container-low rounded-xl animate-pulse" />)}
              </div>
            )}

            {intakeError && !intakeLoading && (
              <div className="bg-secondary-fixed/40 border border-secondary-fixed rounded-xl px-md py-sm">
                <p className="text-on-secondary-container text-label-md font-semibold">No intake form submitted yet.</p>
                <p className="text-on-secondary-container/70 text-caption mt-xs">
                  The patient has not completed their pre-visit form.
                </p>
              </div>
            )}

            {intake && (
              <dl className="space-y-md">
                {[
                  { label: "Chief Complaint / Symptoms", value: intake.symptoms, icon: "sick" },
                  { label: "Medical History",             value: intake.medical_history, icon: "history_edu" },
                  { label: "Current Medications",         value: intake.medications, icon: "medication" },
                  { label: "Allergies",                   value: intake.allergies, icon: "warning" },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="bg-surface-container-low rounded-xl px-md py-sm">
                    <dt className="text-caption text-outline font-bold uppercase tracking-wider mb-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">{icon}</span>
                      {label}
                    </dt>
                    <dd className="text-body-md text-on-surface leading-relaxed">
                      {value || <span className="italic text-on-surface-variant">Not provided</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Info note about prescriptions */}
          <div className="glass-card rounded-2xl px-md py-sm shadow-md border-l-4 border-l-secondary">
            <div className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>medication</span>
              <div>
                <p className="text-label-md text-on-surface font-semibold">Prescriptions available during consultation</p>
                <p className="text-caption text-outline mt-xs">
                  Medication orders can be created and reviewed inside the active consultation session.
                </p>
              </div>
            </div>
          </div>

          {/* Start Consultation */}
          <button
            onClick={() => router.push(`/doctor/consultation?appointment_id=${appointmentId}`)}
            className="w-full bg-primary text-on-primary font-bold text-label-md rounded-2xl py-4 transition hover:scale-[1.01] active:scale-[0.99] shadow-lg flex items-center justify-center gap-sm"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>videocam</span>
            Start / Resume Consultation
          </button>
        </main>
      </div>
    </ProtectedRoute>
  );
}
