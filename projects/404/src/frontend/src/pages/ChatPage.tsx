import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Bot, Stethoscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/api/axios';
import { Card } from '../components/ui/Card';
import DoctorSuggestionCard, { type DoctorSuggestion } from '../components/patient/DoctorSuggestionCard';

interface Message {
  id: string;
  senderId: string;
  senderType: 'USER' | 'SYSTEM' | 'DOCTOR';
  content: string;
  createdAt: string;
  metadata?: { doctorSuggestions?: DoctorSuggestion[] } | null;
}

// Adapts UI chrome based on whether the logged-in user is a doctor or patient
const ROLE_CONFIG = {
  DOCTOR: {
    themeFrom: 'from-emerald-500',
    themeTo: 'to-teal-600',
    ringColor: 'ring-emerald-400',
    bubbleGradient: 'from-emerald-500 via-emerald-600 to-teal-600',
    activeDot: 'bg-emerald-500',
    label: 'Clinical AI Assistant',
    subtitle: 'Clinical decision support · Evidence-based medicine',
    placeholder: 'Ask about treatment options, drug interactions, ICD codes…',
    icon: Stethoscope,
  },
  PATIENT: {
    themeFrom: 'from-indigo-500',
    themeTo: 'to-blue-600',
    ringColor: 'ring-indigo-400',
    bubbleGradient: 'from-indigo-500 via-indigo-600 to-blue-600',
    activeDot: 'bg-emerald-500',
    label: 'CareFlow AI',
    subtitle: 'Active now · Can suggest doctors',
    placeholder: 'Ask about symptoms, or type "find a cardiologist"…',
    icon: Bot,
  },
} as const;

