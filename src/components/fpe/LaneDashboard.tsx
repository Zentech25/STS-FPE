import { useFPEStore } from '@/store/fpe-store';
import { ModeBadge } from './ModeBadge';
import { TraineePanel } from './TraineePanel';
import { ExercisePanel } from './ExercisePanel';
import { ARCPanel } from './ARCPanel';
import { ReplayModal } from './ReplayModal';
import { AnimatedBackground } from './AnimatedBackground';
import { ConnectionIndicators } from './ConnectionIndicators';
import { Play, Pause, Square, Crosshair, History, Focus } from 'lucide-react';
import { useState } from 'react';

export const LaneDashboard = () => {
  const { lanes, selectedLaneId, setStatus, updateExercise, resetSession, saveSession } = useFPEStore();
  const lane = lanes.find((l) => l.id === selectedLaneId);
  const [replayOpen, setReplayOpen] = useState(false);
  if (!lane) return null;

  const toggleStatus = () => {
    if (lane.status === 'standby') setStatus(lane.id, 'live');
    else if (lane.status === 'live') setStatus(lane.id, 'paused');
    else setStatus(lane.id, 'live');
  };

  const stop = () => {
    if (lane.shotsFired > 0 && lane.traineeQueue.length > 0) {
      saveSession(lane.id);
    }
    setStatus(lane.id, 'standby');
    resetSession(lane.id);
  };

  const setExType = (type: 'custom' | 'arc') => updateExercise(lane.id, { type });

  return (
    <div className="relative w-full h-screen overflow-auto">
      <AnimatedBackground />

      <div className="relative z-10">
        {/* Header — streamlined */}
        <header className="h-14 flex items-center justify-between px-5 shrink-0" style={{
          background: "var(--surface-glass)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderBottom: "1px solid var(--divider)",
          boxShadow: "var(--shadow-soft)",
        }}>
          {/* Left: Branding + Connection */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{
                background: "var(--gradient-primary)",
                boxShadow: "0 2px 10px hsl(230 80% 60% / 0.25)",
              }}>
                <Crosshair className="w-4 h-4 text-white" />
              </div>
              <div className="leading-none">
                <span className="text-[14px] font-bold tracking-wide text-foreground">Lane {lane.id}</span>
                <span className="block text-[9px] text-muted-foreground font-mono">FPE CONTROL</span>
              </div>
            </div>

            <div className="w-px h-7" style={{ background: "var(--divider)" }} />

            <ConnectionIndicators />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Weapon calibration initiated — follow on-screen prompts.')}
              className="h-10 px-4 rounded-lg flex items-center gap-1.5 glass-btn text-[11px] font-semibold text-muted-foreground hover:text-foreground"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <Focus className="w-4 h-4" />
              CALIBRATE
            </button>

            <button
              onClick={() => setReplayOpen(true)}
              className="h-10 px-4 rounded-lg flex items-center gap-1.5 glass-btn text-[11px] font-semibold text-muted-foreground hover:text-foreground"
            >
              <History className="w-4 h-4" />
              REPLAY
            </button>

            <div className="w-px h-7" style={{ background: "var(--divider)" }} />

            <ModeBadge mode={lane.mode} />

            <div className="flex gap-1.5 ml-1">
              <button
                onClick={toggleStatus}
                className="w-10 h-10 rounded-lg flex items-center justify-center glass-btn"
                style={{
                  color: lane.status === 'live' ? 'hsl(var(--warning))' : 'hsl(var(--success))',
                }}
              >
                {lane.status === 'live' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={stop}
                className="w-10 h-10 rounded-lg flex items-center justify-center glass-btn"
                style={{ color: 'hsl(var(--destructive))' }}
              >
                <Square className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto p-6 grid grid-cols-3 gap-5 stagger-children">
          {/* Left column - Target/Trainees */}
          <div className="col-span-1 space-y-5">
            <TraineePanel lane={lane} />
          </div>

          {/* Center & Right */}
          <div className="col-span-2 space-y-5">
            {/* Score bar */}
            <div className="glass-panel p-5 grid grid-cols-4 gap-4">
              <ScoreStat label="SHOTS FIRED" value={lane.shotsFired} max={lane.exercise.rounds} />
              <ScoreStat label="HITS" value={lane.hits} />
              <ScoreStat label="SCORE" value={lane.score} accent />
              <ScoreStat label="ACCURACY" value={lane.shotsFired > 0 ? Math.round((lane.hits / lane.shotsFired) * 100) : 0} suffix="%" />
            </div>

            <ExercisePanel lane={lane} exType={lane.exercise.type} onExTypeChange={setExType} masterMode={lane.mode === 'master'} />
            <ARCPanel lane={lane} />
          </div>
        </main>
      </div>

      <ReplayModal lane={lane} open={replayOpen} onClose={() => setReplayOpen(false)} />
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
