import { useEffect, useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import AppointmentCard from '../../components/appointments/AppointmentCard';
import Button from '../../components/ui/Button';
import { listAppointments, createAppointment, deleteAppointment } from '../../lib/api/appointment.service';
import type { Appointment, CreateAppointmentRequest } from '../../types/appointment.types';
import { useAuth } from '../../contexts/AuthContext';
import SlotSelector from '../../components/availability/SlotSelector';
import { listAvailableSlots } from '../../lib/api/availability.service';
import type { TimeSlot } from '../../types/availability.types';
import { Card, CardContent } from '../../components/ui/Card';

export default function PatientAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking state
  const [isBooking, setIsBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Hardcoded doctor for patient booking demo
  const DEMO_DOCTOR_ID = "619e0785-3b1a-4d26-bb21-2a1c0d750c05"; // Replaced later or handled via API

  const fetchAppointments = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await listAppointments({ patientId: user.id });
      setAppointments(data);
    } catch (err) {
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user?.id]);

  const handleDateChange = async (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setLoadingSlots(true);
    try {
      const dateString = date.toISOString().split('T')[0];
      const availableSlots = await listAvailableSlots({
        doctorId: DEMO_DOCTOR_ID,
        date: dateString,
        slotMinutes: 30
      });
      setSlots(availableSlots);
    } catch (err) {
      console.error(err);
      setSlots([]); // Assume none if error (or no doctor mapped)
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (isBooking) {
      handleDateChange(selectedDate);
    }
  }, [isBooking]);

  const handleBook = async () => {
    if (!selectedSlot || !user) return;
    try {
      const request: CreateAppointmentRequest = {
        patientId: user.id,
        doctorId: DEMO_DOCTOR_ID,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        status: 'PENDING',
        reason: 'General Follow-up'
      };
      await createAppointment(request);
      setIsBooking(false);
      setSelectedSlot(null);
      fetchAppointments();
    } catch (err) {
      alert('Failed to book appointment. Doctor may not exist or slot taken.');
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await deleteAppointment(id);
        fetchAppointments();
      } catch (err) {
        alert('Failed to cancel appointment.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Appointments</h1>
          <p className="text-gray-500 mt-1">Manage your upcoming and past visits.</p>
        </div>
        {!isBooking && (
          <Button onClick={() => setIsBooking(true)} className="flex-shrink-0">
            <Plus size={18} className="mr-2" /> Book Visit
          </Button>
        )}
      </div>

      {isBooking && (
        <Card className="border-primary-200 shadow-md">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Book an Appointment</h2>
            <p className="text-sm text-gray-500 mb-6">Select a date and time that works for you.</p>
            
            <SlotSelector 
              slots={slots}
              loading={loadingSlots}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              selectedSlot={selectedSlot}
              onSlotSelect={setSelectedSlot}
            />

            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button variant="outline" onClick={() => setIsBooking(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleBook}
                disabled={!selectedSlot}
                className={selectedSlot ? 'bg-primary-600' : 'bg-gray-300'}
              >
                Confirm Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full" /></div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No appointments found</h3>
          <p className="text-gray-500 mt-1">You don't have any scheduled visits.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {appointments.map(apt => (
            <AppointmentCard 
              key={apt.id} 
              appointment={apt}
              onCancel={apt.status === 'CONFIRMED' || apt.status === 'PENDING' ? () => handleCancel(apt.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
