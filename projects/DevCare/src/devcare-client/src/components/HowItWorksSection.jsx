import React from 'react';

const steps = [
  {
    number: '01',
    title: 'Connect Your Camera',
    description: 'Use any standard webcam or smartphone camera. No expensive hardware or sensors required.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    number: '02',
    title: 'Perform Exercises',
    description: 'Follow guided therapy sessions while our AI tracks your form and provides real-time feedback.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    number: '03',
    title: 'Track Recovery',
    description: 'Review detailed biomechanical reports and share progress with your clinician automatically.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  }
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="site-container py-24 sm:py-32">
      <div className="flex flex-col md:flex-row justify-center items-center mb-16 text-center">
        <div className="max-w-3xl">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-4">
            Process
          </p>
          <h2 className="text-4xl font-bold sm:text-5xl text-[var(--color-secondary)] leading-tight">
            How DevCare Transforms Your Recovery
          </h2>
        </div>
      </div>

      <div className="grid gap-12 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.number} className="relative group p-10 rounded-[2.5rem] bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-primary-soft)] hover:shadow-2xl transition-all duration-500 isolate">
            <div className="mb-10 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] transition-transform duration-500 group-hover:scale-110">
              {step.icon}
            </div>
            <div className="absolute top-8 right-8 text-7xl font-black text-[var(--color-primary)] opacity-30 -z-10 select-none">
              {step.number}
            </div>
            <h3 className="text-2xl font-bold mb-4 text-[var(--color-secondary)]">{step.title}</h3>
            <p className="text-[var(--color-text-muted)] text-base leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorksSection;