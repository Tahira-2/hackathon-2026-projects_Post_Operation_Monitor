import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import { patientSignup } from '../../lib/api/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import type { SignupRequest } from '../../types/auth.types';

export default function PatientRegisterPage() {
  const navigate    = useNavigate();
  const { setSession } = useAuth();

  const [form,    setForm]    = useState<SignupRequest>({ fullName: '', email: '', password: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const response = await patientSignup(form);
      setSession(response.user, response.accessToken);
      navigate('/patient/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 0.875rem 0.75rem 2.75rem',
    border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)',
    fontSize: '0.9375rem', fontFamily: 'inherit', color: 'var(--color-gray-900)',
    backgroundColor: '#fff', outline: 'none', transition: 'border-color 0.15s ease',
    boxSizing: 'border-box',
  };

  return (
    <AuthLayout
      headline="Take control of your health"
      subtext="Create your patient account and get a personalized AI-powered care plan after every visit."
      bullets={[
        'Care plans generated from your consultations',
        'Medication reminders that actually work',
        'Book and manage appointments in seconds',
      ]}
    >
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: '0.375rem', letterSpacing: '-0.025em' }}>
          Create your account
        </h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9375rem' }}>
          Free to use · HIPAA compliant · No credit card
        </p>
      </div>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
          backgroundColor: '#fef2f2', border: '1px solid #fecaca', marginBottom: '1.25rem',
        }}>
          <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
          <p style={{ fontSize: '0.875rem', color: '#b91c1c' }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Full name */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="reg-fullname" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gray-700)', display: 'block', marginBottom: '0.5rem' }}>
            Full name
          </label>
          <div style={{ position: 'relative' }}>
            <User size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)', pointerEvents: 'none' }} />
            <input
              id="reg-fullname"
              type="text"
              name="fullName"
              autoComplete="name"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Sarah Johnson"
              required
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-500)'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            />
          </div>
        </div>

        {/* Email */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="reg-email" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gray-700)', display: 'block', marginBottom: '0.5rem' }}>
            Email address
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)', pointerEvents: 'none' }} />
            <input
              id="reg-email"
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-500)'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: '1.75rem' }}>
          <label htmlFor="reg-password" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gray-700)', display: 'block', marginBottom: '0.5rem' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray-400)', pointerEvents: 'none' }} />
            <input
              id="reg-password"
              type={showPw ? 'text' : 'password'}
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              required
              minLength={6}
              style={{ ...inputStyle, paddingRight: '2.75rem' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-500)'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            />
            <button
              type="button"
              aria-label={showPw ? 'Hide password' : 'Show password'}
              onClick={() => setShowPw((v) => !v)}
              style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray-400)', padding: 0 }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          id="patient-register-submit"
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '0.8125rem', borderRadius: 'var(--radius-md)',
            backgroundColor: loading ? 'var(--color-primary-400)' : 'var(--color-primary-600)',
            color: '#fff', fontWeight: 700, fontSize: '1rem', fontFamily: 'inherit',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            transition: 'background-color 0.15s ease',
          }}
        >
          {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)', textAlign: 'center', marginTop: '1rem', lineHeight: 1.5 }}>
          By creating an account you agree to our{' '}
          <a href="#" style={{ color: 'var(--color-primary-600)' }}>Terms of Service</a>
          {' '}and{' '}
          <a href="#" style={{ color: 'var(--color-primary-600)' }}>Privacy Policy</a>.
        </p>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-muted)' }}>
        Already have an account?{' '}
        <Link to="/login/patient" style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>
          Sign in
        </Link>
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AuthLayout>
  );
}
