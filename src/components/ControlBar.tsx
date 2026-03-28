/**
 * ControlBar
 * Primary action buttons: Start, Next, Stop, Mic, Camera.
 */

import React from 'react';
import clsx from 'clsx';
import {
  Play,
  SkipForward,
  Square,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Loader2,
} from 'lucide-react';
import { ConnectionStatus, MediaState } from '../types';

interface ControlBarProps {
  status: ConnectionStatus;
  mediaState: MediaState;
  onStart: () => void;
  onNext: () => void;
  onStop: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}

export default function ControlBar({
  status,
  mediaState,
  onStart,
  onNext,
  onStop,
  onToggleAudio,
  onToggleVideo,
}: ControlBarProps) {
  const isIdle = status === 'idle' || status === 'disconnected' || status === 'error';
  const isSearching = status === 'searching' || status === 'connecting';
  const isActive = status === 'connected' || isSearching;

  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      {/* ── Primary action ─────────────────────────────────────────────── */}
      {isIdle && (
        <PrimaryButton onClick={onStart} icon={<Play size={16} fill="currentColor" />} label="Start Chat" variant="start" />
      )}

      {isSearching && (
        <PrimaryButton
          onClick={onStop}
          icon={<Loader2 size={16} className="animate-spin" />}
          label="Searching…"
          variant="searching"
        />
      )}

      {status === 'connected' && (
        <>
          <PrimaryButton onClick={onNext} icon={<SkipForward size={16} />} label="Next" variant="next" />
          <PrimaryButton onClick={onStop} icon={<Square size={14} fill="currentColor" />} label="Stop" variant="stop" />
        </>
      )}

      {/* ── Media toggles (only when active) ───────────────────────────── */}
      {isActive && (
        <div className="flex items-center gap-2">
          <Divider />
          <MediaToggle
            active={mediaState.audioEnabled}
            onToggle={onToggleAudio}
            iconOn={<Mic size={15} />}
            iconOff={<MicOff size={15} />}
            label={mediaState.audioEnabled ? 'Mute' : 'Unmute'}
          />
          <MediaToggle
            active={mediaState.videoEnabled}
            onToggle={onToggleVideo}
            iconOn={<Video size={15} />}
            iconOff={<VideoOff size={15} />}
            label={mediaState.videoEnabled ? 'Cam Off' : 'Cam On'}
          />
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface PrimaryButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant: 'start' | 'next' | 'stop' | 'searching';
}

const VARIANT_CLASSES: Record<PrimaryButtonProps['variant'], string> = {
  start: 'bg-accent hover:bg-accent-light text-white shadow-lg shadow-accent/30 animate-glow-pulse',
  next: 'bg-surface-600 hover:bg-surface-500 text-white border border-white/10',
  stop: 'bg-danger/20 hover:bg-danger/30 text-danger border border-danger/30',
  searching: 'bg-accent/20 text-accent-light border border-accent/20 cursor-default pointer-events-none',
};

function PrimaryButton({ onClick, icon, label, variant }: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-semibold text-sm transition-all duration-200 active:scale-95',
        VARIANT_CLASSES[variant],
      )}
    >
      {icon}
      {label}
    </button>
  );
}

interface MediaToggleProps {
  active: boolean;
  onToggle: () => void;
  iconOn: React.ReactNode;
  iconOff: React.ReactNode;
  label: string;
}

function MediaToggle({ active, onToggle, iconOn, iconOff, label }: MediaToggleProps) {
  return (
    <button
      onClick={onToggle}
      title={label}
      className={clsx(
        'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition-all duration-200 active:scale-95',
        active
          ? 'bg-surface-600 hover:bg-surface-500 text-zinc-300 border border-white/10'
          : 'bg-danger/15 hover:bg-danger/25 text-danger border border-danger/25',
      )}
    >
      {active ? iconOn : iconOff}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-white/10" />;
}
