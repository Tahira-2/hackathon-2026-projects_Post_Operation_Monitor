import { useEffect, useState } from 'react'
import styles from './History.module.css'
import { loadHistory } from '../historyStorage.js'
import { FormattedText } from '../textFormatting.jsx'

const URGENCY_CONFIG = {
  in_progress: { color: '#6b7fa3', label: 'In Progress', icon: '💬' },
  emergency: { color: '#ef4444', label: 'Emergency', icon: '🚨' },
  urgent: { color: '#f97316', label: 'Urgent', icon: '⚠️' },
  semi_urgent: { color: '#eab308', label: 'Semi-Urgent', icon: '🕐' },
  non_urgent: { color: '#3b82f6', label: 'Non-Urgent', icon: '📅' },
  self_care: { color: '#22c55e', label: 'Self-Care', icon: '🏠' },
}

export default function History({ sessions, onBack, onOpenSession }) {
  const [persistedSessions, setPersistedSessions] = useState(() => loadHistory())

  useEffect(() => {
    setPersistedSessions(loadHistory())
  }, [])

  const displayedSessions = persistedSessions.length > 0 ? persistedSessions : sessions

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <h1 className={styles.title}>Session History</h1>
      </header>

      <div className={styles.content}>
        {displayedSessions.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📋</div>
            <p>No sessions yet. Start a triage assessment to see your history here.</p>
          </div>
        ) : (
          displayedSessions.map((s) => {
            const cfg = URGENCY_CONFIG[s.urgency_level] || URGENCY_CONFIG.self_care
            const actionLabel = s.urgency_level === 'in_progress' ? 'Continue Session' : 'View Session'
            return (
              <div key={s.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardLevel} style={{ color: cfg.color }}>
                    {cfg.icon} {cfg.label}
                  </div>
                  <div className={styles.cardDate}>{s.date}</div>
                </div>
                <p className={styles.cardSummary}><FormattedText text={s.symptoms_summary} /></p>
                <p className={styles.cardRec}><FormattedText text={s.recommendation} /></p>
                <button className={styles.cardAction} onClick={() => onOpenSession(s)}>
                  {actionLabel}
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
