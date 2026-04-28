import React, { useState, useEffect } from 'react'

const STEPS = [
  { title: 'Extracting text & structure', sub: 'PyMuPDF + Tesseract OCR' },
  { title: 'Identifying line items', sub: 'Medical NER · CPT mapping' },
  { title: 'Validating codes', sub: 'RxNorm · FDA drug database' },
  { title: 'Benchmarking against CMS rates', sub: 'Medicare fee schedule 2024' },
  { title: 'Generating insurance coverage estimate', sub: 'BlueCross BlueShield PPO model' },
]
const SUBTITLES = [
  'Reading your PDF document…',
  'Finding medical codes and line items…',
  'Checking against drug databases…',
  'Comparing to Medicare fee schedule…',
  'Calculating your coverage estimate…',
]
const TIMINGS = [900, 1600, 1200, 1400, 1000]
const ECG_POINTS = "0,36 20,36 28,36 32,16 36,56 40,10 44,58 48,36 60,36 80,36 88,36 92,16 96,56 100,10 104,58 108,36 120,36 140,36 148,36 152,16 156,56 160,10 164,58 168,36 180,36 200,36 208,36 212,16 216,56 220,10 224,58 228,36 240,36 260,36 268,36 272,16 276,56 280,10 284,58 288,36 300,36 320,36 328,36 332,16 336,56 340,10 344,58 348,36 360,36 380,36 388,36 392,16 396,56 400,10 404,58 408,36 420,36 440,36 448,36 452,16 456,56 460,10 464,58 468,36 480,36 500,36 508,36 512,16 516,56 520,10 524,58 528,36 540,36 560,36"

export default function LoadingPage({ onComplete }) {
  const [current, setCurrent] = useState(0)
  const [doneSteps, setDoneSteps] = useState([])
  const [subtitle, setSubtitle] = useState(SUBTITLES[0])
  const totalTime = TIMINGS.reduce((a, b) => a + b, 0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    let step = 0; let elapsedMs = 0
    function advance() {
      setDoneSteps(prev => [...prev, step])
      elapsedMs += TIMINGS[step]; setElapsed(elapsedMs); step++
      if (step < 5) {
        setCurrent(step); setSubtitle(SUBTITLES[step])
        setTimeout(advance, TIMINGS[step])
      } else {
        setSubtitle('Analysis complete!')
        setTimeout(() => onComplete(), 600)
      }
    }
    setTimeout(advance, TIMINGS[0])
  }, [onComplete])

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col items-center justify-center p-10">
      <div className="bg-white border border-border rounded-[20px] py-12 px-14 max-w-[560px] w-full shadow-[0_4px_24px_rgba(15,31,53,0.08)] text-center">
        <div className="w-full h-[72px] mb-9 relative overflow-hidden">
          <svg className="w-[200%] h-full animate-ecg" viewBox="0 0 560 72" preserveAspectRatio="none">
            <polyline fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={ECG_POINTS}/>
          </svg>
          <div className="absolute inset-y-0 left-0 w-[60px] bg-gradient-to-r from-white to-transparent"/>
          <div className="absolute inset-y-0 right-0 w-[60px] bg-gradient-to-l from-white to-transparent"/>
        </div>
        <div className="font-serif text-[22px] font-bold text-navy mb-2">Analyzing your bill</div>
        <div className="text-sm text-slate-light mb-10">{subtitle}</div>
        <div className="flex flex-col text-left mb-9">
          {STEPS.map((s, i) => {
            const isDone = doneSteps.includes(i), isActive = current === i && !isDone
            return (
              <div key={i} className={`flex items-center gap-3.5 py-[13px] border-b border-border last:border-b-0 transition-opacity duration-[400ms] ${isDone || isActive ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-7 h-7 rounded-full border-2 shrink-0 flex items-center justify-center text-xs transition-all duration-[400ms] ${isDone ? 'bg-teal border-teal text-white' : isActive ? 'border-navy bg-white' : 'border-border bg-white'}`}>
                  {isDone ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>
                    : isActive ? <div className="animate-spinner"/>
                    : <span className="text-slate-light">{i+1}</span>}
                </div>
                <div>
                  <div className="text-sm font-semibold text-navy">{s.title}</div>
                  <div className="text-xs text-slate-light font-mono">{s.sub}</div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="h-[3px] bg-border rounded-full overflow-hidden">
          <div className="h-full bg-teal rounded-full transition-all duration-500 ease-in-out" style={{width:`${(elapsed/totalTime)*100}%`}}/>
        </div>
      </div>
    </div>
  )
}
