import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import SeverityDashboard from '../components/SeverityDashboard'
import LineItemTable from '../components/LineItemTable'
import CostComparison from '../components/CostComparison'
import FhirExport from '../components/FhirExport'
import InsuranceSelector from '../components/InsuranceSelector'
import { getCoverage, getInsuranceProviders } from '../api/client'

export default function Results() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [provider, setProvider] = useState(state?.provider || 'BlueCross')
  const [providers, setProviders] = useState([])
  const [coverage, setCoverage] = useState(null)

  const result = state?.result
  if (!result) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-slate text-lg mb-6">No analysis results found.</p>
        <button onClick={() => navigate('/')} className="btn-primary px-8 py-3 text-lg text-white" style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', border: 'none' }}>
          Upload a Bill
        </button>
      </div>
    )
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    getInsuranceProviders().then(setProviders).catch(() => {})
  }, [])

  useEffect(() => {
    if (result.total_charged > 0) {
      getCoverage(provider, result.total_charged)
        .then(setCoverage)
        .catch(() => setCoverage(null))
    }
  }, [provider, result.total_charged])

  const highCount = result.flags.filter(f => f.severity === 'HIGH').length
  const medCount = result.flags.filter(f => f.severity === 'MEDIUM').length
  const lowCount = result.flags.filter(f => f.severity === 'LOW').length

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <button
            onClick={() => navigate('/')}
            className="text-slate hover:text-navy text-sm font-medium flex items-center gap-1 mb-2 transition-colors"
          >
            ← Back to Upload
          </button>
          <h1 className="text-3xl font-serif font-bold text-navy">
            Bill Analysis <span className="text-teal">Complete</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-slate-light bg-paper px-3 py-1 rounded-md border border-line">ID: {result.bill_id?.slice(0, 8)}...</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
        <div className="glass-card p-6 border border-line shadow-sm">
          <div className="text-[11px] font-bold text-slate uppercase tracking-wider mb-2">Total Charged</div>
          <div className="text-3xl font-bold text-navy">${result.total_charged.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="glass-card p-6 border border-line shadow-sm">
          <div className="text-[11px] font-bold text-slate uppercase tracking-wider mb-2">Est. Covered</div>
          <div className="text-3xl font-bold text-teal">${result.estimated_covered.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="glass-card p-6 border border-line shadow-sm">
          <div className="text-[11px] font-bold text-slate uppercase tracking-wider mb-2">Out of Pocket</div>
          <div className="text-3xl font-bold text-amber-500">${result.out_of_pocket.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="glass-card p-6 border border-line shadow-sm">
          <div className="text-[11px] font-bold text-slate uppercase tracking-wider mb-2">Issues Found</div>
          <div className="text-3xl font-bold">
            <span className="text-red">{highCount}</span>
            <span className="text-slate-light mx-1 font-normal">/</span>
            <span className="text-amber-500">{medCount}</span>
            <span className="text-slate-light mx-1 font-normal">/</span>
            <span className="text-teal">{lowCount}</span>
          </div>
        </div>
      </div>

      {/* Switch Insurance */}
      <div className="glass-card p-6 mb-8 animate-slide-up border border-line shadow-sm" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-navy flex items-center gap-2">
            🛡️ Insurance Coverage
          </h2>
          {coverage && (
            <span className="text-sm font-medium text-slate-light bg-paper px-3 py-1 rounded-md border border-line">{coverage.plan_name}</span>
          )}
        </div>
        <InsuranceSelector providers={providers} selected={provider} onSelect={setProvider} compact />
        {coverage && (
          <div className="mt-5 grid grid-cols-2 gap-4">
            {coverage.coverage_details.map((d, i) => (
              <div key={i} className="text-sm text-slate flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                {d}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Severity + Flags */}
        <div className="lg:col-span-2 space-y-8">
          {/* Severity Dashboard */}
          <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <SeverityDashboard flags={result.flags} />
          </div>

          {/* Line Items */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <LineItemTable items={result.line_items} />
          </div>
        </div>

        {/* Right: Cost Comparison + FHIR + Summary */}
        <div className="space-y-8">
          <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <CostComparison flags={result.flags} items={result.line_items} />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <FhirExport result={result} provider={provider} />
          </div>
          {/* Summary */}
          <div className="glass-card p-6 animate-slide-up border border-line shadow-sm" style={{ animationDelay: '0.35s' }}>
            <h3 className="text-[11px] font-bold text-slate uppercase tracking-wider mb-3">AI Summary</h3>
            <div className="text-sm text-slate leading-relaxed whitespace-pre-line">
              {result.summary_text}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              Estimated values — verify with your insurer for exact coverage.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
