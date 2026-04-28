"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, AppointmentSlot } from "@/lib/api";

interface BookingContentProps {
  doctorId: string;
}

function StepBar({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-1 mb-md">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`flex-1 h-1.5 rounded-full transition-colors ${
            s <= step ? "bg-primary" : "bg-outline-variant"
          }`}
        />
      ))}
    </div>
  );
}

function BookingContent({ doctorId }: BookingContentProps) {
  const router     = useRouter();
  const params     = useSearchParams();
  const doctorName = params.get("name") || "Doctor";

  // Step 1 — pre-visit form
  const [step, setStep]                     = useState<1 | 2 | 3>(1);
  const [visitReason, setVisitReason]       = useState("");
  const [additionalSymptoms, setAdditionalSymptoms] = useState("");
  const [medHistory, setMedHistory]         = useState("");
  const [allergies, setAllergies]           = useState("");
  const [preFormError, setPreFormError]     = useState<string | null>(null);

  // Step 2 — slot selection
  const [slots, setSlots]           = useState<AppointmentSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selected, setSelected]     = useState<AppointmentSlot | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [booking, setBooking]       = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Step 3 — confirmed
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [intakeSubmitted, setIntakeSubmitted] = useState<boolean | null>(null);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  const handlePreFormNext = () => {
    if (!visitReason.trim()) {
      setPreFormError("Please describe your reason for this visit.");
      return;
    }
    setPreFormError(null);
    setSlotsLoading(true);
    api.doctors
      .slots(doctorId)
      .then((fetched) => {
        setSlots(fetched);
        // Auto-select the first day that has available slots
        const firstAvailable = fetched.find((s) => s.is_available);
        if (firstAvailable) {
          setSelectedDay(new Date(firstAvailable.start_time).toDateString());
        }
      })
      .catch((e: Error) => setBookingError(e.message))
      .finally(() => setSlotsLoading(false));
    setStep(2);
  };

  const handleBook = async () => {
    if (!selected) return;
    setBookingError(null);
    setBooking(true);
    try {
      const res    = await api.appointments.book(doctorId, selected.start_time);
      const apptId = res.appointment_id;
      setAppointmentId(apptId);

      // Auto-submit intake form from pre-visit data
      const symptoms = visitReason.trim() +
        (additionalSymptoms.trim() ? `\n\nAdditional symptoms: ${additionalSymptoms.trim()}` : "");
      let intakeOk = false;
      try {
        await api.intake.submit({
          appointment_id: apptId,
          symptoms,
          medical_history: medHistory.trim() || "",
          allergies:       allergies.trim() || "",
        });
        intakeOk = true;
      } catch (intakeErr) {
        console.warn("Intake form submission failed:", intakeErr);
      }
      setIntakeSubmitted(intakeOk);

      setStep(3);
    } catch (e: unknown) {
      setBookingError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  // ── Step 3: Confirmation ──────────────────────────────────────────────────
  if (step === 3 && appointmentId) {
    return (
      <div className="max-w-lg mx-auto mt-16 px-4 text-center">
        <span
          className="material-symbols-outlined text-primary mb-md block"
          style={{ fontSize: "64px", fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
        <h2 className="text-headline-lg text-primary font-bold mb-xs">Appointment Confirmed!</h2>
        <p className="text-body-md text-on-surface-variant mb-xs">
          <span className="font-semibold text-on-surface">{doctorName}</span>
          {selected && <> at {formatTime(selected.start_time)}</>}
        </p>
        <p className="text-caption text-outline mb-lg font-mono">ID: {appointmentId}</p>

        <div className={`rounded-2xl px-md py-sm mb-lg text-left border ${
          intakeSubmitted
            ? "glass-card border-primary/20"
            : "bg-secondary-fixed/40 border-secondary-fixed"
        }`}>
          <div className={`flex items-center gap-xs mb-xs ${intakeSubmitted ? "text-primary" : "text-on-secondary-container"}`}>
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {intakeSubmitted ? "check_circle" : "info"}
            </span>
            <p className="text-label-md font-semibold">
              {intakeSubmitted ? "Pre-visit summary sent to your doctor" : "Pre-visit summary queued"}
            </p>
          </div>
          <p className={`text-caption ${intakeSubmitted ? "text-on-surface-variant" : "text-on-secondary-container/80"}`}>
            {intakeSubmitted
              ? "Your doctor can review your visit reason and health background before the appointment."
              : "Your visit details were saved with your booking. If the summary wasn't sent, your doctor can still ask you in-session."}
          </p>
        </div>

        <button
          onClick={() => router.push("/patient/dashboard")}
          className="w-full bg-primary text-on-primary rounded-2xl px-lg py-3 text-label-md font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-md"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // ── Step 1: Pre-visit form ────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="max-w-xl mx-auto mt-8 px-4 pb-xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-primary text-label-md font-semibold mb-md hover:bg-white/40 px-3 py-1.5 rounded-xl transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back
        </button>

        <StepBar step={1} />
        <p className="text-caption text-outline mb-md">Step 1 of 2 — About your visit</p>

        <div className="glass-card rounded-2xl p-md shadow-md">
          <div className="mb-md">
            <h2 className="text-headline-md text-primary font-bold mb-xs">Tell us about your visit</h2>
            <p className="text-body-md text-on-surface-variant">
              This helps <span className="font-semibold text-on-surface">{doctorName}</span> prepare before your appointment.
            </p>
          </div>

          <div className="space-y-md">
            <div>
              <label className="block text-label-md text-on-surface font-semibold mb-xs">
                Reason for visit <span className="text-error">*</span>
              </label>
              <textarea
                value={visitReason}
                onChange={(e) => setVisitReason(e.target.value)}
                placeholder="What is the main reason you're booking this appointment? (e.g. persistent headache for 3 days, chest tightness, routine checkup…)"
                rows={3}
                className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-white"
              />
            </div>

            <div>
              <label className="block text-label-md text-on-surface font-semibold mb-xs">
                Additional symptoms <span className="text-caption text-outline">(optional)</span>
              </label>
              <textarea
                value={additionalSymptoms}
                onChange={(e) => setAdditionalSymptoms(e.target.value)}
                placeholder="Any other symptoms, when they started, how severe…"
                rows={2}
                className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-white"
              />
            </div>

            <div>
              <label className="block text-label-md text-on-surface font-semibold mb-xs">
                Medical history <span className="text-caption text-outline">(optional)</span>
              </label>
              <textarea
                value={medHistory}
                onChange={(e) => setMedHistory(e.target.value)}
                placeholder="Past conditions, surgeries, or ongoing illnesses…"
                rows={2}
                className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-white"
              />
            </div>

            <div>
              <label className="block text-label-md text-on-surface font-semibold mb-xs">
                Allergies <span className="text-caption text-outline">(optional)</span>
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Latex (or 'None known')…"
                className="w-full border border-outline-variant rounded-xl px-md py-sm text-body-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              />
            </div>

            {preFormError && (
              <div className="bg-error-container border border-error/20 rounded-xl px-md py-sm">
                <p className="text-error text-label-md">{preFormError}</p>
              </div>
            )}

            <button
              onClick={handlePreFormNext}
              disabled={!visitReason.trim()}
              className="w-full bg-primary text-on-primary font-bold rounded-xl py-3 text-label-md hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md disabled:opacity-40 flex items-center justify-center gap-sm"
            >
              Continue — Choose a Time
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Calendar week-picker ─────────────────────────────────────────
  // Group slots by calendar day
  const slotsByDay: Record<string, AppointmentSlot[]> = {};
  slots.forEach((s) => {
    const key = new Date(s.start_time).toDateString();
    if (!slotsByDay[key]) slotsByDay[key] = [];
    slotsByDay[key].push(s);
  });
  const days = Object.keys(slotsByDay);
  const daySlotsForSelected = selectedDay ? (slotsByDay[selectedDay] || []) : [];

  return (
    <div className="max-w-2xl mx-auto mt-8 px-4 pb-xl">
      <button
        onClick={() => setStep(1)}
        className="flex items-center gap-1 text-primary text-label-md font-semibold mb-md hover:bg-white/40 px-3 py-1.5 rounded-xl transition-all"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Back
      </button>

      <StepBar step={2} />
      <p className="text-caption text-outline mb-md">Step 2 of 2 — Pick a day &amp; time</p>

      {/* Reason pill */}
      <div className="bg-primary-fixed/40 border border-primary/20 rounded-2xl px-md py-sm mb-md">
        <p className="text-caption text-primary font-bold uppercase tracking-wider mb-xs">Reason for visit</p>
        <p className="text-body-md text-on-surface line-clamp-2">{visitReason}</p>
      </div>

      <div className="glass-card rounded-2xl p-md shadow-md">
        <h2 className="text-headline-md text-primary font-bold mb-md">Book with {doctorName}</h2>

        {slotsLoading && (
          <div className="flex items-center gap-2 mb-md">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-body-md text-outline">Loading availability…</p>
          </div>
        )}
        {bookingError && (
          <div className="bg-error-container border border-error/20 rounded-xl px-md py-sm mb-md">
            <p className="text-error text-label-md">{bookingError}</p>
          </div>
        )}

        {/* ── Day picker (week calendar) ── */}
        {!slotsLoading && days.length > 0 && (
          <>
            <p className="text-label-md text-on-surface-variant font-semibold mb-sm">Select a day</p>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-md -mx-1 px-1">
              {days.map((day) => {
                const d = new Date(day);
                const hasAvail = (slotsByDay[day] || []).some((s) => s.is_available);
                const isActive = selectedDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => { setSelectedDay(day); setSelected(null); }}
                    disabled={!hasAvail}
                    className={`flex flex-col items-center px-3 py-2.5 rounded-2xl border min-w-[64px] transition-all shrink-0
                      ${isActive
                        ? "bg-primary text-on-primary border-primary shadow-md scale-105"
                        : hasAvail
                          ? "bg-white text-on-surface border-outline-variant hover:border-primary hover:bg-primary-fixed/20"
                          : "bg-surface-container-low text-outline border-outline-variant/40 opacity-50 cursor-not-allowed"
                      }`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? "text-on-primary/70" : "text-outline"}`}>
                      {d.toLocaleDateString([], { weekday: "short" })}
                    </span>
                    <span className="text-2xl font-black leading-tight">{d.getDate()}</span>
                    <span className={`text-[10px] font-semibold ${isActive ? "text-on-primary/70" : "text-outline"}`}>
                      {d.toLocaleDateString([], { month: "short" })}
                    </span>
                    {hasAvail && !isActive && (
                      <span className="mt-1 w-1.5 h-1.5 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── Time slots for selected day ── */}
        {selectedDay && (
          <>
            <p className="text-label-md text-on-surface-variant font-semibold mb-sm">
              Available times — {new Date(selectedDay).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <div className="grid grid-cols-4 gap-2 mb-md">
              {daySlotsForSelected.map((slot) => (
                <button
                  key={slot.id}
                  disabled={!slot.is_available}
                  onClick={() => setSelected(slot)}
                  className={`rounded-xl py-2.5 text-label-md font-semibold border transition-all ${
                    !slot.is_available
                      ? "border-outline-variant text-outline cursor-not-allowed bg-surface-container-low"
                      : selected?.id === slot.id
                      ? "border-primary bg-primary text-on-primary shadow-sm scale-105"
                      : "border-outline-variant text-on-surface hover:border-primary hover:bg-primary-fixed/20 bg-white"
                  }`}
                >
                  {formatTime(slot.start_time)}
                  {!slot.is_available && <span className="block text-[10px] text-outline mt-0.5">Taken</span>}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Selected summary */}
        {selected && (
          <div className="bg-primary-fixed/30 border border-primary/20 rounded-xl px-md py-sm mb-md">
            <p className="text-label-md text-primary font-bold flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
              {formatDate(selected.start_time)} at {formatTime(selected.start_time)}
            </p>
          </div>
        )}

        <button
          onClick={handleBook}
          disabled={!selected || booking}
          className="w-full bg-primary text-on-primary font-bold rounded-xl py-3 text-label-md hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md disabled:opacity-40"
        >
          {booking ? "Booking…" : selected ? `Confirm — ${formatDate(selected.start_time)} at ${formatTime(selected.start_time)}` : "Select a Day & Time"}
        </button>
      </div>
    </div>
  );
}

export default function BookingPage({ params }: { params: { id: string } }) {
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
          <span className="text-caption text-outline font-semibold uppercase tracking-wider">Book Appointment</span>
        </header>

        <main className="relative z-10 pt-20">
          <Suspense fallback={<div className="p-8 text-outline text-body-md">Loading…</div>}>
            <BookingContent doctorId={params.id} />
          </Suspense>
        </main>
      </div>
    </ProtectedRoute>
  );
}
