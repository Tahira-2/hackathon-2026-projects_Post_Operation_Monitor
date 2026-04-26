import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Brain,
  CalendarCheck2,
  CheckCircle2,
  HeartPulse,
  Menu,
  ShieldCheck,
  Smartphone,
  Syringe,
  X,
} from 'lucide-react';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const childBenefits = [
    {
      title: 'Track your child vaccine history',
      description:
        'See completed and pending vaccines in one timeline, so parents never lose track.',
    },
    {
      title: 'Get AI-based next vaccine suggestion',
      description:
        'AI uses your child age and simple vaccine rules to suggest the next recommended shot.',
    },
    {
      title: 'Know the right vaccination time',
      description:
        'Parents can quickly check what vaccine is due now and what is coming next by age.',
    },
  ];

  const parentView = [
    { label: 'Child age', value: '8 months', tone: 'bg-blue-50 text-blue-700 border-blue-100' },
    {
      label: 'Next due vaccine',
      value: 'MR - Dose 1',
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    { label: 'Due date', value: 'Next week', tone: 'bg-amber-50 text-amber-800 border-amber-100' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-5rem] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-[-5rem] top-[9rem] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-[35%] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-xl ring-1 ring-blue-400/20">
              💉
            </span>
            <div>
              <p className="text-lg font-semibold tracking-tight text-white">Navjeevan</p>
              <p className="text-xs text-slate-400">AI child vaccine tracking for parents</p>
            </div>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/activate"
              className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/15"
            >
              Activate Account
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
            >
              Sign Up
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="rounded-full border border-white/15 p-2 text-white transition hover:bg-white/5 md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>

        {isMobileMenuOpen && (
          <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8 md:hidden">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
              <Link
                to="/activate"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/15"
              >
                Activate Account
              </Link>
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-1 block rounded-2xl px-4 py-3 text-sm font-medium text-white transition hover:bg-white/5"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-1 block rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pt-16">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <ShieldCheck size={14} /> Built for infants and parents
            </div>

            <h1 className="mt-6 max-w-3xl text-balance text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Track your child vaccines and get AI suggestions at the right age.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Navjeevan helps parents track infant vaccination records and understand what comes next.
              Based on your child age, AI suggests which vaccine is due and when the next dose should be taken.
            </p>

            <div className="mt-8">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Create Child Profile <ArrowRight size={15} />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <CheckCircle2 size={14} className="text-emerald-300" /> Track your child vaccines
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <CheckCircle2 size={14} className="text-emerald-300" /> Age-based AI vaccine suggestion
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <CheckCircle2 size={14} className="text-emerald-300" /> Child dose reminders
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl" />
            <div className="absolute -right-4 bottom-10 h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/7 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-200">Parent dashboard preview</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Simple view to check what your child has taken and what is due next.
                  </p>
                </div>
                <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Child profile
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {parentView.map((signal) => (
                  <div key={signal.label} className={`rounded-2xl border px-4 py-4 ${signal.tone}`}>
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{signal.label}</p>
                    <p className="mt-2 text-2xl font-bold">{signal.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <CalendarCheck2 size={16} className="text-blue-300" /> Child vaccination timeline
                </div>
                <div className="mt-4 space-y-3">
                  {childBenefits.map((step, index) => (
                    <div key={step.title} className="flex items-start gap-3 rounded-2xl bg-white/5 p-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-200">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{step.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/8">
            <Syringe size={22} className="text-cyan-300" />
            <h2 className="mt-4 text-lg font-semibold text-white">Track your child vaccine</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Keep child vaccine records clear with completed doses, pending doses, and reminder history.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/8">
            <Bell size={22} className="text-amber-300" />
            <h2 className="mt-4 text-lg font-semibold text-white">See vaccination time by age</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Parents can quickly know which vaccine window is active now for their infant.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/8">
            <Brain size={22} className="text-emerald-300" />
            <h2 className="mt-4 text-lg font-semibold text-white">AI suggests best next vaccine</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              AI reads your child age and gives a simple suggestion for the next recommended vaccine.
            </p>
          </article>
        </section>

        <section className="mt-12 rounded-[2rem] border border-white/10 bg-gradient-to-r from-blue-500/15 via-white/5 to-emerald-400/10 p-6 backdrop-blur-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-cyan-200">Smart vaccine planning for your child</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Parents can check what is due now and what comes next.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Track child vaccination status with confidence and use AI suggestions to keep your infant on time.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Register Child <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
