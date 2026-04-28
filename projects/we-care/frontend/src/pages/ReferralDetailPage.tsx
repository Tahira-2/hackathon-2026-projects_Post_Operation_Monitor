import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, Copy, Link, Send } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppointmentCard } from '../components/referrals/AppointmentCard'
import { ClinicalNoteCard } from '../components/referrals/ClinicalNoteCard'
import { PatientInfoCard } from '../components/referrals/PatientInfoCard'
import { ReferralSummaryCard } from '../components/referrals/ReferralSummaryCard'
import { StatusTimeline } from '../components/referrals/StatusTimeline'
import { Button } from '../components/ui/Button'
import {
  getReferral,
  updateReferralAppointmentStatus,
  updateReferralStatus,
} from '../lib/referral-api'
import { useAuthStore } from '../stores/authStore'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  sent: 'Sent',
  accepted: 'Accepted',
  completed: 'Completed',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-slate-500',
  sent: 'text-blue-600',
  accepted: 'text-emerald-600',
  completed: 'text-emerald-800',
}

const URGENCY_COLORS: Record<string, string> = {
  low: 'text-emerald-600',
  medium: 'text-orange-500',
  high: 'text-red-600',
}

const TIMELINE_LABELS: Record<string, string> = {
  pending: 'Pending Review',
  sent: 'Sent to Specialist',
  accepted: 'Accepted by Specialist',
  completed: 'Completed',
}

const NEXT_STATUSES: Record<string, string[]> = {
  pending: ['sent'],
  sent: ['accepted'],
  accepted: ['completed'],
  completed: [],
}

