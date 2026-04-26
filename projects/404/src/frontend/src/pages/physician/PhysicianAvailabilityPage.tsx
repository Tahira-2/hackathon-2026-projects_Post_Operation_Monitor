import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { listWorkingHours, upsertWorkingHours, deleteWorkingHours } from '../../lib/api/availability.service';
import type { WorkingHours, UpsertWorkingHoursRequest, WeekDay } from '../../types/availability.types';
import WorkingHoursEditor from '../../components/physician/WorkingHoursEditor';

export default function PhysicianAvailabilityPage() {
  const { user } = useAuth();
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWorkingHours();
  }, [user?.id]);

  const fetchWorkingHours = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      // Hardcoded doctorId since we can't reliably get the doctor's record from user token in frontend without backend user /me route
      const DEMO_DOCTOR_ID = "619e0785-3b1a-4d26-bb21-2a1c0d750c05"; 
      const data = await listWorkingHours(DEMO_DOCTOR_ID);
      setWorkingHours(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: UpsertWorkingHoursRequest) => {
    try {
      setSaving(true);
      const DEMO_DOCTOR_ID = "619e0785-3b1a-4d26-bb21-2a1c0d750c05";
      await upsertWorkingHours({ ...data, doctorId: DEMO_DOCTOR_ID });
      await fetchWorkingHours();
    } catch (err) {
      console.error(err);
      alert('Failed to save working hours');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (day: WeekDay) => {
    try {
      setSaving(true);
      const DEMO_DOCTOR_ID = "619e0785-3b1a-4d26-bb21-2a1c0d750c05";
      await deleteWorkingHours(day, DEMO_DOCTOR_ID);
      await fetchWorkingHours();
    } catch (err) {
      console.error(err);
      alert('Failed to delete working hours');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Availability</h1>
        <p className="text-gray-500 mt-1">Set the times when you are available for appointments.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full" /></div>
      ) : (
        <WorkingHoursEditor 
          workingHours={workingHours}
          onSave={handleSave}
          onDelete={handleDelete}
          loading={saving}
        />
      )}
    </div>
  );
}
