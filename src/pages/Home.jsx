import { useState, useEffect } from 'react'
import styles from './Home.module.css'

const STATS = [
  { value: '70%', label: 'of ER visits are non-emergency' },
  { value: '$2,400', label: 'average ER visit cost' },
  { value: '4.5hrs', label: 'average ER wait time' },
]

const ROUTES = [
  { level: 'emergency', color: '#ef4444', label: 'Emergency', desc: 'Call 911 immediately' },
  { level: 'urgent', color: '#f97316', label: 'Urgent Care', desc: 'Within a few hours' },
  { level: 'semi_urgent', color: '#eab308', label: 'Doctor Visit', desc: 'Within 24–48 hours' },
  { level: 'non_urgent', color: '#3b82f6', label: 'Schedule', desc: 'Routine appointment' },
  { level: 'self_care', color: '#22c55e', label: 'Home Care', desc: 'Rest & monitor' },
]

export default function Home({ onStart, onHistory }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${visible ? styles.visible : ''}`}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <span className={styles.logoText}>MedRoute</span>
          </div>
          <button className={styles.historyBtn} onClick={onHistory}>
            View History
          </button>
        </div>

        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.badge}>AI-Powered Triage</div>
          <h1 className={styles.title}>
            Go to the right place.<br />
            <em>Every time.</em>
          </h1>
          <p className={styles.subtitle}>
            Describe your symptoms. Our AI assesses urgency and routes you to the
            appropriate level of care — saving you time, money, and keeping ERs
            available for true emergencies.
          </p>
          <button className={styles.ctaBtn} onClick={onStart}>
            Start Symptom Assessment
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
          <p className={styles.disclaimer}>Not a substitute for professional medical advice</p>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          {STATS.map((s, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Route levels */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>5-Level Routing System</h2>
          <div className={styles.routes}>
            {ROUTES.map((r, i) => (
              <div key={i} className={styles.routeItem}>
                <div className={styles.routeDot} style={{ background: r.color, boxShadow: `0 0 8px ${r.color}60` }} />
                <div>
                  <div className={styles.routeLabel}>{r.label}</div>
                  <div className={styles.routeDesc}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
