import { Calendar, Clock, MapPin } from 'lucide-react'

interface AppointmentInfo {
  month: string
  day: string
  type: string
  time: string
  location: string
}

interface AppointmentCardProps {
  appointment: AppointmentInfo
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <Calendar size={16} className="text-muted" />
        <h3 className="font-semibold text-primary">Appointment Information</h3>
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
          </div>
        </div>
      </div>
    </div>
  )
}
