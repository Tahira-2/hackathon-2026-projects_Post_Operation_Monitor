import { ArrowLeft, Building2, Mail, Phone, Stethoscope, UserRound } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useDoctorByIdQuery } from '../lib/auth-hooks'
import { getApiErrorMessage } from '../lib/auth-api'
import { useAuthStore } from '../stores/authStore'

function formatMemberSince(createdAt?: string) {
  if (!createdAt) return 'Unknown'

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return 'Unknown'

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getInitials(fullName?: string) {
  return fullName
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'DR'
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-base px-4 py-3">
      <div className="mt-0.5 text-muted">{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className="text-sm text-primary">{value}</p>
      </div>
    </div>
  )
}

export default function DoctorProfilePage() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const authenticatedDoctor = useAuthStore((state) => state.doctor)
  const doctorQuery = useDoctorByIdQuery(id)

  const doctor = doctorQuery.data
  const isCurrentDoctor = authenticatedDoctor?.id === doctor?.id
  const memberSince = useMemo(() => formatMemberSince(doctor?.created_at), [doctor?.created_at])

  if (doctorQuery.isLoading) {
    return <div className="text-sm text-muted">Loading doctor profile...</div>
  }

  if (doctorQuery.isError || !doctor) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} />
          Back
        </Button>
        <div className="rounded-xl border border-border bg-surface px-6 py-8 text-sm text-muted shadow-sm">
          {getApiErrorMessage(
            doctorQuery.error,
            'Unable to load this doctor profile right now.',
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="mt-1 flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted hover:bg-base hover:text-primary transition-colors"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-primary">Doctor Profile</h2>
            <p className="mt-0.5 text-sm text-muted">
              Review specialist details before creating or managing referrals.
            </p>
          </div>
        </div>
        {isCurrentDoctor ? (
          <Button variant="ghost" onClick={() => navigate('/settings')}>
            Edit Profile
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex items-start gap-5 border-b border-border px-6 py-6">
            {doctor.avatar_url ? (
              <img
                src={doctor.avatar_url}
                alt={doctor.full_name}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-xl font-semibold text-slate-600">
                {getInitials(doctor.full_name)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-2xl font-semibold text-primary">{doctor.full_name}</p>
              <p className="mt-1 text-sm text-muted">
                {doctor.specialty ?? 'General Medicine'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-base px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  License {doctor.license_number ?? 'Not listed'}
                </span>
                <span className="rounded-full bg-base px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-6 md:grid-cols-2">
            <InfoRow icon={<Mail size={16} />} label="Email" value={doctor.email} />
            <InfoRow
              icon={<Phone size={16} />}
              label="Contact Number"
              value={doctor.contact_number ?? 'Not provided'}
            />
            <InfoRow
              icon={<Building2 size={16} />}
              label="Hospital / Clinic"
              value={doctor.hospital ?? 'Not assigned'}
            />
            <InfoRow
              icon={<Stethoscope size={16} />}
              label="Specialty"
              value={doctor.specialty ?? 'General Medicine'}
            />
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border px-5 py-4">
              <h3 className="font-semibold text-primary">Professional Summary</h3>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div className="flex items-center gap-2 text-sm text-primary">
                <UserRound size={16} className="text-muted" />
                Verified clinician profile
              </div>
              <p className="text-sm leading-6 text-muted">
                This directory profile is sourced from the doctor account record used for referrals,
                contact routing, and patient scheduling.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
