import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, ArrowRight, User } from 'lucide-react'
import { joinDoctor } from '../../api/connectionsApi'
import logo from '../../assets/Devcare-logo.png'

const ACCESS_TOKEN_KEY = 'devcare_access_token'

function JoinDoctor() {
  const { token } = useParams()
  const navigate = useNavigate()
  const hasCalledApi = useRef(false)

  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'already' | 'error'
  const [message, setMessage] = useState('')
  const [doctorInfo, setDoctorInfo] = useState(null)

  useEffect(() => {
    if (!token || hasCalledApi.current) return

    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (!storedToken) {
      // Not logged in — redirect to login, then come back
      navigate(`/login?next=/join/${token}`, { replace: true })
      return
    }

    const establishConnection = async () => {
      hasCalledApi.current = true
      try {
        const data = await joinDoctor(token)
        if (data.detail?.toLowerCase().includes('already')) {
          setStatus('already')
        } else {
          setStatus('success')
        }
        setMessage(data.detail)
        if (data.doctor) {
          setDoctorInfo(data.doctor)
        }
      } catch (err) {
        setStatus('error')
        setMessage(err.message)
      }
    }

    establishConnection()
  }, [token, navigate])

  const config = {
    loading: {
      icon: <Loader2 size={48} className="text-[var(--color-primary)] animate-spin" />,
      title: 'Verifying Link...',
      subtitle: 'Please wait while we securely connect you.',
      bg: 'bg-[var(--color-primary)]/5',
    },
    success: {
      icon: <CheckCircle2 size={48} className="text-emerald-500" />,
      title: 'Successfully Connected!',
      subtitle: message || 'You are now linked with your doctor on DevCare.',
      bg: 'bg-emerald-50',
    },
    already: {
      icon: <CheckCircle2 size={48} className="text-blue-500" />,
      title: 'Already Connected',
      subtitle: message || 'You are already linked with this doctor.',
      bg: 'bg-blue-50',
    },
    error: {
      icon: <XCircle size={48} className="text-red-500" />,
      title: 'Link Invalid',
      subtitle: message || 'This link is inactive, expired, or invalid.',
      bg: 'bg-red-50',
    },
  }

  const c = config[status]

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f7ff] p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-10">
          <img src={logo} alt="DevCare Logo" className="h-8 w-auto" />
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className={`${c.bg} px-10 py-12 flex flex-col items-center text-center transition-all duration-500`}>
            <div className="mb-6">{c.icon}</div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-2">{c.title}</h1>
            <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-xs">{c.subtitle}</p>
          </div>

          {doctorInfo && (
            <div className="px-10 py-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[var(--color-primary)] shadow-sm">
                <User size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Your Provider</p>
                <p className="font-bold text-slate-900">{doctorInfo.name}</p>
              </div>
            </div>
          )}

          <div className="px-10 py-8 space-y-3">
            {(status === 'success' || status === 'already') && (
              <button
                onClick={() => navigate('/dashboard/patient', { replace: true })}
                className="w-full flex items-center justify-center gap-2 h-[56px] rounded-2xl bg-[var(--color-primary)] text-white font-bold text-sm hover:bg-[var(--color-primary-dark)] transition-all shadow-lg shadow-blue-200"
              >
                Go to Dashboard <ArrowRight size={16} />
              </button>
            )}
            {status === 'error' && (
              <button
                onClick={() => navigate('/', { replace: true })}
                className="w-full flex items-center justify-center gap-2 h-[56px] rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all"
              >
                Back to Home
              </button>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 font-medium mt-8 tracking-wide">
          DEVCARE — SECURE TELEREHABILITATION PLATFORM
        </p>
      </div>
    </div>
  )
}

export default JoinDoctor
