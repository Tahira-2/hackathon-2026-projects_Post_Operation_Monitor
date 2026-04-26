import { api } from './axios';

export interface ReferralDetail {
  id: string;
  clinical_notes: string;
  diagnosis: string | null;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'sent' | 'accepted' | 'completed';
  created_at: string;
  patients: {
    full_name: string;
    date_of_birth: string | null;
    mrn: string | null;
    phone: string | null;
    email: string | null;
  };
  specialists: {
    full_name: string;
    specialty: string;
    hospital: string;
  };
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
