import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Hash, Lock, UserCheck } from 'lucide-react';
import { activateUser } from '../../api/citizenAuth';
import { extractApiErrorMessage } from '../../utils/apiErrors';

const passwordPolicy =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

export default function ActivatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const registeredEmail =
    location.state?.registeredEmail || sessionStorage.getItem('navjeevan_activation_email') || '';

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      loginId: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (formData) => {
    setIsLoading(true);
    setServerError('');

    try {
      await activateUser({
        login_id: formData.loginId,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });
      navigate('/login', { replace: true });
    } catch (error) {
      setServerError(
        extractApiErrorMessage(error, {
          fallbackMessage: 'Activation failed. Please check your details and try again.',
          beautifyFieldNames: true,
          statusMessages: {
            404: 'Login ID not found. Please check the ID and try again.',
            409: 'This account has already been activated.',
            429: 'Too many attempts. Please wait a moment and try again.',
            500: 'Server error. Please try again later.',
            502: 'Server error. Please try again later.',
            503: 'Server error. Please try again later.',
            504: 'Server error. Please try again later.',
          },
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-5rem] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-[-5rem] top-[9rem] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-[35%] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>
      <div className="mx-auto flex min-h-[80vh] w-full max-w-5xl items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10"
          >
            <ArrowLeft size={14} /> Back to Home
          </button>

          <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-white">
            <UserCheck size={20} className="text-blue-400" /> Activate Account
          </h1>
          <p className="mb-6 text-sm text-slate-400">
            Step 2: enter the Login ID sent after registration and set a strong password.
          </p>

          {registeredEmail && (
            <div className="mb-6 rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200">
              Registration successful! We've sent a Login ID to <span className="font-semibold">{registeredEmail}</span>.
              Please check your email and paste it below.
            </div>
          )}

          <div className="mb-6 rounded-lg border border-blue-400/20 bg-blue-400/10 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-300">
              Account Setup Progress
            </p>
            <div className="flex items-center gap-3 opacity-90">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                1
              </div>
              <p className="text-sm text-blue-300">Registration details completed</p>
            </div>
            <div className="ml-3 h-4 w-px bg-blue-400/30" />
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                2
              </div>
              <p className="text-sm font-medium text-blue-200">Activate account (current)</p>
            </div>
          </div>

          {serverError && (
            <div role="alert" aria-live="polite" className="mb-4 rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-300">
              {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="activate-login-id" className="mb-1 block text-sm font-medium text-slate-300">Login ID</label>
              <div className="relative">
                <Hash size={16} className="pointer-events-none absolute left-3 top-3 text-slate-500" />
                <input
                  id="activate-login-id"
                  type="text"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 pl-10 text-sm uppercase tracking-wide text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Login ID"
                  autoComplete="off"
                  aria-invalid={Boolean(errors.loginId)}
                  aria-describedby={errors.loginId ? 'activate-login-id-error' : undefined}
                  {...register('loginId', { required: 'Login ID is required' })}
                />
              </div>
              {errors.loginId && <p id="activate-login-id-error" className="mt-1 text-xs text-red-400">{errors.loginId.message}</p>}
            </div>

            <div>
              <label htmlFor="activate-password" className="mb-1 block text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-3 text-slate-500" />
                <input
                  id="activate-password"
                  type={showPassword ? 'text' : 'password'}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'activate-password-error' : undefined}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 pl-10 pr-16 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Create a strong password"
                  {...register('password', {
                    required: 'Password is required',
                    validate: (value) =>
                      passwordPolicy.test(value) ||
                      'Password must include uppercase, lowercase, number, and special character',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2 text-xs font-medium text-blue-400"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <p id="activate-password-error" className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="activate-confirm-password" className="mb-1 block text-sm font-medium text-slate-300">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-3 text-slate-500" />
                <input
                  id="activate-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={errors.confirmPassword ? 'activate-confirm-password-error' : undefined}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 pl-10 pr-16 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Re-enter password"
                  {...register('confirmPassword', {
                    required: 'Confirm password is required',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-2 text-xs font-medium text-blue-400"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="activate-confirm-password-error" className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-2.5 font-semibold text-white transition duration-200 hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Activating...
                </span>
              ) : (
                'Activate Account'
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-400">
            Already activated?{' '}
            <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
