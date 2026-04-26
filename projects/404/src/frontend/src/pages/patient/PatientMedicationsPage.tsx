import { Pill, Info } from 'lucide-react';
import MedicationItem from '../../components/patient/MedicationItem';

export default function PatientMedicationsPage() {
  const medications = [
    { id: '1', name: 'Lisinopril', dosage: '10mg', timing: '8:00 AM', status: 'taken' as const },
    { id: '2', name: 'Atorvastatin', dosage: '20mg', timing: '8:00 PM', status: 'due' as const, instructions: 'Take with a full glass of water.' },
    { id: '3', name: 'Metformin', dosage: '500mg', timing: '1:00 PM', status: 'due' as const, instructions: 'Take with food to prevent upset stomach.' },
  ];

  const taken = medications.filter(m => m.status === 'taken');
  const due = medications.filter(m => m.status === 'due');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Medications</h1>
        <p className="text-gray-500 mt-1">Manage your prescriptions and daily schedule.</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Info className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
        <div>
          <h4 className="font-medium text-blue-900">Refill Reminder</h4>
          <p className="text-sm text-blue-800 mt-1">You have 2 prescriptions (Lisinopril, Atorvastatin) due for a refill in the next 7 days.</p>
        </div>
      </div>

      <div className="space-y-6">
        {due.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Due Today</h2>
            {due.map(med => (
              <MedicationItem key={med.id} {...med} />
            ))}
          </div>
        )}

        {taken.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-900">Taken</h2>
            {taken.map(med => (
              <MedicationItem key={med.id} {...med} />
            ))}
          </div>
        )}

        {medications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <Pill size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No active medications</h3>
            <p className="text-gray-500 mt-1">Your doctor hasn't prescribed any medications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
