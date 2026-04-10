import { useFPEStore } from '@/store/fpe-store';
import { StatusBadge } from './StatusBadge';
import { ModeBadge } from './ModeBadge';
import { TraineePanel } from './TraineePanel';
import { ExercisePanel } from './ExercisePanel';
import { AnimatedBackground } from './AnimatedBackground';
import { ArrowLeft, Play, Pause, Square, Crosshair } from 'lucide-react';

export const LaneDashboard = () => {
  const { lanes, selectedLaneId, setStatus, setMode } = useFPEStore();
  const lane = lanes.find((l) => l.id === selectedLaneId);
  if (!lane) return null;

  const toggleStatus = () => {
    if (lane.status === 'standby') setStatus(lane.id, 'live');
    else if (lane.status === 'live') setStatus(lane.id, 'paused');
    else setStatus(lane.id, 'live');
  };

  const stop = () => setStatus(lane.id, 'standby');
  const toggleMode = () => setMode(lane.id, lane.mode === 'master' ? 'firer' : 'master');

  return (
    <div className="relative w-full h-screen overflow-auto">
      <AnimatedBackground />

      <div className="relative z-10">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-6 shrink-0" style={{
          background: "var(--surface-glass)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderBottom: "1px solid var(--divider)",
          boxShadow: "var(--shadow-soft)",
        }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
                background: "var(--gradient-primary)",
                boxShadow: "0 4px 14px hsl(230 80% 60% / 0.3)",
              }}>
                <Crosshair className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-[14px] font-bold tracking-wide text-foreground leading-none">Lane {lane.id}</span>
                <span className="block text-[9px] text-muted-foreground font-mono mt-0.5">FPE CONTROL</span>
              </div>
            </div>
            <StatusBadge status={lane.status} />
          </div>

          <div className="flex items-center gap-3">
            <ModeBadge mode={lane.mode} />
            <button
              onClick={toggleMode}
              className="text-[11px] font-semibold text-muted-foreground px-3 py-2 rounded-xl glass-btn"
            >
              SWITCH
            </button>
            <div className="flex gap-1.5 ml-2">
              <button
                onClick={toggleStatus}
                className="w-9 h-9 rounded-xl flex items-center justify-center glass-btn"
                style={{
                  color: lane.status === 'live' ? 'hsl(var(--warning))' : 'hsl(var(--success))',
                }}
              >
                {lane.status === 'live' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={stop}
                className="w-9 h-9 rounded-xl flex items-center justify-center glass-btn"
                style={{ color: 'hsl(var(--destructive))' }}
              >
                <Square className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto p-6 grid grid-cols-3 gap-5 stagger-children">
          {/* Left column - Trainees */}
          <div className="col-span-1 space-y-5">
            <TraineePanel lane={lane} />
          </div>

          {/* Center & Right - Exercise + Score */}
          <div className="col-span-2 space-y-5">
            {/* Score bar */}
            <div className="glass-panel p-5 grid grid-cols-4 gap-4">
              <ScoreStat label="SHOTS FIRED" value={lane.shotsFired} max={lane.exercise.rounds} />
              <ScoreStat label="HITS" value={lane.hits} />
              <ScoreStat label="SCORE" value={lane.score} accent />
              <ScoreStat label="ACCURACY" value={lane.shotsFired > 0 ? Math.round((lane.hits / lane.shotsFired) * 100) : 0} suffix="%" />
            </div>

            <ExercisePanel lane={lane} />
          </div>
        </main>
      </div>
    </div>
  );
};

const ScoreStat = ({ label, value, max, suffix = '', accent }: {
  label: string; value: number; max?: number; suffix?: string; accent?: boolean;
}) => (
  <div className="text-center">
    <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-2">{label}</div>
    <div className={`text-2xl font-bold ${accent ? 'gradient-text' : 'text-foreground'}`}>
      {value}{suffix}
      {max !== undefined && <span className="text-sm text-muted-foreground ml-0.5">/{max}</span>}
    </div>
  </div>
);
