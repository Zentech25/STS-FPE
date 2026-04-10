import { useFPEStore } from '@/store/fpe-store';
import { StatusBadge } from './StatusBadge';
import { ModeBadge } from './ModeBadge';
import { TraineePanel } from './TraineePanel';
import { ExercisePanel } from './ExercisePanel';
import { ArrowLeft, Play, Pause, Square, Crosshair, Target } from 'lucide-react';

export const LaneDashboard = () => {
  const { lanes, selectedLaneId, clearLane, setStatus, setMode } = useFPEStore();
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
    <div className="min-h-screen tactical-grid">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-lg px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={clearLane} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-primary" />
              <span className="font-mono text-lg font-bold tracking-wider">LANE {lane.id}</span>
            </div>
            <StatusBadge status={lane.status} />
          </div>

          <div className="flex items-center gap-3">
            <ModeBadge mode={lane.mode} />
            <button
              onClick={toggleMode}
              className="text-xs font-mono text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 transition-colors"
            >
              SWITCH
            </button>
            <div className="flex gap-1 ml-2">
              <button
                onClick={toggleStatus}
                className={`p-2 rounded transition-colors ${
                  lane.status === 'live'
                    ? 'bg-warning/20 text-warning hover:bg-warning/30'
                    : 'bg-success/20 text-success hover:bg-success/30'
                }`}
              >
                {lane.status === 'live' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={stop}
                className="p-2 rounded bg-danger/20 text-danger hover:bg-danger/30 transition-colors"
              >
                <Square className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4 grid grid-cols-3 gap-4">
        {/* Left column - Trainees */}
        <div className="col-span-1 space-y-4">
          <TraineePanel lane={lane} />
        </div>

        {/* Center & Right - Exercise + Score */}
        <div className="col-span-2 space-y-4">
          {/* Score bar */}
          <div className="glass-card p-4 grid grid-cols-4 gap-4">
            <ScoreStat label="SHOTS FIRED" value={lane.shotsFired} max={lane.exercise.rounds} />
            <ScoreStat label="HITS" value={lane.hits} />
            <ScoreStat label="SCORE" value={lane.score} accent />
            <ScoreStat label="ACCURACY" value={lane.shotsFired > 0 ? Math.round((lane.hits / lane.shotsFired) * 100) : 0} suffix="%" />
          </div>

          <ExercisePanel lane={lane} />
        </div>
      </main>
    </div>
  );
};

const ScoreStat = ({ label, value, max, suffix = '', accent }: {
  label: string; value: number; max?: number; suffix?: string; accent?: boolean;
}) => (
  <div className="text-center">
    <div className="text-xs font-mono text-muted-foreground tracking-wider mb-1">{label}</div>
    <div className={`text-2xl font-mono font-bold ${accent ? 'text-primary' : 'text-foreground'}`}>
      {value}{suffix}
      {max !== undefined && <span className="text-sm text-muted-foreground">/{max}</span>}
    </div>
  </div>
);
