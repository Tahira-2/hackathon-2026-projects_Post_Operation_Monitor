import { useState } from 'react';
import CitizenLoginForm from '../../components/citizen/CitizenLoginForm';
import HCLoginForm from '../../components/healthcare/HCLoginForm';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('user');

  return (
    <div className="relative min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-5rem] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-[-5rem] top-[9rem] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-[35%] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>
      <div className="mx-auto flex min-h-[80vh] w-full max-w-4xl flex-col items-center justify-center gap-5">
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('user')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'user' ? 'bg-blue-500 text-white' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('healthcare')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'healthcare' ? 'bg-emerald-500 text-white' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            Healthcare Login
          </button>
        </div>

        {activeTab === 'user' ? <CitizenLoginForm /> : <HCLoginForm />}
      </div>
    </div>
  );
}
