import { useState, useEffect } from 'react';

interface DeviceStatus {
  label: string;
  connected: boolean;
}

const defaultDevices: DeviceStatus[] = [
  { label: 'FRM', connected: true },
  { label: 'SDU', connected: true },
  { label: 'TGT', connected: true },
  { label: 'MCS', connected: false },
  { label: 'TCU', connected: true },
];

export const ConnectionIndicators = () => {
  const [devices, setDevices] = useState<DeviceStatus[]>(defaultDevices);

  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prev =>
        prev.map(d => ({
          ...d,
          connected: Math.random() > 0.08 ? d.connected : !d.connected,
        }))
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const allConnected = devices.every(d => d.connected);

  return (
    <div
      className="flex items-center gap-3 px-3 py-1.5 rounded-lg"
      style={{
        background: 'var(--surface-inset)',
        border: '1px solid var(--divider)',
      }}
    >
      {!allConnected && (
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            background: 'hsl(var(--destructive))',
            boxShadow: '0 0 6px hsl(var(--destructive) / 0.5)',
          }}
        />
      )}
      {devices.map((d) => (
        <div
          key={d.label}
          className="flex items-center gap-1"
          title={`${d.label}: ${d.connected ? 'Connected' : 'Disconnected'}`}
        >
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              background: d.connected
                ? 'hsl(var(--success))'
                : 'hsl(var(--destructive))',
              boxShadow: d.connected
                ? '0 0 4px hsl(var(--success) / 0.4)'
                : '0 0 4px hsl(var(--destructive) / 0.4)',
            }}
          />
          <span
            className="text-[9px] font-semibold tracking-wider"
            style={{
              color: d.connected ? 'var(--foreground)' : 'hsl(var(--destructive))',
            }}
          >
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
};
