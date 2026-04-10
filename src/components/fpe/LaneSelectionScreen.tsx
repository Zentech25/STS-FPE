import { useFPEStore } from '@/store/fpe-store';
import { StatusBadge } from './StatusBadge';
import { Target, Users, Crosshair } from 'lucide-react';

export const LaneSelectionScreen = () => {
  const { lanes, selectLane } = useFPEStore();

  return (
    <div className="min-h-screen tactical-grid flex flex-col items-center justify-center p-6">
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Crosshair className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold font-mono tracking-wider text-foreground">FPE SYSTEM</h1>
        </div>
        <p className="text-muted-foreground font-mono text-sm tracking-wide">FIRING POSITION EQUIPMENT — SELECT LANE</p>
      </div>

      <div className="grid grid-cols-2 gap-5 max-w-2xl w-full">
        {lanes.map((lane) => {
          const activeTrainee = lane.traineeQueue[0];
          return (
            <button
              key={lane.id}
              onClick={() => selectLane(lane.id)}
              className="glass-card p-6 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)] active:scale-[0.98] group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                  LANE {lane.id}
                </span>
                <StatusBadge status={lane.status} />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span>{lane.exercise.weapon} — {lane.exercise.practiceType.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>
                    {activeTrainee
                      ? `${activeTrainee.rank} ${activeTrainee.name}`
                      : 'No trainee assigned'}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground/60 font-mono">
                  {lane.traineeQueue.length} trainee{lane.traineeQueue.length !== 1 ? 's' : ''} in queue
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
