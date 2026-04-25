interface ProgressBarProps {
  total: number
  current: number // 1-indexed
}

export function ProgressBar({ total, current }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={[
            'h-1.5 flex-1 rounded-full transition-colors',
            i < current ? 'bg-accent' : 'bg-border',
          ].join(' ')}
        />
      ))}
      <span className="ml-3 shrink-0 text-sm text-muted whitespace-nowrap">
        Step {current} of {total}
      </span>
    </div>
  )
}
