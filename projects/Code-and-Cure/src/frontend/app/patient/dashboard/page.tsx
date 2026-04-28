"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { api, Appointment, Doctor, Prescription } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

// Load the Leaflet map client-side only (no SSR — Leaflet requires window)
const DoctorMap = dynamic(() => import("@/components/DoctorMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-2xl bg-surface-container-low animate-pulse" style={{ height: "540px" }} />
  ),
});

type ChatMessage =
  | { role: "user"; text: string }
  | { role: "bot"; text: string; suggestion?: { specialty: string; rationale: string }; emergency?: boolean };

function MiniCalendar({ appointments }: { appointments: Appointment[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const apptDays = new Set(
    appointments
      .filter((a) => a.status !== "cancelled")
      .map((a) => {
        const d = new Date(a.scheduled_at);
        return d.getFullYear() === year && d.getMonth() === month ? d.getDate() : null;
      })
      .filter((d): d is number => d !== null)
  );

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today     = new Date();
  const isToday   = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="glass-card rounded-2xl p-md shadow-md">
      <div className="flex items-center justify-between mb-sm">
        <h3 className="text-headline-md text-primary flex items-center gap-xs">
          <span className="material-symbols-outlined text-[20px]">event</span>
          Calendar
        </h3>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-1 rounded-lg hover:bg-white/40 text-on-surface-variant transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <span className="text-caption text-on-surface font-semibold px-1 whitespace-nowrap">{monthName}</span>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="p-1 rounded-lg hover:bg-white/40 text-on-surface-variant transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-[10px] text-outline font-bold py-1">{d}</div>
        ))}
        {days.map((day, i) => (
          <div
            key={i}
            className={`relative flex items-center justify-center rounded-full text-xs aspect-square transition-all
              ${!day ? "" : isToday(day)
                ? "bg-primary text-on-primary font-bold"
                : apptDays.has(day)
                  ? "bg-secondary-fixed text-on-secondary-container font-semibold"
                  : "text-on-surface"
              }`}
          >
            {day ?? ""}
            {day && apptDays.has(day) && !isToday(day) && (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-secondary rounded-full" />
            )}
          </div>
        ))}
      </div>
      {apptDays.size > 0 ? (
        <p className="text-caption text-outline text-center mt-xs">
          {apptDays.size} appointment{apptDays.size !== 1 ? "s" : ""} this month
        </p>
      ) : (
        <p className="text-caption text-outline text-center mt-xs">No appointments this month</p>
      )}
    </div>
  );
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <span className="flex items-center gap-0.5 text-caption text-on-surface-variant">
      <span className="text-yellow-400 text-xs">
        {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
      </span>
      <span className="ml-0.5">({count})</span>
    </span>
  );
}

function DoctorCard({ doc, onBook }: { doc: Doctor; onBook: (doc: Doctor) => void }) {
  return (
    <div className="glass-card rounded-2xl p-md flex flex-col gap-sm hover:-translate-y-1 transition-all duration-300 shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-primary truncate text-label-md">{doc.name}</p>
          <span className="mt-xs inline-block text-[10px] bg-secondary-fixed text-on-secondary-container px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
            {doc.specialty}
          </span>
        </div>
        <StarRating rating={doc.rating} count={doc.review_count} />
      </div>
      <p className="text-caption text-outline flex items-center gap-1 truncate">
        <span className="material-symbols-outlined text-[14px]">location_on</span>
        {doc.location}
        {typeof doc.distance_miles === "number" ? ` • ${doc.distance_miles} mi` : ""}
      </p>
      <button
        onClick={() => onBook(doc)}
        className="mt-auto w-full bg-primary text-on-primary rounded-xl py-2 text-label-md font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
      >
        Book Appointment
      </button>
    </div>
  );
}

function ChatSuggestionPill({
  specialty,
  onConfirm,
  onDismiss,
}: {
  specialty: string;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="mt-2 flex flex-col gap-1">
      <p className="text-caption text-on-surface-variant">Search for a {specialty}?</p>
      <div className="flex gap-2">
        <button onClick={onConfirm} className="flex-1 bg-primary text-on-primary text-caption rounded-lg py-1.5 font-bold transition hover:scale-[1.02]">
          Yes, search
        </button>
        <button onClick={onDismiss} className="flex-1 border border-outline-variant text-on-surface-variant text-caption rounded-lg py-1.5 transition hover:bg-white/60">
          No thanks
        </button>
      </div>
    </div>
  );
}

function SideNav({
  onLogout,
  onComingSoon,
  onScrollToFind,
}: {
  onLogout: () => void;
  onComingSoon: (msg: string) => void;
  onScrollToFind: () => void;
}) {
  const router = useRouter();
  const navItems = [
    {
      icon: "dashboard",   label: "Dashboard",     active: true,
      action: () => {},
    },
    {
      icon: "videocam",    label: "Consultations",  active: false,
      action: () => router.push("/patient/consultation"),
    },
    {
      icon: "description", label: "Records",        active: false,
      action: () => document.getElementById("my-records")?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      icon: "settings",    label: "Settings",       active: false,
      action: () => onComingSoon("Settings — coming in v2!"),
    },
  ];
  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 hidden lg:flex flex-col py-8 px-4 glass-panel border-r border-white/20 shadow-[20px_0_40px_rgba(0,77,64,0.06)] w-64 h-screen">
      <div className="px-4 mb-lg">
        <p className="text-caption text-outline font-bold uppercase tracking-widest mb-1">Patient Portal</p>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
          <h2 className="text-xl font-black text-primary">careIT</h2>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map(({ icon, label, active, action }) => (
          <a
            key={label}
            onClick={action}
            className={`flex items-center gap-base px-4 py-3 rounded-xl cursor-pointer text-label-md font-semibold transition-all ${
              active
                ? "bg-primary-fixed/60 text-primary border-l-4 border-primary"
                : "text-on-surface-variant hover:text-primary hover:translate-x-1"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
            {label}
          </a>
        ))}
      </nav>
      <div className="space-y-2 mt-auto">
        <button
          onClick={onScrollToFind}
          className="w-full py-3 px-4 bg-primary text-on-primary rounded-xl font-bold text-label-md shadow-lg hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-xs"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Book Appointment
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-base px-4 py-2 text-on-surface-variant hover:text-primary text-sm transition-all rounded-xl"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}

function Dashboard() {
  const router = useRouter();
  const { logout } = useAuth();

  const [doctors, setDoctors]               = useState<Doctor[]>([]);
  const [search, setSearch]                 = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string | undefined>();
  const [docsLoading, setDocsLoading]       = useState(true);
  const [docsError, setDocsError]           = useState<string | null>(null);
  const [nearMeActive, setNearMeActive]     = useState(false);
  const [geoLoading, setGeoLoading]         = useState(false);
  const [radius, setRadius]                 = useState(50);
  const [coords, setCoords]                 = useState<{ latitude: number; longitude: number } | null>(null);
  const [viewMode, setViewMode]             = useState<"grid" | "map">("grid");
  const [appointments, setAppointments]     = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions]   = useState<Prescription[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "Hello! How are you feeling today? Describe your symptoms and I'll find the best specialist for you." },
  ]);
  const [chatInput, setChatInput]   = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [toast, setToast]           = useState<string | null>(null);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Reschedule modal state
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleAt, setRescheduleAt]         = useState("");
  const [rescheduling, setRescheduling]         = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const load = async () => {
      setDocsLoading(true);
      setDocsError(null);
      try {
        const data = await api.doctors.list({
          specialty: specialtyFilter,
          q: !specialtyFilter && search.trim() ? search.trim() : undefined,
          latitude:  nearMeActive && coords ? coords.latitude  : undefined,
          longitude: nearMeActive && coords ? coords.longitude : undefined,
          radius:    nearMeActive ? radius : undefined,
          source: "auto",
        });
        setDoctors(data);
      } catch (e: unknown) {
        setDocsError(e instanceof Error ? e.message : "Failed to fetch doctors");
      } finally {
        setDocsLoading(false);
      }
    };
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, specialtyFilter, nearMeActive, coords, radius]);

  useEffect(() => {
    api.appointments.list().then(setAppointments).catch(() => {});
    api.prescriptions.list().then(setPrescriptions).catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNearMe = () => {
    if (!navigator.geolocation) { setDocsError("Geolocation not supported."); return; }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setNearMeActive(true);
        setGeoLoading(false);
      },
      () => { setDocsError("Location access denied."); setGeoLoading(false); }
    );
  };

  const clearNearMe = () => { setNearMeActive(false); setCoords(null); };

  const clearSearch = () => { setSearch(""); setSpecialtyFilter(undefined); };

  const handleChatSend = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setChatLoading(true);
    try {
      const result = await api.symptoms.analyze(text);
      const isEmergency = result.recommended_specialty === "Emergency Medicine";
      if (isEmergency) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: result.rationale,
            emergency: true,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: `Based on your symptoms, you may benefit from seeing a **${result.recommended_specialty}**. ${result.rationale}`,
            suggestion: { specialty: result.recommended_specialty, rationale: result.rationale },
          },
        ]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "Sorry, I had trouble analyzing those symptoms. Try rephrasing them." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const applySuggestion = (specialty: string) => {
    setSpecialtyFilter(specialty);
    setSearch(specialty);
    setMessages((prev) =>
      prev.map((m) => "suggestion" in m && m.suggestion?.specialty === specialty ? { ...m, suggestion: undefined } : m)
    );
    setMessages((prev) => [...prev, { role: "bot", text: `Showing ${specialty} specialists nationwide. Clear the search bar to browse all doctors.` }]);
  };

  const dismissSuggestion = (specialty: string) => {
    setMessages((prev) =>
      prev.map((m) => "suggestion" in m && m.suggestion?.specialty === specialty ? { ...m, suggestion: undefined } : m)
    );
    setMessages((prev) => [...prev, { role: "bot", text: "No problem! Browse all available doctors or describe different symptoms." }]);
  };

  const handleCancel = async (apptId: string) => {
    if (!confirm("Cancel this appointment?")) return;
    try {
      await api.appointments.cancel(apptId);
      setAppointments((prev) =>
        prev.map((a) => a.id === apptId ? { ...a, status: "cancelled" } : a)
      );
      showToast("Appointment cancelled.");
    } catch {
      showToast("Failed to cancel — please try again.");
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleTarget || !rescheduleAt) return;
    setRescheduling(true);
    try {
      await api.appointments.reschedule(rescheduleTarget.id, new Date(rescheduleAt).toISOString());
      setAppointments((prev) =>
        prev.map((a) => a.id === rescheduleTarget.id ? { ...a, scheduled_at: new Date(rescheduleAt).toISOString(), status: "confirmed" } : a)
      );
      showToast("Appointment rescheduled!");
      setRescheduleTarget(null);
      setRescheduleAt("");
    } catch {
      showToast("Failed to reschedule — please try again.");
    } finally {
      setRescheduling(false);
    }
  };

  const now = new Date();
  const nextAppointment = appointments
    .filter((a) => a.status !== "cancelled" && new Date(a.scheduled_at) > now)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 hero-gradient z-0 pointer-events-none" />

      <SideNav
        onLogout={logout}
        onComingSoon={showToast}
        onScrollToFind={() => document.getElementById("find-doctors")?.scrollIntoView({ behavior: "smooth" })}
      />

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] glass-panel px-lg py-sm rounded-2xl shadow-2xl text-label-md font-semibold text-on-surface flex items-center gap-sm border border-white/30 pointer-events-none whitespace-nowrap">
          <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
          {toast}
        </div>
      )}

      {/* ── Top Nav ─────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 lg:pl-64 flex items-center justify-between px-6 py-3 glass-panel border-b border-white/20 shadow-[0_4px_24px_rgba(0,77,64,0.08)]">
        <div className="flex items-center gap-2 lg:hidden">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
          <span className="font-black text-primary">careIT</span>
        </div>
        <div className="hidden lg:flex items-center gap-md">
          <nav className="flex gap-1">
            <span className="text-primary font-semibold text-sm px-3 py-1.5 rounded-lg bg-primary-fixed/40">Dashboard</span>
            <span
              onClick={() => router.push("/patient/consultation")}
              className="text-on-surface-variant text-sm px-3 py-1.5 rounded-lg hover:bg-white/40 cursor-pointer transition-all"
            >
              Consultations
            </span>
          </nav>
        </div>
        <div className="flex items-center gap-2 relative">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen((o) => !o); setProfileOpen(false); }}
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
                  <p className="text-label-md font-bold text-on-surface">Notifications</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {appointments.length === 0 ? (
                    <p className="text-caption text-outline text-center py-6">No notifications yet.</p>
                  ) : (
                    appointments
                      .slice()
                      .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
                      .slice(0, 5)
                      .map((appt) => (
                        <div key={appt.id} className="px-md py-sm border-b border-outline-variant/10 hover:bg-white/40 transition-all">
                          <p className="text-label-md text-on-surface font-semibold capitalize">
                            Appointment {appt.status}
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

          {/* Chat bubble — scroll to AI navigator */}
          <button
            onClick={() => document.getElementById("find-doctors")?.scrollIntoView({ behavior: "smooth" })}
            className="p-2 rounded-full hover:bg-white/40 transition-all"
          >
            <span className="material-symbols-outlined text-on-surface-variant">chat_bubble</span>
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen((o) => !o); setNotifOpen(false); }}
              className="p-2 rounded-full hover:bg-white/40 transition-all"
            >
              <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-2xl border border-white/20 shadow-2xl z-50 overflow-hidden">
                <div className="px-md py-sm border-b border-outline-variant/20">
                  <p className="text-label-md font-bold text-on-surface">Patient Account</p>
                  <p className="text-caption text-outline">Logged in via careIT</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { showToast("Profile settings — coming in v2!"); setProfileOpen(false); }}
                    className="w-full flex items-center gap-sm px-md py-sm text-label-md text-on-surface hover:bg-white/40 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                    My Profile
                  </button>
                  <button
                    onClick={() => { logout(); setProfileOpen(false); }}
                    className="w-full flex items-center gap-sm px-md py-sm text-label-md text-error hover:bg-error-container transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={logout} className="ml-1 text-sm text-on-surface-variant hover:text-primary font-semibold transition-colors lg:hidden">
            Sign out
          </button>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="relative z-10 lg:ml-64 pt-24 px-margin pb-xl max-w-7xl">
        {/* Welcome header */}
        <header className="mb-lg">
          <h1 className="text-display-xl text-primary mb-xs">Welcome back</h1>
          <p className="text-body-lg text-outline">
            {nextAppointment
              ? `You have an upcoming appointment on ${new Date(nextAppointment.scheduled_at).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}.`
              : "Browse our nationwide network of specialists and book your next consultation."}
          </p>
        </header>

        {/* ── Bento Row 1: Appointment + AI navigator ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-gutter">
          {/* Upcoming appointment card */}
          <section className="lg:col-span-8 glass-card rounded-2xl p-md shadow-xl border-l-4 border-l-secondary">
            <div className="flex justify-between items-start mb-md flex-wrap gap-4">
              <div>
                <span className="bg-secondary-fixed text-on-secondary-container px-3 py-1 rounded-full text-caption font-bold mb-base inline-block uppercase tracking-wide">
                  {nextAppointment ? "Upcoming Consultation" : "No Upcoming Appointments"}
                </span>
                {nextAppointment ? (
                  <>
                    <h2 className="text-headline-lg text-primary">
                      Appointment Booked
                    </h2>
                    <p className="text-outline text-label-md font-semibold">ID: {nextAppointment.id}</p>
                  </>
                ) : (
                  <h2 className="text-headline-lg text-primary">Book Your First Visit</h2>
                )}
              </div>
              {nextAppointment && (
                <div className="text-right">
                  <div className="text-headline-md font-bold text-secondary">
                    {new Date(nextAppointment.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="text-caption text-outline">
                    {new Date(nextAppointment.scheduled_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-md items-center pt-md border-t border-outline-variant/30">
              {nextAppointment ? (
                <>
                  <button
                    onClick={() => router.push(`/patient/consultation?appointment_id=${nextAppointment.id}`)}
                    className="bg-primary text-on-primary px-lg py-3 rounded-xl font-bold flex items-center gap-xs hover:scale-[1.02] active:scale-95 transition-all shadow-md"
                  >
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>videocam</span>
                    Join Consultation
                  </button>
                  <button
                    onClick={() => { setRescheduleTarget(nextAppointment); setRescheduleAt(""); }}
                    className="px-md py-3 border border-outline rounded-xl font-bold text-primary hover:bg-white/50 transition-all text-label-md"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleCancel(nextAppointment.id)}
                    className="px-md py-3 border border-error/40 rounded-xl font-bold text-error hover:bg-error-container transition-all text-label-md"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => document.getElementById("find-doctors")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-primary text-on-primary px-lg py-3 rounded-xl font-bold flex items-center gap-xs hover:scale-[1.02] active:scale-95 transition-all shadow-md text-label-md"
                >
                  <span className="material-symbols-outlined text-[18px]">search</span>
                  Find a Specialist
                </button>
              )}
            </div>
          </section>

          {/* AI Care Navigator */}
          <section className="lg:col-span-4 glass-card rounded-2xl flex flex-col bg-primary-container relative overflow-hidden shadow-xl">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none" />
            <div className="px-md pt-md pb-sm border-b border-white/10 relative z-10">
              <div className="flex items-center gap-sm">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[18px]">smart_toy</span>
                </div>
                <div>
                  <p className="text-label-md text-white font-bold">Symptom Triage</p>
                  <p className="text-caption text-on-primary-container/70">AI-Powered Analysis</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-md py-sm space-y-sm relative z-10 min-h-[180px] max-h-[260px]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {"emergency" in msg && msg.emergency ? (
                    <div className="w-full bg-red-600 text-white rounded-2xl rounded-bl-sm px-sm py-3 shadow-lg border border-red-800">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
                        <span className="font-black text-sm uppercase tracking-wide">Call 911 Now</span>
                      </div>
                      <p className="text-sm leading-snug mb-2">{msg.text}</p>
                      <a
                        href="tel:911"
                        className="block w-full text-center bg-white text-red-700 font-black rounded-xl py-2 text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-md"
                      >
                        📞 Call 911
                      </a>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[88%] rounded-2xl px-sm py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-secondary-fixed text-on-secondary-container rounded-br-sm"
                          : "bg-white text-on-surface rounded-bl-sm shadow-sm"
                      }`}
                    >
                      {msg.text.split("**").map((part, j) =>
                        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                      )}
                      {"suggestion" in msg && msg.suggestion && (
                        <ChatSuggestionPill
                          specialty={msg.suggestion.specialty}
                          onConfirm={() => applySuggestion(msg.suggestion!.specialty)}
                          onDismiss={() => dismissSuggestion(msg.suggestion!.specialty)}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-bl-sm px-sm py-2 text-sm text-on-surface-variant animate-pulse shadow-sm">
                    Analyzing…
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="px-md pb-md pt-sm relative z-10">
              <div className="relative">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleChatSend())}
                  placeholder="Describe your symptoms…"
                  rows={2}
                  disabled={chatLoading}
                  className="w-full bg-white border border-outline-variant/30 rounded-xl py-2 px-sm text-on-surface placeholder-outline focus:ring-2 focus:ring-secondary-fixed resize-none text-sm outline-none"
                />
                <button
                  onClick={handleChatSend}
                  disabled={chatLoading || !chatInput.trim()}
                  className="absolute bottom-2 right-2 p-1.5 bg-secondary-fixed text-on-secondary-fixed rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ── Find Doctors ─────────────────────────────────────────────── */}
        <section id="find-doctors" className="mb-lg">

          {/* Section header + view toggle */}
          <div className="flex items-center justify-between mb-md flex-wrap gap-3">
            <h2 className="text-headline-md text-primary flex items-center gap-xs">
              <span className="material-symbols-outlined">search</span>
              Find a Doctor
            </h2>
            <div className="flex items-center gap-sm">
              {specialtyFilter && (
                <span className="text-caption bg-primary-fixed text-primary px-3 py-1 rounded-full font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">medical_services</span>
                  {specialtyFilter}
                  <button onClick={clearSearch} className="ml-1 opacity-60 hover:opacity-100">×</button>
                </span>
              )}
              {/* Grid / Map toggle */}
              <div className="flex rounded-xl border border-outline-variant overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1 px-3 py-2 text-label-md font-semibold transition-all ${
                    viewMode === "grid"
                      ? "bg-primary text-on-primary"
                      : "bg-white text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">grid_view</span>
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-1 px-3 py-2 text-label-md font-semibold transition-all ${
                    viewMode === "map"
                      ? "bg-primary text-on-primary"
                      : "bg-white text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">map</span>
                  Map
                </button>
              </div>
            </div>
          </div>

          {/* Search + filter bar */}
          <div className="flex gap-sm mb-md flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, specialty, or location…"
                className="w-full bg-white border border-outline-variant rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
              />
              {(search || specialtyFilter) && (
                <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-lg leading-none">
                  ×
                </button>
              )}
            </div>
            <button
              onClick={nearMeActive ? clearNearMe : handleNearMe}
              disabled={geoLoading}
              className={`flex items-center gap-xs px-md py-3 rounded-xl border text-label-md font-semibold transition-all ${
                nearMeActive
                  ? "bg-primary text-on-primary border-primary shadow-md"
                  : "bg-white text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">near_me</span>
              {geoLoading ? "Locating…" : nearMeActive ? "Near Me ×" : "Near Me"}
            </button>
            {nearMeActive && (
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="bg-white border border-outline-variant text-on-surface rounded-xl px-3 py-3 text-sm"
              >
                {[10, 25, 50, 100, 200].map((r) => (
                  <option key={r} value={r}>{r} mi</option>
                ))}
              </select>
            )}
          </div>

          {nearMeActive && (
            <span className="inline-block text-caption bg-primary-fixed text-primary px-3 py-1 rounded-full font-bold mb-md flex items-center gap-1 w-fit">
              <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              Sorted by distance
            </span>
          )}

          {docsError && (
            <p className="text-error text-sm mb-md bg-error-container rounded-xl px-4 py-3">{docsError}</p>
          )}

          {/* ── Map view ── */}
          {viewMode === "map" && (
            <div className="rounded-2xl overflow-hidden shadow-xl border border-white/20 relative">
              {docsLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-caption text-outline">Loading doctors…</p>
                  </div>
                </div>
              )}
              <DoctorMap
                key={doctors.map((d) => d.id).join(",")}
                doctors={doctors}
                onBook={(d) => router.push(`/patient/booking/${d.id}?name=${encodeURIComponent(d.name)}`)}
              />
              {/* Legend */}
              <div className="absolute bottom-4 left-4 z-[1000] glass-panel rounded-xl px-sm py-xs shadow-md border border-white/20 flex items-center gap-xs text-caption text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                {doctors.length} specialists nationwide · click a pin to book
              </div>
            </div>
          )}

          {/* ── Grid view ── */}
          {viewMode === "grid" && (
            docsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="glass-card rounded-2xl h-40 animate-pulse" />
                ))}
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-16 glass-card rounded-2xl">
                <span className="material-symbols-outlined text-outline text-5xl mb-2 block">search_off</span>
                <p className="text-body-md text-outline">No doctors match your search.</p>
                <button onClick={clearSearch} className="mt-3 text-primary font-semibold text-label-md hover:underline">
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
                {doctors.map((doc) => (
                  <DoctorCard
                    key={doc.id}
                    doc={doc}
                    onBook={(d) => router.push(`/patient/booking/${d.id}?name=${encodeURIComponent(d.name)}`)}
                  />
                ))}
              </div>
            )
          )}
        </section>

        {/* ── Bottom: Appointments + Calendar + Prescriptions ──────────── */}
        <div id="my-records" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {/* My Appointments */}
          <section className="glass-card rounded-2xl p-md shadow-md">
            <h3 className="text-headline-md text-primary mb-md flex items-center gap-xs">
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
              My Appointments
            </h3>
            <div className="space-y-sm">
              {appointments.length === 0 ? (
                <p className="text-caption text-outline py-4 text-center">No appointments booked yet.</p>
              ) : (
                  appointments
                  .slice()
                  .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                  .map((appt) => (
                    <div key={appt.id} className="flex items-center justify-between bg-surface-container-low rounded-xl px-sm py-2 gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-label-md text-on-surface">
                          {new Date(appt.scheduled_at).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                          {" at "}
                          {new Date(appt.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-caption text-outline font-mono">ID: {appt.id.slice(0, 8)}…</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`text-caption font-bold px-2.5 py-1 rounded-full capitalize ${
                          appt.status === "confirmed" ? "bg-primary-fixed text-primary"
                          : appt.status === "cancelled" ? "bg-error-container text-error"
                          : "bg-secondary-fixed text-on-secondary-container"
                        }`}>
                          {appt.status}
                        </span>
                        {appt.status !== "cancelled" && (
                          <>
                            <button
                              onClick={() => { setRescheduleTarget(appt); setRescheduleAt(""); }}
                              title="Reschedule"
                              className="p-1 rounded-lg text-primary hover:bg-primary-fixed/40 transition-all"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                            </button>
                            <button
                              onClick={() => handleCancel(appt.id)}
                              title="Cancel"
                              className="p-1 rounded-lg text-error hover:bg-error-container transition-all"
                            >
                              <span className="material-symbols-outlined text-[16px]">cancel</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>

          {/* Mini Calendar */}
          <MiniCalendar appointments={appointments} />

          {/* My Prescriptions */}
          <section className="glass-card rounded-2xl p-md shadow-md">
            <h3 className="text-headline-md text-primary mb-md flex items-center gap-xs">
              <span className="material-symbols-outlined text-[20px]">medication</span>
              My Prescriptions
            </h3>
            <div className="space-y-sm">
              {prescriptions.length === 0 ? (
                <p className="text-caption text-outline py-4 text-center">No prescription records yet.</p>
              ) : (
                prescriptions.slice(0, 6).map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-surface-container-low rounded-xl px-sm py-2">
                    <div>
                      <p className="text-label-md text-on-surface font-semibold">{p.requested_medication}</p>
                      {p.block_reason && (
                        <p className="text-caption text-error mt-0.5">{p.block_reason}</p>
                      )}
                    </div>
                    <span className={`text-caption font-bold px-2.5 py-1 rounded-full capitalize ${
                      p.approval_status === "approved" ? "bg-primary-fixed text-primary"
                      : p.approval_status === "blocked"  ? "bg-error-container text-error"
                      : "bg-secondary-fixed text-on-secondary-container"
                    }`}>
                      {p.approval_status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ── Reschedule Modal ──────────────────────────────────────────────── */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="glass-panel rounded-2xl p-lg shadow-2xl border border-white/20 w-full max-w-sm">
            <h3 className="text-headline-md text-primary font-bold mb-xs">Reschedule Appointment</h3>
            <p className="text-caption text-outline mb-md">ID: {rescheduleTarget.id.slice(0, 8)}…</p>
            <label className="block text-label-md text-on-surface font-semibold mb-xs">
              New date &amp; time
            </label>
            <input
              type="datetime-local"
              value={rescheduleAt}
              onChange={(e) => setRescheduleAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full border border-outline-variant rounded-xl px-md py-sm text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary mb-md bg-white"
            />
            <div className="flex gap-sm">
              <button
                onClick={handleReschedule}
                disabled={!rescheduleAt || rescheduling}
                className="flex-1 bg-primary text-on-primary rounded-xl py-3 font-bold text-label-md hover:scale-[1.01] transition-all disabled:opacity-40"
              >
                {rescheduling ? "Saving…" : "Confirm"}
              </button>
              <button
                onClick={() => setRescheduleTarget(null)}
                className="flex-1 border border-outline-variant rounded-xl py-3 font-bold text-label-md text-on-surface-variant hover:bg-white/40 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PatientDashboard() {
  return (
    <ProtectedRoute role="patient">
      <Dashboard />
    </ProtectedRoute>
  );
}
