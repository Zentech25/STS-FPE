import { useState, useMemo } from 'react';
import type { LaneState, SessionRecord } from '@/types/fpe';
import { getTargetById } from '@/contexts/TargetsContext';
import { X, Play, ArrowLeft, ChevronRight, Target, Calendar, User, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface ReplayModalProps {
  lane: LaneState;
  open: boolean;
  onClose: () => void;
}

type View = 'select' | 'playback';

export const ReplayModal = ({ lane, open, onClose }: ReplayModalProps) => {
  const [view, setView] = useState<View>('select');
  const [selectedRecord, setSelectedRecord] = useState<SessionRecord | null>(null);
  const [filterTrainee, setFilterTrainee] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const records = lane.sessionHistory;

  // Get unique trainees
  const trainees = useMemo(() => {
    const map = new Map<string, { id: string; name: string; rank: string }>();
    records.forEach((r) => map.set(r.traineeId, { id: r.traineeId, name: r.traineeName, rank: r.traineeRank }));
    return Array.from(map.values());
  }, [records]);

  // Get unique dates
  const dates = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => set.add(format(new Date(r.date), 'yyyy-MM-dd')));
    return Array.from(set).sort().reverse();
  }, [records]);

  // Filtered records
  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (filterTrainee && r.traineeId !== filterTrainee) return false;
      if (filterDate && format(new Date(r.date), 'yyyy-MM-dd') !== filterDate) return false;
      return true;
    });
  }, [records, filterTrainee, filterDate]);

  const handlePlay = (record: SessionRecord) => {
    setSelectedRecord(record);
    setView('playback');
  };

  const handleBack = () => {
    setSelectedRecord(null);
    setView('select');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden animate-scale-in flex flex-col"
        style={{
          background: "var(--surface-glass)",
          backdropFilter: "blur(32px) saturate(180%)",
          border: "1px solid var(--divider)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {view === 'select' ? (
          <SelectionView
            records={filtered}
            trainees={trainees}
            dates={dates}
            filterTrainee={filterTrainee}
            filterDate={filterDate}
            onFilterTrainee={setFilterTrainee}
            onFilterDate={setFilterDate}
            onPlay={handlePlay}
            onClose={onClose}
          />
        ) : (
          selectedRecord && (
            <PlaybackView
              record={selectedRecord}
              onBack={handleBack}
              onClose={onClose}
            />
          )
        )}
      </div>
    </div>
  );
};

