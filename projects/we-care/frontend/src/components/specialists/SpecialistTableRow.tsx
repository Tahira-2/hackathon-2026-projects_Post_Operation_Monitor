import type { DirectorySpecialist } from '../../types/specialist'

interface SpecialistTableRowProps {
  specialist: DirectorySpecialist
  onViewProfile: (id: string) => void
}

export function SpecialistTableRow({ specialist, onViewProfile }: SpecialistTableRowProps) {
  return (
    <tr className="hover:bg-base transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
            {specialist.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">{specialist.name}</p>
            <p className="text-xs text-muted">{specialist.credentials}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-sm text-primary">{specialist.specialty}</td>
      <td className="px-5 py-4 text-sm text-primary">{specialist.location}</td>
      <td className="px-5 py-4 text-right">
        <button
          onClick={() => onViewProfile(specialist.id)}
          className="text-sm font-medium text-accent hover:underline"
        >
          View Profile
        </button>
      </td>
    </tr>
  )
}
