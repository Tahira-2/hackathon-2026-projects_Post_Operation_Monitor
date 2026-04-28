import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../ui/Button'
import { SpecialistCard } from './SpecialistCard'
import type { Specialist } from '../../types/specialist'

interface NewReferralStep3Props {
  requiredSpecialty: string
  specialists: Specialist[]
  onBack: () => void
  onSubmit: (specialistId: string) => void
  loading: boolean
}

export function NewReferralStep3({
  requiredSpecialty,
  specialists,
  onBack,
  onSubmit,
  loading,
}: NewReferralStep3Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted">Required Specialty:</p>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-primary tracking-wide">
          {requiredSpecialty}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {specialists.map((s) => (
          <SpecialistCard
            key={s.id}
            specialist={s}
            selected={selectedId === s.id}
            onSelect={setSelectedId}
          />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Clinical Details
        </button>
        <Button
          disabled={!selectedId}
          loading={loading}
          onClick={() => selectedId && onSubmit(selectedId)}
        >
          Submit Referral →
        </Button>
      </div>
    </div>
  )
}
