import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Results from './pages/Results'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col animated-bg">
      {/* Navbar */}
      <nav className="sticky top-0 z-[100] bg-white/[0.92] backdrop-blur-md border-b border-line px-10 h-[60px] flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 font-serif font-bold text-[18px] text-navy no-underline">
          <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center text-white text-[16px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83"/>
            </svg>
          </div>
          MediClaim AI
        </a>
        <div className="flex items-center gap-2">
          <a href="/" className="px-3.5 py-1.5 text-[14px] font-medium text-slate hover:text-navy hover:bg-paper rounded-md transition-all">Home</a>
          <span className="px-2.5 py-1 bg-navy text-white rounded-full text-[12px] font-semibold font-mono tracking-[0.03em]">v1.0</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </main>

      {/* HTML Footer */}
      <footer className="border-t border-line py-6 px-10 text-center text-xs text-slate-light bg-white mt-auto">
        <p>© 2026 MediClaim AI. Built for the future of healthcare.</p>
      </footer>
    </div>
  )
}
