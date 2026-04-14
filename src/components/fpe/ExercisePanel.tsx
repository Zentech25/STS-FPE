import { useFPEStore } from '@/store/fpe-store';
import type { LaneState, PracticeType } from '@/types/fpe';
import { TARGETS } from '@/contexts/TargetsContext';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>
    {children}
  </div>
);

const SelectField = ({ label, value, options, onChange, disabled }: {
  label: string; value: string; options: { value: string; label: string }[] | string[]; onChange: (v: string) => void; disabled?: boolean;
}) => (
  <Field label={label}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="sys-input h-9 text-[12px] disabled:opacity-40"
    >
      {options.map((o) => {
        const val = typeof o === 'string' ? o : o.value;
        const lbl = typeof o === 'string' ? o : o.label;
        return <option key={val} value={val}>{lbl}</option>;
      })}
    </select>
  </Field>
);

const NumberField = ({ label, value, onChange, disabled, min = 0, max, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void; disabled?: boolean; min?: number; max?: number; step?: number;
}) => (
  <Field label={label}>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      className="sys-input h-9 text-[12px] font-mono disabled:opacity-40"
    />
  </Field>
);

const PRACTICE_TYPES: { id: PracticeType; label: string }[] = [
  { id: 'grouping', label: 'Grouping' },
  { id: 'application', label: 'Application' },
  { id: 'timed', label: 'Timed' },
  { id: 'snapshot', label: 'Snap Shot' },
];

const targetOptions = TARGETS.map((t) => ({ value: t.id, label: t.label }));

interface ExercisePanelProps {
  lane: LaneState;
  exType: 'custom' | 'arc';
  onExTypeChange: (type: 'custom' | 'arc') => void;
  masterMode: boolean;
}

export const ExercisePanel = ({ lane, exType, onExTypeChange, masterMode }: ExercisePanelProps) => {
  const { updateExercise } = useFPEStore();
  const ex = lane.exercise;
  const disabled = masterMode;
  const update = (config: Partial<typeof ex>) => updateExercise(lane.id, config);

  // Only show custom exercise fields (ARC fields are in ARC panel)
  if (ex.type === 'arc') {
    return (
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="panel-header mb-0 pb-0" style={{ borderBottom: 'none' }}>EXERCISE CONFIG</div>
          <ExTypeToggle value={exType} onChange={onExTypeChange} disabled={masterMode} />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="panel-header mb-0 pb-0" style={{ borderBottom: 'none' }}>EXERCISE CONFIG</div>
        <ExTypeToggle value={exType} onChange={onExTypeChange} disabled={masterMode} />
      </div>

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

      {/* Practice Type pills */}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">PRACTICE TYPE</label>
        <div className="grid grid-cols-4 gap-0.5 p-0.5 rounded-xl" style={{ background: "var(--surface-inset)" }}>
          {PRACTICE_TYPES.map((pt) => (
            <button
              key={pt.id}
              onClick={() => !disabled && update({ practiceType: pt.id })}
              disabled={disabled}
              className={`text-[10px] text-center font-semibold py-2 rounded-lg transition-all ${
                ex.practiceType === pt.id
                  ? "text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              } disabled:cursor-default`}
              style={ex.practiceType === pt.id ? { background: "var(--gradient-primary)" } : undefined}
            >
              {pt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SelectField label="WEAPON" value={ex.weapon} options={['M4A1', 'M16A4', 'M249', 'M240B', 'M9']} onChange={(v) => update({ weapon: v })} disabled={disabled} />
        <SelectField label="POSITION" value={ex.firingPosition} options={['Prone Supported', 'Prone Unsupported', 'Kneeling', 'Standing']} onChange={(v) => update({ firingPosition: v })} disabled={disabled} />
        <SelectField label="RANGE (m)" value={String(ex.range)} options={['10', '25', '50', '100', '200', '300', '400']} onChange={(v) => update({ range: Number(v) })} disabled={disabled} />
        <NumberField label="ROUNDS" value={ex.rounds} onChange={(v) => update({ rounds: v })} disabled={disabled} min={1} max={100} />
        <SelectField label="TIME OF DAY" value={ex.timeOfDay} options={['day', 'night']} onChange={(v) => update({ timeOfDay: v as 'day' | 'night' })} disabled={disabled} />
        <NumberField label="VISIBILITY %" value={ex.visibility} onChange={(v) => update({ visibility: v })} disabled={disabled} min={0} max={100} />
        <SelectField label="TARGET" value={ex.targetType} options={targetOptions} onChange={(v) => update({ targetType: v })} disabled={disabled} />
      </div>

      {/* Grouping size (always shown when practice type is grouping) */}
      {ex.practiceType === 'grouping' && (
        <div className="grid grid-cols-2 gap-4">
          <NumberField label={`GROUPING SIZE (${ex.groupingUnit})`} value={ex.groupingSize} onChange={(v) => update({ groupingSize: v })} disabled={disabled} min={1} step={0.1} />
          <Field label="UNIT">
            <div className="flex items-center rounded-lg overflow-hidden h-9" style={{ background: "var(--surface-inset)", border: "1px solid var(--divider)" }}>
              {(['cm', 'inches'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => !disabled && update({ groupingUnit: u })}
                  disabled={disabled}
                  className={`flex-1 h-full text-[10px] font-semibold uppercase tracking-wider transition-all ${
                    ex.groupingUnit === u ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  } disabled:cursor-default`}
                  style={ex.groupingUnit === u ? { background: "var(--gradient-primary)" } : undefined}
                >
                  {u}
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}

      {ex.practiceType === 'timed' && (
        <NumberField label="TIME LIMIT (sec)" value={ex.timeLimit} onChange={(v) => update({ timeLimit: v })} disabled={disabled} min={1} />
      )}

      {ex.practiceType === 'snapshot' && (
        <div className="grid grid-cols-3 gap-4">
          <NumberField label="EXPOSURE (sec)" value={ex.exposure} onChange={(v) => update({ exposure: v })} disabled={disabled} min={1} />
          <NumberField label="UP TIME (sec)" value={ex.upTime} onChange={(v) => update({ upTime: v })} disabled={disabled} min={1} />
          <NumberField label="DOWN TIME (sec)" value={ex.downTime} onChange={(v) => update({ downTime: v })} disabled={disabled} min={1} />
        </div>
      )}
    </div>
  );
};

const ExTypeToggle = ({ value, onChange, disabled }: { value: 'custom' | 'arc'; onChange: (v: 'custom' | 'arc') => void; disabled: boolean }) => (
  <div className="flex items-center rounded-lg overflow-hidden" style={{ background: "var(--surface-inset)", border: "1px solid var(--divider)" }}>
    {(['custom', 'arc'] as const).map((t) => (
      <button
        key={t}
        onClick={() => onChange(t)}
        disabled={disabled}
        className={`px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all ${
          value === t ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        } disabled:cursor-default`}
        style={value === t ? { background: "var(--gradient-primary)" } : undefined}
      >
        {t}
      </button>
    ))}
  </div>
);
