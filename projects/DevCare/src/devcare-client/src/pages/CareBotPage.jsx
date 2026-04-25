import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft, Send } from 'lucide-react'

import PatientSidebar from '../components/PatientSidebar'
import PatientTopNav from '../components/PatientTopNav'

const USERNAME_KEY = 'devcare_username'
const ACCESS_TOKEN_KEY = 'devcare_access_token'
const REFRESH_TOKEN_KEY = 'devcare_refresh_token'
const ROLE_KEY = 'devcare_role'

function CareBotPage() {
  const navigate = useNavigate()
  const username = localStorage.getItem(USERNAME_KEY)
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I\'m CareBot, your AI therapy assistant. How can I help you today?' }
  ])
  const [input, setInput] = useState('')

  function handleLogout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USERNAME_KEY)
    localStorage.removeItem(ROLE_KEY)
    navigate('/')
  }

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { id: messages.length + 1, sender: 'user', text: input }])
      setInput('')
      
      // Simulate bot response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: prev.length + 1, 
          sender: 'bot', 
          text: 'That\'s a great question! I\'m here to help guide your therapy. Is there anything specific you\'d like to know?' 
        }])
      }, 1000)
    }
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <PatientSidebar username={username} onLogout={handleLogout} />

      <main className="flex-1 pt-16 md:pt-0 md:pl-0 flex flex-col">
        <PatientTopNav username={username} />
        
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="site-container py-8 flex flex-col h-full">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
              <button onClick={() => navigate('/dashboard/patient')} className="rounded-lg p-2 hover:bg-[var(--color-surface)]">
                <ArrowLeft className="h-6 w-6 text-[var(--color-text)]" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-[var(--color-text)]">CareBot</h1>
                <p className="text-sm text-[var(--color-text-muted)]">Your AI therapy assistant - available 24/7</p>
              </div>
            </div>

            {/* Chat Container */}
            <div className="flex-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="border-t border-[var(--color-border)] p-6">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything about your therapy..."
                    className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder-[var(--color-text-muted)]"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-strong)] transition"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-[var(--color-text-muted)] mb-3">Quick questions:</p>
              <div className="grid gap-3 md:grid-cols-2">
                <button className="text-left p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)] transition text-sm text-[var(--color-text)]">
                  How do I improve my posture?
                </button>
                <button className="text-left p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)] transition text-sm text-[var(--color-text)]">
                  What exercises are good for knee pain?
                </button>
                <button className="text-left p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)] transition text-sm text-[var(--color-text)]">
                  How often should I practice?
                </button>
                <button className="text-left p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)] transition text-sm text-[var(--color-text)]">
                  How can I track my progress?
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CareBotPage
