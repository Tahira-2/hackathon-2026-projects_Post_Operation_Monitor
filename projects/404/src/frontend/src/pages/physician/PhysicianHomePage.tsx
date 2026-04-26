import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { listAppointments } from '../../lib/api/appointment.service';
import type { Appointment } from '../../types/appointment.types';
import AppointmentCard from '../../components/appointments/AppointmentCard';
import { Users, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

export default function PhysicianHomePage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    listAppointments({ doctorId: user.id })
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const upcoming = appointments.filter(a => new Date(a.startTime) > new Date() && a.status === 'CONFIRMED');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome, {user?.fullName}</h1>
        <p className="text-gray-500 mt-1">Here is your practice overview for today.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Today's Patients</p>
              <h3 className="text-2xl font-bold text-gray-900">{upcoming.length}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Plans</p>
              <h3 className="text-2xl font-bold text-gray-900">3</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <h3 className="text-2xl font-bold text-gray-900">12</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Area */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Appointments List (Real API) */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center justify-between border-b border-gray-200 pb-2">
            <span>Upcoming Appointments</span>
          </h2>
          
          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full" /></div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">No upcoming appointments today.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {upcoming.map(apt => (
                <AppointmentCard key={apt.id} appointment={apt} isPhysicianView />
              ))}
            </div>
          )}
        </div>

        {/* AI Care Plans Queue (Mock) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">Action Required</h2>
          
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800 uppercase">Review</span>
                <span className="text-xs text-gray-500">10 mins ago</span>
              </div>
              <h4 className="font-semibold text-gray-900">AI Care Plan Generated</h4>
              <p className="text-sm text-gray-600 mt-1">Review the generated plan for John Doe based on your last consultation.</p>
              <button className="mt-3 text-sm font-semibold text-primary-600 hover:text-primary-700">Review Plan &rarr;</button>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">Follow-up</span>
              </div>
              <h4 className="font-semibold text-gray-900">Lab Results</h4>
              <p className="text-sm text-gray-600 mt-1">Sarah Johnson's lipid panel is ready for review.</p>
              <button className="mt-3 text-sm font-semibold text-primary-600 hover:text-primary-700">View Results &rarr;</button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
