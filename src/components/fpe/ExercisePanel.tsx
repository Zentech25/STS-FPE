import { useFPEStore } from '@/store/fpe-store';
import type { LaneState, PracticeType } from '@/types/fpe';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>
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
      className="sys-input h-9 text-[12px] disabled:opacity-40"
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
      className="sys-input h-9 text-[12px] font-mono disabled:opacity-40"
    />
  </Field>
);

export const ExercisePanel = ({ lane }: { lane: LaneState }) => {
  const { updateExercise } = useFPEStore();
  const ex = lane.exercise;
  const disabled = lane.mode === 'master';
  const update = (config: Partial<typeof ex>) => updateExercise(lane.id, config);

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="panel-header">EXERCISE CONFIG</div>
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

      <div className="grid grid-cols-2 gap-4">
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
        <div className="grid grid-cols-3 gap-4">
          <NumberField label="EXPOSURE (sec)" value={ex.exposure} onChange={(v) => update({ exposure: v })} disabled={disabled} min={1} />
          <NumberField label="UP TIME (sec)" value={ex.upTime} onChange={(v) => update({ upTime: v })} disabled={disabled} min={1} />
          <NumberField label="DOWN TIME (sec)" value={ex.downTime} onChange={(v) => update({ downTime: v })} disabled={disabled} min={1} />
        </div>
      )}
    </div>
  );
};
