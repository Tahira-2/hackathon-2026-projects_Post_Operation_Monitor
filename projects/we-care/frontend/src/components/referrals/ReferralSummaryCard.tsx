import { Info } from 'lucide-react'

interface ReferralSummaryProps {
  icdCode: string
  diagnosis: string
  referredToName: string
  referredToInitials: string
  referredToOrg: string
  referredBy: string
}

export function ReferralSummaryCard({
  icdCode,
  diagnosis,
  referredToName,
  referredToInitials,
  referredToOrg,
  referredBy,
}: ReferralSummaryProps) {
  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <Info size={16} className="text-muted" />
        <h3 className="font-semibold text-primary">Referral Summary</h3>
      </div>
      <div className="divide-y divide-border">
        <div className="px-5 py-4">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase mb-2">Primary Diagnosis</p>
          <div className="flex items-center gap-2">
            <span className="rounded border border-border bg-base px-2 py-0.5 text-xs font-mono font-semibold text-primary">
              {icdCode}
            </span>
            <span className="text-sm text-primary">{diagnosis}</span>
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase mb-2">Referred To</p>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
              {referredToInitials}
            </div>
            <div>
              <p className="text-sm font-medium text-primary">{referredToName}</p>
              <p className="text-xs text-muted">{referredToOrg}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase mb-1">Referred By</p>
          <p className="text-sm text-primary">{referredBy}</p>
        </div>
      </div>
    </div>
  )
}
