"use client";
import { useEffect, useMemo, useState } from "react";

function getMoonPhase(now: Date): number {
  // Simple approximation (0=new, 0.5=full)
  const synodic = 29.53058867; // days
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14));
  const days = (now.getTime() - knownNewMoon.getTime()) / 86400000;
  let phase = days / synodic;
  phase = phase - Math.floor(phase);
  return phase; // 0..1
}

export default function MoonPhase() {
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const phase = useMemo(() => getMoonPhase(now), [now]);
  const isWaxing = phase < 0.5;
  const pct = isWaxing ? phase * 2 : (1 - phase) * 2; // 0..1 illuminated side width ratio

  return (
    <div className="rounded-xl border border-cyan-400/20 bg-[#0a233b]/70 p-4 shadow-[0_0_12px_rgba(34,211,238,0.45)]">
      <h3 className="text-cyan-200 font-semibold mb-3">Fase lunar</h3>
      <div className="flex items-center justify-center">
        <div style={{ width: 160, height: 160, position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: '#ddd'
          }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: '#000',
            boxShadow: 'inset 0 0 18px rgba(0,0,0,0.8)'
          }} />
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: 0, bottom: 0,
              width: `${Math.max(0, Math.min(1, pct)) * 100}%`,
              left: isWaxing ? '50%' : undefined,
              right: isWaxing ? undefined : '50%',
              background: '#ddd'
            }} />
          </div>
        </div>
      </div>
      <div className="mt-3 text-sm text-cyan-100/80">
        {phase < 0.03 || phase > 0.97 ? 'Luna nueva' : phase < 0.25 ? 'Creciente' : phase < 0.27 ? 'Cuarto creciente' : phase < 0.5 ? 'Gibbosa creciente' : phase < 0.53 ? 'Luna llena' : phase < 0.75 ? 'Gibbosa menguante' : phase < 0.77 ? 'Cuarto menguante' : 'Menguante'}
      </div>
    </div>
  );
}

