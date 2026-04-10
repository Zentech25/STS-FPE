import { useFPEStore } from '@/store/fpe-store';
import type { LaneState } from '@/types/fpe';
import { getTargetById } from '@/contexts/TargetsContext';
import { DEFAULT_FIRE_MAP, getFireTypes, getPractices, getARCConfig } from '@/data/arc-data';
import { Sun, Moon } from 'lucide-react';

const PRACTICE_LABELS: Record<string, string> = {
  Grouping: "Grouping",
  Application: "Application",
  Timed: "Timed",
  "Snap Shot": "Snap Shot",
};

export const ARCPanel = ({ lane }: { lane: LaneState }) => {
  const { updateArcSelection, updateExercise } = useFPEStore();
  const sel = lane.arcSelection;
  const disabled = lane.mode === 'master';

  if (lane.exercise.type !== 'arc') return null;

  const fireTypes = getFireTypes(sel.weapon);
  const practices = getPractices(sel.weapon, sel.fireType);
  const cfg = sel.practice ? getARCConfig(sel.weapon, sel.fireType, sel.practice) : undefined;
  const target = cfg ? getTargetById(cfg.typeOfTarget) : undefined;

  const availableWeapons = Object.keys(DEFAULT_FIRE_MAP);

  const patchSel = (p: Partial<typeof sel>) => {
    const next = { ...sel, ...p };
    if (p.weapon !== undefined) { next.fireType = ''; next.practice = ''; }
    if (p.fireType !== undefined && p.weapon === undefined) { next.practice = ''; }
    updateArcSelection(lane.id, next);

    // When a full config is selected, apply it to the exercise
    if (next.weapon && next.fireType && next.practice) {
      const arcCfg = getARCConfig(next.weapon, next.fireType, next.practice);
      if (arcCfg) {
        updateExercise(lane.id, {
          weapon: arcCfg.weapon,
          firingPosition: arcCfg.firingPosition,
          range: arcCfg.firingRange,
          rounds: arcCfg.roundsAllotted,
          targetType: arcCfg.typeOfTarget,
          timeOfDay: arcCfg.timeOfPractice,
          timeLimit: arcCfg.timeSec,
          exposure: arcCfg.exposures,
          upTime: arcCfg.upTime,
          downTime: arcCfg.downTime,
        });
      }
    }
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="panel-header">ARC CONFIGURATION</div>

      {disabled && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[12px] animate-fade-in" style={{
          background: 'hsl(var(--accent) / 0.08)',
          border: '1px solid hsl(var(--accent) / 0.15)',
          color: 'hsl(var(--accent))',
        }}>
          <span className="font-semibold">MASTER MODE</span>
          <span className="text-muted-foreground">— Configuration is read-only</span>
        </div>
      )}

      {/* Cascading selectors */}
      <div className="space-y-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Weapon</label>
          <select
            value={sel.weapon}
            onChange={(e) => patchSel({ weapon: e.target.value })}
            disabled={disabled}
            className="sys-input h-9 text-[12px] w-full disabled:opacity-40"
          >
            <option value="">Select weapon...</option>
            {availableWeapons.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        {sel.weapon && (
          <div className="animate-fade-in">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Type of Fire</label>
            <select
              value={sel.fireType}
              onChange={(e) => patchSel({ fireType: e.target.value })}
              disabled={disabled}
              className="sys-input h-9 text-[12px] w-full disabled:opacity-40"
            >
              <option value="">Select...</option>
              {fireTypes.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>
        )}

        {sel.weapon && sel.fireType && (
          <div className="animate-fade-in">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Name of Practice</label>
            <select
              value={sel.practice}
              onChange={(e) => patchSel({ practice: e.target.value })}
              disabled={disabled}
              className="sys-input h-9 text-[12px] w-full disabled:opacity-40"
            >
              <option value="">Select...</option>
              {practices.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Loaded config display */}
      {cfg && (
        <div className="animate-fade-in space-y-3 pt-2" style={{ borderTop: "1px solid var(--divider)" }}>
          {/* Practice Type pills (read-only) */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Practice Type</label>
            <div className="grid grid-cols-4 gap-0.5 p-0.5 rounded-xl" style={{ background: "var(--surface-inset)" }}>
              {["Grouping", "Application", "Timed", "Snap Shot"].map((pt) => (
                <div
                  key={pt}
                  className={`text-[10px] text-center font-semibold py-2 rounded-lg transition-all ${
                    cfg.practiceType === pt ? "text-primary-foreground shadow-sm" : "text-muted-foreground/40"
                  }`}
                  style={cfg.practiceType === pt ? { background: "var(--gradient-primary)" } : undefined}
                >
                  {pt}
                </div>
              ))}
            </div>
          </div>

          {/* Config details */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            <ReadOnlyField label="Weapon" value={cfg.weapon} />
            <ReadOnlyField label="Position" value={cfg.firingPosition} />
            <ReadOnlyField label="Range (m)" value={String(cfg.firingRange)} />
            <ReadOnlyField label="Rounds" value={String(cfg.roundsAllotted)} />
          </div>

          {/* Time of Day */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Time of Day</label>
            <div className="grid grid-cols-2 gap-0.5 p-0.5 rounded-lg" style={{ background: "var(--surface-inset)" }}>
              <div className={`flex items-center justify-center gap-1.5 text-[11px] font-semibold py-2 rounded-md transition-all ${
                cfg.timeOfPractice === "day" ? "bg-amber-500/90 text-white shadow-sm" : "text-muted-foreground/40"
              }`}>
                <Sun className="w-3.5 h-3.5" /> Day
              </div>
              <div className={`flex items-center justify-center gap-1.5 text-[11px] font-semibold py-2 rounded-md transition-all ${
                cfg.timeOfPractice === "night" ? "bg-indigo-600/90 text-white shadow-sm" : "text-muted-foreground/40"
              }`}>
                <Moon className="w-3.5 h-3.5" /> Night
              </div>
            </div>
          </div>

          {/* Timed-specific */}
          {cfg.practiceType === "Timed" && (
            <ReadOnlyField label="Time Limit (sec)" value={String(cfg.timeSec)} />
          )}

          {/* Snap Shot-specific */}
          {cfg.practiceType === "Snap Shot" && (
            <div className="grid grid-cols-3 gap-3">
              <ReadOnlyField label="Exposure" value={String(cfg.exposures)} />
              <ReadOnlyField label="Up (sec)" value={String(cfg.upTime)} />
              <ReadOnlyField label="Down (sec)" value={String(cfg.downTime)} />
            </div>
          )}

          {/* Target preview */}
          {target && (
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">Target</label>
              <div className="sys-input h-8 text-[11px] flex items-center text-foreground/70 mb-2">
                {target.label}
              </div>
              <div className="rounded-xl flex items-center justify-center p-2 overflow-hidden" style={{
                background: "var(--surface-inset)",
                border: "1px solid var(--divider)",
              }}>
                <img src={target.image} alt={target.label} className="max-w-full max-h-32 object-contain rounded-lg" loading="lazy" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5 block">{label}</label>
    <div className="sys-input h-9 text-[12px] flex items-center text-foreground/70">{value}</div>
  </div>
);
