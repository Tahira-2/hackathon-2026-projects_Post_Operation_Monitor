"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, IntakeForm } from "@/lib/api";

export default function AppointmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const appointmentId = params.id;

  const [intake, setIntake] = useState<IntakeForm | null>(null);
  const [intakeLoading, setIntakeLoading] = useState(true);
  const [intakeError, setIntakeError] = useState<string | null>(null);

  useEffect(() => {
    api.intake
      .get(appointmentId)
      .then(setIntake)
      .catch((e: Error) => setIntakeError(e.message))
      .finally(() => setIntakeLoading(false));
  }, [appointmentId]);

  return (
    <ProtectedRoute role="doctor">
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b px-6 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="text-indigo-600 text-sm hover:underline">
            ← Dashboard
          </button>
          <h1 className="text-lg font-bold text-indigo-700">Appointment Detail</h1>
        </nav>

        <div className="max-w-2xl mx-auto mt-8 px-4 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-1">Appointment</h2>
            <p className="text-sm text-gray-500 font-mono">{appointmentId}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-3">Patient Intake Form</h2>
            {intakeLoading && <p className="text-gray-400 text-sm">Loading intake…</p>}
            {intakeError && (
              <p className="text-amber-600 text-sm">
                No intake form submitted yet. ({intakeError})
              </p>
            )}
            {intake && (
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">Chief Complaint</dt>
                  <dd className="mt-0.5 text-gray-700">{intake.symptoms || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">Medical History</dt>
                  <dd className="mt-0.5 text-gray-700">{intake.medical_history || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">Current Medications</dt>
                  <dd className="mt-0.5 text-gray-700">{intake.medications || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">Allergies</dt>
                  <dd className="mt-0.5 text-gray-700">{intake.allergies || "—"}</dd>
                </div>
              </dl>
            )}
          </div>

          <button
            onClick={() =>
              router.push(`/doctor/consultation?appointment_id=${appointmentId}`)
            }
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl py-3 transition"
          >
            Start Consultation
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
