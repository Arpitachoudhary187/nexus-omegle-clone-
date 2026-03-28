import React from 'react';
import { Zap, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function Header({ darkMode, onToggleDark }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
          <Zap size={16} className="text-white" fill="currentColor" />
        </div>
        <span className="font-display font-bold text-xl text-white tracking-tight">
          nexus
        </span>
        <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-600 border border-zinc-700 px-1.5 py-0.5 rounded-md uppercase tracking-widest">
          Beta
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <span className="hidden md:block text-xs text-zinc-600 font-mono">
          Random video chat for humans
        </span>

        <button
          onClick={onToggleDark}
          className="w-9 h-9 rounded-xl bg-surface-700 hover:bg-surface-600 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-200 active:scale-95"
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}