function toInitials(name: string) {
  return name.replace(/^Dr\.\s*/i, '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'N/A'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTimeSlot(timeSlot: 'morning' | 'afternoon' | 'evening') {
  if (timeSlot === 'morning') return 'Morning'
  if (timeSlot === 'afternoon') return 'Afternoon'
  return 'Evening'
}

export default function ReferralDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const doctor = useAuthStore((s) => s.doctor)

  const [selectedStatus, setSelectedStatus] = useState('')
  const [portalToken, setPortalToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { data: referral, isLoading, isError } = useQuery({
    queryKey: ['referral', id],
    queryFn: () => getReferral(id!),
    enabled: !!id,
  })

  const mutation = useMutation({
    mutationFn: (status: string) =>
      updateReferralStatus(id!, status as 'pending' | 'sent' | 'accepted' | 'completed'),
    onSuccess: (data, status) => {
      queryClient.invalidateQueries({ queryKey: ['referral', id] })
      setSelectedStatus('')
      if (status === 'sent' && data.patient_token) {
        setPortalToken(data.patient_token)
      }
    },
  })

  const appointmentMutation = useMutation({
    mutationFn: (status: 'confirmed' | 'cancelled') =>
      updateReferralAppointmentStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral', id] })
    },
  })

  function copyLink() {
    if (!portalToken) return
    navigator.clipboard.writeText(`${window.location.origin}/p/${portalToken}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-muted">Loading referral…</div>
  }

  if (isError || !referral) {
    return <div className="flex h-64 items-center justify-center text-muted">Referral not found.</div>
  }

  const nextStatuses = NEXT_STATUSES[referral.status] ?? []
  const refId = `REF-${referral.id.slice(0, 8).toUpperCase()}`
  const createdAt = new Date(referral.created_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const patient = referral.patients
  const targetDoctor = referral.targetDoctor
  const referredByDoctor = referral.referredByDoctor
  const isTargetDoctor = doctor?.id === referral.doctor_id
  const isReferrer = doctor?.id === referral.referred_by
  const canSendReferral = isReferrer && referral.status === 'pending'
  const availableNextStatuses = isTargetDoctor
    ? nextStatuses.filter((status) => status !== 'sent')
    : []
  const canManageAppointment =
    isTargetDoctor && referral.appointment?.status === 'requested'

  const timeline = [...referral.referral_status_history]
    .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime())
    .map((h) => ({
      label: TIMELINE_LABELS[h.status] ?? h.status,
      timestamp: new Date(h.changed_at).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
      }),
      completed: true,
    }))

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
              <h2 className="text-xl font-bold text-primary">{refId}</h2>
              <span className={`text-xs font-semibold uppercase ${URGENCY_COLORS[referral.urgency]}`}>
                {referral.urgency}
              </span>
              <span className={`text-xs font-semibold uppercase ${STATUS_COLORS[referral.status]}`}>
                {STATUS_LABELS[referral.status]}
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">Created on {createdAt}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canSendReferral && (
            <Button
              variant="ghost"
              size="sm"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate('sent')}
            >
              <Send size={14} />
              {mutation.isPending ? 'Sending…' : 'Send Referral'}
            </Button>
          )}
          {availableNextStatuses.length > 0 && (
            <div className="flex items-center gap-1">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-primary focus:outline-none"
              >
                <option value="">Select status…</option>
                {availableNextStatuses.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              <Button
                size="sm"
                disabled={!selectedStatus || mutation.isPending}
                onClick={() => selectedStatus && mutation.mutate(selectedStatus)}
              >
                {mutation.isPending ? 'Updating…' : 'Update'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Portal link card */}
      {portalToken && (
        <div className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Link size={14} className="text-accent" />
            <span className="font-medium">Patient portal link generated:</span>
            <span className="truncate max-w-xs text-muted font-mono text-xs">
              {window.location.origin}/p/{portalToken}
            </span>
          </div>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-primary hover:bg-base"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      )}

      {/* Body */}
      <div className="grid grid-cols-[1fr_380px] gap-5 items-start">
        {/* Left */}
        <div className="space-y-5">
          <PatientInfoCard
            patient={{
              fullName: patient.full_name,
              dob: formatDate(patient.date_of_birth),
              mrn: patient.mrn ?? 'N/A',
              contact: patient.phone ?? patient.email ?? 'N/A',
            }}
          />
          <ClinicalNoteCard note={referral.clinical_notes} />
        </div>

        {/* Right */}
        <div className="space-y-5">
          <ReferralSummaryCard
            icdCode="N/A"
            diagnosis={referral.diagnosis ?? 'N/A'}
            referredToName={targetDoctor?.full_name ?? 'Unassigned'}
            referredToInitials={toInitials(targetDoctor?.full_name ?? 'NA')}
            referredToOrg={targetDoctor?.hospital ?? referral.required_specialty ?? 'Unassigned'}
            referredBy={referredByDoctor?.full_name ?? doctor?.full_name ?? 'N/A'}
          />
          {referral.appointment ? (
            <AppointmentCard
              appointment={{
                status: referral.appointment.status,
                month: new Date(referral.appointment.preferred_date).toLocaleString('en-US', { month: 'short' }).toUpperCase(),
                day: new Date(referral.appointment.preferred_date).toLocaleString('en-US', { day: '2-digit' }),
                type: 'Initial Consultation',
                time: formatTimeSlot(referral.appointment.time_slot),
                location: targetDoctor?.hospital ?? 'Location unavailable',
                notes: referral.appointment.notes,
              }}
              actions={canManageAppointment ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={appointmentMutation.isPending}
                    onClick={() => appointmentMutation.mutate('cancelled')}
                  >
                    {appointmentMutation.isPending ? 'Updating…' : 'Deny'}
                  </Button>
                  <Button
                    size="sm"
                    disabled={appointmentMutation.isPending}
                    onClick={() => appointmentMutation.mutate('confirmed')}
                  >
                    {appointmentMutation.isPending ? 'Updating…' : 'Confirm'}
                  </Button>
                </>
              ) : null}
            />
          ) : (
            <AppointmentCard appointment={null} />
          )}
          <StatusTimeline events={timeline} />
        </div>
      </div>
    </div>
  )
}
