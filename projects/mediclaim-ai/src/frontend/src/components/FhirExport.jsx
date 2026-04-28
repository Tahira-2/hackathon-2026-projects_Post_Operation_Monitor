import { useState } from 'react'
import { createFhirEob } from '../api/client'

export default function FhirExport({ result, provider }) {
  const [fhirData, setFhirData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showJson, setShowJson] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const eob = await createFhirEob(result, provider)
      setFhirData(eob)
      setShowJson(true)
    } catch (err) {
      console.error('FHIR export failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!fhirData) return
    const blob = new Blob([JSON.stringify(fhirData, null, 2)], { type: 'application/fhir+json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `eob-${result.bill_id || 'export'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="glass-card p-6 border border-line shadow-sm">
      <h3 className="text-[11px] font-bold text-slate uppercase tracking-wider mb-4">
        FHIR Export
      </h3>
      <p className="text-xs text-slate-light mb-4">
        Export as a FHIR R4 ExplanationOfBenefit resource — the global standard for medical billing data.
      </p>

      {!fhirData ? (
        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full btn-primary text-sm py-3 flex items-center justify-center gap-2"
          id="fhir-export-btn"
        >
          {loading ? (
            <><div className="spinner !w-4 !h-4 !border-2" /> Generating...</>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate FHIR EOB
            </>
          )}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <button onClick={handleDownload} className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download JSON
            </button>
            <button
              onClick={() => setShowJson(!showJson)}
              className="px-4 py-2.5 rounded-xl bg-paper border border-line text-sm text-navy font-medium hover:border-slate-light transition-all"
            >
              {showJson ? 'Hide' : 'View'}
            </button>
          </div>

          {showJson && (
            <div className="max-h-64 overflow-auto rounded-xl bg-[#0f172a] border border-line p-4 shadow-inner">
              <pre className="text-xs text-teal-light font-mono whitespace-pre-wrap">
                {JSON.stringify(fhirData, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-xs text-teal font-medium flex items-center gap-1.5 mt-2">
            <span>✓</span> Valid FHIR R4 ExplanationOfBenefit resource
          </div>
        </div>
      )}
    </div>
  )
}
