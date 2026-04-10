import type { ControlMode } from '@/types/fpe';
import { Shield, Crosshair } from 'lucide-react';

export const ModeBadge = ({ mode }: { mode: ControlMode }) => {
  const isMaster = mode === 'master';
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded font-mono text-xs font-semibold tracking-wider ${
      isMaster
        ? 'bg-info/15 text-info border border-info/30'
        : 'bg-primary/15 text-primary border border-primary/30'
    }`}>
      {isMaster ? <Shield className="w-3.5 h-3.5" /> : <Crosshair className="w-3.5 h-3.5" />}
      {isMaster ? 'MASTER' : 'FIRER'} MODE
    </div>
  );
};
