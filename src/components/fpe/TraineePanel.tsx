import { useFPEStore } from '@/store/fpe-store';
import type { LaneState } from '@/types/fpe';
import { User, X, Target, Search, ChevronDown, Building2 } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { getTargetById } from '@/contexts/TargetsContext';
import { INITIAL_ORBAT, getCompanies, TRAINEES_BY_COMPANY } from '@/data/orbat-data';

export const TraineePanel = ({ lane }: { lane: LaneState }) => {
  const { setTrainee, clearTrainee } = useFPEStore();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);

  const activeTrainee = lane.traineeQueue[0] || null;
  const target = getTargetById(lane.exercise.targetType);

  const companies = useMemo(() => getCompanies(INITIAL_ORBAT), []);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  // Get trainees for selected company
  const availableTrainees = selectedCompanyId
    ? TRAINEES_BY_COMPANY[selectedCompanyId] || []
    : [];

  // Filter trainees based on search query
  const filteredTrainees = searchQuery.trim()
    ? availableTrainees.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableTrainees;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) {
        setCompanyOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectTrainee = (t: typeof availableTrainees[0]) => {
    setTrainee(lane.id, { id: t.id, name: t.name, rank: t.rank });
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleClear = () => {
    clearTrainee(lane.id);
    setSelectedCompanyId(null);
    setSearchQuery('');
  };

  // Active trainee view
  if (activeTrainee) {
    return (
      <div className="glass-panel p-5 space-y-4">
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
            {selectedCompany && (
              <div className="text-[10px] text-muted-foreground truncate">{selectedCompany.path}</div>
            )}
          </div>
          <button
            onClick={handleClear}
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

  // No trainee — show company selector then trainee search
  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="panel-header mb-0 pb-0" style={{ borderBottom: 'none' }}>TRAINEE</div>

      {/* Step 1: Company selector */}
      <div ref={companyRef} className="relative">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">COMPANY</label>
        <button
          onClick={() => setCompanyOpen(!companyOpen)}
          className="sys-input h-12 w-full flex items-center justify-between text-left text-[13px]"
        >
          <span className={selectedCompany ? 'text-foreground' : 'text-muted-foreground'}>
            {selectedCompany ? (
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary shrink-0" />
                {selectedCompany.name}
              </span>
            ) : 'Select company...'}
          </span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${companyOpen ? 'rotate-180' : ''}`} />
        </button>

        {companyOpen && (
          <div
            className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden max-h-[240px] overflow-y-auto animate-fade-in"
            style={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--divider)",
              boxShadow: "var(--shadow-medium)",
            }}
          >
            {companies.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCompanyId(c.id);
                  setCompanyOpen(false);
                  setSearchQuery('');
                }}
                className={`w-full flex flex-col px-4 py-3 text-left transition-colors hover:bg-primary/5 active:bg-primary/10 ${
                  selectedCompanyId === c.id ? 'bg-primary/8' : ''
                }`}
                style={{ borderBottom: "1px solid var(--divider)" }}
              >
                <span className="text-[13px] font-semibold text-foreground">{c.name}</span>
                <span className="text-[10px] text-muted-foreground">{c.path}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: Trainee search (only shown after company is selected) */}
      {selectedCompanyId && (
        <div ref={searchRef} className="relative">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">SEARCH TRAINEE</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search by name or ID..."
              className="sys-input h-12 w-full pl-10 text-[13px]"
            />
          </div>

          {showDropdown && (
            <div
              className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden max-h-[240px] overflow-y-auto animate-fade-in"
              style={{
                background: "var(--surface-elevated)",
                border: "1px solid var(--divider)",
                boxShadow: "var(--shadow-medium)",
              }}
            >
              {filteredTrainees.length === 0 ? (
                <div className="px-4 py-5 text-center text-[13px] text-muted-foreground">
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
      )}

      {!selectedCompanyId && !companyOpen && (
        <div className="text-center text-muted-foreground text-[13px] py-4">
          Select a company to search trainees
        </div>
      )}
    </div>
  );
};
