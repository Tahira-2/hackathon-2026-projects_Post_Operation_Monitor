import { Navigate } from 'react-router-dom'

const ROLE_KEY = 'devcare_role'

function DashboardPage() {
  const role = (localStorage.getItem(ROLE_KEY) || 'patient').toLowerCase()

  if (role === 'doctor') {
    return <Navigate to="/dashboard/doctor" replace />
  }

  return <Navigate to="/dashboard/patient" replace />
  return (
    <div className="app-shell">
      <Navbar />
      <main className="site-container flex min-h-[calc(100vh-4rem)] items-center py-10">
        <div className="w-full">
          {access ? (
            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
              {/* Doctor Dashboard Template */}
              <div className="elevated-card rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-soft)] px-10 py-12 flex flex-col items-center text-center shadow-xl">
                <div className="flex flex-col items-center mb-6">
                  <img src="https://cdn-icons-png.flaticon.com/512/3870/3870822.png" alt="Doctor Icon" className="w-24 h-24 rounded-full border-4 border-[var(--color-primary)] bg-white shadow-lg" />
                  <h2 className="text-2xl font-bold mt-3">Dr. {username || 'Name'}</h2>
                  <p className="text-sm text-[var(--color-text-muted)]">Cardiologist, Department of Cardiology</p>
                </div>
                <div className="grid grid-cols-2 gap-6 w-full mb-8">
                  <div className="rounded-xl bg-white/90 border border-[var(--color-border)] p-5 flex flex-col items-center">
                    <span className="text-[var(--color-primary)] text-2xl font-bold">12</span>
                    <span className="text-xs text-[var(--color-text-muted)]">Patients Today</span>
                  </div>
                  <div className="rounded-xl bg-white/90 border border-[var(--color-border)] p-5 flex flex-col items-center">
                    <span className="text-[var(--color-accent)] text-2xl font-bold">4</span>
                    <span className="text-xs text-[var(--color-text-muted)]">Upcoming Appointments</span>
                  </div>
                  <div className="rounded-xl bg-white/90 border border-[var(--color-border)] p-5 flex flex-col items-center">
                    <span className="text-[var(--color-success)] text-2xl font-bold">2</span>
                    <span className="text-xs text-[var(--color-text-muted)]">Pending Tasks</span>
                  </div>
                  <div className="rounded-xl bg-white/90 border border-[var(--color-border)] p-5 flex flex-col items-center">
                    <span className="text-[var(--color-warning)] text-2xl font-bold">0</span>
                    <span className="text-xs text-[var(--color-text-muted)]">Alerts</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-4 w-full mt-2">
                  <button className="btn-primary min-w-[150px]">View Appointments</button>
                  <button className="btn-secondary min-w-[150px]">Patient List</button>
                  <button className="btn-secondary min-w-[150px]">Messages</button>
                  <button className="btn-secondary min-w-[150px]" onClick={handleLogout}>Logout</button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-6 flex items-center gap-4 shadow">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-primary)] bg-opacity-10">
                    <svg className="w-7 h-7 text-[var(--color-primary)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20l9-5-9-5-9 5 9 5z"/><path d="M12 12V4m0 0L3 9m9-5l9 5"/></svg>
                  </span>
                  <div>
                    <p className="text-lg font-bold">3</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Active Sessions</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-6 flex items-center gap-4 shadow">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-accent)] bg-opacity-10">
                    <svg className="w-7 h-7 text-[var(--color-accent)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg>
                  </span>
                  <div>
                    <p className="text-lg font-bold">7</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Tasks Completed</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-6 flex items-center gap-4 shadow">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-success)] bg-opacity-10">
                    <svg className="w-7 h-7 text-[var(--color-success)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  </span>
                  <div>
                    <p className="text-lg font-bold">1</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Current Plan</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-6 flex items-center gap-4 shadow">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-warning)] bg-opacity-10">
                    <svg className="w-7 h-7 text-[var(--color-warning)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                  </span>
                  <div>
                    <p className="text-lg font-bold">0</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Notifications</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center elevated-card rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-10 shadow-lg">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                Access Required
              </p>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
                Please login to continue
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base text-[var(--color-text-muted)] sm:text-lg">
                Your session is not available yet. Go to the login page or create a new account.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/login" className="btn-primary">
                  Login
                </Link>
                <Link to="/register" className="btn-secondary">
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default DashboardPage