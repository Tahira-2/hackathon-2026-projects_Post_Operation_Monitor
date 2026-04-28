import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-5rem] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-[-5rem] top-[9rem] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-[35%] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>
      <div className="mx-auto flex min-h-[80vh] max-w-4xl items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10"
          >
            <ArrowLeft size={14} /> Back to Home
          </button>

          <h1 className="text-2xl font-bold text-white">Reset Your Password</h1>
          <p className="mt-2 text-sm text-slate-400">Enter your email to receive a reset link.</p>

          {sent && (
            <div className="mt-4 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
              If this email is registered, you will receive a reset link shortly.
            </div>
          )}

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-500 px-4 py-2.5 font-semibold text-white transition duration-200 hover:bg-blue-400"
            >
              Send Reset Link
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-400">
            <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300">
              Return to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
