import React from 'react';
import clsx from 'clsx';
import { ConnectionStatus } from '../types';

interface StatusBadgeProps {
  status: ConnectionStatus;
}

const CONFIG: Record<ConnectionStatus, { label: string; dot: string; bg: string; text: string }> = {
  idle: {
    label: 'Ready',
    dot: 'bg-surface-500',
    bg: 'bg-surface-700/80',
    text: 'text-zinc-400',
  },
  connecting: {
    label: 'Initialising camera…',
    dot: 'bg-warning animate-pulse',
    bg: 'bg-warning/10',
    text: 'text-warning',
  },
  searching: {
    label: 'Finding stranger…',
    dot: 'bg-accent animate-pulse',
    bg: 'bg-accent/10',
    text: 'text-accent-light',
  },
  connected: {
    label: 'Connected',
    dot: 'bg-success animate-pulse-slow',
    bg: 'bg-success/10',
    text: 'text-success',
  },
  disconnected: {
    label: 'Stranger left',
    dot: 'bg-danger',
    bg: 'bg-danger/10',
    text: 'text-danger',
  },
  error: {
    label: 'Error — check permissions',
    dot: 'bg-danger animate-ping',
    bg: 'bg-danger/10',
    text: 'text-danger',
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = CONFIG[status];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium tracking-wide',
        cfg.bg,
        cfg.text,
      )}
    >
      <span className={clsx('w-2 h-2 rounded-full shrink-0', cfg.dot)} />
      {cfg.label}
    </span>
  );
}
