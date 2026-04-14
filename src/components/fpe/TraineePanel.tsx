import { useFPEStore } from '@/store/fpe-store';
import type { LaneState } from '@/types/fpe';
import { User, X, Target, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getTargetById } from '@/contexts/TargetsContext';

// Dummy trainee database for search
const TRAINEE_DATABASE = [
  { id: 'T001', name: 'Johnson, M.', rank: 'PFC' },
  { id: 'T002', name: 'Williams, K.', rank: 'SPC' },
  { id: 'T003', name: 'Davis, R.', rank: 'PV2' },
  { id: 'T004', name: 'Martinez, A.', rank: 'SGT' },
  { id: 'T005', name: 'Brown, J.', rank: 'PFC' },
  { id: 'T006', name: 'Taylor, S.', rank: 'CPL' },
  { id: 'T007', name: 'Anderson, L.', rank: 'SSG' },
  { id: 'T008', name: 'Thomas, P.', rank: 'PV2' },
  { id: 'T009', name: 'Jackson, D.', rank: 'SPC' },
  { id: 'T010', name: 'White, C.', rank: 'PFC' },
  { id: 'T011', name: 'Harris, B.', rank: 'SGT' },
  { id: 'T012', name: 'Clark, E.', rank: 'CPL' },
];

export const TraineePanel = ({ lane }: { lane: LaneState }) => {
  const { setTrainee, clearTrainee } = useFPEStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTrainee = lane.traineeQueue[0] || null;
  const target = getTargetById(lane.exercise.targetType);

  // Filter trainees based on search query
  const filteredTrainees = searchQuery.trim()
    ? TRAINEE_DATABASE.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : TRAINEE_DATABASE;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectTrainee = (t: typeof TRAINEE_DATABASE[0]) => {
    setTrainee(lane.id, { id: t.id, name: t.name, rank: t.rank });
    setSearchQuery('');
    setShowDropdown(false);
  };

  if (activeTrainee) {
    return (
      <div className="glass-panel p-5 space-y-4">
        {/* Active trainee info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
            background: "var(--gradient-primary)",
            boxShadow: "0 2px 8px hsl(230 80% 60% / 0.3)",
          }}>
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-foreground font-semibold text-[15px] truncate">{activeTrainee.rank} {activeTrainee.name}</div>
            <div className="text-[12px] text-muted-foreground font-mono">ID: {activeTrainee.id}</div>
          </div>
          <button
            onClick={() => clearTrainee(lane.id)}
            className="w-11 h-11 rounded-xl flex items-center justify-center glass-btn text-muted-foreground hover:text-destructive transition-colors"
            title="Remove trainee"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target display */}
        <div className="relative rounded-xl overflow-hidden flex items-center justify-center" style={{
          background: "var(--surface-inset)",
          border: "1px solid var(--divider)",
          minHeight: 320,
        }}>
          {target?.image ? (
            <div className="relative w-full h-full flex items-center justify-center p-3">
              <img src={target.image} alt={target.label} className="max-w-full max-h-[360px] object-contain rounded-lg" />
              {lane.shots.map((shot) => (
                <div
                  key={shot.id}
                  className="absolute rounded-full border-2 animate-scale-in"
                  style={{
                    left: `${shot.x}%`,
                    top: `${shot.y}%`,
                    width: 12,
                    height: 12,
                    transform: "translate(-50%, -50%)",
                    backgroundColor: shot.isHit ? "hsl(var(--success) / 0.8)" : "hsl(var(--destructive) / 0.8)",
                    borderColor: shot.isHit ? "hsl(var(--success))" : "hsl(var(--destructive))",
                    boxShadow: shot.isHit ? "0 0 8px hsl(var(--success) / 0.4)" : "0 0 8px hsl(var(--destructive) / 0.4)",
                  }}
                  title={`Zone ${shot.zone} — Score ${shot.score} — ${shot.isHit ? "Hit" : "Miss"}`}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <Target className="w-12 h-12 text-muted-foreground/20" />
              <span className="text-[11px] text-muted-foreground">No target selected</span>
            </div>
          )}
        </div>

        {target && (
          <div className="text-center text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
            {target.label}
          </div>
        )}
      </div>
    );
  }

  // No trainee assigned — show search
  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="panel-header mb-0 pb-0" style={{ borderBottom: 'none' }}>TRAINEE</div>

      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search by name or ID..."
            className="sys-input h-12 w-full pl-11 text-[14px]"
          />
        </div>

        {showDropdown && (
          <div
            className="absolute z-50 w-full mt-1.5 rounded-xl overflow-hidden max-h-[280px] overflow-y-auto animate-fade-in"
            style={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--divider)",
              boxShadow: "var(--shadow-medium)",
            }}
          >
            {filteredTrainees.length === 0 ? (
              <div className="px-4 py-6 text-center text-[13px] text-muted-foreground">
                No trainees found
              </div>
            ) : (
              filteredTrainees.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTrainee(t)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-primary/5 active:bg-primary/10"
                  style={{ borderBottom: "1px solid var(--divider)" }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10 text-primary shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-foreground truncate">{t.rank} {t.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{t.id}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="text-center text-muted-foreground text-[14px] py-4">
        Search and select a trainee to begin
      </div>
    </div>
  );
};
