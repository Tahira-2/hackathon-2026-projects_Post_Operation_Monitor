import { useState } from 'react'
import logo from '../assets/Devcare-logo.png'

import { loginUser, registerUser } from '../api/authApi'
import { toastSuccess, toastError } from '../utils/toast'

const ACCESS_TOKEN_KEY = 'devcare_access_token'
const REFRESH_TOKEN_KEY = 'devcare_refresh_token'
const USERNAME_KEY = 'devcare_username'
const ROLE_KEY = 'devcare_role'

function AuthSection({ onAuthSuccess, mode: propsMode, onModeChange }) {
  const [localMode, setLocalMode] = useState('login')
  const mode = propsMode || localMode

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    username: '',
    email: '',
    role: 'patient',
    password: '',
    confirmPassword: '',
  })

  function storeAuth(access, refresh, username, role) {
    const normalizedRole = (role || 'patient').toLowerCase()
    localStorage.setItem(ACCESS_TOKEN_KEY, access)
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
    localStorage.setItem(USERNAME_KEY, username)
    localStorage.setItem(ROLE_KEY, normalizedRole)
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)

    try {
      if (mode === 'register') {
        const registerData = await registerUser({
          username: form.username,
          email: form.email,
          role: form.role.toLowerCase(),
          password: form.password,
          password_confirm: form.confirmPassword,
        })

        storeAuth(
          registerData.access,
          registerData.refresh,
          registerData.user.username,
          registerData.user.role
        )
        toastSuccess('Registration successful. Redirecting to dashboard...')
        setForm({
          username: '',
          email: '',
          role: 'patient',
          password: '',
          confirmPassword: '',
        })
        onAuthSuccess?.(
          registerData.access,
          registerData.refresh,
          registerData.user.username,
          registerData.user.role
        )
      } else {
        const loginData = await loginUser({
          email: form.email,
          password: form.password,
        })

        storeAuth(
          loginData.access,
          loginData.refresh,
          loginData.user?.username || form.username,
          loginData.user?.role
        )

        toastSuccess('Login successful. Redirecting to dashboard...')
        setForm({
          username: '',
          email: '',
          role: 'patient',
          password: '',
          confirmPassword: '',
        })
        onAuthSuccess?.(
          loginData.access,
          loginData.refresh,
          loginData.user?.username || form.username,
          loginData.user?.role
        )
      }
    } catch (submitError) {
      toastError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  function switchMode(nextMode) {
    if (onModeChange) {
      onModeChange(nextMode)
    } else {
      setLocalMode(nextMode)
    }
  }

  return (
    <article className="elevated-card rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 sm:p-12 shadow-2xl">
      <h3 className="text-2xl font-bold text-[var(--color-primary-strong)] mb-2">
        {mode === 'register' ? 'Join DevCare' : 'Welcome Back'}
      </h3>
      <p className="text-[var(--color-text-muted)] text-[13px] mb-8">
        {mode === 'register' 
          ? 'Get started with smarter, guided recovery from the comfort of your home.' 
          : 'Continue your recovery journey with DevCare.'}
      </p>

      <form className="space-y-5" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <label className="auth-label" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={updateField}
                  className="auth-input"
                  placeholder="Your Username"
                  autoComplete="username"
                  required
                />
              </>
            )}

            <label className="auth-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              className="auth-input"
              placeholder="Your Email Address"
              autoComplete="email"
              required
            />


            {mode === 'register' && (
              <>
                <label className="auth-label">I AM A...</label>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: 'patient' }))}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      form.role === 'patient' 
                      ? 'bg-[#E3F2FD] border-[#1E88E5] text-[#1E88E5]' 
                      : 'bg-white border-[#ECEFF1] text-[#607D8B] hover:border-[#CFD8DC]'
                    }`}
                  >
                    <svg className="w-5 h-5 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-bold text-xs">Patient</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: 'doctor' }))}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      form.role === 'doctor' 
                      ? 'bg-[#E3F2FD] border-[#1E88E5] text-[#1E88E5]' 
                      : 'bg-white border-[#ECEFF1] text-[#607D8B] hover:border-[#CFD8DC]'
                    }`}
                  >
                    <svg className="w-5 h-5 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="font-bold text-xs">Doctor</span>
                  </button>
                </div>
              </>
            )}

            <label className="auth-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              className="auth-input"
              placeholder="••••••••"
              autoComplete={
                mode === 'register' ? 'new-password' : 'current-password'
              }
              required
            />

            {mode === 'register' && (
              <>
                <label className="auth-label" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={updateField}
                  className="auth-input"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </>
            )}



            <button type="submit" className="btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl" disabled={loading}>
              {loading
                ? 'Please wait...'
                : mode === 'register'
                  ? <>Register Account <span className="group-hover:translate-x-1 transition-transform">→</span></>
                  : <>Log In <span className="group-hover:translate-x-1 transition-transform">→</span></>}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#607D8B]">
              {mode === 'register' ? 'Already have an account? ' : "Don't have an account? "}
              <button 
                onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}
                className="text-[#1E88E5] font-bold hover:underline"
              >
                {mode === 'register' ? 'Log in' : 'Create one'}
              </button>
            </p>
          </div>
    </article>
  )
}

export default AuthSection