export default function ChatPage() {
  const { user, token } = useAuth();
  const role = (user?.role ?? 'PATIENT') as keyof typeof ROLE_CONFIG;
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.PATIENT;
  const Icon = cfg.icon;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [patientDbId, setPatientDbId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    async function initChat() {
      if (!user || !token) return;

      // Fetch patient DB ID (only relevant for patients booking appointments)
      try {
        const meRes = await apiClient.get(`/users/${user.id}`);
        setPatientDbId(meRes.data?.patient?.id ?? null);
      } catch { /* not critical */ }

      let convId = localStorage.getItem(`careflow_ai_conv_${user.id}`);
      if (!convId) {
        try {
          const res = await apiClient.post('/chat/conversations', { userIds: [user.id] });
          convId = res.data.id;
          localStorage.setItem(`careflow_ai_conv_${user.id}`, convId!);
        } catch (e) {
          console.error('Failed to create conversation', e);
          return;
        }
      }
      setConversationId(convId);

      try {
        const msgRes = await apiClient.get(`/chat/conversations/${convId}/messages`);
        setMessages(msgRes.data);
      } catch (e) {
        console.error('Failed to fetch messages', e);
      }

      const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
      const newSocket = io(`${BASE_URL}/communication`, { transports: ['websocket'] });

      newSocket.on('connect', () => {
        newSocket.emit('joinRoom', { conversationId: convId });
      });
      newSocket.on('messageCreated', (msg: Message) => {
        setMessages((prev) => {
          if (prev.some((p) => p.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });

      setSocket(newSocket);
      return () => { newSocket.disconnect(); };
    }
    initChat();
  }, [user, token]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !socket || !conversationId || !user) return;
    socket.emit('sendMessage', { conversationId, senderId: user.id, content: inputMsg });
    setInputMsg('');
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-4 lg:gap-6 w-full max-w-full overflow-hidden">
      {/* Sidebar */}
      <Card className="w-72 lg:w-80 flex flex-col p-0 shrink-0 overflow-hidden shadow-lg border-white/40 bg-white/70 backdrop-blur-xl rounded-3xl" padding="none">
        <div className="px-6 py-5 border-b border-gray-100/50">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* Pinned AI Contact */}
          <button className={`w-full flex items-center gap-3.5 p-3 rounded-2xl bg-opacity-10 border border-opacity-20 hover:bg-opacity-20 transition-colors text-left relative overflow-hidden group shadow-sm
            ${role === 'DOCTOR' ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-50 border-indigo-100'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <div className="relative">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${cfg.themeFrom} ${cfg.themeTo} text-white shadow-md group-hover:scale-105 transition-transform`}>
                <Icon size={24} />
              </div>
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${cfg.activeDot} shadow-[0_0_8px_rgba(16,185,129,0.5)]`}></span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-bold text-gray-900 truncate">{cfg.label}</h3>
              <p className={`text-xs font-semibold truncate ${role === 'DOCTOR' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                Always here to help
              </p>
            </div>
          </button>
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 min-w-0 flex flex-col p-0 overflow-hidden shadow-lg border-white/40 bg-white/70 backdrop-blur-xl rounded-3xl" padding="none">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100/50 bg-white/60 backdrop-blur-md z-10 flex items-center gap-4">
          <div className="relative">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${cfg.themeFrom} ${cfg.themeTo} text-white shadow-sm`}>
              <Icon size={22} />
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${cfg.activeDot}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight">{cfg.label}</h3>
            <p className="text-xs font-semibold text-emerald-500">{cfg.subtitle}</p>
          </div>
          {role === 'DOCTOR' && (
            <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
              Physician Mode
            </span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5 bg-slate-50/30">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-60">
              <Icon size={48} className={`mb-4 ${role === 'DOCTOR' ? 'text-emerald-300' : 'text-indigo-300'}`} />
              <p className="text-[15px] font-bold text-gray-600">
                {role === 'DOCTOR' ? 'Clinical AI ready' : 'Start a secure conversation'}
              </p>
              <p className="text-sm font-medium text-gray-500 mt-1">
                {role === 'DOCTOR'
                  ? 'Ask about treatment options, guidelines, or referrals.'
                  : 'Ask about symptoms, medications, or request a doctor.'}
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            const suggestions: DoctorSuggestion[] = (msg.metadata as { doctorSuggestions?: DoctorSuggestion[] } | null)?.doctorSuggestions ?? [];

            return (
              <div key={msg.id} className="flex flex-col w-full">
                <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex items-end gap-2 max-w-[85%] lg:max-w-[75%]">
                    {!isMe && (
                      <div className={`shrink-0 hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${cfg.themeFrom} ${cfg.themeTo} text-white shadow-sm mb-1`}>
                        <Icon size={16} />
                      </div>
                    )}
                    <div className={`relative px-5 py-3.5 shadow-sm ${
                      isMe
                        ? `bg-gradient-to-br ${cfg.bubbleGradient} text-white rounded-3xl rounded-br-sm`
                        : 'bg-white border border-gray-100 text-gray-800 rounded-3xl rounded-bl-sm shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]'
                    }`}>
                      <p className={`text-[15px] leading-relaxed break-words whitespace-pre-wrap ${isMe ? 'font-medium' : ''}`}>
                        {msg.content}
                      </p>
                      <p className={`text-[10px] mt-1.5 font-bold text-right ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Doctor suggestion cards (only shown to patients) */}
                {!isMe && suggestions.length > 0 && role === 'PATIENT' && (
                  <div className="mt-2 ml-10 space-y-2 max-w-[85%] lg:max-w-[75%]">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide px-1">Available Doctors</p>
                    {suggestions.map((doc) => (
                      <DoctorSuggestionCard
                        key={doc.doctorId}
                        doctor={doc}
                        patientId={patientDbId ?? user?.id ?? ''}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Input */}
        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100/50">
          <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={cfg.placeholder}
              className={`w-full bg-slate-50 hover:bg-white focus:bg-white border border-gray-200 focus:border-current rounded-full pl-6 pr-16 py-4 text-[15px] font-medium focus:outline-none focus:ring-4 transition-all text-gray-800 placeholder:text-gray-400 shadow-inner
                ${role === 'DOCTOR' ? 'focus:border-emerald-400 focus:ring-emerald-500/10' : 'focus:border-indigo-400 focus:ring-indigo-500/10'}`}
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className={`absolute right-2.5 p-2.5 rounded-full bg-gradient-to-r ${cfg.themeFrom} ${cfg.themeTo} text-white hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed`}
            >
              <Send size={18} className="translate-x-[1px]" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
