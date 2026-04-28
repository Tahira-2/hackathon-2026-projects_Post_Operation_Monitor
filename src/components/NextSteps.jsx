import styles from './NextSteps.module.css'

const STEPS = {
  emergency: [
    'Call 911 now',
    "Don't eat or drink anything",
    'Unlock your front door if alone',
    'Stay on the line with dispatch',
  ],
  urgent: [
    'Head to urgent care within 2 hours',
    'Bring a list of current medications and allergies',
    'Have someone drive you if pain is severe',
    'Call ahead so they can prepare',
  ],
  semi_urgent: [
    "Schedule a doctor's appointment today or tomorrow",
    'Monitor and write down how symptoms change',
    'Avoid strenuous activity',
    'Take OTC pain relief if appropriate',
  ],
  non_urgent: [
    'Book a routine appointment this week',
    'Keep a symptom log to share with your doctor',
    'Rest and stay hydrated',
    'Call the office if symptoms worsen',
  ],
  self_care: [
    'Rest and stay hydrated',
    'Take OTC medication as directed',
    'Monitor for 24-48 hours',
    "Seek care if symptoms worsen or don't improve",
  ],
}

const URGENCY_COLORS = {
  emergency: '#ef4444',
  urgent: '#f97316',
  semi_urgent: '#eab308',
  non_urgent: '#3b82f6',
  self_care: '#22c55e',
}

export default function NextSteps({ urgency }) {
  const steps = STEPS[urgency]
  if (!steps) return null

  const accentColor = URGENCY_COLORS[urgency]

  return (
    <div className={styles.container} style={{ borderLeftColor: accentColor }}>
      <div className={styles.header}>
        <span className={styles.icon}>✅</span>
        <span className={styles.title}>What to Do Next</span>
      </div>

      <div className={styles.list}>
        {steps.map((step, i) => (
          <div key={i} className={styles.stepItem}>
            <div className={styles.stepNumber} style={{ background: accentColor }}>
              {i + 1}
            </div>
            <div className={styles.stepText}>{step}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
