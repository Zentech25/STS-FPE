import { useFPEStore } from '@/store/fpe-store';
import type { LaneState } from '@/types/fpe';
import { User, ChevronUp, ChevronDown, X, UserPlus, Target, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { getTargetById } from '@/contexts/TargetsContext';

export const TraineePanel = ({ lane }: { lane: LaneState }) => {
  const { reorderQueue, removeTrainee, addTrainee } = useFPEStore();
  const [showAdd, setShowAdd] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRank, setNewRank] = useState('PV2');

  const activeTrainee = lane.traineeQueue[0];
  const waiting = lane.traineeQueue.slice(1);
  const hasTrainees = lane.traineeQueue.length > 0;
  const target = getTargetById(lane.exercise.targetType);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addTrainee(lane.id, {
      id: `T${Date.now()}`,
      name: newName.trim(),
      rank: newRank,
    });
    setNewName('');
    setShowAdd(false);
  };

  if (hasTrainees) {
    return (
      <div className="glass-panel p-5 space-y-4">
        {/* Active trainee info bar */}
        {activeTrainee && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
              background: "var(--gradient-primary)",
              boxShadow: "0 2px 8px hsl(230 80% 60% / 0.3)",
            }}>
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-foreground font-semibold text-[14px] truncate">{activeTrainee.rank} {activeTrainee.name}</div>
              <div className="text-[11px] text-muted-foreground font-mono">ID: {activeTrainee.id}</div>
            </div>
            {waiting.length > 0 && (
              <span className="text-[11px] text-muted-foreground font-medium px-3 py-1.5 rounded-lg" style={{ background: "var(--surface-inset)" }}>
                +{waiting.length} queued
              </span>
            )}
          </div>
        )}

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

        {/* Collapsible trainee queue */}
        <div>
          <button
            onClick={() => setQueueOpen(!queueOpen)}
            className="w-full flex items-center justify-between h-12 px-4 rounded-xl glass-btn"
          >
            <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
              QUEUE ({lane.traineeQueue.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setShowAdd(!showAdd); }}
                className="w-9 h-9 rounded-lg flex items-center justify-center glass-btn text-primary"
              >
                <UserPlus className="w-4 h-4" />
              </button>
              <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${queueOpen ? 'rotate-90' : ''}`} />
            </div>
          </button>

          {queueOpen && (
            <div className="mt-3 space-y-1.5 animate-fade-in">
              {showAdd && (
                <div className="flex gap-2 mb-2">
                  <select
                    value={newRank}
                    onChange={(e) => setNewRank(e.target.value)}
                    className="sys-input h-11 w-24 text-[12px] font-mono"
                  >
                    {['PV2', 'PFC', 'SPC', 'CPL', 'SGT', 'SSG'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Last, F."
                    className="sys-input h-11 flex-1 text-[13px]"
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  />
                  <button onClick={handleAdd} className="sys-btn-primary h-11 w-20 text-[12px]">ADD</button>
                </div>
              )}

              {lane.traineeQueue.map((t, i) => (
                <div key={t.id} className="flex items-center justify-between rounded-xl px-4 py-2.5 text-[12px]" style={{
                  background: i === 0 ? "hsl(var(--primary) / 0.08)" : "var(--surface-elevated)",
                  border: `1px solid ${i === 0 ? "hsl(var(--primary) / 0.2)" : "var(--divider)"}`,
                }}>
                  <span className="text-foreground font-medium">
                    {i === 0 && <span className="text-primary mr-1.5">▶</span>}
                    {t.rank} {t.name}
                  </span>
                  <div className="flex items-center gap-1">
                    {i > 0 && (
                      <button onClick={() => reorderQueue(lane.id, i, i - 1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronUp className="w-4 h-4" />
                      </button>
                    )}
                    {i > 0 && i < lane.traineeQueue.length - 1 && (
                      <button onClick={() => reorderQueue(lane.id, i, i + 1)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    )}
                    {i > 0 && (
                      <button onClick={() => removeTrainee(lane.id, t.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // No trainees — show setup form
  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="panel-header mb-0 pb-0" style={{ borderBottom: 'none' }}>TRAINEES</div>
        <button onClick={() => setShowAdd(!showAdd)} className="w-10 h-10 rounded-xl flex items-center justify-center glass-btn text-primary">
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      {showAdd && (
        <div className="flex gap-2 animate-fade-in">
          <select
            value={newRank}
            onChange={(e) => setNewRank(e.target.value)}
            className="sys-input h-11 w-24 text-[12px] font-mono"
          >
            {['PV2', 'PFC', 'SPC', 'CPL', 'SGT', 'SSG'].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Last, F."
            className="sys-input h-11 flex-1 text-[13px]"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={handleAdd} className="sys-btn-primary h-11 w-20 text-[12px]">ADD</button>
        </div>
      )}

      <div className="text-center text-muted-foreground text-[14px] py-6">No trainee assigned</div>
    </div>
  );
};
