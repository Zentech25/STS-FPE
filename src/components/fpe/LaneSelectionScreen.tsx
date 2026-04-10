import { useFPEStore } from '@/store/fpe-store';
import { StatusBadge } from './StatusBadge';
import { AnimatedBackground } from './AnimatedBackground';
import { Target, Users, Crosshair } from 'lucide-react';

export const LaneSelectionScreen = () => {
  const { lanes, selectLane } = useFPEStore();

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-2xl px-6">
        <div className="mb-10 text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{
            background: "var(--gradient-primary)",
            boxShadow: "0 8px 28px hsl(230 80% 60% / 0.35)",
          }}>
            <Crosshair className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-wide text-foreground">
            FPE System
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Firing Position Equipment — Select Lane
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 stagger-children">
          {lanes.map((lane) => {
            const activeTrainee = lane.traineeQueue[0];
            return (
              <button
                key={lane.id}
                onClick={() => selectLane(lane.id)}
                className="glass-panel p-6 text-left group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    Lane {lane.id}
                  </span>
                  <StatusBadge status={lane.status} />
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Target className="w-4 h-4" />
                    <span className="text-[12px]">{lane.exercise.weapon} — {lane.exercise.practiceType.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-[12px]">
                      {activeTrainee
                        ? `${activeTrainee.rank} ${activeTrainee.name}`
                        : 'No trainee assigned'}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground/60 font-mono">
                    {lane.traineeQueue.length} trainee{lane.traineeQueue.length !== 1 ? 's' : ''} in queue
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
