import type { ReactNode } from 'react'
import { Calendar, Clock, MapPin } from 'lucide-react'

interface AppointmentInfo {
  status: 'requested' | 'confirmed' | 'cancelled'
  month: string
  day: string
  type: string
  time: string
  location: string
  notes?: string | null
}

interface AppointmentCardProps {
  appointment: AppointmentInfo | null
  actions?: ReactNode
}

const STATUS_LABELS: Record<AppointmentInfo['status'], string> = {
  requested: 'Requested',
  confirmed: 'Confirmed',
  cancelled: 'Denied',
}

const STATUS_CLASSES: Record<AppointmentInfo['status'], string> = {
  requested: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}

export function AppointmentCard({ appointment, actions }: AppointmentCardProps) {
  if (!appointment) {
    return (
      <div className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Calendar size={16} className="text-muted" />
          <h3 className="font-semibold text-primary">Appointment Information</h3>
        </div>
        <div className="p-5">
          <div className="rounded-xl border border-dashed border-border bg-base p-4 text-sm text-muted">
            No appointment created yet.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
        <Calendar size={16} className="text-muted" />
        <h3 className="font-semibold text-primary">Appointment Information</h3>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASSES[appointment.status]}`}>
          {STATUS_LABELS[appointment.status]}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start gap-4 rounded-xl border border-border bg-base p-4">
          <div className="text-center shrink-0">
            <p className="text-xs font-bold uppercase text-red-500">{appointment.month}</p>
            <p className="text-3xl font-bold text-primary leading-none">{appointment.day}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-primary">{appointment.type}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Clock size={12} />
              {appointment.time}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <MapPin size={12} />
              {appointment.location}
            </div>
            {appointment.notes ? (
              <p className="pt-1 text-xs text-muted">{appointment.notes}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="mt-4 flex justify-end gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}
