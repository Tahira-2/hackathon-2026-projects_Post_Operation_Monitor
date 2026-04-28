import React from 'react';

const features = [
  {
    tag: 'AI Posture Detection',
    title: 'AI Posture Detection',
    description:
      'Advanced skeletal mapping tracks joints in real-time, providing immediate corrective feedback during rehabilitation exercises without the need for wearable sensors.',
    icon: (
      <svg className="w-8 h-8 text-[#1E88E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    tag: 'Outcome Analytics',
    title: 'Outcome Analytics',
    description:
      'Longitudinal tracking of patient recovery progress through automated biomechanical reporting.',
    icon: (
      <svg className="w-8 h-8 text-[#1E88E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    showProgress: true
  },
  {
    tag: 'Smart Telerehab',
    title: 'Smart Telerehab',
    description:
      'Seamlessly connect with therapists through high-definition encrypted video integrated with clinical data overlays.',
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    dark: true
  },
]

function FeaturesSection() {
  return (
    <section id="features" className="bg-white pt-12 pb-32 sm:pt-16 sm:pb-48">
      <div className="site-container">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-24">
          <div className="max-w-2xl">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-4">
              Capabilities
            </p>
            <h2 className="text-4xl font-bold sm:text-5xl text-[var(--color-secondary)] leading-tight">
              The New Standard of <span className="text-[var(--color-primary)]">Precision Care</span>
            </h2>
          </div>
          <p className="max-w-md text-[var(--color-text-muted)] text-lg leading-relaxed">
            Our platform combines computer vision with clinical expertise to provide a recovery experience that is both data-driven and human-centric.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {features.map((feature, idx) => (
            <article
              key={feature.title}
              className={`relative group p-10 rounded-[2.5rem] transition-all duration-500 overflow-hidden isolate ${
                feature.dark 
                ? 'bg-[var(--color-secondary)] text-white shadow-2xl scale-105 z-10' 
                : 'bg-[#F8FAFC] border border-[var(--color-border)] hover:bg-white hover:shadow-xl'
              }`}
            >
              {/* Decorative elements for dark card */}
              {feature.dark && (
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--color-primary)] opacity-20 rounded-full blur-3xl -z-10"></div>
              )}

              <div className={`mb-8 inline-flex items-center justify-center w-16 h-16 rounded-2xl transition-transform duration-500 group-hover:scale-110 ${
                feature.dark ? 'bg-white/10 text-white' : 'bg-white shadow-sm text-[var(--color-primary)]'
              }`}>
                {React.cloneElement(feature.icon, { 
                  className: `w-8 h-8 ${feature.dark ? 'text-white' : 'text-[var(--color-primary)]'}` 
                })}
              </div>

              <h3 className={`text-2xl font-bold mb-4 ${feature.dark ? 'text-white' : 'text-[var(--color-secondary)]'}`}>
                {feature.title}
              </h3>
              
              <p className={`text-base leading-relaxed ${feature.dark ? 'text-gray-300' : 'text-[var(--color-text-muted)]'}`}>
                {feature.description}
              </p>

              {feature.showProgress && (
                <div className="mt-10 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                      <span>Accuracy</span>
                      <span>98%</span>
                    </div>
                    <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-[var(--color-primary)] w-[98%] rounded-full transition-all duration-1000"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)]">
                      <span>Recovery Rate</span>
                      <span>85%</span>
                    </div>
                    <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-[var(--color-secondary)] w-[85%] rounded-full transition-all duration-1000"></div>
                    </div>
                  </div>
                </div>
              )}

              {feature.dark && (
                <button className="mt-10 inline-flex items-center text-sm font-bold text-white hover:gap-2 transition-all">
                  Explore Technology <span className="ml-2">→</span>
                </button>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection