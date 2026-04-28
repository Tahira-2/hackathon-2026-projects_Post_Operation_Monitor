import { Check } from 'lucide-react'

interface Step {
  label: string
}

interface StepperProps {
  steps: Step[]
  current: number // 1-indexed
}

export function Stepper({ steps, current }: StepperProps) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, i) => {
        const index = i + 1
        const completed = index < current
        const active = index === current

        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  completed ? 'bg-primary text-white' : '',
                  active ? 'bg-accent text-white' : '',
                  !completed && !active ? 'border-2 border-border text-muted bg-surface' : '',
                ].join(' ')}
              >
                {completed ? <Check size={14} strokeWidth={3} /> : index}
              </div>
              <span
                className={[
                  'text-sm font-medium whitespace-nowrap',
                  active ? 'text-accent' : '',
                  completed ? 'text-primary' : '',
                  !active && !completed ? 'text-muted' : '',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="mx-4 h-px flex-1 bg-border" />
            )}
          </div>
        )
      })}
    </div>
  )
}
