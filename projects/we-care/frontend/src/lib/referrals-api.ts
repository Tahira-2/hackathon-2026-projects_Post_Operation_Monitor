import { api } from './axios'
import type { Referral } from '../types/referral'
import type { ReferralViewType } from './referral-view'

interface ReferralApiItem {
  id: string
  diagnosis: string | null
  required_specialty: string | null
  urgency: 'low' | 'medium' | 'high'
  status: 'pending' | 'sent' | 'accepted' | 'completed'
  created_at: string
  patients: { id: string; full_name: string } | Array<{ id: string; full_name: string }> | null
  targetDoctor?: {
    id: string
    full_name: string
    contact_number: string | null
    specialty: string
    hospital: string
  } | null
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

function toReferralUrgency(urgency: ReferralApiItem['urgency']): Referral['urgency'] {
  if (urgency === 'high') return 'HIGH'
  if (urgency === 'medium') return 'ELEVATED'
  return 'ROUTINE'
}

function toReferralStatus(status: ReferralApiItem['status']): Referral['status'] {
  return status.toUpperCase() as Referral['status']
}

function mapReferral(item: ReferralApiItem): Referral {
  const patient = Array.isArray(item.patients) ? item.patients[0] : item.patients

  return {
    id: item.id,
    patient: patient?.full_name ?? 'Unknown Patient',
    diagnosis: item.diagnosis ?? 'Unspecified diagnosis',
    specialty: item.required_specialty ?? item.targetDoctor?.specialty ?? 'General',
    specialist: item.targetDoctor?.full_name ?? 'Unassigned',
    urgency: toReferralUrgency(item.urgency),
    status: toReferralStatus(item.status),
    date: new Date(item.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  }
}

export async function getReferrals(viewType: ReferralViewType, page = 1, pageSize = 10) {
  const response = await api.get<PaginatedResponse<ReferralApiItem>>('/api/referrals', {
    params: { type: viewType, page, pageSize },
  })

  return {
    ...response.data,
    items: response.data.items.map(mapReferral),
  }
}
