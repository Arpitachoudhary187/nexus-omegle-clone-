/**
 * LandingOverlay
 * Full-screen welcome screen shown when status is 'idle'.
 */

import React from 'react';
import { Zap, Shield, Globe, ChevronRight } from 'lucide-react';

interface LandingOverlayProps {
  onStart: () => void;
}

export default function LandingOverlay({ onStart }: LandingOverlayProps) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface-900/95 backdrop-blur-sm rounded-2xl animate-fade-in">
      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center text-center gap-8 px-8 max-w-md">
        {/* Icon cluster */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center shadow-outer-glow">
            <Zap size={36} className="text-accent" fill="currentColor" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-surface-900 animate-pulse-slow" />
        </div>

        {/* Copy */}
        <div className="space-y-3">
          <h1 className="font-display font-bold text-4xl text-white tracking-tight">
            Meet someone <br />
            <span className="text-accent">right now.</span>
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Instant anonymous video chat with strangers from around the world. No sign-up, no judgment.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { icon: <Globe size={11} />, label: 'Worldwide' },
            { icon: <Shield size={11} />, label: 'Anonymous' },
            { icon: <Zap size={11} />, label: 'Instant match' },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-700 border border-white/8 rounded-full text-xs text-zinc-400 font-mono"
            >
              {icon} {label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          className="group flex items-center gap-2 px-8 py-3.5 bg-accent hover:bg-accent-light text-white font-display font-semibold text-base rounded-xl transition-all duration-200 shadow-lg shadow-accent/30 hover:shadow-accent/50 active:scale-95 animate-glow-pulse"
        >
          Start Chatting
          <ChevronRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>

        <p className="text-[11px] text-zinc-700 font-mono">
          By continuing you agree to be respectful and kind.
        </p>
      </div>
    </div>
  );
}
