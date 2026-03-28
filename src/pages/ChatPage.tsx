/**
 * ChatPage
 * The primary view: split video panels (left) + chat sidebar (right).
 * Orchestrates all child components and reads from AppContext.
 */

import React from 'react';
import clsx from 'clsx';
import { useAppContext, useNotifyTyping } from '../context/AppContext';
import VideoPanel from '../components/VideoPanel';
import ChatBox from '../components/ChatBox';
import ControlBar from '../components/ControlBar';
import StatusBadge from '../components/StatusBadge';
import DisconnectedBanner from '../components/DisconnectedBanner';
import LandingOverlay from '../components/LandingOverlay';

export default function ChatPage() {
  const {
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
    toggleAudio,
    toggleVideo,
  } = useAppContext();

  const notifyTyping = useNotifyTyping();

  const isIdle = status === 'idle';
  const isSearching = status === 'searching' || status === 'connecting';
  const isConnected = status === 'connected';
  const isDisconnected = status === 'disconnected';

  return (
    <div className="flex flex-col h-full gap-4 relative">
      {/* ── Landing overlay (idle state) ─────────────────────────────── */}
      {isIdle && <LandingOverlay onStart={startChat} />}

      {/* ── Status bar ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between shrink-0">
        <StatusBadge status={status} />
        {isConnected && (
          <span className="text-xs text-zinc-600 font-mono animate-fade-in hidden sm:block">
            Press{' '}
            <kbd className="px-1.5 py-0.5 bg-surface-600 rounded text-zinc-400 border border-white/10 text-[10px]">
              Next
            </kbd>{' '}
            to find a new stranger
          </span>
        )}
      </div>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row flex-1 gap-4 min-h-0">

        {/* ── Video + controls (left / top) ───────────────────────────── */}
        <div className="flex flex-col flex-1 gap-3 min-h-0">

          {/* Video grid */}
          <div className="relative flex-1 min-h-0">
            <div className="h-full grid grid-rows-2 lg:grid-rows-1 lg:grid-cols-2 gap-3">

              {/* Remote — stranger */}
              <VideoPanel
                videoRef={remoteVideoRef}
                label="Stranger"
                isEmpty={!isConnected}
                isSearching={isSearching}
              />

              {/* Local — picture-in-picture on mobile when active */}
              <VideoPanel
                videoRef={localVideoRef}
                label="You"
                isLocal
                videoDisabled={!mediaState.videoEnabled}
                className={clsx(
                  isConnected &&
                    'lg:relative absolute bottom-3 right-3 w-28 h-20 lg:w-auto lg:h-auto z-10 shadow-2xl',
                )}
              />
            </div>
          </div>

          {/* Disconnected banner */}
          {isDisconnected && (
            <DisconnectedBanner onNext={nextStranger} onStop={stopChat} />
          )}

          {/* Control bar */}
          <div className="shrink-0 flex justify-center py-1">
            <ControlBar
              status={status}
              mediaState={mediaState}
              onStart={startChat}
              onNext={nextStranger}
              onStop={stopChat}
              onToggleAudio={toggleAudio}
              onToggleVideo={toggleVideo}
            />
          </div>
        </div>

        {/* ── Chat sidebar (right / bottom) ────────────────────────────── */}
        <div className="lg:w-80 xl:w-96 h-64 sm:h-72 lg:h-auto shrink-0">
          <ChatBox
            messages={messages}
            isStrangerTyping={isStrangerTyping}
            status={status}
            onSend={sendMessage}
            onTyping={notifyTyping}
          />
        </div>
      </div>
    </div>
  );
}
