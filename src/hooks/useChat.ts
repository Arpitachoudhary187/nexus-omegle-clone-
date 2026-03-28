/**
 * useChat
 * Manages the text-chat message list and typing indicator state.
 */

import { useState, useCallback, useRef } from 'react';
import { ChatMessage } from '../types';

interface UseChatReturn {
  messages: ChatMessage[];
  isStrangerTyping: boolean;
  addMyMessage: (text: string) => void;
  addStrangerMessage: (text: string) => void;
  setStrangerTyping: (isTyping: boolean) => void;
  clearMessages: () => void;
}

let msgCounter = 0;

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStrangerTyping, setIsStrangerTyping] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addMessage = useCallback((text: string, sender: 'me' | 'stranger') => {
    const msg: ChatMessage = {
      id: `msg-${++msgCounter}`,
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
  }, []);

  const addMyMessage = useCallback((text: string) => addMessage(text, 'me'), [addMessage]);
  const addStrangerMessage = useCallback((text: string) => addMessage(text, 'stranger'), [addMessage]);

  /** Auto-clear typing indicator after a timeout in case we miss the `false` event. */
  const setStrangerTyping = useCallback((isTyping: boolean) => {
    setIsStrangerTyping(isTyping);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (isTyping) {
      typingTimerRef.current = setTimeout(() => setIsStrangerTyping(false), 4000);
    }
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, isStrangerTyping, addMyMessage, addStrangerMessage, setStrangerTyping, clearMessages };
}
