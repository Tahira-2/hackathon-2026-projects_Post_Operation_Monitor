import type { AvailabilityStatus } from '../../types/specialist'

const DOT_CLASSES: Record<AvailabilityStatus, string> = {
  'available-now': 'bg-green-500',
  'available-soon': 'bg-green-500',
  'consulting': 'bg-orange-400',
  'in-surgery': 'bg-red-500',
}

interface AvailabilityBadgeProps {
  status: AvailabilityStatus
  label: string
}

export function AvailabilityBadge({ status, label }: AvailabilityBadgeProps) {
  return (
    <span className="flex items-center gap-1.5 text-sm text-primary">
      <span className={`h-2 w-2 rounded-full shrink-0 ${DOT_CLASSES[status]}`} />
      {label}
    </span>
  )
}
