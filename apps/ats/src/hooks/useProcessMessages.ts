import { logger } from '@/lib/logger';
/**
 * Hook para gestionar mensajes con el candidato
 * Incluye polling automático con cleanup adecuado
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getProcessMessages,
  sendProcessMessage,
  type ProcessMessageData,
} from '../services/selectionProcessApi';

const POLLING_INTERVAL = 10000; // 10 segundos

export interface UseProcessMessagesReturn {
  messages: ProcessMessageData[];
  loading: boolean;
  newMessage: string;
  setNewMessage: (value: string) => void;
  sending: boolean;
  handleSendMessage: () => Promise<void>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function useProcessMessages(processId: string | undefined): UseProcessMessagesReturn {
  const [messages, setMessages] = useState<ProcessMessageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cargar mensajes inicial
  const fetchMessages = useCallback(async () => {
    if (!processId) return;

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const data = await getProcessMessages(processId);
      setMessages(data);
    } catch (err) {
      // Ignorar errores de abort
      if (err instanceof Error && err.name !== 'AbortError') {
        logger.error('Error fetching messages:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [processId]);

  // Carga inicial
  useEffect(() => {
    fetchMessages();

    // Cleanup al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchMessages]);

  // Polling para nuevos mensajes
  useEffect(() => {
    if (!processId) return;

    const pollMessages = async () => {
      try {
        const data = await getProcessMessages(processId);
        // Solo actualizar si hay nuevos mensajes
        if (data.length !== prevMessageCountRef.current) {
          setMessages(data);
        }
      } catch (err) {
        // Silenciar errores de polling
        logger.error('Error polling messages:', err);
      }
    };

    const intervalId = setInterval(pollMessages, POLLING_INTERVAL);

    // Cleanup del interval
    return () => {
      clearInterval(intervalId);
    };
  }, [processId]);

  // Scroll automático cuando hay nuevos mensajes
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  const handleSendMessage = useCallback(async () => {
    if (!processId || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      const sentMessage = await sendProcessMessage(processId, newMessage.trim());
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage('');
    } catch (err) {
      logger.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  }, [processId, newMessage, sending]);

  return {
    messages,
    loading,
    newMessage,
    setNewMessage,
    sending,
    handleSendMessage,
    messagesEndRef,
  };
}
