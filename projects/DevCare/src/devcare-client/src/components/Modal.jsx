import { X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between border-b border-slate-50 px-8 py-6">
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          <button 
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            <X size={20} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default Modal
