import { Calendar, MapPin, Users, Tag, Clock, Phone } from 'lucide-react';

export default function ProgramsView() {
  const programs = [
    {
      id: 1,
      name: 'National Immunization Program - COVID-19 Booster',
      type: 'Mass Immunization',
      startDate: '2026-05-01',
      endDate: '2026-05-31',
      location: 'Kathmandu Valley',
      targetAge: '5-12 years',
      vaccines: ['COVID-19'],
      description: 'Special booster drive for children in Kathmandu area',
      provider: 'Ministry of Health',
      contact: '+977-1-4226374',
      participants: '5,000+',
      status: 'active',
    },
    {
      id: 2,
      name: 'Measles & Rubella Elimination Campaign',
      type: 'Campaign',
      startDate: '2026-06-01',
      endDate: '2026-06-30',
      location: 'Entire Nepal',
      targetAge: '1-14 years',
      vaccines: ['Measles', 'Rubella'],
      description: 'National campaign to eliminate measles and rubella',
      provider: 'WHO & Ministry of Health',
      contact: '+977-1-4226374',
      participants: '2,000,000+',
      status: 'active',
    },
    {
      id: 3,
      name: 'Routine Immunization Services',
      type: 'Routine Service',
      startDate: '2026-04-01',
      endDate: '2026-12-31',
      location: 'All Health Centers',
      targetAge: '0-18 months',
      vaccines: ['Pentavalent', 'Polio', 'PCV', 'Rotavirus'],
      description: 'Regular vaccination schedule at health centers',
      provider: 'Local Health Centers',
      contact: '+977-1-4226300',
      participants: 'Ongoing',
      status: 'active',
    },
    {
      id: 4,
      name: 'School Health Program - Vaccination Drive',
      type: 'School-based',
      startDate: '2026-07-01',
      endDate: '2026-09-30',
      location: 'Schools in Kathmandu',
      targetAge: '6-18 years',
      vaccines: ['Tetanus', 'Diphtheria', 'Typhoid'],
      description: 'Vaccination program at schools before school year',
      provider: 'School Health Division',
      contact: '+977-1-4226400',
      participants: '50,000+',
      status: 'upcoming',
    },
  ];

  const getStatusBadgeColor = (status) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-blue-100 text-blue-800';
  };

  const getStatusText = (status) => {
    return status === 'active' ? '🟢 Active' : '🔵 Upcoming';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white">Vaccination Programs</h2>
        <p className="text-slate-300 mt-1">
          Upcoming vaccination programs available in your area
        </p>
      </div>

      {/* Programs Grid */}
      <div className="grid gap-6">
        {programs.map((program) => (
          <div
            key={program.id}
            className="rounded-2xl border border-white/10 bg-white/7 shadow-2xl shadow-black/30 overflow-hidden hover:shadow-lg hover:bg-white/10 transition backdrop-blur-xl border-l-4 border-l-blue-500/50"
          >
            {/* Program Header */}
            <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/10 p-6 border-b border-white/10">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {program.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(program.status)}`}>
                      {getStatusText(program.status)}
                    </span>
                    <span className="inline-block bg-purple-500/20 text-purple-200 border border-purple-500/30 px-3 py-1 text-xs font-semibold rounded-full">
                      {program.type}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-slate-300">{program.description}</p>
            </div>

            {/* Program Details */}
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-blue-400 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="text-sm text-slate-400 font-semibold">Duration</p>
                      <p className="text-slate-200">
                        {program.startDate} to {program.endDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="text-red-400 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="text-sm text-slate-400 font-semibold">Location</p>
                      <p className="text-slate-200">{program.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="text-emerald-400 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="text-sm text-slate-400 font-semibold">
                        Expected Participants
                      </p>
                      <p className="text-slate-200">{program.participants}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Tag className="text-indigo-400 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="text-sm text-slate-400 font-semibold">Target Age</p>
                      <p className="text-slate-200">{program.targetAge}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="text-orange-400 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="text-sm text-slate-400 font-semibold">Contact</p>
                      <p className="text-slate-200">{program.contact}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="text-yellow-400 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="text-sm text-slate-400 font-semibold">Provider</p>
                      <p className="text-slate-200">{program.provider}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vaccines Offered */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-slate-400 font-semibold mb-3">Vaccines Offered</p>
                <div className="flex flex-wrap gap-2">
                  {program.vaccines.map((vaccine, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-500/20 text-blue-200 border border-blue-500/30 px-3 py-1 rounded-full text-sm font-semibold"
                    >
                      {vaccine}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="bg-slate-800/30 px-6 py-4 border-t border-white/10 flex gap-3">
              <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-400 transition">
                Register for Program
              </button>
              <button className="flex-1 bg-white/10 text-slate-200 py-2 px-4 rounded-lg font-semibold hover:bg-white/20 transition border border-white/20">
                Learn More
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl border-l-4 border-l-blue-500/50 border border-blue-500/20 bg-blue-500/10 p-6 backdrop-blur-xl">
        <h4 className="font-bold text-blue-200 mb-2">Need Help?</h4>
        <p className="text-blue-300/80">
          Contact your local health center or call the National Immunization Hotline
          at +977-1-4226374 for more information about vaccination programs.
        </p>
      </div>
    </div>
  );
}
