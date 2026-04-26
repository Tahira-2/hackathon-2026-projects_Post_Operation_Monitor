import { Heart, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type React from 'react';

interface AuthLayoutProps {
  /** Rendered inside the right-hand form panel */
  children: React.ReactNode;
  /** Trust message headline shown on left panel */
  headline: string;
  /** Trust message subtext */
  subtext: string;
  /** Left-panel bullet points */
  bullets?: string[];
}

const defaultBullets = [
  'HIPAA-grade security, end-to-end',
  'Your data is never sold or shared',
  'Trusted by 500+ US healthcare providers',
];

export default function AuthLayout({
  children,
  headline,
  subtext,
  bullets = defaultBullets,
}: AuthLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* ── Left: Trust panel ────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(145deg, var(--color-primary-800) 0%, var(--color-primary-600) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '3rem 3.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background orbs */}
        <div aria-hidden style={{
          position: 'absolute', top: -100, right: -80, width: 380, height: 380,
          borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
        }} />
        <div aria-hidden style={{
          position: 'absolute', bottom: -60, left: -60, width: 280, height: 280,
          borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Heart size={20} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#fff', letterSpacing: '-0.03em' }}>
              CareFlow <span style={{ color: 'rgba(255,255,255,0.6)' }}>AI</span>
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 800,
            color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2,
            marginBottom: '1rem',
          }}>
            {headline}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.65, marginBottom: '2.5rem' }}>
            {subtext}
          </p>

          {/* Bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '3rem' }}>
            {bullets.map((b) => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <CheckCircle2 size={18} style={{ color: 'rgba(134,239,172,1)', flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9375rem' }}>{b}</span>
              </div>
            ))}
          </div>

          {/* Compliance badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 99,
          }}>
            <ShieldCheck size={15} style={{ color: 'rgba(134,239,172,1)' }} />
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem', fontWeight: 600 }}>
              HIPAA Compliant Platform
            </span>
          </div>
        </div>
      </div>

      {/* ── Right: Form panel ─────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: 'var(--color-gray-50)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2.5rem 2rem',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          {children}
        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 767px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="background: linear-gradient(145deg"] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
