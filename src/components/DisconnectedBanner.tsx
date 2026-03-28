import React from 'react';
import { UserX, RotateCcw } from 'lucide-react';

interface DisconnectedBannerProps {
  onNext: () => void;
  onStop: () => void;
}

export default function DisconnectedBanner({ onNext, onStop }: DisconnectedBannerProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 bg-danger/10 border border-danger/20 rounded-xl animate-slide-up">
      <div className="flex items-center gap-2.5">
        <UserX size={16} className="text-danger shrink-0" />
        <span className="text-sm text-danger/90 font-mono">Stranger has disconnected</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onNext}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/20 hover:bg-accent/30 text-accent-light rounded-lg text-xs font-display font-semibold transition-all duration-200"
        >
          <RotateCcw size={12} />
          Find new
        </button>
        <button
          onClick={onStop}
          className="px-3 py-1.5 bg-surface-600 hover:bg-surface-500 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs font-display font-semibold transition-all duration-200"
        >
          Quit
        </button>
      </div>
    </div>
  );
}
