import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Mail, Phone, User } from 'lucide-react';
import { registerUser } from '../../api/citizenAuth';
import { NEPAL_DISTRICTS } from '../../constants';

const extractErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred. Please try again.';

  // Network / connectivity errors
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again later.';
  }

  // Server responded with error status
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (status === 400) {
      // Handle validation errors from backend (could be object with field-level errors)
      if (typeof data === 'object' && !data.detail && !data.error && !data.message) {
        const fieldErrors = Object.entries(data)
          .map(([field, msgs]) => {
            const msg = Array.isArray(msgs) ? msgs.join(', ') : msgs;
            return `${field}: ${msg}`;
          })
          .join(' | ');
        if (fieldErrors) return fieldErrors;
      }
      return data?.detail || data?.error || data?.message || 'Invalid data submitted. Please check your inputs.';
    }
    if (status === 409) return data?.detail || 'An account with this email or phone already exists.';
    if (status === 429) return 'Too many requests. Please wait a moment and try again.';
    if (status >= 500) return 'Server error. Please try again later.';

    return data?.detail || data?.error || data?.message || 'Registration failed. Please try again.';
  }

  // Request was made but no response received
  if (error.request) {
    return 'No response from server. Please check your connection and try again.';
  }

  return error.message || 'An unexpected error occurred. Please try again.';
};

export default function CitizenRegisterForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      specialConditions: '',
      region: '',
    },
  });

  const onSubmit = async (formData) => {
    setIsLoading(true);
    setServerError('');
    setSuccessMessage('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phoneNumber || '',
        date_of_birth: formData.dateOfBirth,
        special_conditions: formData.specialConditions || '',
        region: formData.region.trim(),
      };

      const response = await registerUser(payload);
      const loginIdFromBackend =
        response?.data?.login_id ||
        response?.data?.data?.login_id ||
        response?.data?.user?.login_id ||
        response?.data?.account?.login_id ||
        '';

      if (loginIdFromBackend) {
        sessionStorage.setItem('navjeevan_activation_login_id', loginIdFromBackend);
      }
      sessionStorage.setItem('navjeevan_activation_email', formData.email);
      setSuccessMessage('Step 1 completed. Redirecting to account activation...');
      setTimeout(() => {
        navigate('/activate', {
          state: {
            loginId: loginIdFromBackend,
            registeredEmail: formData.email,
          },
        });
      }, 900);
    } catch (error) {
      setServerError(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10"
      >
        <ArrowLeft size={14} /> Back to Home
      </button>

      <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-white">
        <User size={20} className="text-blue-400" /> Create Child Profile
      </h1>
      <p className="mb-6 text-sm text-slate-400">Step 1: Submit profile details to receive Login ID</p>

      <div className="mb-6 rounded-lg border border-blue-400/20 bg-blue-400/10 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-300">
          Account Setup Progress
        </p>
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
            1
          </div>
          <p className="text-sm font-medium text-blue-200">Registration details (current)</p>
        </div>
        <div className="ml-3 h-4 w-px bg-blue-400/30" />
        <div className="flex items-center gap-3 opacity-80">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-400/30 bg-white/5 text-xs font-bold text-blue-300">
            2
          </div>
          <p className="text-sm text-blue-300">Activate account with Login ID</p>
        </div>
      </div>

      {serverError && (
        <div className="mb-4 rounded-lg border border-red-400/25 bg-red-400/10 px-3 py-2 text-sm text-red-300">
          {serverError}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Full Name</label>
          <div className="relative">
            <User size={16} className="pointer-events-none absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
              {...register('name', {
                required: 'Full name is required',
                minLength: { value: 2, message: 'Full name must be at least 2 characters' },
              })}
            />
          </div>
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-3 top-3 text-slate-500" />
            <input
              type="email"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Enter a valid email address',
                },
              })}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="pointer-events-none absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="98XXXXXXXX"
                {...register('phoneNumber', {
                  required: 'Phone number is required',
                  validate: (value) => /^\d{10}$/.test(value) || 'Phone number must be 10 digits',
                })}
              />
            </div>
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-red-400">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Date of Birth</label>
            <input
              type="date"
              max={today}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('dateOfBirth', {
                required: 'Date of birth is required',
                validate: (value) =>
                  new Date(value).getTime() < new Date().setHours(0, 0, 0, 0) ||
                  'Date of birth must be in the past',
              })}
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-xs text-red-400">{errors.dateOfBirth.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Region (District)</label>
          <input
            type="text"
            list="nepal-districts"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Select region district or start typing"
            {...register('region', {
              required: 'District is required',
              validate: (value) =>
                NEPAL_DISTRICTS.some((district) => district.toLowerCase() === value.trim().toLowerCase()) ||
                'Please select a valid Nepal district',
            })}
          />
          <datalist id="nepal-districts">
            {NEPAL_DISTRICTS.map((district) => (
              <option key={district} value={district} />
            ))}
          </datalist>
          {errors.region && <p className="mt-1 text-xs text-red-400">{errors.region.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Special Conditions (Optional)
          </label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., allergy, chronic condition"
            {...register('specialConditions')}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-2.5 font-semibold text-white transition duration-200 hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting...
            </span>
          ) : (
            'Submit Registration'
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300">
          Login here
        </Link>
      </p>
    </div>
  );
}
