import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Sparkles, X, Send, ClipboardList, AlertCircle, Bot, Edit2, Trash2, Plus, ChevronDown, ChevronUp, Database } from 'lucide-react'

function CareBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hello Dr. Robert! I'm your Care Assistant. Need help generating a targeted rehab plan or a todo list for a patient?" }
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [expandedTasks, setExpandedTasks] = useState({}) // { 'msgIdx-taskIdx': true }
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!query.trim()) return

    const userQuery = query
    const userMsg = { role: 'user', content: userQuery }
    setMessages(prev => [...prev, userMsg])
    setQuery('')
    setIsGenerating(true)

    try {
      const token = localStorage.getItem('devcare_access_token')
      
      if (!token) {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: "You need to be logged in to use Care AI. Please log in and try again." 
        }])
        setIsGenerating(false)
        return
      }

      const res = await fetch('http://localhost:8000/api/rehab/chatbot/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: userQuery })
      })
      
      if (res.status === 401) {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: "Your session has expired. Please log out and log back in." 
        }])
        return
      }

      if (!res.ok) throw new Error('API error')
      
      const data = await res.json()
      
      // Ensure todoList items are objects as expected
      const sanitizedTodoList = (data.todoList || []).map(item => {
        if (typeof item === 'string') {
           return { name: item, metadata: '', instruction: '' }
        }
        return item
      })

      const botMsg = { 
        role: 'bot', 
        content: data.content,
        todoList: sanitizedTodoList
      }
      setMessages(prev => [...prev, botMsg])
    } catch (err) {
      console.error('CareBot Error:', err)
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "Sorry, I'm having trouble connecting to the Care AI service." 
      }])
    } finally {
      setIsGenerating(false)
    }
  }

  const updateTask = (msgIndex, taskIndex, field, newValue) => {
    setMessages(prev => {
      const newMessages = [...prev]
      const msg = { ...newMessages[msgIndex] }
      const newTodoList = [...msg.todoList]
      newTodoList[taskIndex] = { ...newTodoList[taskIndex], [field]: newValue }
      msg.todoList = newTodoList
      newMessages[msgIndex] = msg
      return newMessages
    })
  }

  const deleteTask = (msgIndex, taskIndex) => {
    setMessages(prev => {
      const newMessages = [...prev]
      const msg = { ...newMessages[msgIndex] }
      const newTodoList = msg.todoList.filter((_, idx) => idx !== taskIndex)
      msg.todoList = newTodoList
      newMessages[msgIndex] = msg
      return newMessages
    })
  }

  const addTask = (msgIndex) => {
    setMessages(prev => {
      const newMessages = [...prev]
      const msg = { ...newMessages[msgIndex] }
      msg.todoList = [...(msg.todoList || []), { name: "New Exercise", metadata: "", instruction: "Details..." }]
      newMessages[msgIndex] = msg
      return newMessages
    })
  }

  const toggleExpand = (msgIdx, taskIdx) => {
    const key = `${msgIdx}-${taskIdx}`
    setExpandedTasks(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[450px] max-h-[700px] elevated-card border-none bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-[var(--color-primary)] p-6 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Care Assistant</h3>
                <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Rehab Intelligence</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 min-h-[400px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-4 rounded-2xl text-sm font-medium leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-[var(--color-primary)] text-white shadow-md rounded-tr-none' 
                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.content}
                  
                  {msg.todoList && msg.todoList.length >= 0 && msg.role === 'bot' && (
                    <div className="mt-4 space-y-3">
                       <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                             <ClipboardList size={12} /> Generated Todo List
                          </div>
                          <button 
                            onClick={() => addTask(i)}
                            className="p-1 rounded-md hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Add Task"
                          >
                            <Plus size={14} />
                          </button>
                       </div>
                       
                       {msg.todoList.map((item, idx) => {
                         const isExpanded = expandedTasks[`${i}-${idx}`]
                         return (
                           <div key={idx} className="group relative rounded-xl bg-white border border-slate-100 overflow-hidden shadow-sm hover:border-blue-200 transition-all">
                              {/* Main Row (Visible) */}
                              <div className="p-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/50" onClick={() => toggleExpand(i, idx)}>
                                 <div className="flex items-center gap-3">
                                    <div className="h-5 w-5 rounded-full border-2 border-blue-200 shrink-0 flex items-center justify-center">
                                       {isExpanded && <div className="h-2 w-2 bg-blue-400 rounded-full"></div>}
                                    </div>
                                    <input 
                                      value={item.name || ''}
                                      onChange={(e) => updateTask(i, idx, 'name', e.target.value)}
                                      className="font-bold text-[13px] text-slate-700 bg-transparent border-none focus:ring-0 p-0"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                 </div>
                                 <div className="flex items-center gap-1">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); deleteTask(i, idx); }}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-400 transition-all"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                    {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                                 </div>
                              </div>

                              {/* Expanded Details (Hidden by default) */}
                              {isExpanded && (
                                <div className="px-3 pb-3 pt-1 border-t border-slate-50 bg-slate-50/30 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                   {/* Database Metadata */}
                                   <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-50/50 border border-blue-100/50">
                                      <Database size={12} className="text-blue-500 mt-0.5 shrink-0" />
                                      <input 
                                        value={item.metadata || ''}
                                        onChange={(e) => updateTask(i, idx, 'metadata', e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-[10px] font-mono text-blue-600 uppercase tracking-tighter"
                                        placeholder="DATABASE METADATA (ID NAME JOINT MIN MAX)"
                                      />
                                   </div>
                                   
                                   {/* Instructions */}
                                   <textarea 
                                      rows={Math.max(2, Math.ceil((item.instruction?.length || 0) / 40))}
                                      value={item.instruction || ''}
                                      onChange={(e) => updateTask(i, idx, 'instruction', e.target.value)}
                                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-[12px] text-slate-600 leading-relaxed resize-none overflow-hidden"
                                      placeholder="Instruction details..."
                                      onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                      }}
                                   />
                                </div>
                              )}
                           </div>
                         )
                       })}
                       
                       {msg.todoList.length > 0 && (
                         <button className="w-full mt-2 py-2 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors shadow-sm">
                            Sync to Patient App
                         </button>
                       )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ask CareBot to generate tasks..."
                className="auth-input pr-12 h-[52px] bg-slate-50 focus:bg-white text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-all shadow-md"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[9px] font-bold text-slate-400 px-1">
               <AlertCircle size={10} /> AI suggestions should be reviewed by a clinical professional.
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`h-16 w-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen 
            ? 'bg-slate-900 text-white rotate-90' 
            : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
        }`}
      >
        {isOpen ? <X size={28} /> : <Bot size={28} />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-4 border-white animate-pulse"></div>
        )}
      </button>
    </div>
  )
}

export default CareBot
