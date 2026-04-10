import type { SessionStatus } from '@/types/fpe';

const statusConfig: Record<SessionStatus, { label: string; dotClass: string; bgClass: string }> = {
  standby: { label: 'STANDBY', dotClass: 'status-dot-offline', bgClass: 'bg-muted' },
  live: { label: 'LIVE', dotClass: 'status-dot-online', bgClass: 'bg-success/10' },
  paused: { label: 'PAUSED', dotClass: 'status-dot-warning', bgClass: 'bg-warning/10' },
};

export const StatusBadge = ({ status }: { status: SessionStatus }) => {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-semibold tracking-wider uppercase ${config.bgClass}`}>
      <span className={`status-dot ${config.dotClass}`} />
      <span className="text-foreground">{config.label}</span>
    </span>
  );
};
