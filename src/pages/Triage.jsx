import { useState, useRef, useEffect } from 'react'
import styles from './Triage.module.css'

const SYSTEM_PROMPT = `You are MedRoute, an AI-powered medical triage assistant. Your job is to assess the urgency of a patient's symptoms through a conversational interview.

RULES:
1. Be warm, calm, and reassuring. Use plain language.
2. Ask ONE focused follow-up question at a time. Do NOT ask multiple questions in one message.
3. Gather: main symptoms, duration, severity (1-10), location, what makes it better/worse, relevant medical history, age.
4. After 3-6 exchanges (enough info gathered), provide your assessment.
5. When ready to assess, respond with EXACTLY this JSON format at the END of your message (after your natural language response):

|||ASSESSMENT|||
{"urgency_level": "emergency|urgent|semi_urgent|non_urgent|self_care", "symptoms_summary": "brief summary", "recommendation": "specific actionable advice"}
|||END_ASSESSMENT|||

URGENCY LEVELS:
- emergency: Life-threatening (chest pain + shortness of breath, stroke symptoms, severe bleeding, loss of consciousness, severe allergic reaction)
- urgent: Needs attention within hours (high fever >103F, moderate breathing difficulty, severe pain, deep cuts)
- semi_urgent: Needs attention within 24-48 hrs (persistent fever, worsening symptoms, moderate pain, minor injuries)
- non_urgent: Routine care (mild ongoing symptoms, follow-ups, minor aches)
- self_care: Home treatment (common cold, minor bruises, mild headache)

IMPORTANT: Always include the medical disclaimer that this is not a replacement for professional medical advice. If symptoms seem life-threatening, IMMEDIATELY recommend calling 911 and classify as emergency.

Start by greeting the patient and asking what brought them here today.`

const QUICK_SYMPTOMS = [
  'Chest pain', 'Difficulty breathing', 'Severe headache',
  'High fever', 'Stomach pain', 'Dizziness', 'Nausea', 'Injury'
]

