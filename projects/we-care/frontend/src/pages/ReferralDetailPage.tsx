import { ArrowLeft, Send, Printer } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { PatientInfoCard } from '../components/referrals/PatientInfoCard'
import { ClinicalNoteCard } from '../components/referrals/ClinicalNoteCard'
import { ReferralSummaryCard } from '../components/referrals/ReferralSummaryCard'
import { AppointmentCard } from '../components/referrals/AppointmentCard'
import { StatusTimeline } from '../components/referrals/StatusTimeline'
import type { TimelineEvent } from '../components/referrals/StatusTimeline'

const MOCK_PATIENT = {
  fullName: 'Eleanor R. Thompson',
  dob: 'Mar 12, 1954 (69 yrs)',
  mrn: 'MRN-9982-441-A',
  contact: '(555) 019-2834',
  insurance: 'Medicare Advantage Plus (ID: 92837492A)',
}

const MOCK_NOTE = `CHIEF COMPLAINT:
Patient presents with worsening dyspnea on exertion and atypical chest pain over the last 3 weeks.

HPI:
69 y/o female with a history of HTN and hyperlipidemia. Reports feeling "winded" after walking up one flight of stairs. Chest pain is described as a dull ache, non-radiating, lasting 5-10 minutes, relieved by rest. No diaphoresis or palpitations.

OBJECTIVE:
BP: 142/88  HR: 78  RR: 18  Temp: 98.6F  SpO2: 96% on RA
CV: RRR, no murmurs, rubs, or gallops.
Resp: CTA bilaterally, no wheezes or crackles.

ASSESSMENT:
1. New onset exertional dyspnea and atypical angina.
2. Uncontrolled essential hypertension.

PLAN:`

const MOCK_APPOINTMENT = {
  month: 'NOV',
  day: '02',
  type: 'Initial Consultation',
  time: '10:30 AM EST',
  location: 'Main Campus, Suite 400',
}

const MOCK_TIMELINE: TimelineEvent[] = [
  { label: 'Scheduled', timestamp: 'Oct 26, 2023 • 14:20 PM', completed: true },
  { label: 'Accepted by Specialist', timestamp: 'Oct 25, 2023 • 09:10 AM', completed: true },
  { label: 'Sent to Cardiology Specialists', timestamp: 'Oct 24, 2023 • 09:20 AM', completed: true },
  { label: 'Pending Review', timestamp: 'Oct 24, 2023 • 09:15 AM', completed: false },
]

export default function ReferralDetailPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="mt-1 flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted hover:bg-base hover:text-primary transition-colors"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-primary">REF-2023-8942</h2>
              <span className="text-xs font-semibold uppercase text-orange-600">Urgent</span>
              <span className="text-xs font-semibold uppercase text-accent">Accepted</span>
            </div>
            <p className="text-xs text-muted mt-0.5">Created on Oct 24, 2023 • 09:15 AM</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Printer size={14} />
            Print Referral
          </Button>
          <Button variant="ghost" size="sm">
            <Send size={14} />
            Resend Notification
          </Button>
          <Button size="sm">Update Status</Button>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-[1fr_380px] gap-5 items-start">
        {/* Left */}
        <div className="space-y-5">
          <PatientInfoCard patient={MOCK_PATIENT} onEdit={() => {}} />
          <ClinicalNoteCard note={MOCK_NOTE} />
        </div>

        {/* Right */}
        <div className="space-y-5">
          <ReferralSummaryCard
            icdCode="I20.9"
            diagnosis="Angina pectoris, unspecified"
            referredToName="Dr. Michael Sterling"
            referredToInitials="MS"
            referredToOrg="Cardiology Specialists Group"
            referredBy="Dr. Sarah Jenkins (Primary Care)"
          />
          <AppointmentCard appointment={MOCK_APPOINTMENT} />
          <StatusTimeline events={MOCK_TIMELINE} />
        </div>
      </div>
    </div>
  )
}
