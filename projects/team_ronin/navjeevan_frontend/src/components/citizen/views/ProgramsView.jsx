import { useEffect, useMemo, useState } from 'react';
import { Calendar, MapPin, Users, Tag } from 'lucide-react';
import { fetchPrograms, registerForProgram } from '../../../api/programs';
import { fetchUserProfile } from '../../../api/userProfile';

export default function ProgramsView() {
  const [programs, setPrograms] = useState([]);
  const [userRegion, setUserRegion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRegisteringId, setIsRegisteringId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadPrograms = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [programRes, profileRes] = await Promise.all([fetchPrograms(), fetchUserProfile()]);
      const eventResults = programRes?.data?.results || [];
      const region = profileRes?.data?.region || '';
      setUserRegion(region);
      setPrograms(Array.isArray(eventResults) ? eventResults : []);
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err?.message ||
        'Could not load programs.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const relevantPrograms = useMemo(() => {
    if (!userRegion) {
      return programs;
    }
    const matching = programs.filter(
      (item) => (item?.event_location_name || '').toLowerCase() === userRegion.toLowerCase(),
    );
    return matching.length > 0 ? matching : programs;
  }, [programs, userRegion]);

  const handleRegister = async (programId) => {
    setIsRegisteringId(programId);
    setError('');
    setSuccess('');
    try {
      const response = await registerForProgram(programId);
      setSuccess(response?.data?.message || 'Registered for program.');
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err?.message ||
        'Could not register for this program.';
      setError(message);
    } finally {
      setIsRegisteringId('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Vaccination Programs</h2>
        <p className="mt-1 text-slate-300">
          {userRegion ? `Programs prioritized for ${userRegion}` : 'Upcoming vaccination programs'}
        </p>
      </div>

      {error && <div className="rounded-2xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm text-emerald-200">{success}</div>}

      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-white/7 p-6 text-slate-300">Loading programs...</div>
      ) : (
        <div className="grid gap-6">
          {relevantPrograms.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/7 p-6 text-slate-300">No programs found.</div>
          ) : (
            relevantPrograms.map((program) => (
              <div
                key={program.id}
                className="overflow-hidden rounded-2xl border border-white/10 border-l-4 border-l-blue-500/50 bg-white/7 shadow-2xl shadow-black/30 backdrop-blur-xl"
              >
                <div className="border-b border-white/10 bg-gradient-to-r from-blue-500/20 to-indigo-500/10 p-6">
                  <h3 className="text-xl font-bold text-white">{program.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200">
                      {(program.event_status || 'NOT_STARTED').replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <p className="flex items-center gap-2 text-slate-200"><Calendar size={18} className="text-blue-400" /> {program.created_at ? new Date(program.created_at).toLocaleDateString() : 'N/A'}</p>
                    <p className="flex items-center gap-2 text-slate-200"><MapPin size={18} className="text-red-400" /> {program.event_location_name || 'Unknown'}</p>
                    <p className="flex items-center gap-2 text-slate-200"><Users size={18} className="text-emerald-400" /> Organizer: {program.organized_by_name || 'Healthcare Staff'}</p>
                    <p className="flex items-center gap-2 text-slate-200"><Tag size={18} className="text-indigo-400" /> Contact: {program.contact_phone_number || 'N/A'}</p>
                  </div>

                  <p className="text-slate-300">{program.description || 'No additional details.'}</p>
                  <div className="flex flex-wrap gap-2">
                    {(program.vaccinations || []).map((vaccine) => (
                      <span
                        key={`${program.id}-${vaccine.id}`}
                        className="rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1 text-sm font-semibold text-blue-200"
                      >
                        {vaccine.vaccination_name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 border-t border-white/10 bg-slate-800/30 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleRegister(program.id)}
                    disabled={isRegisteringId === program.id}
                    className="flex-1 rounded-lg border border-blue-400/30 bg-blue-500 px-4 py-2 font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isRegisteringId === program.id ? 'Registering...' : 'Register for Program'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
