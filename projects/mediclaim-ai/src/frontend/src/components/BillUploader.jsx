import { useState, useRef } from 'react'

export default function BillUploader({ file, onFileSelect }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.type === 'application/pdf') {
      onFileSelect(dropped)
    }
  }

  const handleChange = (e) => {
    const selected = e.target.files[0]
    if (selected) onFileSelect(selected)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div>
      <div
        className={`border-2 border-dashed border-white/[0.15] bg-[#020617] hover:bg-white/[0.02] rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${dragOver ? 'border-teal/50 bg-teal/5' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        id="bill-upload-zone"
      >
        {file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-teal/10 border border-teal/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-teal-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-white">{file.name}</p>
              <p className="text-sm text-slate-light mt-1 font-mono">{formatSize(file.size)} • PDF</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onFileSelect(null) }}
              className="text-xs text-red hover:text-red/80 font-medium transition-colors mt-2"
            >
              Remove & choose different file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.05] flex items-center justify-center shadow-inner">
              <svg className="w-8 h-8 text-teal-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-white">Drop your medical bill here</p>
              <p className="text-sm text-slate-light mt-1">or click to browse • PDF files only</p>
            </div>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleChange}
        className="hidden"
        id="bill-file-input"
      />
    </div>
  )
}
