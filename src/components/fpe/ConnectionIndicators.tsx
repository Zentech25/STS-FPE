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

  // Simulate occasional connection changes for demo
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

  return (
    <div className="flex items-center gap-2">
      {devices.map((d) => (
        <div
          key={d.label}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
          style={{
            background: 'var(--surface-inset)',
            border: '1px solid var(--divider)',
          }}
          title={`${d.label}: ${d.connected ? 'Connected' : 'Disconnected'}`}
        >
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{
              background: d.connected
                ? 'hsl(var(--success))'
                : 'hsl(var(--destructive))',
              boxShadow: d.connected
                ? '0 0 6px hsl(var(--success) / 0.5)'
                : '0 0 6px hsl(var(--destructive) / 0.5)',
            }}
          />
          <span className="text-[10px] font-semibold tracking-wider text-foreground">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
};
