import type { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'

interface AiInsightCardProps {
  children: ReactNode
}

export function AiInsightCard({ children }: AiInsightCardProps) {
  return (
    <div className="rounded-xl border border-border border-l-4 border-l-ai bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold tracking-wide text-ai">AI INSIGHTS</p>
        <Sparkles size={16} className="text-ai" />
      </div>
      <p className="text-sm text-primary leading-relaxed">{children}</p>
    </div>
  )
}
