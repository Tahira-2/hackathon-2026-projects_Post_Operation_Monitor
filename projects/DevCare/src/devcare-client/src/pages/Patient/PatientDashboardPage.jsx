import { useNavigate } from 'react-router-dom'
import { Heart, Clock, Pill, AlertCircle, TrendingUp, Calendar, FileText, Activity } from 'lucide-react'

import Footer from '../../components/Footer'
import Navbar from '../../components/Navbar'

const ACCESS_TOKEN_KEY = 'devcare_access_token'
const REFRESH_TOKEN_KEY = 'devcare_refresh_token'
const USERNAME_KEY = 'devcare_username'
const ROLE_KEY = 'devcare_role'

function PatientDashboardPage() {
  const navigate = useNavigate()
  const username = localStorage.getItem(USERNAME_KEY)

  function handleLogout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USERNAME_KEY)
    localStorage.removeItem(ROLE_KEY)
    navigate('/')
  }

  // Mock data for patient
  const patientData = {
    status: 'Stable',
    lastCheckup: '2 days ago',
    upcomingAppointments: 2,
    activePrescriptions: 4,
    alerts: 1,
  }

  const vitals = [
    { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', icon: Heart, status: 'normal' },
    { label: 'Heart Rate', value: '72', unit: 'bpm', icon: Activity, status: 'normal' },
    { label: 'Temperature', value: '98.6', unit: '°F', icon: TrendingUp, status: 'normal' },
    { label: 'Blood Sugar', value: '95', unit: 'mg/dL', icon: TrendingUp, status: 'normal' },
  ]

  const appointments = [
    { id: 1, doctor: 'Dr. Sarah Johnson', specialty: 'Cardiology', date: '2026-04-28', time: '10:00 AM', status: 'Confirmed' },
    { id: 2, doctor: 'Dr. Michael Chen', specialty: 'General Checkup', date: '2026-05-05', time: '2:30 PM', status: 'Scheduled' },
  ]

  const prescriptions = [
    { id: 1, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', daysLeft: 15, status: 'Active' },
    { id: 2, name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', daysLeft: 8, status: 'Active' },
    { id: 3, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', daysLeft: 22, status: 'Active' },
    { id: 4, name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', daysLeft: 5, status: 'Expiring Soon' },
  ]

  return (
    <div className="app-shell">
      <Navbar />

      <main className="site-container py-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
            Welcome Back
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            {username || 'Patient'}
          </h1>
          <p className="mt-2 text-base text-[var(--color-text-muted)]">
            Your health overview and upcoming appointments
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                  Current Status
                </p>
                <p className="mt-3 text-2xl font-bold text-[var(--color-primary)]">{patientData.status}</p>
              </div>
              <Heart className="h-8 w-8 text-[var(--color-primary)]" />
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                  Last Checkup
                </p>
                <p className="mt-3 text-2xl font-bold text-[var(--color-accent)]">{patientData.lastCheckup}</p>
              </div>
              <Clock className="h-8 w-8 text-[var(--color-accent)]" />
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                  Upcoming Visits
                </p>
                <p className="mt-3 text-2xl font-bold text-[var(--color-success)]">{patientData.upcomingAppointments}</p>
              </div>
              <Calendar className="h-8 w-8 text-[var(--color-success)]" />
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                  Prescriptions
                </p>
                <p className="mt-3 text-2xl font-bold text-[var(--color-warning)]">{patientData.activePrescriptions}</p>
              </div>
              <Pill className="h-8 w-8 text-[var(--color-warning)]" />
            </div>
          </div>
        </div>

        {/* Vitals Section */}
        <div className="mb-10">
          <h2 className="mb-5 text-xl font-bold text-[var(--color-text)]">Current Vitals</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {vitals.map((vital) => {
              const IconComponent = vital.icon
              return (
                <div key={vital.label} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                        {vital.label}
                      </p>
                      <p className="mt-3 text-2xl font-bold text-[var(--color-primary)]">
                        {vital.value} <span className="text-base text-[var(--color-text-muted)]">{vital.unit}</span>
                      </p>
                    </div>
                    <IconComponent className="h-8 w-8 text-[var(--color-primary)]" strokeWidth={1.5} />
                  </div>
                  <div className="mt-4 inline-flex rounded-full bg-[var(--color-success)] bg-opacity-20 px-2 py-1">
                    <span className="text-xs font-semibold text-[var(--color-success)] capitalize">{vital.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Appointments Section */}
          <div className="lg:col-span-2">
            <h2 className="mb-5 text-xl font-bold text-[var(--color-text)]">Upcoming Appointments</h2>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--color-text)]">{appointment.doctor}</h3>
                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{appointment.specialty}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
                          <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[var(--color-primary)]" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-2">
                      <span className="inline-flex rounded-full bg-[var(--color-success)] bg-opacity-20 px-3 py-1 text-xs font-semibold text-[var(--color-success)]">
                        {appointment.status}
                      </span>
                      <button className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prescriptions Sidebar */}
          <div>
            <h2 className="mb-5 text-xl font-bold text-[var(--color-text)]">Active Prescriptions</h2>
            <div className="space-y-3">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
                  <h3 className="font-semibold text-[var(--color-text)]">{prescription.name}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-[var(--color-text-muted)]">
                      <span className="font-medium">{prescription.dosage}</span> • {prescription.frequency}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Refills in: <span className="font-semibold text-[var(--color-warning)]">{prescription.daysLeft} days</span>
                    </p>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      prescription.status === 'Expiring Soon'
                        ? 'bg-[var(--color-danger)] bg-opacity-20 text-[var(--color-danger)]'
                        : 'bg-[var(--color-success)] bg-opacity-20 text-[var(--color-success)]'
                    }`}>
                      {prescription.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-6">
          <h3 className="mb-4 text-lg font-bold text-[var(--color-text)]">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary">
              <Calendar className="h-4 w-4" />
              Schedule Appointment
            </button>
            <button className="btn-secondary">
              <FileText className="h-4 w-4" />
              View Medical Records
            </button>
            <button className="btn-secondary">
              <AlertCircle className="h-4 w-4" />
              View Lab Results
            </button>
            <button className="btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PatientDashboardPage
