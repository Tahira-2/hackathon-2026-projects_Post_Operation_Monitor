import { useEffect, useMemo, useState } from 'react';
import { Heart, Calendar, Clock, MapPin, Bell, Syringe } from 'lucide-react';
import { fetchUserProfile } from '../../../api/userProfile';
import { getVaccinations } from '../../../api/vaccinations';
import { fetchPrograms } from '../../../api/programs';
import { fetchUserNotifications } from '../../../api/notifications';

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

export default function DashboardView() {
  const [profile, setProfile] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [profileRes, vaccinationsRes, programsRes, notificationsRes] = await Promise.all([
          fetchUserProfile(),
          getVaccinations(),
          fetchPrograms(),
          fetchUserNotifications(),
        ]);

        setProfile(profileRes?.data || null);
        setVaccinations(normalizeList(vaccinationsRes?.data));
        setPrograms(normalizeList(programsRes?.data));
        setNotifications(normalizeList(notificationsRes?.data));
      } catch (err) {
        const message =
          err?.response?.data?.error ||
          err?.response?.data?.detail ||
          err?.message ||
          'Could not load dashboard data.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const completedCount = useMemo(
    () => vaccinations.filter((item) => (item?.status || '').toLowerCase() === 'completed').length,
    [vaccinations],
  );
  const totalCount = vaccinations.length;
  const percentage = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const unreadCount = useMemo(
    () => notifications.filter((item) => !(item?.read ?? item?.is_read)).length,
    [notifications],
  );

  const nextDose = useMemo(() => {
    return vaccinations
      .filter((item) => {
        const status = (item?.status || '').toLowerCase();
        return status === 'scheduled' || status === 'missed';
      })
      .sort((a, b) => {
        const left = new Date(a?.scheduled_date || a?.date_administered || '9999-12-31').getTime();
        const right = new Date(b?.scheduled_date || b?.date_administered || '9999-12-31').getTime();
        return left - right;
      })[0];
  }, [vaccinations]);

  const upcomingPrograms = useMemo(
    () =>
      programs
        .filter((item) => item?.event_status !== 'ENDED')
        .slice(0, 3)
        .map((item) => ({
          id: item?.id,
          title: item?.name,
          date: item?.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A',
          location: item?.event_location_name || 'Unknown',
          status: item?.event_status || 'NOT_STARTED',
        })),
    [programs],
  );

  if (isLoading) {
    return <div className="rounded-2xl border border-white/10 bg-white/7 p-6 text-slate-300">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {error && <div className="rounded-2xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/7 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-white">{profile?.name || 'Citizen'}</h2>
            <p className="mt-1 text-slate-300">{profile?.email || 'No email available'}</p>
            <p className="mt-1 text-sm text-slate-400">Region: {profile?.region || 'Not set'}</p>
            <p className="mt-1 text-sm text-slate-400">Phone: {profile?.phone_number || 'Not set'}</p>
          </div>
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-blue-200">
              <Bell size={18} />
              <p className="font-semibold">Unread Notifications</p>
            </div>
            <p className="text-3xl font-bold text-white">{unreadCount}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Heart size={18} className="text-pink-400" />
            <p className="font-semibold text-white">Vaccination Progress</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 flex-1 rounded-full bg-slate-800">
              <div className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500" style={{ width: `${percentage}%` }} />
            </div>
            <span className="text-sm font-semibold text-slate-300">
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <div className="mb-2 flex items-center gap-2 text-emerald-200">
            <Syringe size={18} />
            <p className="font-semibold">Next Due Dose</p>
          </div>
          {nextDose ? (
            <>
              <p className="text-base font-semibold text-white">
                {nextDose.vaccine_name} · Dose {nextDose.dose_number}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Due: {nextDose.scheduled_date || nextDose.date_administered || 'Date not set'}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-emerald-200/90">
                Status: {nextDose.status}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-300">No pending vaccination doses.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/7 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <h3 className="mb-4 text-xl font-bold text-white">Upcoming Programs</h3>
        <div className="space-y-3">
          {upcomingPrograms.length === 0 ? (
            <p className="text-slate-400">No upcoming programs available.</p>
          ) : (
            upcomingPrograms.map((program) => (
              <div key={program.id} className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h4 className="font-semibold text-white">{program.title}</h4>
                  <span className="rounded-full border border-blue-400/30 bg-blue-500/20 px-2 py-0.5 text-xs text-blue-200">
                    {program.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-slate-300">
                  <p className="flex items-center gap-2"><Calendar size={14} /> {program.date}</p>
                  <p className="flex items-center gap-2"><Clock size={14} /> Live updates in notifications</p>
                  <p className="flex items-center gap-2"><MapPin size={14} /> {program.location}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
