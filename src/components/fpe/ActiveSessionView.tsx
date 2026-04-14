import type { LaneState } from '@/types/fpe';
import { getTargetById } from '@/contexts/TargetsContext';
import { Target, ArrowUp, ArrowDown } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ActiveSessionViewProps {
  lane: LaneState;
}

export const ActiveSessionView = ({ lane }: ActiveSessionViewProps) => {
  const target = getTargetById(lane.exercise.targetType);
  const ex = lane.exercise;
  const [elapsed, setElapsed] = useState(0);
  const [targetUp, setTargetUp] = useState(true);

  // Timer
  useEffect(() => {
    if (lane.status !== 'live' || !lane.sessionStartTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - lane.sessionStartTime!) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lane.status, lane.sessionStartTime]);

  // Simulate target up/down for snapshot mode
  useEffect(() => {
    if (ex.practiceType !== 'snapshot' || lane.status !== 'live') return;
    const cycle = (ex.upTime + ex.downTime) * 1000;
    if (cycle <= 0) return;
    const interval = setInterval(() => {
      const pos = (Date.now() - (lane.sessionStartTime || Date.now())) % cycle;
      setTargetUp(pos < ex.upTime * 1000);
    }, 200);
    return () => clearInterval(interval);
  }, [ex.practiceType, ex.upTime, ex.downTime, lane.status, lane.sessionStartTime]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const accuracy = lane.shotsFired > 0 ? Math.round((lane.hits / lane.shotsFired) * 100) : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top stats bar */}
      <div className="glass-panel p-4 grid grid-cols-5 gap-3">
        <StatCell label="SHOTS" value={`${lane.shotsFired}/${ex.rounds}`} />
        <StatCell label="HITS" value={lane.hits} />
        <StatCell label="SCORE" value={lane.score} accent />
        <StatCell label="ACCURACY" value={`${accuracy}%`} />
        <StatCell label="TIMER" value={formatTime(elapsed)} mono />
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Target — takes 3 columns, primary focus */}
        <div className="col-span-3">
          <div className="glass-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="panel-header mb-0 pb-0" style={{ borderBottom: 'none' }}>LIVE TARGET</div>
              {ex.practiceType === 'snapshot' && (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  targetUp ? 'text-success' : 'text-destructive'
                }`} style={{
                  background: targetUp ? 'hsl(var(--success) / 0.1)' : 'hsl(var(--destructive) / 0.1)',
                  border: `1px solid ${targetUp ? 'hsl(var(--success) / 0.2)' : 'hsl(var(--destructive) / 0.2)'}`,
                }}>
                  {targetUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {targetUp ? 'UP' : 'DOWN'}
                </div>
              )}
            </div>

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
                      className="absolute rounded-full border-2 animate-scale-in"
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
                      title={`Shot ${lane.shots.indexOf(shot) + 1} — Zone ${shot.zone} — Score ${shot.score}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-12">
                  <Target className="w-12 h-12 text-muted-foreground/20" />
                  <span className="text-[11px] text-muted-foreground">No target</span>
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

        {/* Right side — exercise info + shot log */}
        <div className="col-span-2 space-y-4">
          {/* Exercise details */}
          <div className="glass-panel p-4 space-y-2">
            <div className="panel-header mb-0 pb-0" style={{ borderBottom: 'none' }}>EXERCISE DETAILS</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
              <DetailRow label="Weapon" value={ex.weapon} />
              <DetailRow label="Position" value={ex.firingPosition} />
              <DetailRow label="Range" value={`${ex.range}m`} />
              <DetailRow label="Rounds" value={`${ex.rounds}`} />
              <DetailRow label="Practice" value={ex.practiceType} />
              <DetailRow label="Time" value={ex.timeOfDay} />
              {ex.practiceType === 'grouping' && (
                <DetailRow label="Req. Group" value={`${ex.groupingSize} ${ex.groupingUnit}`} />
              )}
              {ex.practiceType === 'timed' && (
                <DetailRow label="Time Limit" value={`${ex.timeLimit}s`} />
              )}
            </div>
          </div>

          {/* Shot log table */}
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
                      <td colSpan={5} className="px-2 py-4 text-center text-muted-foreground">Awaiting shots...</td>
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
                            shot.isHit
                              ? 'text-success'
                              : 'text-destructive'
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

const StatCell = ({ label, value, accent, mono }: { label: string; value: string | number; accent?: boolean; mono?: boolean }) => (
  <div className="text-center">
    <div className="text-[9px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-1">{label}</div>
    <div className={`text-xl font-bold ${accent ? 'gradient-text' : 'text-foreground'} ${mono ? 'font-mono' : ''}`}>
      {value}
    </div>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <>
    <span className="text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
    <span className="text-foreground font-semibold capitalize">{value}</span>
  </>
);
