import { useFPEStore } from '@/store/fpe-store';
import type { LaneState, PracticeType } from '@/types/fpe';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-mono text-muted-foreground mb-1">{label}</label>
    {children}
  </div>
);

const SelectField = ({ label, value, options, onChange, disabled }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; disabled?: boolean;
}) => (
  <Field label={label}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full bg-secondary text-secondary-foreground rounded px-2 py-1.5 text-sm border border-border disabled:opacity-50 font-mono"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
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
      className="w-full bg-secondary text-secondary-foreground rounded px-2 py-1.5 text-sm border border-border disabled:opacity-50 font-mono"
    />
  </Field>
);

export const ExercisePanel = ({ lane }: { lane: LaneState }) => {
  const { updateExercise } = useFPEStore();
  const ex = lane.exercise;
  const disabled = lane.mode === 'master';
  const update = (config: Partial<typeof ex>) => updateExercise(lane.id, config);

  return (
    <div className="glass-card p-4 space-y-4">
      <h3 className="font-mono text-xs font-semibold tracking-wider text-muted-foreground">EXERCISE CONFIG</h3>
      {disabled && (
        <div className="bg-info/10 border border-info/20 rounded px-3 py-2 text-xs text-info font-mono">
          MASTER MODE — CONFIG READ ONLY
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <SelectField label="TYPE" value={ex.type} options={['custom', 'arc']} onChange={(v) => update({ type: v as 'custom' | 'arc' })} disabled={disabled} />
        <SelectField
          label="PRACTICE"
          value={ex.practiceType}
          options={['grouping', 'application', 'timed', 'snapshot']}
          onChange={(v) => update({ practiceType: v as PracticeType })}
          disabled={disabled}
        />
        <SelectField label="WEAPON" value={ex.weapon} options={['M4A1', 'M16A4', 'M249', 'M240B', 'M9']} onChange={(v) => update({ weapon: v })} disabled={disabled} />
        <SelectField label="POSITION" value={ex.firingPosition} options={['Prone Supported', 'Prone Unsupported', 'Kneeling', 'Standing']} onChange={(v) => update({ firingPosition: v })} disabled={disabled} />
        <NumberField label="RANGE (m)" value={ex.range} onChange={(v) => update({ range: v })} disabled={disabled} min={25} max={600} step={25} />
        <NumberField label="ROUNDS" value={ex.rounds} onChange={(v) => update({ rounds: v })} disabled={disabled} min={1} max={100} />
        <SelectField label="TIME OF DAY" value={ex.timeOfDay} options={['day', 'night']} onChange={(v) => update({ timeOfDay: v as 'day' | 'night' })} disabled={disabled} />
        <NumberField label="VISIBILITY %" value={ex.visibility} onChange={(v) => update({ visibility: v })} disabled={disabled} min={0} max={100} />
        <SelectField label="TARGET" value={ex.targetType} options={['E-Type Silhouette', 'F-Type Silhouette', 'Dog Target', 'Bull\'s Eye']} onChange={(v) => update({ targetType: v })} disabled={disabled} />
      </div>

      {ex.practiceType === 'timed' && (
        <NumberField label="TIME LIMIT (sec)" value={ex.timeLimit} onChange={(v) => update({ timeLimit: v })} disabled={disabled} min={1} />
      )}

      {ex.practiceType === 'snapshot' && (
        <div className="grid grid-cols-3 gap-3">
          <NumberField label="EXPOSURE (sec)" value={ex.exposure} onChange={(v) => update({ exposure: v })} disabled={disabled} min={1} />
          <NumberField label="UP TIME (sec)" value={ex.upTime} onChange={(v) => update({ upTime: v })} disabled={disabled} min={1} />
          <NumberField label="DOWN TIME (sec)" value={ex.downTime} onChange={(v) => update({ downTime: v })} disabled={disabled} min={1} />
        </div>
      )}
    </div>
  );
};
