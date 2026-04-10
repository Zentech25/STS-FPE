import { useState, useMemo, useRef } from 'react';
import type { LaneState, SessionRecord } from '@/types/fpe';
import { getTargetById } from '@/contexts/TargetsContext';
import { X, Play, ArrowLeft, Target, Search, CalendarIcon, Hash, RotateCcw } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AnimatedBackground } from './AnimatedBackground';

interface ReplayModalProps {
  lane: LaneState;
  open: boolean;
  onClose: () => void;
}

type View = 'select' | 'playback';

export const ReplayModal = ({ lane, open, onClose }: ReplayModalProps) => {
  const [view, setView] = useState<View>('select');
  const [selectedRecord, setSelectedRecord] = useState<SessionRecord | null>(null);

  const handlePlay = (record: SessionRecord) => {
    setSelectedRecord(record);
    setView('playback');
  };

  const handleBack = () => {
    setSelectedRecord(null);
    setView('select');
  };

  const handleClose = () => {
    setView('select');
    setSelectedRecord(null);
    onClose();
  };

  if (!open) return null;

  if (view === 'playback' && selectedRecord) {
    return <FullScreenPlayback record={selectedRecord} onBack={handleBack} onClose={handleClose} />;
  }

  return <SelectionScreen records={lane.sessionHistory} onPlay={handlePlay} onClose={handleClose} />;
};

/* ═══════════════════════════════════════════════
   Selection Screen — full-screen with search fields
   ═══════════════════════════════════════════════ */
const SelectionScreen = ({
  records, onPlay, onClose,
}: {
  records: SessionRecord[];
  onPlay: (r: SessionRecord) => void;
  onClose: () => void;
}) => {
  const [traineeSearch, setTraineeSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [sessionSearch, setSessionSearch] = useState('');
  const [showTraineeDropdown, setShowTraineeDropdown] = useState(false);
  const [showSessionDropdown, setShowSessionDropdown] = useState(false);
  const traineeRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<HTMLDivElement>(null);

  // Unique trainees
  const trainees = useMemo(() => {
    const map = new Map<string, { id: string; name: string; rank: string }>();
    records.forEach((r) => map.set(r.traineeId, { id: r.traineeId, name: r.traineeName, rank: r.traineeRank }));
    return Array.from(map.values());
  }, [records]);

  // Filtered trainees for dropdown
  const filteredTrainees = useMemo(() => {
    if (!traineeSearch) return trainees;
    const q = traineeSearch.toLowerCase();
    return trainees.filter((t) =>
      t.id.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.rank.toLowerCase().includes(q)
    );
  }, [trainees, traineeSearch]);

  // Step 1: filter by trainee
  const afterTrainee = useMemo(() => {
    if (!traineeSearch) return records;
    const q = traineeSearch.toLowerCase();
    return records.filter((r) =>
      r.traineeId.toLowerCase().includes(q) ||
      r.traineeName.toLowerCase().includes(q) ||
      r.traineeRank.toLowerCase().includes(q)
    );
  }, [records, traineeSearch]);

  // Step 2: filter by date
  const afterDate = useMemo(() => {
    if (!selectedDate) return afterTrainee;
    return afterTrainee.filter((r) => isSameDay(new Date(r.date), selectedDate));
  }, [afterTrainee, selectedDate]);

  // Step 3: filter by session ID
  const filtered = useMemo(() => {
    if (!sessionSearch) return afterDate;
    const q = sessionSearch.toLowerCase();
    return afterDate.filter((r) => r.id.toLowerCase().includes(q));
  }, [afterDate, sessionSearch]);

  // Sessions for dropdown
  const filteredSessions = useMemo(() => {
    if (!sessionSearch) return afterDate;
    const q = sessionSearch.toLowerCase();
    return afterDate.filter((r) => r.id.toLowerCase().includes(q));
  }, [afterDate, sessionSearch]);

  const clearAll = () => {
    setTraineeSearch('');
    setSelectedDate(undefined);
    setSessionSearch('');
  };

  const hasFilters = traineeSearch || selectedDate || sessionSearch;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 shrink-0" style={{
          background: "var(--surface-glass)",
          backdropFilter: "blur(24px) saturate(180%)",
          borderBottom: "1px solid var(--divider)",
          boxShadow: "var(--shadow-soft)",
        }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <Play className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[16px] font-bold text-foreground">Session Replay</div>
              <div className="text-[11px] text-muted-foreground">Search and select a session to review</div>
            </div>
          </div>
          <button onClick={onClose} className="h-12 px-6 rounded-xl flex items-center gap-2 glass-btn text-[13px] font-semibold text-muted-foreground">
            <X className="w-5 h-5" />
            EXIT
          </button>
        </header>

        {/* Search Fields */}
        <div className="px-6 py-5" style={{
          background: "var(--surface-glass)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--divider)",
        }}>
          <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4">
            {/* Trainee ID Search */}
            <div className="relative" ref={traineeRef}>
              <label className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-2 block">
                Trainee ID / Name
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={traineeSearch}
                  onChange={(e) => { setTraineeSearch(e.target.value); setShowTraineeDropdown(true); }}
                  onFocus={() => setShowTraineeDropdown(true)}
                  onBlur={() => setTimeout(() => setShowTraineeDropdown(false), 200)}
                  placeholder="Search by ID or name..."
                  className="sys-input h-12 w-full pl-10 text-[13px]"
                />
              </div>
              {showTraineeDropdown && filteredTrainees.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20 max-h-48 overflow-auto" style={{
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--divider)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                }}>
                  {filteredTrainees.map((t) => (
                    <button
                      key={t.id}
                      onMouseDown={() => { setTraineeSearch(t.id); setShowTraineeDropdown(false); }}
                      className="w-full text-left px-4 py-3 text-[13px] hover:bg-primary/10 transition-colors flex items-center justify-between"
                    >
                      <span className="text-foreground font-medium">{t.rank} {t.name}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">{t.id}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Picker */}
            <div>
              <label className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-2 block">
                Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button className={cn(
                    "sys-input h-12 w-full text-left flex items-center gap-3 text-[13px] px-3.5",
                    !selectedDate && "text-muted-foreground"
                  )}>
                    <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    {selectedDate ? format(selectedDate, "dd MMM yyyy") : "Pick a date..."}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Session ID Search */}
            <div className="relative" ref={sessionRef}>
              <label className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-2 block">
                Session ID
              </label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={sessionSearch}
                  onChange={(e) => { setSessionSearch(e.target.value); setShowSessionDropdown(true); }}
                  onFocus={() => setShowSessionDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSessionDropdown(false), 200)}
                  placeholder="Search session ID..."
                  className="sys-input h-12 w-full pl-10 text-[13px]"
                />
              </div>
              {showSessionDropdown && filteredSessions.length > 0 && sessionSearch && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20 max-h-48 overflow-auto" style={{
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--divider)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                }}>
                  {filteredSessions.map((r) => (
                    <button
                      key={r.id}
                      onMouseDown={() => { setSessionSearch(r.id); setShowSessionDropdown(false); }}
                      className="w-full text-left px-4 py-3 text-[13px] hover:bg-primary/10 transition-colors flex items-center justify-between"
                    >
                      <span className="text-foreground font-mono text-[12px]">{r.id}</span>
                      <span className="text-[11px] text-muted-foreground">{r.traineeRank} {r.traineeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {hasFilters && (
            <div className="max-w-5xl mx-auto mt-3 flex justify-end">
              <button onClick={clearAll} className="h-10 px-4 rounded-xl flex items-center gap-2 glass-btn text-[12px] font-semibold text-muted-foreground">
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-auto px-6 py-5">
          <div className="max-w-5xl mx-auto space-y-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <Target className="w-14 h-14 opacity-20" />
                <span className="text-[14px] font-medium">No sessions found</span>
                <span className="text-[12px] text-muted-foreground/60">
                  {records.length === 0
                    ? "Complete a session to see replay data"
                    : "Try adjusting your search filters"
                  }
                </span>
              </div>
            ) : (
              <>
                <div className="text-[11px] text-muted-foreground font-medium mb-3">
                  {filtered.length} session{filtered.length !== 1 ? 's' : ''} found
                </div>
                {filtered.map((r) => {
                  const accuracy = r.shotsFired > 0 ? Math.round((r.hits / r.shotsFired) * 100) : 0;
                  const target = getTargetById(r.targetType);
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
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{
                          background: "var(--surface-inset)",
                          border: "1px solid var(--divider)",
                        }}>
                          {target?.image ? (
                            <img src={target.image} alt="" className="w-10 h-10 object-contain rounded-lg" />
                          ) : (
                            <Target className="w-5 h-5 text-muted-foreground/30" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-semibold text-foreground">{r.traineeRank} {r.traineeName}</div>
                          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            {r.id} • {format(new Date(r.date), "dd MMM yyyy HH:mm")}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {r.weapon} • {r.practiceType} • {r.firingPosition}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="text-right">
                          <div className="text-[18px] font-bold gradient-text">{r.score}/{r.maxScore}</div>
                          <div className="text-[11px] text-muted-foreground">{accuracy}% accuracy</div>
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                          <Play className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   Full-Screen Playback View
   ═══════════════════════════════════════════════ */
const FullScreenPlayback = ({
  record, onBack, onClose,
}: {
  record: SessionRecord;
  onBack: () => void;
  onClose: () => void;
}) => {
  const target = getTargetById(record.targetType);
  const accuracy = record.shotsFired > 0 ? Math.round((record.hits / record.shotsFired) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 shrink-0" style={{
          background: "var(--surface-glass)",
          backdropFilter: "blur(24px) saturate(180%)",
          borderBottom: "1px solid var(--divider)",
          boxShadow: "var(--shadow-soft)",
        }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <Play className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[16px] font-bold text-foreground">{record.traineeRank} {record.traineeName}</div>
              <div className="text-[11px] text-muted-foreground font-mono">{record.id} • {format(new Date(record.date), "dd MMM yyyy HH:mm")}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onBack} className="h-12 px-5 rounded-xl flex items-center gap-2 glass-btn text-[13px] font-semibold text-muted-foreground">
              <RotateCcw className="w-4 h-4" />
              Different Replay
            </button>
            <button onClick={onClose} className="h-12 px-5 rounded-xl flex items-center gap-2 glass-btn text-[13px] font-semibold text-muted-foreground">
              <X className="w-5 h-5" />
              EXIT
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto grid grid-cols-5 gap-6 h-full">
            {/* Target — takes 3 cols */}
            <div className="col-span-3 flex flex-col gap-4">
              <div className="relative rounded-2xl overflow-hidden flex items-center justify-center flex-1" style={{
                background: "var(--surface-inset)",
                border: "1px solid var(--divider)",
                minHeight: 400,
              }}>
                {target?.image ? (
                  <div className="relative w-full h-full flex items-center justify-center p-6">
                    <img src={target.image} alt={target.label} className="max-w-full max-h-[500px] object-contain rounded-lg" />
                    {record.shots.map((shot, i) => (
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
                          boxShadow: shot.isHit ? "0 0 12px hsl(var(--success) / 0.4)" : "0 0 12px hsl(var(--destructive) / 0.4)",
                          animationDelay: `${i * 80}ms`,
                        }}
                        title={`Shot ${i + 1}: Zone ${shot.zone} — Score ${shot.score}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <Target className="w-14 h-14 text-muted-foreground/20" />
                    <span className="text-[12px] text-muted-foreground">No target image available</span>
                  </div>
                )}
              </div>
              {target && (
                <div className="text-center text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  {target.label}
                </div>
              )}
            </div>

            {/* Stats — takes 2 cols */}
            <div className="col-span-2 space-y-4">
              {/* Score cards */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Score" value={`${record.score}/${record.maxScore}`} accent />
                <StatCard label="Accuracy" value={`${accuracy}%`} accent />
                <StatCard label="Hits" value={String(record.hits)} good />
                <StatCard label="Misses" value={String(record.shotsFired - record.hits)} bad />
              </div>

              {/* Session info */}
              <div className="glass-panel p-5 space-y-2.5">
                <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-3 pb-2" style={{ borderBottom: "1px solid var(--divider)" }}>
                  SESSION DETAILS
                </div>
                <DetailRow label="Session ID" value={record.id} mono />
                <DetailRow label="Trainee ID" value={record.traineeId} mono />
                <DetailRow label="Date" value={format(new Date(record.date), "dd MMM yyyy HH:mm:ss")} />
                <div className="h-px w-full" style={{ background: "var(--divider)" }} />
                <DetailRow label="Practice" value={record.practiceType} />
                <DetailRow label="Weapon" value={record.weapon} />
                <DetailRow label="Position" value={record.firingPosition} />
                <DetailRow label="Target" value={target?.label ?? record.targetType} />
                <DetailRow label="Range" value={`${record.range}m`} />
                <DetailRow label="Time of Day" value={record.timeOfDay} />
                <div className="h-px w-full" style={{ background: "var(--divider)" }} />
                <DetailRow label="Rounds Allotted" value={String(record.roundsAllotted)} />
                <DetailRow label="Shots Fired" value={String(record.shotsFired)} />
                <DetailRow label="Hits" value={String(record.hits)} good />
                <DetailRow label="Misses" value={String(record.shotsFired - record.hits)} bad />
              </div>

              {/* Shot log */}
              {record.shots.length > 0 && (
                <div className="glass-panel p-5">
                  <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-3 pb-2" style={{ borderBottom: "1px solid var(--divider)" }}>
                    SHOT LOG ({record.shots.length})
                  </div>
                  <div className="max-h-40 overflow-auto space-y-1">
                    {record.shots.map((shot, i) => (
                      <div key={shot.id} className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded-lg" style={{
                        background: i % 2 === 0 ? "var(--surface-inset)" : "transparent",
                      }}>
                        <span className="text-muted-foreground font-mono w-8">#{i + 1}</span>
                        <span className={`font-medium ${shot.isHit ? 'text-emerald-400' : 'text-destructive'}`}>
                          {shot.isHit ? 'HIT' : 'MISS'}
                        </span>
                        <span className="text-muted-foreground">Zone {shot.zone}</span>
                        <span className="text-foreground font-semibold">+{shot.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Shared Components ── */
const StatCard = ({ label, value, accent, good, bad }: {
  label: string; value: string; accent?: boolean; good?: boolean; bad?: boolean;
}) => (
  <div className="rounded-xl p-4 text-center" style={{
    background: "var(--surface-elevated)",
    border: "1px solid var(--divider)",
  }}>
    <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-1">{label}</div>
    <div className={`text-[20px] font-bold ${accent ? 'gradient-text' : ''} ${good ? 'text-emerald-400' : ''} ${bad ? 'text-destructive' : ''}`}>
      {value}
    </div>
  </div>
);

const DetailRow = ({ label, value, mono, good, bad }: {
  label: string; value: string; mono?: boolean; good?: boolean; bad?: boolean;
}) => (
  <div className="flex justify-between items-center">
    <span className="text-muted-foreground text-[12px]">{label}</span>
    <span className={cn(
      "font-medium text-[12px] capitalize",
      mono && "font-mono text-[11px]",
      good && "text-emerald-400",
      bad && "text-destructive",
      !good && !bad && "text-foreground",
    )}>
      {value}
    </span>
  </div>
);
