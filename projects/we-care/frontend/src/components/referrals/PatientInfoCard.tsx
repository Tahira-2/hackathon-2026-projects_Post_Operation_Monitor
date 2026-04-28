import { User, Pencil } from 'lucide-react'
import { InfoField } from '../ui/InfoField'

interface PatientInfo {
  fullName: string
  dob: string
  mrn: string
  contact: string
}

interface PatientInfoCardProps {
  patient: PatientInfo
  onEdit?: () => void
}

export function PatientInfoCard({ patient, onEdit }: PatientInfoCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <User size={16} className="text-muted" />
          <h3 className="font-semibold text-primary">Patient Information</h3>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            <Pencil size={12} />
            Edit
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 p-5">
        <InfoField label="Full Name" value={patient.fullName} />
        <InfoField label="Date of Birth" value={patient.dob} />
        <InfoField label="MRN / ID" value={patient.mrn} />
        <InfoField label="Contact" value={patient.contact} />
      </div>
    </div>
  )
}
