import type { Urgency, ReferralStatus } from '../../types/referral'

export type BadgeVariant = Urgency | ReferralStatus

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  HIGH: 'bg-red-100 text-red-700',
  ELEVATED: 'bg-orange-100 text-orange-700',
  ROUTINE: 'bg-slate-100 text-slate-600',
  PENDING: 'bg-orange-100 text-orange-700',
  SENT: 'bg-slate-100 text-slate-600',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
}

interface BadgeProps {
  variant: BadgeVariant
  label?: string
}

export function Badge({ variant, label }: BadgeProps) {
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${VARIANT_CLASSES[variant]}`}>
      {label ?? variant}
    </span>
  )
}
