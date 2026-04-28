import { api } from './axios';

export interface ReferralDetail {
  id: string;
  clinical_notes: string;
  diagnosis: string | null;
  required_specialty: string | null;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'sent' | 'accepted' | 'completed';
  created_at: string;
  referred_by: string;
  doctor_id: string;
  patients: {
    full_name: string;
    date_of_birth: string | null;
    mrn: string | null;
    phone: string | null;
    email: string | null;
  };
  targetDoctor: {
    full_name: string;
    specialty: string;
    hospital: string;
  } | null;
  referredByDoctor: {
    full_name: string;
    specialty: string;
    hospital: string;
  } | null;
  appointment: {
    id: string;
    preferred_date: string;
    time_slot: 'morning' | 'afternoon' | 'evening';
    status: 'requested' | 'confirmed' | 'cancelled';
    notes: string | null;
  } | null;
  referral_status_history: { status: string; changed_at: string }[];
}

export async function getReferral(id: string): Promise<ReferralDetail> {
  const { data } = await api.get<ReferralDetail>(`/api/referrals/${id}`);
  return data;
}

export async function updateReferralStatus(
  id: string,
  status: 'pending' | 'sent' | 'accepted' | 'completed',
): Promise<{ patient_token?: string }> {
  const { data } = await api.patch(`/api/referrals/${id}/status`, { status });
  return data;
}

export async function updateReferralAppointmentStatus(
  id: string,
  status: 'confirmed' | 'cancelled',
): Promise<ReferralDetail['appointment']> {
  const { data } = await api.patch(`/api/referrals/${id}/appointment`, { status });
  return data;
}