const URGENCY_CONFIG = {
  emergency: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', label: 'EMERGENCY', icon: '🚨', action: 'Call 911 immediately' },
  urgent: { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', label: 'URGENT', icon: '⚠️', action: 'Go to urgent care now' },
  semi_urgent: { color: '#eab308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)', label: 'SEMI-URGENT', icon: '🕐', action: 'See a doctor within 24–48 hours' },
  non_urgent: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', label: 'NON-URGENT', icon: '📅', action: 'Schedule a routine appointment' },
  self_care: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', label: 'SELF-CARE', icon: '🏠', action: 'Rest and monitor at home' },
}

function parseAssessment(text) {
  const match = text.match(/\|\|\|ASSESSMENT\|\|\|([\s\S]*?)\|\|\|END_ASSESSMENT\|\|\|/)
  if (match) {
    const cleanText = text.replace(/\|\|\|ASSESSMENT\|\|\|[\s\S]*?\|\|\|END_ASSESSMENT\|\|\|/, '').trim()
    const assessmentData = JSON.parse(match[1].trim())
    return { cleanText, assessmentData }
  }
  return null
}

function formatTime() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function Triage({ onBack, onSave }) {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hello! I'm MedRoute, your AI health assistant. I'm here to help you understand how urgently you might need medical attention.\n\nPlease tell me — **what symptoms are you experiencing today?**",
    timestamp: formatTime()
  }])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [assessment, setAssessment] = useState(null)
  const [showQuick, setShowQuick] = useState(true)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('anthropic_key') || '')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const saveKey = (key) => {
    localStorage.setItem('anthropic_key', key)
    setApiKey(key)
    setShowKeyInput(false)
  }

  const sendMessage = async (text) => {
    const msg = text || input
    if (!msg.trim() || isLoading) return

    if (!apiKey) {
      setShowKeyInput(true)
      return
    }

    const userMessage = { role: 'user', content: msg.trim(), timestamp: formatTime() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setShowQuick(false)
    setIsLoading(true)

    try {
      const apiMessages = updatedMessages.map(({ role, content }) => ({ role, content }))

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1000,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...apiMessages,
          ],
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error?.message || 'API error')
      }

      const data = await response.json()
      const rawContent = data.choices[0].message.content
      const parsed = parseAssessment(rawContent)

      if (parsed) {
        const assistantMessage = {
          role: 'assistant',
          content: parsed.cleanText || parsed.assessmentData.recommendation,
          timestamp: formatTime()
        }
        setMessages(prev => [...prev, assistantMessage])
        setAssessment(parsed.assessmentData)
        onSave?.({
          symptoms_summary: parsed.assessmentData.symptoms_summary,
          urgency_level: parsed.assessmentData.urgency_level,
          recommendation: parsed.assessmentData.recommendation,
          conversation: updatedMessages,
        })
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: rawContent, timestamp: formatTime() }])
      }
    } catch (err) {
      const errMsg = err.message.includes('invalid x-api-key') || err.message.includes('401')
        ? 'Invalid API key. Please check your key and try again.'
        : `Error: ${err.message}`
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg, timestamp: formatTime() }])
    }

    setIsLoading(false)
    inputRef.current?.focus()
  }

  const reset = () => {
    setMessages([{
      role: 'assistant',
      content: "Hello! I'm MedRoute, your AI health assistant. I'm here to help you understand how urgently you might need medical attention.\n\nPlease tell me — **what symptoms are you experiencing today?**",
      timestamp: formatTime()
    }])
    setAssessment(null)
    setInput('')
    setShowQuick(true)
  }

  const urgency = assessment ? URGENCY_CONFIG[assessment.urgency_level] : null

  return (
    <div className={styles.container}>

      {/* API Key Modal */}
      {showKeyInput && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Enter your API Key</h2>
            <p className={styles.modalText}>
              Get a free API key at{' '}
              <a href="https://console.groq.com" target="_blank" rel="noreferrer" className={styles.link}>
                console.groq.com
              </a>
              {' '}— free, no credit card needed.
            </p>
            <input
              className={styles.modalInput}
              type="password"
              placeholder="sk-ant-..."
              defaultValue={apiKey}
              id="keyInput"
              autoFocus
            />
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowKeyInput(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={() => {
                const val = document.getElementById('keyInput').value
                if (val.trim()) saveKey(val.trim())
              }}>Save & Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
          <div className={styles.brandIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <div className={styles.brandName}>MedRoute</div>
            <div className={styles.brandSub}>Symptom Assessment</div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.keyBtn} onClick={() => setShowKeyInput(true)} title="API Key">
            🔑
          </button>
          <button className={styles.resetBtn} onClick={reset}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
            </svg>
            Reset
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className={styles.messages} ref={scrollRef}>
        <div className={styles.messagesInner}>
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.aiBubble}`}>
              {msg.role === 'assistant' && (
                <div className={styles.avatarDot} />
              )}
              <div className={styles.bubbleContent}>
                <div className={styles.bubbleText}>
                  {msg.content.split('**').map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                  )}
                </div>
                <div className={styles.bubbleTime}>{msg.timestamp}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className={`${styles.bubble} ${styles.aiBubble}`}>
              <div className={styles.avatarDot} />
              <div className={styles.typingIndicator}>
                <span /><span /><span />
              </div>
            </div>
          )}

          {assessment && urgency && (
            <div className={styles.assessmentCard} style={{ borderColor: urgency.border, background: urgency.bg }}>
              <div className={styles.assessmentHeader}>
                <span className={styles.assessmentIcon}>{urgency.icon}</span>
                <div>
                  <div className={styles.assessmentLevel} style={{ color: urgency.color }}>{urgency.label}</div>
                  <div className={styles.assessmentAction}>{urgency.action}</div>
                </div>
              </div>
              <div className={styles.assessmentDivider} style={{ background: urgency.border }} />
              <p className={styles.assessmentSummary}>{assessment.symptoms_summary}</p>
              <p className={styles.assessmentRec}>{assessment.recommendation}</p>
              <button className={styles.newSessionBtn} onClick={reset} style={{ borderColor: urgency.border, color: urgency.color }}>
                Start New Assessment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick symptoms */}
      {showQuick && !assessment && (
        <div className={styles.quickSymptoms}>
          <div className={styles.quickLabel}>Common symptoms:</div>
          <div className={styles.quickBtns}>
            {QUICK_SYMPTOMS.map((s, i) => (
              <button key={i} className={styles.quickBtn} onClick={() => sendMessage(s)}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      {!assessment && (
        <div className={styles.inputArea}>
          <div className={styles.inputRow}>
            <input
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Describe your symptoms..."
              disabled={isLoading}
            />
            <button
              className={styles.sendBtn}
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p className={styles.inputDisclaimer}>
            Not a substitute for professional medical advice. In emergencies, call 911.
          </p>
        </div>
      )}
    </div>
  )
}
