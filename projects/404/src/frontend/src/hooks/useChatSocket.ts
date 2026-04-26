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
}

function formatMsg(msg: any): ChatMessage {
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

  // Sync initial messages (HTTP load on conversation change)
  useEffect(() => {
    setMessages(initialMessages);
  }, [conversationId, initialMessages.length]); // eslint-disable-line

  // Socket lifecycle
  useEffect(() => {
    if (!conversationId) return;

    const socket = io(`${SOCKET_URL}/communication`, {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('joinRoom', { conversationId });
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.on('messageCreated', (msg: any) => {
      const formatted = formatMsg(msg);
      setMessages((prev) => {
        // Avoid duplicates (optimistic already appended user msg)
        if (prev.some((m) => m.id === formatted.id)) return prev;
        return [...prev, formatted];
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [conversationId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || !socketRef.current) return;

      // Optimistic local append
      const optimistic: ChatMessage = {
        id: `opt-${Date.now()}`,
        senderId,
        senderType: 'USER',
        text: content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, optimistic]);

      socketRef.current.emit('sendMessage', {
        conversationId,
        senderId,
        content,
        senderType: 'USER',
      });
    },
    [conversationId, senderId],
  );

  return { messages, sendMessage, isConnected };
}
