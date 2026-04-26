import React, { useState } from 'react';
import { Download, CheckCircle, AlertCircle } from 'lucide-react';

export default function VaccinationHistoryView() {
  const vaccinationHistory = [
    {
      id: 1,
      vaccine: 'COVID-19',
      dose: 'Dose 3 of 3',
      status: 'PENDING',
      administered: '14 Nov 2022',
      provider: 'Norvic Hospital',
      location: 'Kathmandu, Kathmandu',
      preventedDisease: 'PREVENTS SARS-COV-2',
    },
    {
      id: 2,
      vaccine: 'COVID-19',
      dose: 'Dose 2 of 3',
      status: 'COMPLETED',
      administered: '03 Dec 2021',
      provider: 'Tribhuvan University Hospital',
      location: 'Kathmandu, Kathmandu',
      preventedDisease: 'PREVENTS SARS-COV-2',
    },
    {
      id: 3,
      vaccine: 'COVID-19',
      dose: 'Dose 1 of 3',
      status: 'COMPLETED',
      administered: '22 Aug 2021',
      provider: 'Tribhuvan University Hospital',
      location: 'Kathmandu, Kathmandu',
      preventedDisease: 'PREVENTS SARS-COV-2',
    },
    {
      id: 4,
      vaccine: 'Pentavalent',
      dose: 'Dose 3 of 3',
      status: 'COMPLETED',
      administered: '15 Jun 2022',
      provider: 'Kanti Children\'s Hospital',
      location: 'Kathmandu, Kathmandu',
      preventedDisease: 'PREVENTS DIPHTHERIA, TETANUS, PERTUSSIS',
    },
    {
      id: 5,
      vaccine: 'Measles',
      dose: 'Dose 1 of 2',
      status: 'COMPLETED',
      administered: '10 Sep 2021',
      provider: 'Sukraraj Tropical & Communicable Disease Hospital',
      location: 'Kathmandu, Kathmandu',
      preventedDisease: 'PREVENTS MEASLES, MUMPS, RUBELLA',
    },
    {
      id: 6,
      vaccine: 'Polio',
      dose: 'Dose 2 of 4',
      status: 'COMPLETED',
      administered: '05 Jul 2021',
      provider: 'Norvic Hospital',
      location: 'Kathmandu, Kathmandu',
      preventedDisease: 'PREVENTS POLIOMYELITIS',
    },
  ];

  const filterOptions = ['ALL', 'COMPLETED', 'PENDING'];
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  // Filter vaccinations based on selected status
  const filteredVaccinations =
    selectedFilter === 'ALL'
      ? vaccinationHistory
      : vaccinationHistory.filter((v) => v.status === selectedFilter);

  const getStatusColor = (status) => {
    return status === 'COMPLETED'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
  };

  const getStatusIcon = (status) => {
    return status === 'COMPLETED' ? (
      <CheckCircle size={20} className="text-emerald-400" />
    ) : (
      <AlertCircle size={20} className="text-yellow-400" />
    );
  };

  const getTimelineColor = (status) => {
    return status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-yellow-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Vaccination History</h2>
          <p className="text-slate-300 mt-1">
            Complete chronological record of all administered doses.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition w-fit border border-blue-400/30">
          <Download size={18} />
          Export PDF Card
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 border-b border-white/10">
        {filterOptions.map((option) => (
          <button
            key={option}
            onClick={() => setSelectedFilter(option)}
            className={`px-4 py-2 font-semibold transition border-b-2 ${
              selectedFilter === option
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Ledger Entries */}
      <div className="rounded-2xl border border-white/10 bg-white/7 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <h3 className="text-lg font-bold text-white mb-4">
          LEDGER ENTRIES · {filteredVaccinations.length}
        </h3>

        <div className="space-y-6">
          {filteredVaccinations.map((vaccine, index) => (
            <div key={vaccine.id}>
              {/* Timeline dot and line */}
              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-4 h-4 rounded-full ${getTimelineColor(
                      vaccine.status
                    )} border-4 border-slate-950 shadow-sm`}
                  />
                  {index !== filteredVaccinations.length - 1 && (
                    <div className="w-1 h-24 bg-slate-700 my-2" />
                  )}
                </div>

                {/* Vaccine Details */}
                <div className="flex-1 pb-6">
                  <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-6 backdrop-blur-sm">
                    {/* Vaccine Name and Dose */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-2xl font-bold text-white">{vaccine.vaccine}</h4>
                        <p className="text-sm text-slate-400">{vaccine.dose}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(vaccine.status)}
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(
                            vaccine.status
                          )}`}
                        >
                          {vaccine.status}
                        </span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">ADMINISTERED</p>
                        <p className="text-lg font-semibold text-white">
                          {vaccine.administered}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">PROVIDER</p>
                        <p className="text-lg font-semibold text-white">
                          {vaccine.provider}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-slate-400">LOCATION</p>
                        <p className="text-lg font-semibold text-white">
                          {vaccine.location}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-slate-400">
                          {vaccine.preventedDisease}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 backdrop-blur-xl">
          <p className="text-sm text-slate-300 font-semibold">Completed Doses</p>
          <p className="text-3xl font-bold text-emerald-300 mt-2">
            {vaccinationHistory.filter((v) => v.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 backdrop-blur-xl">
          <p className="text-sm text-slate-300 font-semibold">Pending Doses</p>
          <p className="text-3xl font-bold text-yellow-300 mt-2">
            {vaccinationHistory.filter((v) => v.status === 'PENDING').length}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 backdrop-blur-xl">
          <p className="text-sm text-slate-300 font-semibold">Total Doses</p>
          <p className="text-3xl font-bold text-blue-300 mt-2">
            {vaccinationHistory.length}
          </p>
        </div>
      </div>
    </div>
  );
}
