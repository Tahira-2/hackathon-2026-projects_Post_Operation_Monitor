"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Appointment } from "@/lib/api";

export default function DoctorDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.appointments
      .list()
      .then(setAppointments)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-green-100 text-green-700",
      completed: "bg-gray-100 text-gray-600",
      cancelled: "bg-red-100 text-red-600",
    };
    return map[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <ProtectedRoute role="doctor">
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-indigo-700">CareIT Doctor Portal</h1>
            <p className="text-xs text-gray-400">Your schedule at a glance</p>
          </div>
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700">Sign out</a>
        </nav>

        <div className="max-w-3xl mx-auto mt-8 px-4">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Upcoming Appointments</h2>

          {loading && <p className="text-gray-500 text-sm">Loading appointments…</p>}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
              <p className="text-red-400 text-xs mt-1">
                Ensure your doctor profile is linked to your account.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    Patient ID: <span className="text-indigo-600 font-mono text-sm">{appt.patient_id}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{formatTime(appt.scheduled_at)}</p>
                  <span
                    className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(appt.status)}`}
                  >
                    {appt.status}
                  </span>
                </div>
                <button
                  onClick={() => router.push(`/doctor/appointment/${appt.id}`)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition"
                >
                  View
                </button>
              </div>
            ))}
            {!loading && !error && appointments.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-sm">No appointments scheduled yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
