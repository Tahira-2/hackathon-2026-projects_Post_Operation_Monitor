import { useState, useEffect } from 'react'
import { 
  ClipboardList, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Info, 
  ArrowRight,
  SendHorizontal,
  Loader2
} from 'lucide-react'
import { getMyPatients } from '../../api/connectionsApi'
import { getExercises, createRehabPlan } from '../../api/rehabApi'
import { toastSuccess, toastError } from '../../utils/toast'

function AssignTherapy() {
  const [selectedPatient, setSelectedPatient] = useState('')
  const [patients, setPatients] = useState([])
  const [availableExercises, setAvailableExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [exercises, setExercises] = useState([]) // Array of { id, target_reps, order }
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')

  const [planName, setPlanName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    Promise.all([getMyPatients(), getExercises()])
      .then(([pData, exData]) => {
        setPatients(pData)
        setAvailableExercises(exData)
      })
      .catch(err => {
        console.error('Error fetching data:', err)
        toastError('Failed to load required data. Please refresh.')
      })
      .finally(() => setLoading(false))
  }, [])

  const toggleExercise = (id) => {
    const exists = exercises.find(e => e.exercise_id === id)
    if (exists) {
      // Remove it and re-calculate the order of the remaining exercises
      const updatedExercises = exercises
        .filter(e => e.exercise_id !== id)
        .sort((a, b) => a.order - b.order)
        .map((ex, index) => ({
          ...ex,
          order: index + 1
        }))
      setExercises(updatedExercises)
    } else {
      setExercises([...exercises, { exercise_id: id, target_reps: 10, order: exercises.length + 1 }])
    }
  }

  const updateExerciseParams = (id, field, value) => {
    setExercises(exercises.map(ex => 
      ex.exercise_id === id ? { ...ex, [field]: parseInt(value) || 0 } : ex
    ))
  }

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, newTask.trim()])
      setNewTask('')
    }
  }

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index))
  }

  const handleDeployPlan = async () => {
    if (!selectedPatient) return
    
    // Sort exercises to ensure order is sequential before sending
    const sortedExercises = [...exercises].sort((a, b) => a.order - b.order)

    setSubmitting(true)
    try {
      const planData = {
        patient_id: parseInt(selectedPatient),
        name: planName,
        start_date: startDate,
        end_date: endDate,
        tasks: tasks,
        exercises: sortedExercises
      }
      
      const response = await createRehabPlan(planData)
      toastSuccess(`Plan successfully deployed for ${patients.find(p => String(p.id) === selectedPatient)?.name}!`)
      
      // Reset form
      setExercises([])
      setTasks([])
      setSelectedPatient('')
      setPlanName('')
      setStartDate('')
      setEndDate('')
    } catch (err) {
      toastError(`Failed to deploy plan: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in pb-12">
      <header className="mb-12">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-2">
           <div className="h-1 w-4 bg-[var(--color-primary)] rounded-full"></div>
           Plan Configuration
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Assign Recovery Plan</h1>
        <p className="text-lg text-[var(--color-text-muted)] mt-2 font-medium">Create a personalized combination of exercises and daily tasks.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-8">
          
          {/* Step 1: Select Patient */}
          <section className="elevated-card p-8 border-none shadow-lg relative overflow-hidden">
            {loading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center gap-3">
                <Loader2 className="animate-spin text-[var(--color-primary)]" size={20} />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Clinical Directory...</span>
              </div>
            )}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">01</div>
              <h2 className="text-xl font-bold">Select Target Patient</h2>
            </div>
            <div className="relative">
               <select 
                className="auth-input h-[56px] appearance-none font-semibold text-slate-700 disabled:opacity-50"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                disabled={loading}
               >
                <option value="">Choose a patient from your directory...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (@{p.username})</option>
                ))}
                {!loading && patients.length === 0 && (
                  <option disabled>No connected patients found. Use 'New Connection' first.</option>
                )}
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ArrowRight size={18} className="rotate-90" />
               </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Plan Name</label>
                <input
                  type="text"
                  placeholder="Enter plan name (e.g. Knee Recovery Phase 1)"
                  className="auth-input h-[48px]"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Start Date</label>
                  <input
                    type="date"
                    className="auth-input h-[48px]"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">End Date</label>
                  <input
                    type="date"
                    className="auth-input h-[48px]"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: Physical Exercises */}
          <section className="elevated-card p-8 border-none shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">02</div>
                <h2 className="text-xl font-bold">Physical Therapy Library</h2>
              </div>
              <div className="relative hidden sm:block">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <input type="text" placeholder="Search exercises..." className="bg-slate-50 border border-slate-100 rounded-lg py-2 pl-9 pr-4 text-xs font-medium outline-none focus:border-blue-200" />
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {availableExercises.map(ex => {
                const selected = exercises.find(e => e.exercise_id === ex.id)
                const getIcon = (name) => {
                  if (name.includes('Bicep')) return '💪'
                  if (name.includes('Squat')) return '🦵'
                  if (name.includes('Shoulder')) return '🏋️'
                  if (name.includes('Knee')) return '🦵'
                  return '🦿'
                }

                return (
                  <div 
                    key={ex.id}
                    onClick={() => toggleExercise(ex.id)}
                    className={`group cursor-pointer rounded-[1.5rem] border-2 p-5 transition-all flex flex-col gap-4 ${
                      selected 
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]' 
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl transition-all shadow-sm ${selected ? 'bg-white' : 'bg-slate-50'}`}>
                        {getIcon(ex.name)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-bold transition-colors ${selected ? 'text-[var(--color-primary)]' : 'text-slate-800'}`}>{ex.name}</h4>
                          {selected && <CheckCircle2 size={18} className="text-[var(--color-primary)] animate-in zoom-in duration-300" />}
                        </div>
                        <p className={`text-xs mt-1.5 font-medium leading-relaxed transition-colors ${selected ? 'text-blue-600/80' : 'text-slate-500'}`}>{ex.description}</p>
                      </div>
                    </div>

                    {selected && (
                      <div className="flex items-center gap-4 pt-4 border-t border-blue-100 animate-in slide-in-from-top-2 duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="flex-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-blue-400 block mb-1.5">No. of Reps</label>
                          <input 
                            type="number" 
                            value={selected.target_reps}
                            onChange={(e) => updateExerciseParams(ex.id, 'target_reps', e.target.value)}
                            className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:border-blue-300 outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Step 3: Daily Tasks */}
          <section className="elevated-card p-8 border-none shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">03</div>
              <h2 className="text-xl font-bold">Daily Recovery Roadmap</h2>
            </div>
            
            <div className="flex items-end gap-4 mb-8">
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">New Milestone / Task</label>
                <div className="relative">
                  <input 
                    type="text" 
                    className="auth-input pr-12 h-[60px] border-slate-200 shadow-sm focus:shadow-md transition-all" 
                    placeholder="e.g., Apply ice compression for 15 mins..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  />
                </div>
              </div>
              <button 
                onClick={addTask}
                className="bg-[var(--color-secondary)] text-white px-8 rounded-2xl h-[60px] flex items-center justify-center gap-2 font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 shrink-0"
              >
                <Plus size={20} strokeWidth={3} />
                <span>Add Task</span>
              </button>
            </div>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2rem]">
                   <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                      <Info size={24} />
                   </div>
                   <p className="text-sm font-bold text-slate-400">No supplemental tasks added yet</p>
                   <p className="text-xs text-slate-400 mt-1">Add items like nutrition, rest, or cold therapy.</p>
                </div>
              ) : (
                tasks.map((task, index) => (
                  <div key={index} className="group flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="h-6 w-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-[10px] font-black">
                         {index + 1}
                       </div>
                       <span className="text-sm font-semibold text-slate-700">{task}</span>
                    </div>
                    <button 
                      onClick={() => removeTask(index)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4">
          <div className="sticky top-8 space-y-6">
            <div className="elevated-card p-8 border-none shadow-xl bg-white relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-primary)]"></div>
               <h2 className="text-xl font-bold mb-8">Plan Summary</h2>
               
               <div className="space-y-6">
                 <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Recipient</p>
                   <p className="text-sm font-bold text-slate-900">
                     {selectedPatient ? (patients.find(p => String(p.id) === selectedPatient)?.name || '---') : '---'}
                   </p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Exercises</p>
                      <p className="text-2xl font-black text-slate-900">{exercises.length}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Tasks</p>
                      <p className="text-2xl font-black text-slate-900">{tasks.length}</p>
                    </div>
                 </div>
               </div>

               <button 
                 disabled={!selectedPatient || !planName || !startDate || !endDate || startDate > endDate || (exercises.length === 0 && tasks.length === 0) || submitting}
                 className="btn-primary w-full mt-10 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-blue-200 disabled:opacity-50"
                 onClick={handleDeployPlan}
               >
                 {submitting ? <Loader2 size={20} className="animate-spin" /> : <SendHorizontal size={20} />}
                 <span>{submitting ? 'Deploying...' : 'Deploy Plan'}</span>
               </button>
               
            </div>

            <div className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100">
               <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                     <CheckCircle2 size={20} />
                  </div>
                  <div>
                     <p className="text-sm font-bold text-emerald-800 leading-tight">Patient Connected</p>
                     <p className="text-xs text-emerald-600 mt-1 font-medium">Real-time telemetry will activate once plan is assigned.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignTherapy
