export type ReferralViewType = 'inbound' | 'outbound' | 'pending'

export const DEFAULT_REFERRAL_VIEW: ReferralViewType = 'inbound'

export const REFERRAL_VIEW_LABELS: Record<ReferralViewType, { title: string; subtitle: string }> = {
  inbound: {
    title: 'Inbound Referrals',
    subtitle: 'Patients assigned to you by other providers.',
  },
  outbound: {
    title: 'Outbound Referrals',
    subtitle: 'Patients you referred to another doctor for follow-up care.',
  },
  pending: {
    title: 'Pending Referrals',
    subtitle: 'Inbound referrals waiting on your next action.',
  },
}

export function normalizeReferralViewType(value: string | null | undefined): ReferralViewType {
  if (value === 'inbound' || value === 'outbound' || value === 'pending') {
    return value
  }

  return DEFAULT_REFERRAL_VIEW
}
