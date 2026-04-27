import { Link } from 'react-router-dom'
import heroImage from '../assets/hero-therapy.png'

function HeroSection() {
  return (
    <section id="home" className="site-container pt-44 pb-12 sm:pt-60 sm:pb-16 lg:pt-72 lg:pb-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
        <div>

          <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl text-[var(--color-secondary)]">
            Recover <span className="text-[var(--color-primary)]">Smarter</span> with AI-Guided Therapy
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-text-muted)] sm:text-xl">
            Professional-grade rehabilitation in the comfort of your home. Powered by advanced computer vision to track your progress in real-time.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/register" className="btn-dark px-8 py-3">
              Get Started
            </Link>
            <a href="#demo" className="btn-secondary px-8 py-3 bg-white border-[#ECEFF1] text-[#263238] font-semibold">
              View Demo
            </a>
          </div>
        </div>

        <div className="relative">
          <img 
            src={heroImage} 
            alt="AI Posture Therapy" 
            className="rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]"
          />
        </div>
      </div>
    </section>
  )
}

export default HeroSection