import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Bot, Stethoscope, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/api/axios';
import DoctorSuggestionCard, { type DoctorSuggestion } from '../components/patient/DoctorSuggestionCard';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  senderId: string;
  senderType: 'USER' | 'SYSTEM' | 'DOCTOR';
  content: string;
  createdAt: string;
  metadata?: { doctorSuggestions?: DoctorSuggestion[] } | null;
}

const ROLE_CONFIG = {
  DOCTOR: {
    themeFrom: 'from-emerald-500',
    themeTo: 'to-teal-600',
    headerBg: 'bg-emerald-50 border-emerald-100',
    activeDot: 'bg-emerald-500 ring-white',
    label: 'Clinical AI Assistant',
    subtitle: 'Decision support & evidence-based medicine',
    placeholder: 'Ask about guidelines, interactions, or ICD codes...',
    icon: Stethoscope,
    bubble: 'bg-emerald-600 text-white',
    userBubble: 'bg-gray-100 text-gray-900',
    sendBtn: 'bg-emerald-600 hover:bg-emerald-700',
  },
  PATIENT: {
    themeFrom: 'from-indigo-500',
    themeTo: 'to-blue-600',
    headerBg: 'bg-white border-gray-200',
    activeDot: 'bg-emerald-500 ring-white',
    label: 'CareFlow AI',
    subtitle: 'Always here to help you navigate your care',
    placeholder: 'Message your care team or ask AI...',
    icon: Bot,
    bubble: 'bg-indigo-600 text-white',
    userBubble: 'bg-gray-100 text-gray-900',
    sendBtn: 'bg-indigo-600 hover:bg-indigo-700',
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

      try {
        const meRes = await apiClient.get(`/users/${user.id}`);
        setPatientDbId(meRes.data?.patient?.id ?? null);
      } catch { /* ignore */ }

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

      newSocket.on('connect', () => newSocket.emit('joinRoom', { conversationId: convId }));
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
    <div className="absolute inset-0 md:static flex flex-col w-full h-[calc(100vh-64px)] md:h-full bg-white md:rounded-3xl md:border border-gray-200 md:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.1)] overflow-hidden">
      {/* Header */}
      <div className={`shrink-0 flex items-center justify-between px-4 md:px-6 py-3.5 border-b z-10 ${cfg.headerBg}`}>
        <div className="flex items-center gap-3 md:gap-4">
          <Link to=".." className="md:hidden p-1 -ml-1 text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div className="relative">
            <div className={`flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr ${cfg.themeFrom} ${cfg.themeTo} text-white shadow-md`}>
              <Icon size={20} className="md:w-6 md:h-6" />
            </div>
            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 ${cfg.activeDot}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base md:text-lg font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              {cfg.label}
              {role === 'DOCTOR' && (
                <span className="hidden md:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 tracking-wide uppercase">
                  Physician Mode
                </span>
              )}
            </h1>
            <p className={`text-xs font-semibold truncate ${role === 'DOCTOR' ? 'text-emerald-700' : 'text-gray-500'}`}>
              {cfg.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 md:px-6 space-y-6 bg-slate-50/50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-70">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 border-2 border-dashed bg-white ${role === 'DOCTOR' ? 'border-emerald-200 text-emerald-400' : 'border-indigo-200 text-indigo-400'}`}>
              <Icon size={32} />
            </div>
            <p className="text-base font-extrabold text-gray-900 text-center">
              {role === 'DOCTOR' ? 'Clinical AI Ready' : 'Start a secure conversation'}
            </p>
            <p className="text-sm font-semibold text-gray-500 text-center max-w-sm mt-1 mb-8">
              {cfg.subtitle}
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          const suggestions: DoctorSuggestion[] = (msg.metadata as { doctorSuggestions?: DoctorSuggestion[] } | null)?.doctorSuggestions ?? [];

          return (
            <div key={msg.id} className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-end gap-2 max-w-[85%] md:max-w-[70%]">
                {!isMe && (
                  <div className={`hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${cfg.themeFrom} ${cfg.themeTo} text-white shadow-sm mb-1`}>
                    <Icon size={14} />
                  </div>
                )}
                <div className={`px-5 py-3.5 shadow-sm text-[15px] leading-relaxed break-words whitespace-pre-wrap ${
                  isMe
                    ? 'bg-gray-100 text-gray-900 rounded-[24px] rounded-br-md'
                    : `${cfg.bubble} rounded-[24px] rounded-bl-md`
                }`}>
                  {msg.content}
                </div>
              </div>
              
              <div className={`flex items-center gap-1.5 mt-1.5 px-1 md:px-11 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="text-[10px] font-bold text-gray-400">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isMe && <span className="text-[10px] font-bold text-emerald-500">Sent</span>}
              </div>

              {/* Suggestions logic remains identical */}
              {!isMe && suggestions.length > 0 && role === 'PATIENT' && (
                <div className="mt-3 md:ml-10 space-y-2 max-w-[85%] md:max-w-[70%] w-full">
                  <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Available Providers</p>
                  <div className="flex flex-col gap-2">
                    {suggestions.map((doc) => (
                      <DoctorSuggestionCard key={doc.doctorId} doctor={doc} patientId={patientDbId ?? user?.id ?? ''} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Area */}
      <div className="shrink-0 p-3 md:p-4 bg-white border-t border-gray-100/80">
        <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={cfg.placeholder}
            className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:bg-white focus:border-current focus:ring-4 rounded-full pl-5 pr-14 py-3.5 md:py-4 text-sm md:text-[15px] font-medium placeholder:text-gray-400 transition-all outline-none"
            style={{ color: 'var(--color-gray-900)', outlineColor: role === 'DOCTOR' ? 'var(--color-emerald-400)' : 'var(--color-indigo-400)' }}
          />
          <button
            type="submit"
            disabled={!inputMsg.trim()}
            className={`absolute right-1.5 md:right-2 p-2.5 md:p-3 rounded-full text-white shadow-sm hover:shadow active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed ${cfg.sendBtn}`}
          >
            <Send size={16} className="translate-x-[1px]" />
          </button>
        </form>
      </div>
    </div>
  );
}
