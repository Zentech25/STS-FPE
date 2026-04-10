import type { SessionStatus } from '@/types/fpe';

const statusConfig: Record<SessionStatus, { label: string; className: string }> = {
  standby: { label: 'STANDBY', className: 'bg-muted text-muted-foreground' },
  live: { label: 'LIVE', className: 'bg-success/20 text-success status-glow-success' },
  paused: { label: 'PAUSED', className: 'bg-warning/20 text-warning status-glow-warning' },
};

export const StatusBadge = ({ status }: { status: SessionStatus }) => {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded font-mono text-xs font-semibold tracking-wider ${config.className}`}>
      {status === 'live' && <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />}
      {status === 'paused' && <span className="w-2 h-2 rounded-full bg-warning" />}
      {config.label}
    </span>
  );
};
