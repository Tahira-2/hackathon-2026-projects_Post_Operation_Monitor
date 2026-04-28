export default function LineItemTable({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="glass-card p-6 border border-line shadow-sm">
        <h3 className="text-[11px] font-bold text-slate uppercase tracking-wider mb-4">Line Items</h3>
        <p className="text-slate-light text-center py-6">No line items extracted</p>
      </div>
    )
  }

  const total = items.reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="glass-card p-6 border border-line shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold text-slate uppercase tracking-wider">
          Line Items ({items.length})
        </h3>
        <span className="text-sm font-bold text-navy">
          Total: ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-bold text-slate-light uppercase tracking-wider border-b border-line">
              <th className="pb-3 pr-4">Description</th>
              <th className="pb-3 pr-4">CPT</th>
              <th className="pb-3 pr-4">Category</th>
              <th className="pb-3 pr-4 text-right">Amount</th>
              <th className="pb-3 text-center">Verified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-paper transition-colors">
                <td className="py-3 pr-4">
                  <span className="text-navy font-medium">{item.description}</span>
                  {item.rxnorm_id && (
                    <span className="ml-2 text-xs font-mono text-teal bg-teal/10 px-1.5 py-0.5 rounded">RxNorm: {item.rxnorm_id}</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  {item.cpt_code ? (
                    <span className="px-2 py-0.5 rounded bg-paper border border-line text-xs font-mono text-slate">
                      {item.cpt_code}
                    </span>
                  ) : (
                    <span className="text-slate-light">—</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <span className="text-xs text-slate">{item.category}</span>
                </td>
                <td className="py-3 pr-4 text-right font-semibold text-navy">
                  ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 text-center">
                  {item.fda_verified === true && <span className="text-teal font-bold" title="FDA verified">✓</span>}
                  {item.fda_verified === false && <span className="text-amber-500 font-bold" title="Not verified">?</span>}
                  {item.fda_verified == null && <span className="text-slate-light">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
