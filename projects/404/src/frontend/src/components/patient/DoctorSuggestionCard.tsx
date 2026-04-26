import { useState } from 'react';
import { Calendar, Clock, CheckCircle, Stethoscope, User } from 'lucide-react';
import apiClient from '../../lib/api/axios';
import { useAuth } from '../../contexts/AuthContext';

interface WorkingHour {
  day: string;
  startTime: string;
  endTime: string;
}

export interface DoctorSuggestion {
  doctorId: string;
  doctorName: string;
  specialization: string;
  workingHours: WorkingHour[];
}

interface Props {
  doctor: DoctorSuggestion;
  patientId: string;
}

const DAY_ORDER = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const SHORT_DAY: Record<string, string> = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed',
  THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
};

export default function DoctorSuggestionCard({ doctor, patientId }: Props) {
  const { user } = useAuth();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<WorkingHour | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState('');

  const sortedHours = [...doctor.workingHours].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
  );

  const handleBook = async () => {
    if (!selectedDay || !selectedDate || !user) return;
    setLoading(true);
    setError('');

    try {
      // Build a datetime from the selected date + doctor's start/end times
      const startTime = new Date(`${selectedDate}T${selectedDay.startTime}:00`).toISOString();
      const endTime = new Date(`${selectedDate}T${selectedDay.endTime}:00`).toISOString();

      await apiClient.post('/appointments', {
        doctorId: doctor.doctorId,
        patientId,
        status: 'PENDING',
        startTime,
        endTime,
        reason: reason || `Consultation with ${doctor.doctorName}`,
      });

      setBooked(true);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message ?? 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (booked) {
    return (
      <div className="mt-2 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 shadow-sm">
        <CheckCircle className="text-emerald-500 shrink-0" size={20} />
        <div>
          <p className="text-sm font-bold text-emerald-800">Appointment Booked!</p>
          <p className="text-xs text-emerald-600">Your appointment with {doctor.doctorName} is confirmed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-100">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-sm">
          <User size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-gray-900 truncate">{doctor.doctorName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Stethoscope size={11} className="text-indigo-500 shrink-0" />
            <p className="text-xs font-semibold text-indigo-600 truncate">{doctor.specialization}</p>
          </div>
        </div>
        <button
          onClick={() => setBookingOpen(!bookingOpen)}
          className="shrink-0 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          Book Now
        </button>
      </div>

      {/* Availability chips */}
      {sortedHours.length > 0 && (
        <div className="px-4 py-2.5 flex flex-wrap gap-2">
          {sortedHours.map((wh) => (
            <div key={wh.day} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <Clock size={10} className="text-gray-400" />
              <span className="text-[11px] font-semibold text-gray-600">
                {SHORT_DAY[wh.day]} {wh.startTime}–{wh.endTime}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Booking Form */}
      {bookingOpen && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-3 bg-slate-50/50">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Select a slot</p>

          {/* Day picker */}
          <div className="flex flex-wrap gap-2">
            {sortedHours.map((wh) => (
              <button
                key={wh.day}
                onClick={() => setSelectedDay(wh)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  selectedDay?.day === wh.day
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {SHORT_DAY[wh.day]} {wh.startTime}
              </button>
            ))}
          </div>

          {/* Date picker */}
          {selectedDay && (
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400 shrink-0" />
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all bg-white"
              />
            </div>
          )}

          {/* Reason */}
          <input
            type="text"
            placeholder="Reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition-all bg-white placeholder:text-gray-400"
          />

          {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={handleBook}
              disabled={!selectedDay || !selectedDate || loading}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Booking…' : 'Confirm Appointment'}
            </button>
            <button
              onClick={() => setBookingOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
