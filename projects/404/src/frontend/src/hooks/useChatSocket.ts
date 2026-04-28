import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Strip /api suffix to get bare server URL
const SOCKET_URL = (import.meta.env.VITE_API_URL as string || 'http://localhost:3000/api')
  .replace(/\/api$/, '');

export interface ChatMessage {
  id: string;
  senderId: string;
  senderType?: string;
  text: string;
  time: string;
  status?: 'sending' | 'sent';
}

export function formatMsg(msg: any): ChatMessage {
  return {
    id: msg.id,
    senderId: msg.senderId,
    senderType: msg.senderType,
    text: msg.content ?? msg.text ?? '',
    time: new Date(msg.createdAt ?? Date.now()).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export function useChatSocket(
  conversationId: string,
  senderId: string,
  initialMessages: ChatMessage[] = [],
) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isConnected, setIsConnected] = useState(false);
  const [typingIds, setTypingIds] = useState<Set<string>>(new Set());

  // Sync initial messages (HTTP load on conversation change)
  useEffect(() => {
    setMessages(initialMessages.map(m => ({ ...m, status: 'sent' })));
  }, [conversationId, initialMessages.length]); // eslint-disable-line

  // Socket lifecycle
  useEffect(() => {
    if (!conversationId) return;

    const socket = io(`${SOCKET_URL}/communication`, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('joinRoom', { conversationId });
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.on('messageCreated', (msg: any) => {
      const formatted = { ...formatMsg(msg), status: 'sent' as const };
      setMessages((prev) => {
        // Find optimistic message if it exists
        const exists = prev.findIndex(m => m.id === formatted.id);
        if (exists >= 0) return prev;
        
        // Remove typing indicator for AI when it replies
        if (msg.senderId === 'SYSTEM') {
           setTypingIds(prevSet => {
             const newSet = new Set(prevSet);
             newSet.delete('SYSTEM');
             return newSet;
           });
        }
        return [...prev, formatted];
      });
    });

    socket.on('typing', (data: { senderId: string, isTyping: boolean }) => {
      setTypingIds(prev => {
        const next = new Set(prev);
        if (data.isTyping) next.add(data.senderId);
        else next.delete(data.senderId);
        return next;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [conversationId]);

  const emitTyping = useCallback((isTyping: boolean) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', { conversationId, senderId, isTyping });
    }
  }, [conversationId, senderId, isConnected]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || !socketRef.current) return;

      const optimisticId = `opt-${Date.now()}`;
      const optimistic: ChatMessage = {
        id: optimisticId,
        senderId,
        senderType: 'USER',
        text: content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sending'
      };
      setMessages((prev) => [...prev, optimistic]);

      // If chatting with SYSTEM, artificially show AI typing
      if (conversationId === 'SYSTEM') {
         setTypingIds(prev => new Set(prev).add('SYSTEM'));
      }

      socketRef.current.emit('sendMessage', {
        conversationId,
        senderId,
        content,
        senderType: 'USER',
      }, () => {
         // Ack callback from socket event
         // Wait, the nestjs gateway returns ack!
      });

      // To handle the ack, since nestjs gateway returns { event: 'messageAck' }
      // We listen to messageAck event actually!
    },
    [conversationId, senderId],
  );

  useEffect(() => {
    const sock = socketRef.current;
    if (!sock) return;
    const handleAck = (data: { messageId: string, aiMessageId: string | null }) => {
       setMessages(prev => prev.map(m => 
          m.status === 'sending' ? { ...m, id: data.messageId, status: 'sent' } : m
       ));
    };
    sock.on('messageAck', handleAck);
    return () => { sock.off('messageAck', handleAck); }
  }, [isConnected]);

  return { messages, sendMessage, emitTyping, isConnected, typingIds };
}
