import { useNavigate } from 'react-router-dom'

import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

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

  return (
    <div className="app-shell">
      <Navbar />

      <main className="site-container py-10">
        <div className="elevated-card rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 sm:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
            Patient Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Welcome, {username || 'User'}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[var(--color-text-muted)] sm:text-lg">
            Track your health summary, upcoming appointments, and recommendations.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5">
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">Upcoming Visits</p>
              <p className="mt-2 text-2xl font-bold">2</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5">
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">Active Prescriptions</p>
              <p className="mt-2 text-2xl font-bold">4</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-5">
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">New Alerts</p>
              <p className="mt-2 text-2xl font-bold">1</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className="btn-primary" onClick={handleLogout}>
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
