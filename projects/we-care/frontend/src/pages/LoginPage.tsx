import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { FormInput } from '../components/ui/FormInput'
import { Logo } from '../components/ui/Logo'
import { loginSchema, type LoginForm } from '../types/auth'

type FormErrors = { email?: string; password?: string }

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const result = loginSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: FormErrors = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormErrors
        fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }
    setLoading(true)
    try {
      // TODO: wire to auth API
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-1 flex items-center gap-2">
            <Logo size={28} />
            <span className="text-2xl font-bold tracking-tight text-primary">RefAI</span>
          </div>
          <p className="text-sm text-muted">Secure Clinician Portal</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormInput
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="doctor@hospital.org"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            hint={
              <Button variant="text" type="button" className="text-xs" onClick={() => navigate('/forgot-password')}>
                Forgot Password?
              </Button>
            }
          />

          <Button type="submit" fullWidth loading={loading}>
            Sign In →]
          </Button>
        </form>

        <div className="mt-6 border-t border-border pt-5 text-center">
          <p className="text-sm text-muted">
            Don't have an account?{' '}
            <Button variant="text" type="button" className="text-sm font-medium" onClick={() => navigate('/signup')}>
              Create an account
            </Button>
          </p>
        </div>
      </div>

    </div>
  )
}
