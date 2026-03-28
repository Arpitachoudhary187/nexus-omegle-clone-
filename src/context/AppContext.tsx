/**
 * AppContext
 * Global state and actions for the video chat session.
 * Wires together Socket.IO events ↔ WebRTC ↔ chat state.
 *
 * notifyTyping is exposed via a separate context (NotifyTypingContext)
 * to avoid polluting AppContextValue and keep the public API clean.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '../services/socket';
import { useWebRTC } from '../hooks/useWebRTC';
import { useChat } from '../hooks/useChat';
import { AppContextValue, ConnectionStatus, MediaState } from '../types';

// ── Contexts ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

/** Exposes the debounced typing notifier via its own context. */
export const NotifyTypingContext = createContext<(() => void) | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [mediaState, setMediaState] = useState<MediaState>({
    audioEnabled: true,
    videoEnabled: true,
  });

  const socketRef = useRef<Socket | null>(null);
  const strangerIdRef = useRef<string | null>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    localVideoRef,
    remoteVideoRef,
    startLocalStream,
    stopLocalStream,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    closePeerConnection,
    toggleAudio,
    toggleVideo,
  } = useWebRTC();

  const {
    messages,
    isStrangerTyping,
    addMyMessage,
    addStrangerMessage,
    setStrangerTyping,
    clearMessages,
  } = useChat();

  // ── Socket lifecycle & event handlers ─────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    socket.connect();

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setStatus((prev) => (prev !== 'idle' ? 'disconnected' : 'idle'));
    });

    socket.on(
      'match_found',
      async ({ strangerId, isInitiator }: { strangerId: string; isInitiator: boolean }) => {
        strangerIdRef.current = strangerId;
        setStatus('connected');
        if (isInitiator) {
          await createOffer(socket, strangerId);
        }
      },
    );

    socket.on('waiting', () => setStatus('searching'));

    socket.on(
      'webrtc_offer_received',
      async ({ offer, from }: { offer: RTCSessionDescriptionInit; from: string }) => {
        strangerIdRef.current = from;
        await handleOffer(socket, offer, from);
      },
    );

    socket.on(
      'webrtc_answer_received',
      async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
        await handleAnswer(answer);
      },
    );

    socket.on(
      'ice_candidate_received',
      async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        await handleIceCandidate(candidate);
      },
    );

    socket.on('receive_message', ({ text }: { text: string }) => {
      addStrangerMessage(text);
    });

    socket.on('stranger_typing', ({ isTyping }: { isTyping: boolean }) => {
      setStrangerTyping(isTyping);
    });

    socket.on('stranger_disconnected', () => {
      closePeerConnection();
      clearMessages();
      strangerIdRef.current = null;
      setStatus('disconnected');
    });

    socket.on('error', ({ message }: { message: string }) => {
      console.error('[Socket] Error:', message);
      setStatus('error');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('match_found');
      socket.off('waiting');
      socket.off('webrtc_offer_received');
      socket.off('webrtc_answer_received');
      socket.off('ice_candidate_received');
      socket.off('receive_message');
      socket.off('stranger_typing');
      socket.off('stranger_disconnected');
      socket.off('error');
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const startChat = useCallback(async () => {
    setStatus('connecting');
    clearMessages();
    try {
      await startLocalStream();
      setStatus('searching');
      socketRef.current?.emit('find_match');
    } catch (err) {
      console.error('[App] startChat failed:', err);
      setStatus('error');
    }
  }, [startLocalStream, clearMessages]);

  const stopChat = useCallback(() => {
    closePeerConnection();
    stopLocalStream();
    socketRef.current?.emit('skip_user');
    strangerIdRef.current = null;
    clearMessages();
    setStatus('idle');
  }, [closePeerConnection, stopLocalStream, clearMessages]);

  const nextStranger = useCallback(() => {
    closePeerConnection();
    clearMessages();
    strangerIdRef.current = null;
    setStatus('searching');
    socketRef.current?.emit('skip_user');
  }, [closePeerConnection, clearMessages]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !strangerIdRef.current) return;
      addMyMessage(text);
      socketRef.current?.emit('send_message', { text });
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      socketRef.current?.emit('typing', { isTyping: false });
    },
    [addMyMessage],
  );

  const notifyTyping = useCallback(() => {
    if (!strangerIdRef.current) return;
    socketRef.current?.emit('typing', { isTyping: true });
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    typingDebounceRef.current = setTimeout(() => {
      socketRef.current?.emit('typing', { isTyping: false });
    }, 2000);
  }, []);

  const handleToggleAudio = useCallback(() => {
    const next = !mediaState.audioEnabled;
    setMediaState((s) => ({ ...s, audioEnabled: next }));
    toggleAudio(next);
  }, [mediaState.audioEnabled, toggleAudio]);

  const handleToggleVideo = useCallback(() => {
    const next = !mediaState.videoEnabled;
    setMediaState((s) => ({ ...s, videoEnabled: next }));
    toggleVideo(next);
  }, [mediaState.videoEnabled, toggleVideo]);

  // ── Context value ─────────────────────────────────────────────────────────

  const value: AppContextValue = {
    status,
    messages,
    isStrangerTyping,
    mediaState,
    localVideoRef,
    remoteVideoRef,
    startChat,
    stopChat,
    nextStranger,
    sendMessage,
    toggleAudio: handleToggleAudio,
    toggleVideo: handleToggleVideo,
  };

  return (
    <AppContext.Provider value={value}>
      <NotifyTypingContext.Provider value={notifyTyping}>
        {children}
      </NotifyTypingContext.Provider>
    </AppContext.Provider>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside <AppProvider>');
  return ctx;
}

export function useNotifyTyping(): () => void {
  return useContext(NotifyTypingContext) ?? (() => {});
}

// Legacy export kept for any imports
export const AppContextRaw = AppContext;
