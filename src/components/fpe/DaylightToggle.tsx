import { useEffect, useState } from 'react';
import { Sun } from 'lucide-react';

const STORAGE_KEY = 'fpe-daylight-mode';

export const DaylightToggle = () => {
  const [active, setActive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === '1';
  });

  useEffect(() => {
    document.body.classList.toggle('daylight-mode', active);
    localStorage.setItem(STORAGE_KEY, active ? '1' : '0');
  }, [active]);

  return (
    <button
      onClick={() => setActive((v) => !v)}
      title={active ? 'Daylight mode ON — high contrast for bright light' : 'Enable Daylight Mode for bright environments'}
      className="h-10 px-3 rounded-lg flex items-center gap-1.5 glass-btn text-[11px] font-semibold transition-colors"
      style={{
        minWidth: 44,
        minHeight: 44,
        background: active ? 'hsl(40 96% 48%)' : undefined,
        color: active ? '#1a1a1a' : 'hsl(var(--muted-foreground))',
        borderColor: active ? 'hsl(40 96% 38%)' : undefined,
        boxShadow: active ? '0 0 0 2px hsl(40 96% 48% / 0.25)' : undefined,
      }}
    >
      <Sun className="w-4 h-4" />
      DAYLIGHT
    </button>
  );
};
