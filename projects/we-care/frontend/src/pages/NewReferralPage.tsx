import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stepper } from '../components/ui/Stepper'
import { NewReferralStep1 } from '../components/referrals/NewReferralStep1'
import { NewReferralStep2 } from '../components/referrals/NewReferralStep2'
import { NewReferralStep3 } from '../components/referrals/NewReferralStep3'
import type { ExtractedData } from '../types/referral'
import type { Specialist } from '../types/specialist'

const STEPS = [
  { label: 'Write Note' },
  { label: 'Review' },
  { label: 'Select Specialist' },
]

const MOCK_SPECIALISTS: Specialist[] = [
  { id: '1', name: 'Dr. Sarah Jenkins', initials: 'SJ', subspecialty: 'Interventional Cardiology', hospital: 'Mercy General Hospital', phone: '(555) 284-9102', available: true },
  { id: '2', name: 'Dr. Michael Chang', initials: 'MC', subspecialty: 'General Cardiology', hospital: 'City Cardiovascular Center', phone: '(555) 837-1193', available: true },
  { id: '3', name: 'Dr. Emily Roa', initials: 'ER', subspecialty: 'Electrophysiology', hospital: 'University Medical Group', phone: '(555) 441-0092', available: false },
  { id: '4', name: 'Dr. David Lin', initials: 'DL', subspecialty: 'General Cardiology', hospital: 'Mercy General Hospital', phone: '(555) 284-7731', available: true },
]

const MOCK_EXTRACTED: ExtractedData = {
  patientName: 'John Doe',
  dob: '05/12/1984',
  gender: 'Male',
  email: 'j.doe@email.com',
  phone: '(555) 123-4567',
  requiredSpecialty: 'Cardiology',
  diagnosis: 'Atypical chest pain, possible cardiac origin. Positive stress test.',
  urgency: 'Urgent',
}

export default function NewReferralPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [clinicalNote, setClinicalNote] = useState('')
  const [extracted, setExtracted] = useState<ExtractedData | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleExtract(note: string) {
    setExtracting(true)
    setClinicalNote(note)
    // TODO: replace with real Gemini API call
    await new Promise((r) => setTimeout(r, 1500))
    setExtracted(MOCK_EXTRACTED)
    setExtracting(false)
    setStep(2)
  }

  function handleConfirm(data: ExtractedData) {
    setExtracted(data)
    setStep(3)
  }

  async function handleSubmit(_specialistId: string) {
    setSubmitting(true)
    // TODO: replace with real API call
    await new Promise((r) => setTimeout(r, 1000))
    setSubmitting(false)
    navigate('/')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary">New Referral</h2>
        <p className="text-sm text-muted mt-0.5">Initiate a new patient referral journey.</p>
      </div>

      <Stepper steps={STEPS} current={step} />

      {step === 1 && (
        <NewReferralStep1 onExtract={handleExtract} loading={extracting} />
      )}
      {step === 2 && extracted && (
        <NewReferralStep2
          clinicalNote={clinicalNote}
          extracted={extracted}
          onBack={() => setStep(1)}
          onConfirm={handleConfirm}
        />
      )}
      {step === 3 && extracted && (
        <NewReferralStep3
          requiredSpecialty={extracted.requiredSpecialty}
          specialists={MOCK_SPECIALISTS}
          onBack={() => setStep(2)}
          onSubmit={handleSubmit}
          loading={submitting}
        />
      )}
    </div>
  )
}
