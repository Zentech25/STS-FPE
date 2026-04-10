import type { ControlMode } from '@/types/fpe';
import { Shield, Crosshair } from 'lucide-react';

export const ModeBadge = ({ mode }: { mode: ControlMode }) => {
  const isMaster = mode === 'master';
  return (
    <div className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-semibold tracking-wider`}
      style={{
        background: isMaster ? 'hsl(var(--accent) / 0.12)' : 'hsl(var(--primary) / 0.12)',
        border: `1px solid ${isMaster ? 'hsl(var(--accent) / 0.2)' : 'hsl(var(--primary) / 0.2)'}`,
        color: isMaster ? 'hsl(var(--accent))' : 'hsl(var(--primary))',
      }}
    >
      {isMaster ? <Shield className="w-3.5 h-3.5" /> : <Crosshair className="w-3.5 h-3.5" />}
      {isMaster ? 'MASTER' : 'FIRER'} MODE
    </div>
  );
};
