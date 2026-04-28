import { useState } from 'react'
import type { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '../ui/Button'
import type { ExtractedData } from '../../types/referral'

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']
const URGENCY_OPTIONS = ['Routine', 'Elevated', 'Urgent']

interface NewReferralStep2Props {
  clinicalNote: string
  extracted: ExtractedData
  specialtyOptions: string[]
  onBack: () => void
  onConfirm: (data: ExtractedData) => void
}

function AiLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-1">
      <label className="text-xs font-medium text-muted">{children}</label>
      <Sparkles size={12} className="text-ai" />
    </div>
  )
}

const inputCls = 'w-full rounded-lg border-2 border-ai/40 bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:border-ai'
const selectCls = `${inputCls} appearance-none cursor-pointer`

export function NewReferralStep2({
  clinicalNote,
  extracted,
  specialtyOptions,
  onBack,
  onConfirm,
}: NewReferralStep2Props) {
  const [data, setData] = useState<ExtractedData>(extracted)
  const isEmailValid = data.email.trim().length > 0

  function update(field: keyof ExtractedData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        {/* Original note */}
        <div className="w-80 shrink-0 rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-xs font-semibold text-muted">Original Clinical Note</p>
          </div>
          <pre className="whitespace-pre-wrap p-4 text-xs text-muted font-sans leading-relaxed">
            {clinicalNote}
          </pre>
        </div>

        {/* Extracted fields */}
        <div className="flex-1 rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <p className="text-xs font-semibold text-primary">Extracted Information</p>
            <span className="flex items-center gap-1 rounded-full bg-ai/10 px-2 py-0.5 text-xs font-semibold text-ai">
              <Sparkles size={10} /> AI Extracted
            </span>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <AiLabel>Patient Name</AiLabel>
                <input className={inputCls} value={data.patientName} onChange={(e) => update('patientName', e.target.value)} />
              </div>
              <div>
                <AiLabel>Date of Birth</AiLabel>
                <input className={inputCls} value={data.dob} onChange={(e) => update('dob', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <AiLabel>Gender</AiLabel>
                <select className={selectCls} value={data.gender} onChange={(e) => update('gender', e.target.value)}>
                  {GENDER_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <AiLabel>Email</AiLabel>
                <input
                  type="email"
                  className={inputCls}
                  value={data.email}
                  onChange={(e) => update('email', e.target.value)}
                />
                {!isEmailValid ? (
                  <p className="mt-1 text-xs text-red-600">Email is required to send the referral portal link.</p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <AiLabel>Phone</AiLabel>
                <input className={inputCls} value={data.phone} onChange={(e) => update('phone', e.target.value)} />
              </div>
            </div>

            <div>
              <AiLabel>Required Specialty</AiLabel>
              <select
                className={selectCls}
                value={data.requiredSpecialty}
                onChange={(e) => update('requiredSpecialty', e.target.value)}
              >
                {specialtyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <AiLabel>Diagnosis / Impression</AiLabel>
              <textarea
                rows={2}
                className={`${inputCls} resize-none`}
                value={data.diagnosis}
                onChange={(e) => update('diagnosis', e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-muted">Urgency Level</label>
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 uppercase">
                    {data.urgency}
                  </span>
                  <Sparkles size={12} className="text-ai" />
                </div>
              </div>
              <select className={selectCls} value={data.urgency} onChange={(e) => update('urgency', e.target.value)}>
                {URGENCY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button disabled={!isEmailValid} onClick={() => onConfirm(data)}>
          Confirm and Continue →
        </Button>
      </div>
    </div>
  )
}
