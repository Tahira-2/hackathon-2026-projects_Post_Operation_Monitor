import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, AlertCircle, Info, Calendar, Edit2, X, Save, MapPin, User, Plus } from 'lucide-react';
import { getVaccinations, getBasicVaccines, updateVaccination, createVaccination } from '../../../api/vaccinations';

export default function VaccinationHistoryView() {
  const [vaccinationHistory, setVaccinationHistory] = useState([]);
  const [basicVaccines, setBasicVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Add State
  const [isAdding, setIsAdding] = useState(false);
  const [newData, setNewData] = useState({
    vaccine_name: '',
    dose_number: 1,
    status: 'scheduled',
    date_administered: '',
    scheduled_date: '',
    district: '',
    administered_by: '',
    notes: ''
  });

  const filterOptions = ['ALL', 'COMPLETED', 'PENDING', 'SCHEDULED', 'MISSED'];
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [historyRes, basicRes] = await Promise.all([
        getVaccinations(),
        getBasicVaccines()
      ]);
      
      const formattedHistory = historyRes.data.map(record => ({
        id: record.id,
        vaccine: record.vaccine_name,
        dose: `Dose ${record.dose_number}`,
        status: record.status ? record.status.toUpperCase() : 'UNKNOWN',
        administered: record.date_administered || record.scheduled_date || 'N/A',
        provider: record.administered_by || 'Not specified',
        location: record.district || 'Not specified',
        notes: record.notes || 'Routine Immunization',
        raw: record
      }));

      setVaccinationHistory(formattedHistory);
      setBasicVaccines(basicRes.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching vaccination data:", err);
      setError("Failed to load vaccination data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (record) => {
    setEditingId(record.id);
    setEditData({
      status: record.raw.status,
      date_administered: record.raw.date_administered || '',
      administered_by: record.raw.administered_by || '',
      district: record.raw.district || '',
      notes: record.raw.notes || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingId) {
      setEditData(prev => ({ ...prev, [name]: value }));
    } else {
      setNewData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveUpdate = async (id) => {
    try {
      setIsUpdating(true);
      const record = vaccinationHistory.find(v => v.id === id);
      await updateVaccination(id, {
        ...editData,
        vaccine_name: record.vaccine,
        dose_number: record.raw.dose_number
      });
      setEditingId(null);
      await fetchData();
    } catch (err) {
      setError("Failed to update record.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      await createVaccination(newData);
      setIsAdding(false);
      setNewData({
        vaccine_name: '',
        dose_number: 1,
        status: 'scheduled',
        date_administered: '',
        scheduled_date: '',
        district: '',
        administered_by: '',
        notes: ''
      });
      await fetchData();
    } catch (err) {
      setError("Failed to add new record.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter vaccinations
  const filteredVaccinations =
    selectedFilter === 'ALL'
      ? vaccinationHistory
      : vaccinationHistory.filter((v) => {
          if (selectedFilter === 'PENDING' && v.status === 'SCHEDULED') return true;
          return v.status === selectedFilter;
        });

  const getStatusColor = (status) => {
    switch(status) {
      case 'COMPLETED': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'MISSED': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'COMPLETED' ? (
      <CheckCircle size={20} className="text-emerald-400" />
    ) : (
      <AlertCircle size={20} className={status === 'MISSED' ? "text-red-400" : "text-yellow-400"} />
    );
  };

  if (loading && vaccinationHistory.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Vaccination History</h2>
          <p className="text-slate-300 mt-1">Record and monitor child health progress.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition border border-emerald-400/30"
          >
            <Plus size={18} />
            Add Record
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
          <button onClick={() => setError(null)}><X size={16} /></button>
        </div>
      )}

      {/* Basic Guidelines */}
      <div className="rounded-2xl border border-white/10 bg-slate-800/80 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <Info size={24} className="text-blue-400" />
          <h3 className="text-xl font-bold text-white">Recommended Vaccine Guidelines</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {basicVaccines.map((v) => (
            <div key={v.id} className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
              <h4 className="text-blue-300 font-bold">{v.name}</h4>
              <div className="text-xs text-slate-400 mt-2 space-y-1">
                <p>Time: <span className="text-slate-200">{v.recommended_timeframe}</span></p>
                <p>Deadline: <span className="text-slate-200">{v.deadline_days} days</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD NEW RECORD FORM */}
      {isAdding && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="text-emerald-400" /> Add New Vaccination Entry
            </h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white"><X /></button>
          </div>
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase font-bold">Vaccine Name</label>
              <input required name="vaccine_name" value={newData.vaccine_name} onChange={handleInputChange} placeholder="e.g. BCG" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase font-bold">Dose Number</label>
              <input type="number" name="dose_number" value={newData.dose_number} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase font-bold">Status</label>
              <select name="status" value={newData.status} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white">
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase font-bold">Administered Date</label>
              <input type="date" name="date_administered" value={newData.date_administered} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase font-bold">Scheduled Date</label>
              <input type="date" name="scheduled_date" value={newData.scheduled_date} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase font-bold">District</label>
              <input name="district" value={newData.district} onChange={handleInputChange} placeholder="e.g. Kathmandu" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-slate-400 uppercase font-bold">Administered By</label>
              <input name="administered_by" value={newData.administered_by} onChange={handleInputChange} placeholder="Doctor name or Hospital" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
            </div>
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs text-slate-400 uppercase font-bold">Notes</label>
              <textarea name="notes" value={newData.notes} onChange={handleInputChange} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white h-20" />
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition">Cancel</button>
              <button type="submit" disabled={isUpdating} className="px-6 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition disabled:opacity-50">Save Record</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 border-b border-white/10 pb-2">
        {filterOptions.map((o) => (
          <button key={o} onClick={() => setSelectedFilter(o)} className={`px-4 py-2 font-semibold transition border-b-2 -mb-2 ${selectedFilter === o ? 'border-blue-400 text-blue-300' : 'border-transparent text-slate-400 hover:text-slate-300'}`}>{o}</button>
        ))}
      </div>

      {/* Ledger */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
        <h3 className="text-lg font-bold text-white mb-6 underline underline-offset-8 decoration-blue-500/50">LEDGER ENTRIES · {filteredVaccinations.length}</h3>
        
        {filteredVaccinations.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg">No records found.</p>
            {!isAdding && <button onClick={() => setIsAdding(true)} className="mt-4 text-blue-400 hover:underline font-bold">Add your first vaccination record</button>}
          </div>
        ) : (
          <div className="space-y-8">
            {filteredVaccinations.map((v, i) => (
              <div key={v.id} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${v.status === 'COMPLETED' ? 'bg-emerald-500' : v.status === 'MISSED' ? 'bg-red-500' : 'bg-yellow-500'} border-4 border-slate-950`} />
                  {i !== filteredVaccinations.length - 1 && <div className="w-1 h-full bg-slate-800 my-2" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-6 backdrop-blur-sm transition hover:bg-slate-800/60 group">
                    {editingId === v.id ? (
                      <div className="space-y-4">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <h4 className="text-xl font-bold text-white">{v.vaccine}</h4>
                          <div className="flex gap-2">
                            <button onClick={() => handleSaveUpdate(v.id)} disabled={isUpdating} className="p-2 bg-emerald-600 rounded-lg"><Save size={18} /></button>
                            <button onClick={handleCancelEdit} className="p-2 bg-slate-700 rounded-lg"><X size={18} /></button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <select name="status" value={editData.status} onChange={handleInputChange} className="bg-slate-900 border border-white/10 rounded-lg p-2 text-white">
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="missed">Missed</option>
                          </select>
                          <input type="date" name="date_administered" value={editData.date_administered} onChange={handleInputChange} className="bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                          <input name="administered_by" value={editData.administered_by} onChange={handleInputChange} placeholder="Provider" className="bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                          <input name="district" value={editData.district} onChange={handleInputChange} placeholder="District" className="bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-2xl font-bold text-white">{v.vaccine}</h4>
                            <p className="text-sm text-slate-500">{v.dose}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button onClick={() => handleEditClick(v)} className="flex items-center gap-2 p-2 px-3 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-500/40 transition">
                              <Edit2 size={14} /> <span className="text-xs font-bold uppercase tracking-wider">Edit</span>
                            </button>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full border tracking-widest ${getStatusColor(v.status)}`}>{v.status}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div><p className="text-slate-500 uppercase text-[10px] font-bold">Date</p><p className="text-white font-semibold flex items-center gap-2"><Calendar size={14} className="text-blue-400" /> {v.administered}</p></div>
                          <div><p className="text-slate-500 uppercase text-[10px] font-bold">Provider</p><p className="text-white font-semibold flex items-center gap-2"><User size={14} className="text-blue-400" /> {v.provider}</p></div>
                          <div><p className="text-slate-500 uppercase text-[10px] font-bold">Location</p><p className="text-white font-semibold flex items-center gap-2"><MapPin size={14} className="text-blue-400" /> {v.location}</p></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
