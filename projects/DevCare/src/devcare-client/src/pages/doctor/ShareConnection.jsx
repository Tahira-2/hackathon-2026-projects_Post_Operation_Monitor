import { useState } from 'react'
import {
  UserPlus,
  QrCode,
  Copy,
  MessageCircle,
  Smartphone,
  Mail,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Link2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { createJoinLink } from '../../api/connectionsApi'
import { toastSuccess, toastError } from '../../utils/toast'

function ShareConnection() {
  const [slug, setSlug] = useState('')
  const [linkData, setLinkData] = useState(null) // { link, token, qr_code }
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const data = await createJoinLink({ slug: slug.trim() })
      setLinkData(data)
      toastSuccess('Join link generated successfully.')
    } catch (err) {
      toastError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!shareLink) return
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    toastSuccess('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Build a real shareable URL using the current frontend origin + the token
  const shareLink = linkData?.token
    ? `${window.location.origin}/join/${linkData.token}`
    : ''


  return (
    <div className="animate-fade-in pb-12">
      <header className="mb-12">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-2">
          <div className="h-1 w-4 bg-[var(--color-primary)] rounded-full"></div>
          Onboarding Center
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Expand Your Network</h1>
        <p className="mt-2 text-lg text-[var(--color-text-muted)] max-w-2xl font-medium">
          Generate a secure, shareable link and QR code to onboard new patients instantly.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-12">

        {/* Left Column: QR Code */}
        <div className="lg:col-span-4">
          <div className="elevated-card rounded-[2.5rem] border-none bg-white p-10 text-center h-full flex flex-col justify-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16" />

            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">
              Instant QR Gateway
            </h3>

            <div className="mx-auto bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 mb-8 relative group flex items-center justify-center" style={{ minHeight: 200 }}>
              {linkData?.qr_code ? (
                <>
                  <div className="absolute inset-0 bg-[var(--color-primary)] opacity-0 group-hover:opacity-5 transition-opacity rounded-[2.5rem]" />
                  <img
                    src={linkData.qr_code}
                    alt="Secure QR Code"
                    className="w-full h-auto relative z-10"
                  />
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-300">
                  <QrCode size={72} strokeWidth={1} />
                  <p className="text-xs font-bold uppercase tracking-widest">Generate a link first</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-left p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <Smartphone className="text-blue-500 shrink-0" size={18} />
              <p className="text-[11px] font-semibold text-slate-600 leading-tight">
                Patient scans via any camera to establish their clinical link.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-8">

          {/* Generator Card */}
          <div className="elevated-card rounded-[2.5rem] border-none bg-white p-10 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shadow-sm">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Generate Join Link</h3>
                <p className="text-sm text-slate-500 font-medium">Optionally customize the link slug</p>
              </div>
            </div>

            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  devcare.app/join/<span className="text-[var(--color-primary)]">your-slug</span>
                </label>
                <input
                  type="text"
                  id="slug-input"
                  placeholder="e.g. dr-sarah-physio"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  className="auth-input h-[56px] bg-slate-50 border-slate-100 font-bold text-slate-800"
                />
              </div>
              <button
                id="generate-link-btn"
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--color-primary)] text-white font-bold text-sm hover:bg-[var(--color-primary-dark)] transition-all disabled:opacity-60 shrink-0"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {loading ? 'Generating…' : 'Generate'}
              </button>
            </div>


          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Share Link Card */}
            <div className="elevated-card rounded-[2.5rem] border-none bg-white p-10 shadow-lg">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-sm">
                <Link2 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Invite Link</h3>
              <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
                Copy and share this secure link with your patient.
              </p>

              <div className="relative group">
                <input
                  readOnly
                  value={shareLink ? shareLink.replace('https://', '') : ''}
                  placeholder="Generate a link above…"
                  className="auth-input pr-12 h-[56px] bg-slate-50 border-slate-100 font-bold text-slate-800 cursor-default truncate"
                />
                <button
                  id="copy-link-btn"
                  onClick={handleCopy}
                  disabled={!linkData}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-xl transition-all disabled:opacity-40 ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
                  }`}
                >
                  {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                </button>
              </div>
              {copied && (
                <p className="text-[10px] font-black text-emerald-600 mt-3 text-center uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                  Copied to Clipboard
                </p>
              )}
            </div>

            {/* Multi-channel Share */}
            <div className="elevated-card rounded-[2.5rem] border-none bg-white p-10 shadow-lg">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-sm">
                <MessageCircle size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">One-Click Share</h3>
              <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
                Directly send invitations through preferred messaging platforms.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={() => {
                    if (shareLink) window.open(`https://wa.me/?text=${encodeURIComponent(shareLink)}`, '_blank')
                  }}
                  disabled={!linkData}
                  style={{
                    backgroundColor: 'rgba(37,211,102,0.12)',
                    color: '#25D366',
                    border: 'none',
                    cursor: linkData ? 'pointer' : 'default',
                    opacity: linkData ? 1 : 0.4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '16px',
                    borderRadius: '16px',
                    transition: 'opacity 0.2s',
                    width: '100%',
                  }}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>WhatsApp</span>
                </button>

                {/* Email */}
                <a
                  href={shareLink ? `mailto:?subject=Join%20me%20on%20DevCare&body=${encodeURIComponent(shareLink)}` : '#'}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl transition-all bg-blue-50 text-blue-600 hover:bg-blue-100 ${!linkData ? 'pointer-events-none opacity-40' : ''}`}
                >
                  <Mail size={24} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Email</span>
                </a>

                {/* SMS */}
                <a
                  href={shareLink ? `sms:?body=${encodeURIComponent(shareLink)}` : '#'}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 ${!linkData ? 'pointer-events-none opacity-40' : ''}`}
                >
                  <Smartphone size={24} />
                  <span className="text-[9px] font-black uppercase tracking-widest">SMS</span>
                </a>
              </div>
            </div>
          </div>

          {/* Generated Token Info */}
          {linkData?.token && (
            <div className="elevated-card rounded-[2.5rem] border-none bg-white shadow-xl overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Active Link Details</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Token Reference</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <CheckCircle2 size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                </div>
              </div>

              <div className="px-10 py-6 flex items-center gap-5">
                <div className="h-12 w-12 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                  <Link2 size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Token</p>
                  <p className="font-bold text-slate-900 text-sm truncate font-mono">{linkData.token}</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <Clock size={10} /> Just now
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShareConnection
