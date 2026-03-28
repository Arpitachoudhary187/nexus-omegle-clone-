/**
 * VideoPanel
 * Renders a single video tile (local or remote) with an overlay label,
 * a "camera off" placeholder, and an optional scanning animation while searching.
 */

import React from 'react';
import clsx from 'clsx';
import { User, VideoOff, Wifi } from 'lucide-react';

interface VideoPanelProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  label: string;
  isLocal?: boolean;
  /** Show a "camera disabled" overlay */
  videoDisabled?: boolean;
  /** Show a scan-line searching animation */
  isSearching?: boolean;
  /** Show a "waiting for stranger" placeholder */
  isEmpty?: boolean;
  className?: string;
}

export default function VideoPanel({
  videoRef,
  label,
  isLocal = false,
  videoDisabled = false,
  isSearching = false,
  isEmpty = false,
  className,
}: VideoPanelProps) {
  return (
    <div
      className={clsx(
        'relative w-full h-full rounded-2xl overflow-hidden bg-surface-800 border border-white/5 group',
        'shadow-[0_4px_40px_rgba(0,0,0,0.5)]',
        isLocal && 'ring-1 ring-accent/20',
        className,
      )}
    >
      {/* Actual video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={clsx(
          'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
          (videoDisabled || isEmpty) ? 'opacity-0' : 'opacity-100',
        )}
      />

      {/* Camera-off overlay */}
      {videoDisabled && !isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-800 gap-3 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-surface-700 flex items-center justify-center">
            <VideoOff size={28} className="text-zinc-500" />
          </div>
          <p className="text-xs text-zinc-500 font-mono">Camera disabled</p>
        </div>
      )}

      {/* Empty / waiting placeholder */}
      {isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          {isSearching ? (
            <>
              {/* Scan-line animation */}
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-2 border-accent/30" />
                <div className="absolute inset-2 rounded-full border border-accent/20" />
                <div className="absolute inset-4 rounded-full border border-accent/10" />
                <Wifi size={28} className="absolute inset-0 m-auto text-accent animate-pulse" />
                {/* Scan line */}
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-accent to-transparent opacity-70 animate-scan" />
                </div>
              </div>
              <p className="text-xs text-accent-light font-mono tracking-widest animate-pulse uppercase">
                Scanning…
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-surface-700/60 flex items-center justify-center border border-white/5">
                <User size={32} className="text-zinc-600" />
              </div>
              <p className="text-xs text-zinc-600 font-mono">Waiting for stranger</p>
            </>
          )}
        </div>
      )}

      {/* Label pill */}
      <div className="absolute bottom-3 left-3 z-10">
        <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs font-mono text-white/70 border border-white/10">
          {label}
        </span>
      </div>

      {/* Corner glow for local tile */}
      {isLocal && (
        <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-accent/10" />
      )}
    </div>
  );
}
