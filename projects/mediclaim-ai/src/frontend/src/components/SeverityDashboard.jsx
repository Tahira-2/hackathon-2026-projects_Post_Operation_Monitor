import { useState } from 'react'

const SEVERITY_CONFIG = {
  HIGH: { color: 'bg-red/5 border-red/20 text-red', icon: '🔴', bg: 'bg-red', label: 'Critical' },
  MEDIUM: { color: 'bg-amber-50 border-amber-200 text-amber-700', icon: '🟡', bg: 'bg-amber-500', label: 'Warning' },
  LOW: { color: 'bg-teal/5 border-teal/20 text-teal', icon: '🟢', bg: 'bg-teal', label: 'Info' },
}

export default function SeverityDashboard({ flags }) {
  const [expanded, setExpanded] = useState(null)

  if (!flags || flags.length === 0) {
    return (
      <div className="glass-card p-6 border border-line shadow-sm">
        <h3 className="text-[11px] font-bold text-slate uppercase tracking-wider mb-4">Severity Dashboard</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-teal font-semibold">No issues detected</p>
          <p className="text-sm text-slate-light mt-1">All charges appear within normal ranges</p>
        </div>
      </div>
    )
  }

  const grouped = { HIGH: [], MEDIUM: [], LOW: [] }
  flags.forEach(f => grouped[f.severity]?.push(f))

  return (
    <div className="glass-card p-6 border border-line shadow-sm">
      <h3 className="text-[11px] font-bold text-slate uppercase tracking-wider mb-4">Severity Dashboard</h3>

      {/* Summary bar */}
      <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-6 bg-paper">
        {Object.entries(grouped).map(([sev, items]) => {
          if (items.length === 0) return null
          const pct = (items.length / flags.length) * 100
          return <div key={sev} className={`${SEVERITY_CONFIG[sev].bg} transition-all`} style={{ width: `${pct}%` }} />
        })}
      </div>

      {/* Severity counts */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {Object.entries(grouped).map(([sev, items]) => (
          <div key={sev} className={`p-3 rounded-xl border ${SEVERITY_CONFIG[sev].color} text-center`}>
            <div className="text-2xl font-bold">{items.length}</div>
            <div className="text-xs mt-1">{SEVERITY_CONFIG[sev].label}</div>
          </div>
        ))}
      </div>

      {/* Flag list */}
      <div className="space-y-3">
        {flags.map((flag, idx) => {
          const cfg = SEVERITY_CONFIG[flag.severity]
          const isOpen = expanded === idx
          return (
            <div
              key={idx}
              className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 ${cfg.color}`}
              onClick={() => setExpanded(isOpen ? null : idx)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span>{cfg.icon}</span>
                  <div>
                    <p className="font-semibold text-sm">{flag.item}</p>
                    <p className="text-xs mt-1 opacity-75">
                      Charged: ${flag.charged.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      {flag.benchmark && (
                        <> • Benchmark: ${flag.benchmark.toLocaleString('en-US', { minimumFractionDigits: 2 })}</>
                      )}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${cfg.color} border`}>
                  {flag.severity}
                </span>
              </div>
              {isOpen && (
                <div className="mt-3 pt-3 border-t border-current/10 text-sm opacity-80">
                  {flag.reason}
                  {flag.covered_by_insurance && (
                    <span className="ml-2 text-xs text-teal font-medium">✓ Covered by insurance</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
