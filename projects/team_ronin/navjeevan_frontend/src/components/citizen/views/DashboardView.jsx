import { Heart, Calendar, Clock, MapPin } from 'lucide-react';

export default function DashboardView() {
  const childData = {
    name: 'Aarav Sharma',
    age: 5,
    dateOfBirth: '2021-03-15',
    bloodType: 'O+',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav',
    nextVaccine: 'Measles Booster',
    nextVaccineDate: '2026-05-10',
    location: 'Kathmandu, Nepal',
  };

  const vaccinationProgress = {
    completed: 12,
    total: 15,
    percentage: 80,
  };

  const upcomingEvents = [
    {
      id: 1,
      title: 'Measles Booster Vaccination',
      date: '2026-05-10',
      time: '10:00 AM',
      location: 'Tribhuvan University Hospital',
      status: 'upcoming',
    },
    {
      id: 2,
      title: 'Health Checkup',
      date: '2026-06-05',
      time: '2:00 PM',
      location: 'Norvic Hospital',
      status: 'upcoming',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Child Profile Card */}
      <div className="rounded-2xl border border-white/10 bg-white/7 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Image and Basic Info */}
          <div className="md:col-span-1 flex flex-col items-center text-center">
            <img
              src={childData.photo}
              alt={childData.name}
              className="w-32 h-32 rounded-full mb-4 border-4 border-blue-400/30"
            />
            <h2 className="text-2xl font-bold text-white">{childData.name}</h2>
            <p className="text-slate-300">{childData.age} years old</p>
            <p className="text-sm text-slate-400">DOB: {childData.dateOfBirth}</p>
          </div>

          {/* Health Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                <p className="text-sm text-slate-300">Blood Type</p>
                <p className="text-xl font-bold text-blue-300 mt-1">{childData.bloodType}</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="text-sm text-slate-300">Age</p>
                <p className="text-xl font-bold text-emerald-300 mt-1">{childData.age} years</p>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={20} className="text-pink-400" />
                <p className="font-semibold text-white">Vaccination Progress</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-800 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${vaccinationProgress.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-slate-300">
                  {vaccinationProgress.completed}/{vaccinationProgress.total}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Scheduled Vaccination */}
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/20 to-cyan-500/10 p-6 shadow-2xl shadow-blue-900/20 backdrop-blur-xl">
        <h3 className="text-xl font-bold mb-4 text-white">Next Vaccination</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-slate-400 text-sm">Vaccine</p>
            <p className="text-2xl font-bold text-blue-200 mt-1">{childData.nextVaccine}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Scheduled Date</p>
            <p className="text-2xl font-bold text-cyan-200 mt-1">{childData.nextVaccineDate}</p>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="rounded-2xl border border-white/10 bg-white/7 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <h3 className="text-xl font-bold text-white mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="border-l-4 border-blue-500/50 rounded-lg bg-blue-500/10 p-4 border border-blue-500/20"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-white">{event.title}</h4>
                <span className="inline-block bg-blue-500/30 border border-blue-400/30 text-blue-200 text-xs px-2 py-1 rounded-full">
                  {event.status}
                </span>
              </div>
              <div className="space-y-1 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 backdrop-blur-xl">
          <p className="text-sm text-slate-300 font-semibold">Vaccinations Done</p>
          <p className="text-3xl font-bold text-emerald-300 mt-2">
            {vaccinationProgress.completed}
          </p>
        </div>
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 backdrop-blur-xl">
          <p className="text-sm text-slate-300 font-semibold">Remaining</p>
          <p className="text-3xl font-bold text-yellow-300 mt-2">
            {vaccinationProgress.total - vaccinationProgress.completed}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 backdrop-blur-xl">
          <p className="text-sm text-slate-300 font-semibold">Location</p>
          <p className="text-lg font-bold text-blue-300 mt-2">{childData.location}</p>
        </div>
      </div>
    </div>
  );
}
