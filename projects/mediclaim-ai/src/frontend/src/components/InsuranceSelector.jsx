const PLAN_ICONS = {
  BlueCross: '💙', Aetna: '🔷', UnitedHealth: '🟢', Cigna: '🟠', Medicare: '🏛️',
}

export default function InsuranceSelector({ providers, selected, onSelect, compact }) {
  if (!providers || providers.length === 0) {
    const fallback = ['BlueCross', 'Aetna', 'UnitedHealth', 'Cigna', 'Medicare']
    return (
      <div className={`grid ${compact ? 'grid-cols-5' : 'grid-cols-2 md:grid-cols-5'} gap-3`}>
        {fallback.map((p) => (
          <button
            key={p}
            onClick={() => onSelect(p)}
            className={`p-3 rounded-xl border text-sm font-medium transition-all duration-200 flex flex-col items-center gap-2 ${
              selected === p
                ? 'bg-navy border-navy text-white shadow-md -translate-y-px'
                : 'bg-paper border-line text-navy hover:border-slate-light hover:bg-white shadow-sm'
            }`}
            id={`insurance-${p.toLowerCase()}`}
          >
            <span className="mr-1">{PLAN_ICONS[p] || '🏥'}</span>
            {compact ? '' : p}
            {compact && <span className="text-xs block mt-0.5">{p}</span>}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid ${compact ? 'grid-cols-5' : 'grid-cols-2 md:grid-cols-5'} gap-3`}>
      {providers.map((plan) => (
        <button
          key={plan.provider}
          onClick={() => onSelect(plan.provider)}
          className={`${compact ? 'p-3' : 'p-4'} rounded-xl border text-center transition-all duration-200 flex flex-col items-center gap-2 ${
            selected === plan.provider
              ? 'bg-navy border-navy shadow-md -translate-y-px text-white'
              : 'bg-paper border-line hover:border-slate-light hover:bg-white shadow-sm text-navy'
          }`}
          id={`insurance-${plan.provider.toLowerCase()}`}
        >
          <div className="text-2xl mb-1">{PLAN_ICONS[plan.provider] || '🏥'}</div>
          <div className={`font-bold ${compact ? 'text-xs' : 'text-sm'}`}>
            {plan.provider}
          </div>
          {!compact && (
            <>
              <div className={`text-xs font-mono opacity-60`}>{plan.plan_type}</div>
              <div className={`text-xs font-mono opacity-60`}>{(plan.coverage_percentage * 100).toFixed(0)}% coverage</div>
            </>
          )}
        </button>
      ))}
    </div>
  )
}
