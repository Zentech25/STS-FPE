import { useFPEStore } from '@/store/fpe-store';
import type { LaneState } from '@/types/fpe';
import { User, ChevronUp, ChevronDown, X, UserPlus } from 'lucide-react';
import { useState } from 'react';

export const TraineePanel = ({ lane }: { lane: LaneState }) => {
  const { reorderQueue, removeTrainee, addTrainee } = useFPEStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRank, setNewRank] = useState('PV2');

  const activeTrainee = lane.traineeQueue[0];
  const waiting = lane.traineeQueue.slice(1);

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

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="panel-header mb-0 pb-0 border-b-0" style={{ borderBottom: 'none' }}>TRAINEES</div>
        <button onClick={() => setShowAdd(!showAdd)} className="w-8 h-8 rounded-xl flex items-center justify-center glass-btn text-primary">
          <UserPlus className="w-4 h-4" />
        </button>
      </div>

      {showAdd && (
        <div className="flex gap-2 animate-fade-in">
          <select
            value={newRank}
            onChange={(e) => setNewRank(e.target.value)}
            className="sys-input h-9 w-20 text-[11px] font-mono"
          >
            {['PV2', 'PFC', 'SPC', 'CPL', 'SGT', 'SSG'].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Last, F."
            className="sys-input h-9 flex-1 text-[12px]"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={handleAdd} className="sys-btn-primary h-9 w-16 text-[11px]">ADD</button>
        </div>
      )}

      {activeTrainee ? (
        <div className="glass-panel-glow p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{
              background: "var(--gradient-primary)",
              boxShadow: "0 2px 8px hsl(230 80% 60% / 0.3)",
            }}>
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-primary">ACTIVE FIRER</span>
          </div>
          <div className="text-foreground font-semibold text-[14px]">{activeTrainee.rank} {activeTrainee.name}</div>
          <div className="text-[11px] text-muted-foreground font-mono mt-1">ID: {activeTrainee.id}</div>
        </div>
      ) : (
        <div className="text-center text-muted-foreground text-[13px] py-6">No trainee assigned</div>
      )}

      {waiting.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">QUEUE</span>
          {waiting.map((t, i) => {
            const queueIndex = i + 1;
            return (
              <div key={t.id} className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] interactive-row" style={{
                background: "var(--surface-elevated)",
                border: "1px solid var(--divider)",
                borderRadius: "12px",
              }}>
                <span className="text-foreground font-medium">{t.rank} {t.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => reorderQueue(lane.id, queueIndex, queueIndex - 1)}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  {queueIndex < lane.traineeQueue.length - 1 && (
                    <button
                      onClick={() => reorderQueue(lane.id, queueIndex, queueIndex + 1)}
                      className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => removeTrainee(lane.id, t.id)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded-lg transition-colors ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
