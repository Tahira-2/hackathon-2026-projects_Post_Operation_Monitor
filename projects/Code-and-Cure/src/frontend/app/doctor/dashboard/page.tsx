"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Appointment } from "@/lib/api";

function statusStyle(status: string) {
  const map: Record<string, string> = {
    pending:   "bg-secondary-fixed text-on-secondary-container",
    confirmed: "bg-primary-fixed text-primary",
    completed: "bg-surface-container text-on-surface-variant",
    cancelled: "bg-error-container text-error",
  };
  return map[status] ?? "bg-surface-container text-on-surface-variant";
}

function DoctorDashboardContent() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast]       = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    api.appointments
      .list()
      .then(setAppointments)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString([], {
      weekday: "short", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const today = appointments.filter(
    (a) => new Date(a.scheduled_at).toDateString() === new Date().toDateString()
  );
  const upcoming = appointments.filter(
    (a) => new Date(a.scheduled_at) > new Date() && new Date(a.scheduled_at).toDateString() !== new Date().toDateString()
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 hero-gradient z-0 pointer-events-none" />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] glass-panel px-lg py-sm rounded-2xl shadow-2xl text-label-md font-semibold text-on-surface flex items-center gap-sm border border-white/30 pointer-events-none whitespace-nowrap">
          <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
          {toast}
        </div>
      )}

      {/* Top nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 glass-panel border-b border-white/20 shadow-[0_4px_24px_rgba(0,77,64,0.08)]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
          <div>
            <span className="font-black text-primary text-lg">careIT</span>
            <span className="ml-2 text-caption text-on-surface-variant font-semibold uppercase tracking-wider">Doctor Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="p-2 rounded-full hover:bg-white/40 transition-all relative"
            >
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              {appointments.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 glass-panel rounded-2xl border border-white/20 shadow-2xl z-50 overflow-hidden">
                <div className="px-md py-sm border-b border-outline-variant/20">
                  <p className="text-label-md font-bold text-on-surface">Upcoming Appointments</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {appointments.length === 0 ? (
                    <p className="text-caption text-outline text-center py-6">No appointments yet.</p>
                  ) : (
                    appointments
                      .slice()
                      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                      .slice(0, 5)
                      .map((appt) => (
                        <div key={appt.id} className="px-md py-sm border-b border-outline-variant/10 hover:bg-white/40 transition-all">
                          <p className="text-label-md text-on-surface font-semibold">
                            Patient {appt.patient_id.slice(0, 6)}…
                          </p>
                          <p className="text-caption text-outline">
                            {new Date(appt.scheduled_at).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                            {" at "}
                            {new Date(appt.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>
          <a href="/" className="text-sm text-on-surface-variant hover:text-primary font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-white/40">
            Sign out
          </a>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 z-40 hidden lg:flex flex-col py-8 px-4 glass-panel border-r border-white/20 w-64 h-screen">
        <div className="px-4 mb-lg">
          <p className="text-caption text-outline font-bold uppercase tracking-widest mb-1">Provider Portal</p>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
            <h2 className="text-xl font-black text-primary">careIT</h2>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {[
            { icon: "dashboard",   label: "Dashboard",      active: true,  action: undefined },
            { icon: "description", label: "Clinical Notes", active: false, action: undefined },
            { icon: "medication",  label: "Prescriptions",  active: false, action: undefined },
            { icon: "settings",    label: "Settings",       active: false, action: () => showToast("Settings — coming in v2!") },
          ].map(({ icon, label, active, action }) => (
            <a
              key={label}
              onClick={action}
              className={`flex items-center gap-base px-4 py-3 rounded-xl cursor-pointer text-label-md font-semibold transition-all ${
                active ? "bg-primary-fixed/60 text-primary border-l-4 border-primary" : "text-on-surface-variant hover:text-primary hover:translate-x-1"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              {label}
            </a>
          ))}
        </nav>
        <div className="mt-auto p-4 glass-card rounded-xl">
          <div className="flex items-center gap-sm mb-1">
            <span className="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
            <span className="text-label-md text-primary">Secure Node</span>
          </div>
          <p className="text-caption text-outline">All data encrypted end-to-end</p>
        </div>
      </aside>

      {/* Main */}
      <main className="relative z-10 lg:ml-64 pt-24 px-margin pb-xl max-w-5xl">
        <header className="mb-lg">
          <h1 className="text-display-xl text-primary mb-xs">Your Schedule</h1>
          <p className="text-body-lg text-outline">
            {loading ? "Loading appointments…" : `${appointments.length} appointment${appointments.length !== 1 ? "s" : ""} on your calendar.`}
          </p>
        </header>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-lg">
          {[
            { label: "Today",     value: today.length,       icon: "today",          bg: "bg-primary-fixed", color: "text-primary" },
            { label: "Upcoming",  value: upcoming.length,    icon: "event_upcoming",  bg: "bg-secondary-fixed", color: "text-on-secondary-container" },
            { label: "Total",     value: appointments.length, icon: "calendar_month", bg: "bg-tertiary-fixed", color: "text-tertiary" },
            { label: "Pending",   value: appointments.filter((a) => a.status === "pending").length, icon: "pending", bg: "bg-surface-container", color: "text-on-surface-variant" },
          ].map(({ label, value, icon, bg, color }) => (
            <div key={label} className={`glass-card rounded-2xl p-md flex items-center gap-md shadow-md`}>
              <div className={`w-11 h-11 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                <span className={`material-symbols-outlined text-[20px] ${color}`}>{icon}</span>
              </div>
              <div>
                <p className="text-caption text-outline font-bold uppercase tracking-wide">{label}</p>
                <p className="text-headline-md text-primary font-bold">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-error-container border border-error/20 rounded-2xl px-md py-sm mb-md">
            <p className="text-error text-label-md font-semibold">{error}</p>
            <p className="text-error/70 text-caption mt-xs">Ensure your doctor profile is linked to your account.</p>
          </div>
        )}

        <h2 className="text-headline-md text-primary mb-md flex items-center gap-xs">
          <span className="material-symbols-outlined text-[20px]">event_note</span>
          Appointments
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl">
            <span className="material-symbols-outlined text-outline text-5xl mb-3 block">event_busy</span>
            <p className="text-body-md text-outline">No appointments scheduled yet.</p>
            <p className="text-caption text-on-surface-variant mt-xs">Patients will appear here once they book with you.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments
              .slice()
              .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
              .map((appt) => (
                <div key={appt.id} className="glass-card rounded-2xl px-md py-sm flex items-center justify-between gap-4 shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center gap-md flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-label-md text-on-surface font-semibold">
                        Patient <span className="text-primary font-mono text-xs">{appt.patient_id.slice(0, 8)}…</span>
                      </p>
                      <p className="text-caption text-outline flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        {formatTime(appt.scheduled_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm shrink-0">
                    <span className={`text-caption font-bold px-3 py-1 rounded-full capitalize ${statusStyle(appt.status)}`}>
                      {appt.status}
                    </span>
                    <button
                      onClick={() => router.push(`/doctor/appointment/${appt.id}`)}
                      className="bg-primary text-on-primary text-label-md font-bold rounded-xl px-md py-2 hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function DoctorDashboard() {
  return (
    <ProtectedRoute role="doctor">
      <DoctorDashboardContent />
    </ProtectedRoute>
  );
}
