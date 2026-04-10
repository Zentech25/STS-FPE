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
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-xs font-semibold tracking-wider text-muted-foreground">TRAINEES</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="text-primary hover:text-primary/80 transition-colors">
          <UserPlus className="w-4 h-4" />
        </button>
      </div>

      {showAdd && (
        <div className="flex gap-2">
          <select
            value={newRank}
            onChange={(e) => setNewRank(e.target.value)}
            className="bg-secondary text-secondary-foreground rounded px-2 py-1 text-xs font-mono border border-border"
          >
            {['PV2', 'PFC', 'SPC', 'CPL', 'SGT', 'SSG'].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Last, F."
            className="flex-1 bg-secondary text-secondary-foreground rounded px-2 py-1 text-xs border border-border placeholder:text-muted-foreground"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={handleAdd} className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold">ADD</button>
        </div>
      )}

      {activeTrainee ? (
        <div className="glass-card-active p-3">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-primary font-semibold">ACTIVE FIRER</span>
          </div>
          <div className="text-foreground font-semibold">{activeTrainee.rank} {activeTrainee.name}</div>
          <div className="text-xs text-muted-foreground font-mono">ID: {activeTrainee.id}</div>
        </div>
      ) : (
        <div className="text-center text-muted-foreground text-sm py-4">No trainee assigned</div>
      )}

      {waiting.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs font-mono text-muted-foreground">QUEUE</span>
          {waiting.map((t, i) => {
            const queueIndex = i + 1;
            return (
              <div key={t.id} className="flex items-center justify-between bg-secondary/50 rounded px-3 py-2 text-sm">
                <span className="text-foreground">{t.rank} {t.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => reorderQueue(lane.id, queueIndex, queueIndex - 1)}
                    className="text-muted-foreground hover:text-foreground p-0.5"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  {queueIndex < lane.traineeQueue.length - 1 && (
                    <button
                      onClick={() => reorderQueue(lane.id, queueIndex, queueIndex + 1)}
                      className="text-muted-foreground hover:text-foreground p-0.5"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => removeTrainee(lane.id, t.id)}
                    className="text-muted-foreground hover:text-danger p-0.5 ml-1"
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
