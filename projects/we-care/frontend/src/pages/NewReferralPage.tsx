import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stepper } from '../components/ui/Stepper'
import { NewReferralStep1 } from '../components/referrals/NewReferralStep1'
import { NewReferralStep2 } from '../components/referrals/NewReferralStep2'
import { NewReferralStep3 } from '../components/referrals/NewReferralStep3'
import { useDoctorProfileLookupsQuery } from '../lib/auth-hooks'
import { api } from '../lib/axios'
import type { ExtractedData } from '../types/referral'
import type { Specialist } from '../types/specialist'

const STEPS = [
  { label: 'Write Note' },
  { label: 'Review' },
  { label: 'Select Specialist' },
]

const URGENCY_MAP: Record<string, 'low' | 'medium' | 'high'> = {
  Routine: 'low',
  Elevated: 'medium',
  Urgent: 'high',
  low: 'low',
  medium: 'medium',
  high: 'high',
}

const GENDER_MAP: Record<string, string> = {
  Male: 'male',
  Female: 'female',
  'Non-binary': 'other',
  'Prefer not to say': 'other',
}

function toInitials(name: string) {
  return name
    .replace(/^Dr\.\s*/i, '')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function NewReferralPage() {
  const navigate = useNavigate()
  const doctorLookupsQuery = useDoctorProfileLookupsQuery()
  const [step, setStep] = useState(1)
  const [clinicalNote, setClinicalNote] = useState('')
  const [extracted, setExtracted] = useState<ExtractedData | null>(null)
  const [specialists, setSpecialists] = useState<Specialist[]>([])
  const [extracting, setExtracting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const specialtyOptions = doctorLookupsQuery.data?.specialties ?? []

  async function handleExtract(note: string) {
    setExtracting(true)
    setClinicalNote(note)
    const { data } = await api.post('/api/extract', { notes: note })
    setExtracted({
      patientName: data.patient_name ?? '',
      dob: data.date_of_birth ?? '',
      gender: 'Male',
      email: data.email ?? '',
      phone: '',
      requiredSpecialty: data.required_specialty ?? '',
      diagnosis: data.diagnosis ?? '',
      urgency: data.urgency === 'high' ? 'Urgent' : data.urgency === 'medium' ? 'Elevated' : 'Routine',
    })
    setExtracting(false)
    setStep(2)
  }

  async function handleConfirm(data: ExtractedData) {
    setExtracted(data)
    const { data: resp } = await api.get('/api/specialists', {
      params: { specialty: data.requiredSpecialty, pageSize: 100 },
    })
    const list = resp.items ?? resp
    setSpecialists(
      list.map((s: {
        id: string
        full_name: string
        avatar_url?: string | null
        specialty: string
        hospital: string
        location?: string
        phone: string
        available: boolean
      }) => ({
        id: s.id,
        name: s.full_name,
        initials: toInitials(s.full_name),
        subspecialty: s.specialty,
        hospital: s.hospital,
        location: s.location ?? '',
        phone: s.phone,
        avatarUrl: s.avatar_url ?? null,
        available: s.available ?? true,
      }))
    )
    setStep(3)
  }

  async function handleSubmit(specialistId: string) {
    if (!extracted) return
    setSubmitting(true)
    const { data } = await api.post('/api/referrals', {
      patient: {
        full_name: extracted.patientName,
        date_of_birth: extracted.dob || undefined,
        gender: GENDER_MAP[extracted.gender] ?? 'other',
        email: extracted.email || undefined,
        phone: extracted.phone || undefined,
      },
      referral: {
        doctor_id: specialistId,
        clinical_notes: clinicalNote,
        diagnosis: extracted.diagnosis,
        required_specialty:
          specialists.find((specialist) => specialist.id === specialistId)?.subspecialty ??
          extracted.requiredSpecialty,
        urgency: URGENCY_MAP[extracted.urgency] ?? 'low',
      },
    })
    setSubmitting(false)
    navigate(`/referrals/${data.referral.id}`)
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
          specialtyOptions={specialtyOptions}
          onBack={() => setStep(1)}
          onConfirm={handleConfirm}
        />
      )}
      {step === 3 && extracted && (
        <NewReferralStep3
          requiredSpecialty={extracted.requiredSpecialty}
          specialists={specialists}
          onBack={() => setStep(2)}
          onSubmit={handleSubmit}
          loading={submitting}
        />
      )}
    </div>
  )
}
