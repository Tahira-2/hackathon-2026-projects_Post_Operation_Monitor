import { api } from './axios';

export interface PatientReferral {
  id: string;
  diagnosis: string | null;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'sent' | 'accepted' | 'completed';
  clinical_notes: string;
  created_at: string;
  patients: { full_name: string; date_of_birth: string | null; gender: string | null };
  targetDoctor: { full_name: string; specialty: string; hospital: string; phone: string | null } | null;
}

export interface BookedAppointment {
  id: string;
  referral_id: string;
  preferred_date: string;
  time_slot: 'morning' | 'afternoon' | 'evening';
  status: string;
  created_at: string;
}

export async function getReferral(token: string): Promise<PatientReferral> {
  const { data } = await api.get<PatientReferral>(`/api/patient/${token}`);
  return data;
}

export async function bookAppointment(
  token: string,
  payload: {
    preferred_date: string;
    time_slot: 'morning' | 'afternoon' | 'evening';
    notes?: string;
  },
): Promise<BookedAppointment> {
  const { data } = await api.post<BookedAppointment>(
    `/api/patient/${token}/appointments`,
    payload,
  );
  return data;
}
