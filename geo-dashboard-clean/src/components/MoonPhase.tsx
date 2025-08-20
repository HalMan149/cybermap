"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { getMoonImageUrl } from "@/config/appConfig";
// @ts-expect-error types may be missing in env
import SunCalc from 'suncalc';

function getMoonInfo(now: Date) {
  const illum = SunCalc.getMoonIllumination(now);
  const moonPos = SunCalc.getMoonPosition(now, 0, 0);
  // Illumination fraction 0..1, phase angle fraction 0..1 (0=new, 0.5=full)
  const phase = illum.phase;
  const fraction = illum.fraction;
  // Distance in km (approx) from SunCalc: altitude/azimuth/distance (meters)
  // Some builds return distance in meters, others in km; normalize to km if too large
  let distanceKm = moonPos?.distance ?? 384400;
  if (distanceKm > 1000000) distanceKm = distanceKm / 1000;
  return { phase, fraction, distanceKm };
}

export default function MoonPhase() {
  const [now, setNow] = useState<Date>(new Date());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { phase, fraction, distanceKm } = useMemo(() => getMoonInfo(now), [now]);
  const nasaMoonUrl = getMoonImageUrl();
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [autoRotation, setAutoRotation] = useState<boolean>(true);

  function inferHemisphereByTimeZone(): 'north' | 'south' {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const southernPrefixes = [
        'Australia/', 'Pacific/Auckland', 'Pacific/Chatham',
        'America/Argentina', 'America/Santiago', 'America/Montevideo', 'America/Asuncion', 'America/Sao_Paulo', 'America/Lima',
        'Africa/Johannesburg', 'Africa/Windhoek', 'Indian/Antananarivo', 'Indian/Mauritius'
      ];
      return southernPrefixes.some(p => tz.startsWith(p)) ? 'south' : 'north';
    } catch {
      return 'north';
    }
  }

  // Detección de hemisferio para decidir flip horizontal por defecto
  useEffect(() => {
    // restaurar rotación guardada
    try {
      const saved = localStorage.getItem('moonRotationDeg');
      if (saved !== null) {
        setRotationDeg(parseFloat(saved));
        setAutoRotation(false);
      }
    } catch {}

    const fallback = () => {
      const hemi = inferHemisphereByTimeZone();
      // Heurística: en la práctica, para acercarnos a lo que ve el usuario,
      // invertimos horizontal en hemisferio NORTE (lat>=0) y no invertimos en SUR.
      setFlipH(hemi === 'north');
      setFlipV(false);
      if (autoRotation) setRotationDeg(hemi === 'north' ? 0 : 180);
    };
    if (!navigator?.geolocation) return fallback();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        setFlipH(lat >= 0);
        setFlipV(false);
        if (autoRotation) setRotationDeg(lat >= 0 ? 0 : 180);
      },
      () => fallback(),
      { enableHighAccuracy: false, maximumAge: 3600_000, timeout: 3000 }
    );
  }, []);

  // Persistir rotación manual
  useEffect(() => {
    if (!autoRotation) {
      try { localStorage.setItem('moonRotationDeg', String(rotationDeg)); } catch {}
    }
  }, [rotationDeg, autoRotation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = (canvas.width = 180);
    const h = (canvas.height = 180);
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, r = 72;

    // Moon disk
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#111';
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    // Illuminated portion using fraction (0..1) and phase (0..1)
    // Use a parametric approach: draw two half-disks with a Bezier curve approximating the terminator
    const waxing = phase < 0.5;
    const k = 2 * fraction - 1; // -1..1
    const terminatorX = cx + (waxing ? -k : k) * r;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI / 2, -Math.PI / 2, true);
    ctx.bezierCurveTo(terminatorX, cy - r * 0.7, terminatorX, cy + r * 0.7, cx, cy + r);
    ctx.closePath();
    ctx.clip();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = '#ddd'; ctx.fill();
    ctx.restore();

    // Shading
    const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.2, cx, cy, r);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }, [phase]);

  return (
    <div className="rounded-xl border border-cyan-400/20 bg-[#0a233b]/70 p-4 shadow-[0_0_12px_rgba(34,211,238,0.45)]">
      <h3 className="text-cyan-200 font-semibold mb-3">Fase lunar</h3>
      <div className="flex items-center justify-center">
        {(() => {
          const transform = `${`rotate(${rotationDeg}deg)`}${flipH ? ' scaleX(-1)' : ''}${flipV ? ' scaleY(-1)' : ''}`.trim();
          return nasaMoonUrl ? (
            <img src={nasaMoonUrl} alt="Luna" className="w-[180px] h-[180px] rounded-full object-cover" style={{ transform }} />
          ) : (
            <div style={{ transform }}>
              <canvas ref={canvasRef} />
            </div>
          );
        })()}
      </div>
      <div className="mt-3 text-sm text-cyan-100/80 space-y-1">
        <div>Fase: {phase < 0.03 || phase > 0.97 ? 'Luna nueva' : phase < 0.25 ? 'Creciente' : phase < 0.27 ? 'Cuarto creciente' : phase < 0.5 ? 'Gibbosa creciente' : phase < 0.53 ? 'Luna llena' : phase < 0.75 ? 'Gibbosa menguante' : phase < 0.77 ? 'Cuarto menguante' : 'Menguante'}</div>
        <div>Iluminación: {Math.round(fraction * 100)}%</div>
        <div>Distancia: ~{Math.round(distanceKm).toLocaleString()} km</div>
        <div className="pt-2 space-y-1">
          <label className="text-xs flex items-center gap-2">
            <input type="checkbox" checked={autoRotation} onChange={e => setAutoRotation(e.target.checked)} />
            Rotación automática por hemisferio (0° norte, 180° sur)
          </label>
          <div className="flex items-center gap-2 text-xs">
            <span>Rotar:</span>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotationDeg}
              onChange={e => { setRotationDeg(parseInt(e.target.value, 10)); setAutoRotation(false); }}
            />
            <span>{rotationDeg}°</span>
          </div>
          <label className="text-xs flex items-center gap-2">
            <input type="checkbox" checked={flipH} onChange={e => setFlipH(e.target.checked)} />
            Invertir horizontal (lado iluminado)
          </label>
          <label className="text-xs flex items-center gap-2">
            <input type="checkbox" checked={flipV} onChange={e => setFlipV(e.target.checked)} />
            Invertir vertical (rotación visual)
          </label>
        </div>
      </div>
    </div>
  );
}


