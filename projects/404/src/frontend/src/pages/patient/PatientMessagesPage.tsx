import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Bot } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../lib/api/axios';
import { Card } from '../../components/ui/Card';
import DoctorSuggestionCard, { type DoctorSuggestion } from '../../components/patient/DoctorSuggestionCard';

interface Message {
  id: string;
  senderId: string;
  senderType: 'USER' | 'SYSTEM' | 'DOCTOR';
  content: string;
  createdAt: string;
  metadata?: {
    doctorSuggestions?: DoctorSuggestion[];
  } | null;
}

export default function PatientMessagesPage() {
  const { user, token } = useAuth();
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

      // Get the patient DB record ID (needed for booking appointments)
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
      const newSocket = io(`${BASE_URL}/communication`, {
        transports: ['websocket'],
      });

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

      return () => {
        newSocket.disconnect();
      };
    }
    initChat();
  }, [user, token]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !socket || !conversationId || !user) return;

    socket.emit('sendMessage', {
      conversationId,
      senderId: user.id,
      content: inputMsg,
    });

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
          {/* Pinned AI */}
          <button className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-indigo-50/80 border border-indigo-100/50 hover:bg-indigo-100 transition-colors text-left relative overflow-hidden group shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <div className="relative">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md transform group-hover:scale-105 transition-transform">
                <Bot size={24} />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-indigo-50 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-bold text-gray-900 truncate">CareFlow AI</h3>
              <p className="text-xs font-semibold text-indigo-600 truncate">Always here to help</p>
            </div>
          </button>
        </div>
      </Card>

      {/* Chat area — min-w-0 prevents flex blowout */}
      <Card className="flex-1 min-w-0 flex flex-col p-0 overflow-hidden shadow-lg border-white/40 bg-white/70 backdrop-blur-xl rounded-3xl" padding="none">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100/50 bg-white/60 backdrop-blur-md z-10 flex items-center gap-4">
          <div className="relative">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-sm">
              <Bot size={22} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight">CareFlow AI</h3>
            <p className="text-xs font-semibold text-emerald-500">Active now · Can suggest doctors</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5 bg-slate-50/30">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-60">
              <Bot size={48} className="mb-4 text-indigo-300" />
              <p className="text-[15px] font-bold text-gray-600">Start a secure conversation</p>
              <p className="text-sm font-medium text-gray-500 mt-1">
                Ask about symptoms, medications, or request a doctor.
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
                      <div className="shrink-0 hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-sm mb-1">
                        <Bot size={16} />
                      </div>
                    )}
                    <div className={`relative px-5 py-3.5 shadow-sm ${
                      isMe
                        ? 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 text-white rounded-3xl rounded-br-sm'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-3xl rounded-bl-sm shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]'
                    }`}>
                      <p className={`text-[15px] leading-relaxed break-words whitespace-pre-wrap ${isMe ? 'font-medium' : ''}`}>
                        {msg.content}
                      </p>
                      <p className={`text-[10px] mt-1.5 font-bold text-right ${isMe ? 'text-indigo-100/80' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Doctor suggestion cards below AI message */}
                {!isMe && suggestions.length > 0 && (
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
              placeholder="Ask about symptoms, or type 'find a cardiologist'…"
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-gray-200 focus:border-indigo-400 rounded-full pl-6 pr-16 py-4 text-[15px] font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-gray-800 placeholder:text-gray-400 shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="absolute right-2.5 p-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
            >
              <Send size={18} className="translate-x-[1px]" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
