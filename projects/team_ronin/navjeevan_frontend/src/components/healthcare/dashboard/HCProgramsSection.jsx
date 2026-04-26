import { useMemo, useState } from 'react';
import { PlusCircle, Save, UserPlus } from 'lucide-react';

export default function HCProgramsSection({
  programs,
  programForm,
  districtOptions,
  vaccineOptions,
  predefinedVaccineOptions,
  selectedPredefinedVaccine,
  customVaccineName,
  eventStatusOptions,
  onProgramChange,
  onProgramSubmit,
  onSelectPredefinedVaccine,
  onAddPredefinedVaccine,
  onCustomVaccineNameChange,
  onAddCustomVaccine,
  onReloadVaccines,
  onGoToCitizens,
  isLoading,
  isSubmitting,
  isVaccineSubmitting,
  vaccineLoadError,
  error,
  success,
}) {
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const formatStatusLabel = (status) =>
    (status || '')
      .toString()
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const getStatusBadgeClass = (status) => {
    if (status === 'IN_PROGRESS') {
      return 'border-amber-400/30 bg-amber-400/10 text-amber-200';
    }
    if (status === 'ENDED') {
      return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200';
    }
    return 'border-slate-400/30 bg-slate-400/10 text-slate-200';
  };

  const totalPages = Math.max(1, Math.ceil(programs.length / ITEMS_PER_PAGE));

  const paginatedPrograms = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return programs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, programs]);

  const handlePrevPage = () => {
    setCurrentPage((previousPage) => Math.max(1, previousPage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((previousPage) => Math.min(totalPages, previousPage + 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/7 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div>
          <h2 className="text-xl font-bold text-white">Program Register</h2>
          <p className="text-sm text-slate-400">Upcoming programs are listed below in paginated form.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onGoToCitizens}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-slate-800/70 px-4 py-2 font-semibold text-white transition hover:bg-slate-700/80"
          >
            <UserPlus size={16} />
            Add Citizen
          </button>
          <button
            type="button"
            onClick={() => setIsAddProgramOpen((currentState) => !currentState)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 font-semibold text-white transition hover:bg-blue-400"
          >
            <PlusCircle size={16} />
            {isAddProgramOpen ? 'Close Add Program' : 'Add Program'}
          </button>
        </div>
      </div>

      {isAddProgramOpen && (
        <form
          onSubmit={onProgramSubmit}
          className="rounded-2xl border border-white/10 bg-white/7 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-400/20">
              <PlusCircle size={20} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">Add Upcoming Program</h2>
              <p className="text-sm text-slate-400">Add complete scheduling details for better planning and tracking.</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Program Name *
              </label>
              <input
                value={programForm.name}
                onChange={(event) => onProgramChange('name', event.target.value)}
                placeholder="Enter a clear program title"
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Program Date *
                </label>
                <input
                  value={programForm.date}
                  onChange={(event) => onProgramChange('date', event.target.value)}
                  type="date"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Status
                </label>
                <select
                  value={programForm.eventStatus}
                  onChange={(event) => onProgramChange('eventStatus', event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {eventStatusOptions.map((status) => (
                    <option key={status} value={status} className="bg-white text-slate-900">
                      {formatStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Location District *
              </label>
              <input
                value={programForm.location}
                onChange={(event) => onProgramChange('location', event.target.value)}
                list="program-district-options"
                placeholder="Select or type district"
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <datalist id="program-district-options">
              {districtOptions.map((district) => (
                <option key={district.id} value={district.name} />
              ))}
            </datalist>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Target Group *
                </label>
                <input
                  value={programForm.targetGroup}
                  onChange={(event) => onProgramChange('targetGroup', event.target.value)}
                  placeholder="e.g. children under 5"
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Notes
                </label>
                <textarea
                  value={programForm.notes}
                  onChange={(event) => onProgramChange('notes', event.target.value)}
                  placeholder="Optional operational details"
                  rows={1}
                  className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Select Vaccines
                </label>
                <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-200">
                  {programForm.vaccineIds.length} selected
                </span>
              </div>
              <select
                multiple
                value={programForm.vaccineIds}
                onChange={(event) =>
                  onProgramChange(
                    'vaccineIds',
                    Array.from(event.target.selectedOptions).map((option) => option.value),
                  )
                }
                className="min-h-36 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {vaccineOptions.length === 0 && (
                  <option disabled className="bg-white text-slate-900">
                    No vaccines found. Please add vaccines first.
                  </option>
                )}
                {vaccineOptions.map((vaccine) => (
                  <option key={vaccine.id} value={vaccine.id} className="bg-white text-slate-900">
                    {vaccine.vaccination_name} ({vaccine.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Add from predefined vaccines
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                <select
                  value={selectedPredefinedVaccine}
                  onChange={(event) => onSelectPredefinedVaccine(event.target.value)}
                  className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {predefinedVaccineOptions.map((name) => (
                    <option key={name} value={name} className="bg-white text-slate-900">
                      {name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={onAddPredefinedVaccine}
                  className="rounded-lg border border-blue-400/30 bg-blue-500/15 px-4 py-2 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/25"
                >
                  Add to Selection
                </button>
              </div>
            </div>
            {vaccineLoadError && (
              <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                Vaccine load error: {vaccineLoadError}
              </div>
            )}
            <p className="text-xs text-slate-400">
              Hold Ctrl (or Cmd on Mac) to select multiple vaccines. If options are empty, refresh to reload data.
            </p>
            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Add custom vaccine (not predefined)
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <input
                  value={customVaccineName}
                  onChange={(event) => onCustomVaccineNameChange(event.target.value)}
                  placeholder="Vaccine name"
                  className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={onAddCustomVaccine}
                  disabled={isVaccineSubmitting}
                  className="rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Add Custom
                </button>
                <button
                  type="button"
                  onClick={onReloadVaccines}
                  disabled={isLoading}
                  className="rounded-lg border border-white/20 bg-slate-800/60 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700/80 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? 'Reloading...' : 'Reload Vaccines'}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Saving Program...' : <><Save size={16} /> Save Program</>}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/7 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">Upcoming Programs</h2>
            <p className="text-sm text-slate-400">Programs you have already scheduled.</p>
          </div>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            {programs.length} total
          </span>
        </div>

        <div className="space-y-4">
          {isLoading && (
            <div className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-slate-300">
              Loading upcoming programs...
            </div>
          )}

          {!isLoading && programs.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-slate-300">
              No upcoming programs found.
            </div>
          )}

          {paginatedPrograms.map((program) => (
            <div key={`${program.name}-${program.date}`} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">{program.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{program.location}</p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(program.status)}`}
                >
                  {formatStatusLabel(program.status)}
                </span>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                <div>
                  <p className="text-slate-500">Date</p>
                  <p className="font-medium text-white">{program.date}</p>
                </div>
                <div>
                  <p className="text-slate-500">Target group</p>
                  <p className="font-medium text-white">{program.targetGroup}</p>
                </div>
                <div>
                  <p className="text-slate-500">Notes</p>
                  <p className="font-medium text-white">{program.notes}</p>
                </div>
                <div>
                  <p className="text-slate-500">Vaccines</p>
                  <p className="font-medium text-white">{program.vaccines?.join(', ') || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}

          {!isLoading && programs.length > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm">
              <p className="text-slate-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
