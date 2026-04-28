import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function CostComparison({ flags, items }) {
  // Build chart data from flags that have benchmarks
  const chartData = flags
    .filter(f => f.benchmark && f.benchmark > 0)
    .slice(0, 8)
    .map(f => ({
      name: f.item.length > 20 ? f.item.slice(0, 18) + '…' : f.item,
      charged: f.charged,
      benchmark: f.benchmark,
      severity: f.severity,
    }))

  if (chartData.length === 0) {
    // Show category breakdown instead
    const catTotals = {}
    ;(items || []).forEach(item => {
      catTotals[item.category] = (catTotals[item.category] || 0) + item.amount
    })
    const catData = Object.entries(catTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }))

    if (catData.length === 0) {
      return (
        <div className="glass-card p-6 border border-line shadow-sm">
          <h3 className="text-[11px] font-bold text-slate uppercase tracking-wider mb-4">Cost Breakdown</h3>
          <p className="text-slate-light text-center py-4 text-sm">No data to display</p>
        </div>
      )
    }

    const COLORS = ['#0f1f35', '#334155', '#64748b', '#0d9488', '#14b8a6', '#5eead4']

    return (
      <div className="glass-card p-6 border border-line shadow-sm">
        <h3 className="text-[11px] font-bold text-slate uppercase tracking-wider mb-4">Cost by Category</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={catData} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                labelStyle={{ color: '#0f1f35', fontWeight: 'bold', marginBottom: '4px' }}
                itemStyle={{ color: '#334155', fontSize: '13px' }}
                formatter={(v) => [`$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Amount']}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-6 border border-line shadow-sm">
      <h3 className="text-[11px] font-bold text-slate uppercase tracking-wider mb-4">
        Charged vs CMS Benchmark
      </h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 0, right: 10 }}>
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
              labelStyle={{ color: '#0f1f35', fontWeight: 'bold', marginBottom: '4px' }}
              itemStyle={{ fontSize: '13px' }}
              formatter={(v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            />
            <Bar dataKey="charged" name="Charged" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="benchmark" name="CMS Benchmark" fill="#0d9488" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red" /> Charged</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-teal" /> CMS Benchmark</span>
      </div>
    </div>
  )
}
