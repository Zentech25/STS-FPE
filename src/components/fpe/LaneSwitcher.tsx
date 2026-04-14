import { useState, useRef, useEffect } from 'react';
import { useFPEStore } from '@/store/fpe-store';
import { TOTAL_APEX_LANES } from '@/types/fpe';
import { ChevronDown, Link2, Link2Off } from 'lucide-react';

interface LaneSwitcherProps {
  fpeId: number;
  currentApexLane: number;
}

export const LaneSwitcher = ({ fpeId, currentApexLane }: LaneSwitcherProps) => {
  const { lanes, switchApexLane } = useFPEStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const occupiedLanes = lanes
    .filter((l) => l.id !== fpeId)
    .map((l) => l.connectedApexLane);

  const apexLanes = Array.from({ length: TOTAL_APEX_LANES }, (_, i) => i + 1);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-colors"
        style={{
          background: 'var(--surface-inset)',
          border: '1px solid var(--divider)',
          color: 'var(--foreground)',
        }}
      >
        <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="font-mono">LANE {currentApexLane}</span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 z-50 rounded-lg py-1 min-w-[160px]"
          style={{
            background: 'var(--surface-glass)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid var(--divider)',
            boxShadow: 'var(--shadow-medium)',
          }}
        >
          <div className="px-3 py-1.5 text-[9px] font-semibold tracking-widest text-muted-foreground uppercase">
            Switch Apex Lane
          </div>
          <div className="max-h-[240px] overflow-y-auto">
            {apexLanes.map((ln) => {
              const isCurrent = ln === currentApexLane;
              const occupiedBy = lanes.find((l) => l.id !== fpeId && l.connectedApexLane === ln);
              const isBusy = !!occupiedBy;

              return (
                <button
                  key={ln}
                  disabled={isBusy}
                  onClick={() => {
                    switchApexLane(fpeId, ln);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-[11px] transition-colors ${
                    isCurrent
                      ? 'text-primary font-bold'
                      : isBusy
                      ? 'text-muted-foreground/40 cursor-not-allowed'
                      : 'text-foreground hover:bg-accent/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">Lane {ln}</span>
                    {isCurrent && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded font-bold tracking-wider"
                        style={{ background: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))' }}>
                        CURRENT
                      </span>
                    )}
                  </div>
                  {isBusy && (
                    <div className="flex items-center gap-1">
                      <Link2Off className="w-3 h-3" />
                      <span className="text-[8px] px-1.5 py-0.5 rounded font-bold tracking-wider"
                        style={{ background: 'hsl(var(--destructive) / 0.12)', color: 'hsl(var(--destructive))' }}>
                        FPE {occupiedBy.id}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
