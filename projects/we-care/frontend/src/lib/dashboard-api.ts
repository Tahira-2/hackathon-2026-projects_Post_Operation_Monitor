import { api } from './axios'
import type { Referral } from '../types/referral'
import type { ReferralViewType } from './referral-view'

export interface DashboardSummary {
  kpis: {
    totalReferrals: number
    pendingReferrals: number
    completedReferrals: number
    acceptedReferrals: number
  }
  monthlyTrend: Array<{ month: string; referrals: number }>
  bySpecialty: Array<{ specialty: string; count: number }>
  statusDistribution: Array<{ name: string; value: number; color: string }>
  recentReferrals: Referral[]
  aiInsight: string
}

export async function getDashboardSummary(viewType: ReferralViewType) {
  const response = await api.get<DashboardSummary>('/api/dashboard', {
    params: { type: viewType },
  })
  return response.data
}
