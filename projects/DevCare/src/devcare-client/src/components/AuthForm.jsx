import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { loginUser, registerUser } from '../api/authApi'
import { toastSuccess, toastError } from '../utils/toast'

const ACCESS_TOKEN_KEY = 'devcare_access_token'
const REFRESH_TOKEN_KEY = 'devcare_refresh_token'
const USERNAME_KEY = 'devcare_username'

const initialFormState = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function AuthForm({ mode }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(initialFormState)

  function updateField(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function saveAuth(access, refresh, username) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access)
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
    localStorage.setItem(USERNAME_KEY, username)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)

    try {
      if (mode === 'register') {
        const registerData = await registerUser({
          username: form.username,
          email: form.email,
          password: form.password,
          password_confirm: form.confirmPassword,
        })

        saveAuth(
          registerData.access,
          registerData.refresh,
          registerData.user.username
        )
        toastSuccess('Registration successful. Redirecting...')

        const searchParams = new URLSearchParams(window.location.search)
        const nextPath = searchParams.get('next')

        setTimeout(() => {
          if (nextPath) {
            navigate(nextPath, { replace: true })
          } else {
            navigate('/dashboard')
          }
        }, 600)
      } else {
        const loginData = await loginUser({
          email: form.email,
          password: form.password,
        })

        saveAuth(loginData.access, loginData.refresh, loginData.user.username)
        toastSuccess('Login successful. Redirecting...')
        
        // Handle 'next' redirect if present
        const searchParams = new URLSearchParams(window.location.search)
        const nextPath = searchParams.get('next')
        
        setTimeout(() => {
          if (nextPath) {
            navigate(nextPath, { replace: true })
          } else {
            navigate('/dashboard')
          }
        }, 600)
      }


      setForm(initialFormState)
    } catch (submitError) {
      toastError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  const isRegister = mode === 'register'

  return (
    <section className="site-container flex min-h-[calc(100vh-4rem)] items-center py-10">
      <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="elevated-card rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 sm:px-9">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            {isRegister
              ? 'Register your healthcare demo account'
              : 'Login to your dashboard'}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[var(--color-text-muted)] sm:text-lg">
            {isRegister
              ? 'Create a simple JWT-backed account for your hackathon demo.'
              : 'Use your JWT credentials to access the dashboard page.'}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/" className="btn-primary">
              Back to landing
            </Link>
            <Link to={isRegister ? '/login' : '/register'} className="btn-secondary">
              {isRegister ? 'Go to login' : 'Create account'}
            </Link>
          </div>
        </article>

        <article className="elevated-card rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="auth-label" htmlFor={isRegister ? 'username' : 'email'}>
                {isRegister ? 'Username' : 'Email'}
              </label>
              <input
                id={isRegister ? 'username' : 'email'}
                name={isRegister ? 'username' : 'email'}
                type={isRegister ? 'text' : 'email'}
                value={isRegister ? form.username : form.email}
                onChange={updateField}
                className="auth-input"
                placeholder={isRegister ? 'Enter username' : 'name@example.com'}
                autoComplete={isRegister ? 'username' : 'email'}
                required
              />
            </div>


            {isRegister && (
              <div>
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
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            )}

            <div>
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
                placeholder="Enter password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
              />
            </div>

            {isRegister && (
              <div>
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
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                />
              </div>
            )}



            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
            </button>
          </form>
        </article>
      </div>
    </section>
  )
}

export default AuthForm