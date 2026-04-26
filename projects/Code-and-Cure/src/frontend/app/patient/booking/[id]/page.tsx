"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, AppointmentSlot } from "@/lib/api";

interface BookingContentProps {
  doctorId: string;
}

function BookingContent({ doctorId }: BookingContentProps) {
  const router = useRouter();
  const params = useSearchParams();
  const doctorName = params.get("name") || "Doctor";

  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AppointmentSlot | null>(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    api.doctors.slots(doctorId)
      .then(setSlots)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [doctorId]);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  const handleBook = async () => {
    if (!selected) return;
    setError(null);
    setBooking(true);
    try {
      const res = await api.appointments.book(doctorId, selected.start_time);
      setAppointmentId(res.appointment_id);
      setConfirmed(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  if (confirmed && appointmentId) {
    return (
      <div className="max-w-lg mx-auto mt-16 px-4 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-700 mb-2">Appointment Confirmed!</h2>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">{doctorName}</span> at{" "}
          {selected && formatTime(selected.start_time)}
        </p>
        <p className="text-xs text-gray-400 mb-6">Appointment ID: {appointmentId}</p>
        <button
          onClick={() => router.push("/patient/dashboard")}
          className="bg-indigo-600 text-white rounded-xl px-6 py-2 text-sm font-medium hover:bg-indigo-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-8 px-4">
      <button onClick={() => router.back()} className="text-indigo-600 text-sm mb-4 hover:underline">
        ← Back
      </button>
      <h2 className="text-xl font-bold text-gray-800 mb-1">Book with {doctorName}</h2>
      {slots[0] && (
        <p className="text-sm text-gray-500 mb-6">{formatDate(slots[0].start_time)}</p>
      )}

      {loading && <p className="text-gray-500 text-sm">Loading available slots…</p>}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-3 gap-2 mb-6">
        {slots.map((slot) => (
          <button
            key={slot.id}
            disabled={!slot.is_available}
            onClick={() => setSelected(slot)}
            className={`rounded-xl py-3 text-sm font-medium border transition ${
              !slot.is_available
                ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                : selected?.id === slot.id
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-gray-300 text-gray-700 hover:border-indigo-400 bg-white"
            }`}
          >
            {formatTime(slot.start_time)}
            {!slot.is_available && (
              <span className="block text-xs text-gray-300">Taken</span>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={handleBook}
        disabled={!selected || booking}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-3 transition disabled:opacity-40"
      >
        {booking ? "Booking…" : selected ? `Confirm ${formatTime(selected.start_time)}` : "Select a Time"}
      </button>
    </div>
  );
}

export default function BookingPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute role="patient">
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b px-6 py-4">
          <h1 className="text-lg font-bold text-indigo-700">CareIT — Book Appointment</h1>
        </nav>
        <Suspense fallback={<div className="p-8 text-gray-500">Loading…</div>}>
          <BookingContent doctorId={params.id} />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
