import { useFPEStore } from '@/store/fpe-store';
import type { LaneState, SessionRecord } from '@/types/fpe';
import { getTargetById } from '@/contexts/TargetsContext';
import { ArrowLeft, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

export const ReplayPanel = ({ lane }: { lane: LaneState }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const records = lane.sessionHistory;

  if (records.length === 0) {
    return (
      <div className="glass-panel p-5">
        <div className="panel-header">REPLAY</div>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
          <Target className="w-10 h-10 opacity-20" />
          <span className="text-[12px]">No session records yet</span>
          <span className="text-[10px] text-muted-foreground/60">Complete a session to see replay data</span>
        </div>
      </div>
    );
  }

  const record = selectedIdx !== null ? records[selectedIdx] : null;

  if (record) {
    return <ReplayDetail record={record} records={records} index={selectedIdx!} onBack={() => setSelectedIdx(null)} onNavigate={setSelectedIdx} />;
  }

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="panel-header">REPLAY</div>
      <div className="space-y-2">
        {records.map((r, i) => {
          const accuracy = r.shotsFired > 0 ? Math.round((r.hits / r.shotsFired) * 100) : 0;
          return (
            <button
              key={r.id}
              onClick={() => setSelectedIdx(i)}
              className="w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all interactive-row"
              style={{
                background: "var(--surface-elevated)",
                border: "1px solid var(--divider)",
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-foreground">{r.traineeRank} {r.traineeName}</div>
                <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  {format(new Date(r.date), "dd MMM yyyy HH:mm")} • {r.practiceType} • {r.weapon}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[14px] font-bold gradient-text">{r.score}/{r.maxScore}</div>
                  <div className="text-[10px] text-muted-foreground">{accuracy}% acc</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ReplayDetail = ({ record, records, index, onBack, onNavigate }: {
  record: SessionRecord;
  records: SessionRecord[];
  index: number;
  onBack: () => void;
  onNavigate: (i: number) => void;
}) => {
  const target = getTargetById(record.targetType);
  const accuracy = record.shotsFired > 0 ? Math.round((record.hits / record.shotsFired) * 100) : 0;

  return (
    <div className="glass-panel p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="glass-btn w-8 h-8 rounded-lg flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <div className="text-[14px] font-bold text-foreground">{record.traineeRank} {record.traineeName}</div>
          <div className="text-[10px] text-muted-foreground capitalize">{record.practiceType}</div>
        </div>
        {records.length > 1 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground font-mono px-2 py-1 rounded-md" style={{ background: "var(--surface-inset)" }}>
              {index + 1}/{records.length}
            </span>
            <button disabled={index === 0} onClick={() => onNavigate(index - 1)} className="glass-btn w-7 h-7 rounded-md flex items-center justify-center disabled:opacity-30">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button disabled={index === records.length - 1} onClick={() => onNavigate(index + 1)} className="glass-btn w-7 h-7 rounded-md flex items-center justify-center disabled:opacity-30">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Target with shot markers */}
      <div className="relative rounded-xl overflow-hidden flex items-center justify-center" style={{
        background: "var(--surface-inset)",
        border: "1px solid var(--divider)",
        minHeight: 260,
      }}>
        {target?.image ? (
          <div className="relative w-full h-full flex items-center justify-center p-3">
            <img src={target.image} alt={target.label} className="max-w-full max-h-[280px] object-contain rounded-lg" />
            {record.shots.map((shot) => (
              <div
                key={shot.id}
                className="absolute rounded-full border-2"
                style={{
                  left: `${shot.x}%`,
                  top: `${shot.y}%`,
                  width: 10,
                  height: 10,
                  transform: "translate(-50%, -50%)",
                  backgroundColor: shot.isHit ? "hsl(var(--success) / 0.8)" : "hsl(var(--destructive) / 0.8)",
                  borderColor: shot.isHit ? "hsl(var(--success))" : "hsl(var(--destructive))",
                  boxShadow: shot.isHit ? "0 0 8px hsl(var(--success) / 0.4)" : "0 0 8px hsl(var(--destructive) / 0.4)",
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <Target className="w-10 h-10 text-muted-foreground/20" />
          </div>
        )}
      </div>

      {/* Session details */}
      <div className="space-y-1.5 text-[12px]">
        <DetailRow label="Date" value={format(new Date(record.date), "dd MMM yyyy HH:mm")} />
        <DetailRow label="Lane" value={String(record.laneId)} />
        <DetailRow label="Practice" value={record.practiceType} />
        <DetailRow label="Weapon" value={record.weapon} />
        <DetailRow label="Position" value={record.firingPosition} />
        <DetailRow label="Target" value={target?.label ?? record.targetType} />
        <DetailRow label="Range" value={`${record.range}m`} />
        <DetailRow label="Time of Day" value={record.timeOfDay} />
        <div className="h-px w-full my-1" style={{ background: "var(--divider)" }} />
        <DetailRow label="Score" value={`${record.score} / ${record.maxScore}`} highlight />
        <DetailRow label="Accuracy" value={`${accuracy}%`} highlight />
        <DetailRow label="Rounds Allotted" value={String(record.roundsAllotted)} />
        <DetailRow label="Hits" value={String(record.hits)} good />
        <DetailRow label="Misses" value={String(record.shotsFired - record.hits)} bad />
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, highlight, good, bad }: {
  label: string; value: string; highlight?: boolean; good?: boolean; bad?: boolean;
}) => (
  <div className="flex justify-between items-center">
    <span className="text-muted-foreground text-[11px]">{label}</span>
    <span className={`font-medium text-[11px] capitalize ${highlight ? "text-primary" : ""} ${good ? "text-emerald-400" : ""} ${bad ? "text-destructive" : ""}`}>
      {value}
    </span>
  </div>
);
