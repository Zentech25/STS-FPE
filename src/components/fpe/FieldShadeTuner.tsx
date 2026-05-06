import { useEffect, useState } from 'react';
import { Sliders } from 'lucide-react';

const STORAGE_KEY = 'fpe-field-lightness';

export const FieldShadeTuner = () => {
  // Lightness % in HSL (0 = black, 100 = white). Current dark = 18.
  const [lightness, setLightness] = useState<number>(() => {
    if (typeof window === 'undefined') return 18;
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? Number(v) : 18;
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--field-lightness', `${lightness}%`);
    // Pick text color: white on dark, near-black on light
    const textColor = lightness > 55 ? '10%' : '98%';
    document.documentElement.style.setProperty('--field-text-lightness', textColor);
    localStorage.setItem(STORAGE_KEY, String(lightness));
  }, [lightness]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Tune field background shade"
        className="h-10 px-3 rounded-lg flex items-center gap-1.5 glass-btn text-[11px] font-semibold text-muted-foreground hover:text-foreground"
        style={{ minWidth: 44, minHeight: 44 }}
      >
        <Sliders className="w-4 h-4" />
        SHADE
        <span className="font-mono text-[10px] opacity-70">{lightness}%</span>
      </button>

      {open && (
        <div
          data-daylight-dropdown
          className="absolute right-0 top-full mt-1.5 p-4 rounded-xl min-w-[280px]"
          style={{
            zIndex: 9999,
            background: 'rgba(255,255,255,0.98)',
            border: '1.5px solid rgba(0,0,0,0.15)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
          }}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            Field Background Shade
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg shrink-0"
              style={{
                background: `hsl(224 28% ${lightness}%)`,
                border: '1.5px solid rgba(0,0,0,0.2)',
              }}
            />
            <input
              type="range"
              min={5}
              max={95}
              step={1}
              value={lightness}
              onChange={(e) => setLightness(Number(e.target.value))}
              className="flex-1"
            />
            <span className="font-mono text-[12px] font-semibold w-10 text-right">{lightness}%</span>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
            <span>DARK</span>
            <span>LIGHT</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-2">
            Drag to test. Current value: <span className="font-mono font-semibold text-foreground">{lightness}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
