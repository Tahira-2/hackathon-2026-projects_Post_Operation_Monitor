import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { submitFeedback, getPatientSessions } from '../../api/rehabApi'
import { getMyPatients } from '../../api/connectionsApi'
import { toastSuccess, toastError } from '../../utils/toast'
import { format } from 'date-fns'
import { 
  MessageSquareMore, 
  Star, 
  SendHorizontal, 
  AlertCircle, 
  UserCircle,
  FileText,
  Clock,
  Loader2
} from 'lucide-react'

function FeedbackReview() {
  const navigate = useNavigate()
  const { patientId } = useParams()
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')
  const selectedPatient = patientId

  const [patientData, setPatientData] = useState(null)
  const [latestSessionId, setLatestSessionId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        // 1. Fetch patient sessions to get latest session and condition (plan name)
        const sessions = await getPatientSessions(selectedPatient)
        let lastSessionDate = 'No sessions yet'
        let condition = 'General Recovery'
        
        if (sessions && sessions.length > 0) {
          const latest = sessions[0]
          setLatestSessionId(latest.id)
          condition = latest.plan_name
          if (latest.completed_at) {
            lastSessionDate = format(new Date(latest.completed_at), 'MMM dd, hh:mm a')
          }
        }

        // 2. Fetch patient basic info (name)
        const patients = await getMyPatients()
        const patient = patients.find(p => p.id.toString() === selectedPatient.toString())
        
        if (patient) {
          setPatientData({
            name: patient.name || patient.username,
            condition: condition,
            lastSession: lastSessionDate,
            avatarUrl: patient.avatar_url
          })
        }
      } catch (err) {
        console.error("Could not fetch patient details", err)
        toastError("Could not load patient information")
      } finally {
        setLoading(false)
      }
    }

    if (selectedPatient) {
      fetchData()
    }
  }, [selectedPatient])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!latestSessionId) {
      toastError("No completed session found for this patient.")
      return
    }

    setSubmitting(true)

    try {
      await submitFeedback({
        patient_id: parseInt(selectedPatient),
        session_id: latestSessionId,
        rating: rating,
        guidance: message
      })
      toastSuccess('Clinical feedback has been recorded and transmitted.')
      navigate('/doctor/dashboard')
    } catch (err) {
      toastError(err.message || 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Patient Profile...</p>
      </div>
    )
  }

  if (!patientData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle size={40} className="text-red-400 mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Patient not found</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in pb-12">
      <header className="mb-12">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-2">
           <div className="h-1 w-4 bg-[var(--color-primary)] rounded-full"></div>
           Review & Insights
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Feedback</h1>
        <p className="text-lg text-[var(--color-text-muted)] mt-2 font-medium">Evaluate patient performance and provide professional guidance.</p>
      </header>

      <div className="mx-auto max-w-4xl grid gap-8 lg:grid-cols-12">
        {/* Left: Patient Info Summary */}
        <div className="lg:col-span-4 space-y-6">
           <div className="elevated-card p-6 border-none shadow-lg bg-white">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Active Review</h3>
              <div className="flex items-center gap-4 mb-8">
                 {patientData.avatarUrl ? (
                   <img src={patientData.avatarUrl} className="h-14 w-14 rounded-2xl object-cover" alt={patientData.name} />
                 ) : (
                   <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-400">
                     {patientData.name[0]}
                   </div>
                 )}
                 <div>
                    <h4 className="font-bold text-slate-900">{patientData.name}</h4>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter mt-1">{patientData.condition}</p>
                 </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-50">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Session</span>
                    <span className="text-[10px] font-bold text-slate-700">{patientData.lastSession}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data Quality</span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Excellent</span>
                 </div>
              </div>
           </div>

        </div>

        {/* Main: Feedback Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="elevated-card rounded-[2.5rem] border-none shadow-xl bg-white p-10">
            <div className="mb-10 text-center">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-widest block mb-6">Performance Evaluation</label>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`group relative h-14 w-14 flex items-center justify-center rounded-2xl transition-all duration-300 ${
                      rating >= star 
                        ? 'bg-amber-50 text-amber-500 scale-110 shadow-sm shadow-amber-100' 
                        : 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Star 
                      size={28} 
                      fill={rating >= star ? "currentColor" : "none"} 
                      strokeWidth={2.5}
                      className={rating >= star ? 'animate-in zoom-in duration-300' : ''}
                    />
                    {rating === star && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
                        {star === 5 ? 'PERFECT' : star === 4 ? 'GREAT' : star === 3 ? 'GOOD' : star === 2 ? 'FAIR' : 'NEEDS WORK'}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <div className="flex items-center justify-between mb-4 px-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14} />
                  Clinical Guidance
                </label>
                <span className="text-[10px] font-bold text-slate-300">{message.length}/500 chars</span>
              </div>
              <textarea
                className="auth-input min-h-[220px] resize-none pt-6 leading-relaxed font-medium text-slate-700 placeholder:text-slate-300 border-slate-100 bg-slate-50/30 focus:bg-white"
                placeholder="Ex: Patient showed excellent hip stability today. Suggest increasing weight-bearing duration by 10 minutes next session..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
               <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <Clock size={16} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">Send Immediately</span>
               </div>
               <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 opacity-50 cursor-not-allowed">
                  <Star size={16} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">Private Note</span>
               </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-5 rounded-[1.5rem] text-lg shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-50"
              disabled={!rating || !message || submitting || !latestSessionId}
            >
              {submitting ? <Loader2 size={22} className="animate-spin" /> : <SendHorizontal size={22} />}
              <span>{submitting ? 'Transmitting...' : 'Broadcast Feedback'}</span>
            </button>
            

            
          </form>
        </div>
      </div>
    </div>
  )
}

export default FeedbackReview