/* ── Selection View ── */
const SelectionView = ({
  records, trainees, dates, filterTrainee, filterDate,
  onFilterTrainee, onFilterDate, onPlay, onClose,
}: {
  records: SessionRecord[];
  trainees: { id: string; name: string; rank: string }[];
  dates: string[];
  filterTrainee: string;
  filterDate: string;
  onFilterTrainee: (v: string) => void;
  onFilterDate: (v: string) => void;
  onPlay: (r: SessionRecord) => void;
  onClose: () => void;
}) => (
  <>
    {/* Header */}
    <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--divider)" }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
          <Play className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-[16px] font-bold text-foreground">Session Replay</div>
          <div className="text-[11px] text-muted-foreground">Select a session to review</div>
        </div>
      </div>
      <button onClick={onClose} className="w-11 h-11 rounded-xl flex items-center justify-center glass-btn">
        <X className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>

    {/* Filters */}
    <div className="px-6 py-4 flex gap-3" style={{ borderBottom: "1px solid var(--divider)" }}>
      <div className="flex items-center gap-2 flex-1">
        <User className="w-4 h-4 text-muted-foreground shrink-0" />
        <select
          value={filterTrainee}
          onChange={(e) => onFilterTrainee(e.target.value)}
          className="sys-input h-11 flex-1 text-[13px]"
        >
          <option value="">All Trainees</option>
          {trainees.map((t) => (
            <option key={t.id} value={t.id}>{t.rank} {t.name}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 flex-1">
        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
        <select
          value={filterDate}
          onChange={(e) => onFilterDate(e.target.value)}
          className="sys-input h-11 flex-1 text-[13px]"
        >
          <option value="">All Dates</option>
          {dates.map((d) => (
            <option key={d} value={d}>{format(new Date(d), 'dd MMM yyyy')}</option>
          ))}
        </select>
      </div>
      {(filterTrainee || filterDate) && (
        <button
          onClick={() => { onFilterTrainee(''); onFilterDate(''); }}
          className="w-11 h-11 rounded-xl flex items-center justify-center glass-btn text-muted-foreground"
        >
          <Filter className="w-4 h-4" />
        </button>
      )}
    </div>

    {/* Sessions list */}
    <div className="flex-1 overflow-auto px-6 py-4 space-y-2">
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <Target className="w-12 h-12 opacity-20" />
          <span className="text-[13px]">No session records found</span>
          <span className="text-[11px] text-muted-foreground/60">Complete a session to see replay data</span>
        </div>
      ) : (
        records.map((r) => {
          const accuracy = r.shotsFired > 0 ? Math.round((r.hits / r.shotsFired) * 100) : 0;
          return (
            <button
              key={r.id}
              onClick={() => onPlay(r)}
              className="w-full flex items-center justify-between rounded-xl px-5 py-4 text-left transition-all interactive-row"
              style={{
                background: "var(--surface-elevated)",
                border: "1px solid var(--divider)",
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-foreground">{r.traineeRank} {r.traineeName}</div>
                <div className="text-[11px] text-muted-foreground font-mono mt-1">
                  {format(new Date(r.date), "dd MMM yyyy HH:mm")} • {r.practiceType} • {r.weapon}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[16px] font-bold gradient-text">{r.score}/{r.maxScore}</div>
                  <div className="text-[11px] text-muted-foreground">{accuracy}% acc</div>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                  <Play className="w-4 h-4 text-primary" />
                </div>
              </div>
            </button>
          );
        })
      )}
    </div>
  </>
);

/* ── Playback View ── */
const PlaybackView = ({
  record, onBack, onClose,
}: {
  record: SessionRecord;
  onBack: () => void;
  onClose: () => void;
}) => {
  const target = getTargetById(record.targetType);
  const accuracy = record.shotsFired > 0 ? Math.round((record.hits / record.shotsFired) * 100) : 0;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--divider)" }}>
        <div className="flex items-center gap-3">
          <div className="text-[16px] font-bold text-foreground">{record.traineeRank} {record.traineeName}</div>
          <span className="text-[11px] text-muted-foreground font-mono px-2 py-1 rounded-lg" style={{ background: "var(--surface-inset)" }}>
            {format(new Date(record.date), "dd MMM yyyy HH:mm")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="h-11 px-4 rounded-xl flex items-center gap-2 glass-btn text-[12px] font-semibold text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            Different Replay
          </button>
          <button onClick={onClose} className="w-11 h-11 rounded-xl flex items-center justify-center glass-btn">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="grid grid-cols-2 gap-5">
          {/* Target with shots */}
          <div className="relative rounded-xl overflow-hidden flex items-center justify-center" style={{
            background: "var(--surface-inset)",
            border: "1px solid var(--divider)",
            minHeight: 320,
          }}>
            {target?.image ? (
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <img src={target.image} alt={target.label} className="max-w-full max-h-[340px] object-contain rounded-lg" />
                {record.shots.map((shot) => (
                  <div
                    key={shot.id}
                    className="absolute rounded-full border-2"
                    style={{
                      left: `${shot.x}%`,
                      top: `${shot.y}%`,
                      width: 12,
                      height: 12,
                      transform: "translate(-50%, -50%)",
                      backgroundColor: shot.isHit ? "hsl(var(--success) / 0.8)" : "hsl(var(--destructive) / 0.8)",
                      borderColor: shot.isHit ? "hsl(var(--success))" : "hsl(var(--destructive))",
                      boxShadow: shot.isHit ? "0 0 10px hsl(var(--success) / 0.4)" : "0 0 10px hsl(var(--destructive) / 0.4)",
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

          {/* Session details */}
          <div className="space-y-3">
            {/* Score summary cards */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Score" value={`${record.score}/${record.maxScore}`} accent />
              <StatCard label="Accuracy" value={`${accuracy}%`} accent />
              <StatCard label="Hits" value={String(record.hits)} good />
              <StatCard label="Misses" value={String(record.shotsFired - record.hits)} bad />
            </div>

            {/* Details */}
            <div className="glass-panel p-4 space-y-2">
              <DetailRow label="Practice" value={record.practiceType} />
              <DetailRow label="Weapon" value={record.weapon} />
              <DetailRow label="Position" value={record.firingPosition} />
              <DetailRow label="Target" value={target?.label ?? record.targetType} />
              <DetailRow label="Range" value={`${record.range}m`} />
              <DetailRow label="Time of Day" value={record.timeOfDay} />
              <DetailRow label="Rounds Allotted" value={String(record.roundsAllotted)} />
              <DetailRow label="Shots Fired" value={String(record.shotsFired)} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const StatCard = ({ label, value, accent, good, bad }: {
  label: string; value: string; accent?: boolean; good?: boolean; bad?: boolean;
}) => (
  <div className="rounded-xl p-4 text-center" style={{
    background: "var(--surface-elevated)",
    border: "1px solid var(--divider)",
  }}>
    <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-1">{label}</div>
    <div className={`text-[18px] font-bold ${accent ? 'gradient-text' : ''} ${good ? 'text-emerald-400' : ''} ${bad ? 'text-destructive' : ''}`}>
      {value}
    </div>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-muted-foreground text-[12px]">{label}</span>
    <span className="font-medium text-[12px] capitalize text-foreground">{value}</span>
  </div>
);
