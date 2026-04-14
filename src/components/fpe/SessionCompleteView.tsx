import type { LaneState } from '@/types/fpe';
import { getTargetById } from '@/contexts/TargetsContext';
import { Target, RotateCcw, FilePlus } from 'lucide-react';

interface SessionCompleteViewProps {
  lane: LaneState;
  onRestart: () => void;
  onNewExercise: () => void;
}

export const SessionCompleteView = ({ lane, onRestart, onNewExercise }: SessionCompleteViewProps) => {
  const target = getTargetById(lane.exercise.targetType);
  const ex = lane.exercise;
  const accuracy = lane.shotsFired > 0 ? Math.round((lane.hits / lane.shotsFired) * 100) : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Session complete banner */}
      <div className="glass-panel p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(var(--primary))', boxShadow: '0 0 12px hsl(var(--primary) / 0.4)' }} />
          <span className="text-[13px] font-bold uppercase tracking-wider text-foreground">SESSION COMPLETE</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRestart}
            className="h-10 px-4 rounded-lg flex items-center gap-1.5 glass-btn text-[11px] font-semibold text-foreground"
          >
            <RotateCcw className="w-4 h-4" />
            RESTART
          </button>
          <button
            onClick={onNewExercise}
            className="h-10 px-4 rounded-lg flex items-center gap-1.5 text-[11px] font-semibold text-white"
            style={{ background: 'var(--gradient-primary)', boxShadow: '0 2px 12px hsl(230 80% 55% / 0.3)' }}
          >
            <FilePlus className="w-4 h-4" />
            NEW EXERCISE
          </button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="glass-panel p-4 grid grid-cols-4 gap-3">
        <StatCell label="SHOTS FIRED" value={`${lane.shotsFired}/${ex.rounds}`} />
        <StatCell label="HITS" value={lane.hits} />
        <StatCell label="SCORE" value={lane.score} accent />
        <StatCell label="ACCURACY" value={`${accuracy}%`} />
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Target review — primary focus */}
        <div className="col-span-3">
          <div className="glass-panel p-4 space-y-3">
            <div className="panel-header mb-0 pb-0" style={{ borderBottom: 'none' }}>TARGET REVIEW</div>
            <div className="relative rounded-xl overflow-hidden flex items-center justify-center" style={{
              background: "var(--surface-inset)",
              border: "1px solid var(--divider)",
              minHeight: 400,
            }}>
              {target?.image ? (
                <div className="relative w-full h-full flex items-center justify-center p-3">
                  <img src={target.image} alt={target.label} className="max-w-full max-h-[440px] object-contain rounded-lg" />
                  {lane.shots.map((shot) => (
                    <div
                      key={shot.id}
                      className="absolute rounded-full border-2"
                      style={{
                        left: `${shot.x}%`,
                        top: `${shot.y}%`,
                        width: 14,
                        height: 14,
                        transform: "translate(-50%, -50%)",
                        backgroundColor: shot.isHit ? "hsl(var(--success) / 0.8)" : "hsl(var(--destructive) / 0.8)",
                        borderColor: shot.isHit ? "hsl(var(--success))" : "hsl(var(--destructive))",
                        boxShadow: shot.isHit ? "0 0 10px hsl(var(--success) / 0.5)" : "0 0 10px hsl(var(--destructive) / 0.5)",
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-12">
                  <Target className="w-12 h-12 text-muted-foreground/20" />
                </div>
              )}
            </div>
            {target && (
              <div className="text-center text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                {target.label}
              </div>
            )}
          </div>
        </div>

        {/* Right side — details + shot log */}
        <div className="col-span-2 space-y-4">
          <div className="glass-panel p-4 space-y-2">
            <div className="panel-header mb-0 pb-0" style={{ borderBottom: 'none' }}>EXERCISE DETAILS</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
              <DetailRow label="Weapon" value={ex.weapon} />
              <DetailRow label="Position" value={ex.firingPosition} />
              <DetailRow label="Range" value={`${ex.range}m`} />
              <DetailRow label="Rounds" value={`${ex.rounds}`} />
              <DetailRow label="Practice" value={ex.practiceType} />
              {ex.practiceType === 'grouping' && (
                <DetailRow label="Req. Group" value={`${ex.groupingSize} ${ex.groupingUnit}`} />
              )}
            </div>
          </div>

          <div className="glass-panel p-4 space-y-2">
            <div className="panel-header mb-0 pb-0" style={{ borderBottom: 'none' }}>SHOT LOG</div>
            <div className="max-h-[280px] overflow-y-auto rounded-lg" style={{ border: "1px solid var(--divider)" }}>
              <table className="w-full text-[10px]">
                <thead>
                  <tr style={{ background: "var(--surface-inset)" }}>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground uppercase tracking-wider">X (cm)</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground uppercase tracking-wider">Y (cm)</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground uppercase tracking-wider">Score</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground uppercase tracking-wider">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {lane.shots.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-2 py-4 text-center text-muted-foreground">No shots recorded</td>
                    </tr>
                  ) : (
                    [...lane.shots].reverse().map((shot, i) => (
                      <tr key={shot.id} className="transition-colors hover:bg-primary/5" style={{ borderTop: "1px solid var(--divider)" }}>
                        <td className="px-2 py-1.5 font-mono text-foreground">{lane.shots.length - i}</td>
                        <td className="px-2 py-1.5 font-mono text-foreground">{(shot.x * 1.2).toFixed(1)}</td>
                        <td className="px-2 py-1.5 font-mono text-foreground">{(shot.y * 1.2).toFixed(1)}</td>
                        <td className="px-2 py-1.5 font-mono text-foreground">{shot.score}</td>
                        <td className="px-2 py-1.5">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            shot.isHit ? 'text-success' : 'text-destructive'
                          }`} style={{
                            background: shot.isHit ? 'hsl(var(--success) / 0.1)' : 'hsl(var(--destructive) / 0.1)',
                          }}>
                            {shot.isHit ? 'HIT' : 'MISS'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCell = ({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) => (
  <div className="text-center">
    <div className="text-[9px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-1">{label}</div>
    <div className={`text-xl font-bold ${accent ? 'gradient-text' : 'text-foreground'}`}>{value}</div>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <>
    <span className="text-muted-foreground font-medium uppercase tracking-wider text-[11px]">{label}</span>
    <span className="text-foreground font-semibold capitalize text-[11px]">{value}</span>
  </>
);
