/**
 * ChatBox
 * Scrollable message list + typing indicator + message input.
 */

import React, { useEffect, useRef, useState, KeyboardEvent } from 'react';
import clsx from 'clsx';
import { Send } from 'lucide-react';
import { ChatMessage, ConnectionStatus } from '../types';

interface ChatBoxProps {
  messages: ChatMessage[];
  isStrangerTyping: boolean;
  status: ConnectionStatus;
  onSend: (text: string) => void;
  onTyping?: () => void;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatBox({ messages, isStrangerTyping, status, onSend, onTyping }: ChatBoxProps) {
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isConnected = status === 'connected';

  // Auto-scroll to newest message
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isStrangerTyping]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text || !isConnected) return;
    onSend(text);
    setDraft('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    onTyping?.();
  };

  return (
    <div className="flex flex-col h-full bg-surface-800 rounded-2xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
        <span className="text-xs font-display font-semibold text-zinc-300 tracking-wide uppercase">Chat</span>
        <span className="text-xs text-zinc-600 font-mono">{messages.length} messages</span>
      </div>

      {/* Message list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-surface-600 scrollbar-track-transparent"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#2e2e40 transparent' }}
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-zinc-600 font-mono text-center leading-relaxed">
              {isConnected
                ? 'Say hello to your stranger…'
                : 'Messages will appear here once connected.'}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isStrangerTyping && (
          <div className="flex items-end gap-2 animate-fade-in">
            <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl rounded-bl-sm bg-surface-700 border border-white/5">
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </span>
            </div>
            <span className="text-[10px] text-zinc-600 mb-0.5 font-mono">Stranger is typing</span>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-white/5 p-3">
        <div className={clsx(
          'flex items-end gap-2 rounded-xl border bg-surface-700 px-3 py-2 transition-all duration-200',
          isConnected
            ? 'border-white/10 focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/20'
            : 'border-white/5 opacity-50',
        )}>
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={!isConnected}
            placeholder={isConnected ? 'Type a message…' : 'Connect first…'}
            className="flex-1 resize-none bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none leading-relaxed max-h-24 overflow-y-auto"
            style={{ scrollbarWidth: 'none' }}
          />
          <button
            onClick={handleSend}
            disabled={!isConnected || !draft.trim()}
            className={clsx(
              'shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200',
              isConnected && draft.trim()
                ? 'bg-accent hover:bg-accent-light text-white shadow-lg shadow-accent/25'
                : 'text-zinc-600 cursor-not-allowed',
            )}
          >
            <Send size={13} />
          </button>
        </div>
        <p className="text-[10px] text-zinc-700 mt-1.5 text-center font-mono">
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const isMe = message.sender === 'me';
  return (
    <div className={clsx('flex flex-col gap-1 animate-slide-up', isMe ? 'items-end' : 'items-start')}>
      <div
        className={clsx(
          'max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed',
          isMe
            ? 'bg-accent text-white rounded-br-sm'
            : 'bg-surface-700 text-zinc-200 border border-white/5 rounded-bl-sm',
        )}
      >
        {message.text}
      </div>
      <span className="text-[10px] text-zinc-700 font-mono px-1">
        {isMe ? 'You' : 'Stranger'} · {formatTime(message.timestamp)}
      </span>
    </div>
  );
}
