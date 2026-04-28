import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  icon: ReactNode
  sub: ReactNode
}

export function StatCard({ label, value, icon, sub }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
        {icon}
      </div>
      <p className="text-3xl font-bold text-primary">{value}</p>
      <div className="mt-1">{sub}</div>
    </div>
  )
}
