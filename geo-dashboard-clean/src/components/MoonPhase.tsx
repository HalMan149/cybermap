"use client";
import { useEffect, useMemo, useRef, useState } from "react";

function getMoonPhase(now: Date): number {
  const synodic = 29.53058867;
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14));
  const days = (now.getTime() - knownNewMoon.getTime()) / 86400000;
  let phase = days / synodic;
  phase = phase - Math.floor(phase);
  return phase; // 0..1
}

function getMoonDistanceKm(now: Date): number {
  // Simple elliptical approx around 384400 km
  const phase = getMoonPhase(now);
  const mean = 384400;
  const amp = 26000; // rough amplitude
  return Math.round(mean + Math.cos(phase * 2 * Math.PI) * amp);
}

function getIllumination(phase: number): number {
  // 0=new -> 0%; 0.5=full -> 100%
  return Math.round((1 - Math.cos(phase * 2 * Math.PI)) * 50);
}

export default function MoonPhase() {
  const [now, setNow] = useState<Date>(new Date());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const phase = useMemo(() => getMoonPhase(now), [now]);
  const illum = useMemo(() => getIllumination(phase), [phase]);
  const dist = useMemo(() => getMoonDistanceKm(now), [now]);

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
    // Illuminated portion
    // Use phase angle to draw limb
    const angle = phase * 2 * Math.PI;
    // Compute x offset of terminator
    const k = Math.cos(angle);
    const a = r;
    const b = Math.abs(r * k);
    // Draw bright ellipse over the disk centered at cx
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx + (phase < 0.5 ? -r * (1 - k) : r * (1 - k)), cy, a, b, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#ddd';
    ctx.fill();
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
      <div className="flex items-center justify-center"><canvas ref={canvasRef} /></div>
      <div className="mt-3 text-sm text-cyan-100/80 space-y-1">
        <div>Fase: {phase < 0.03 || phase > 0.97 ? 'Luna nueva' : phase < 0.25 ? 'Creciente' : phase < 0.27 ? 'Cuarto creciente' : phase < 0.5 ? 'Gibbosa creciente' : phase < 0.53 ? 'Luna llena' : phase < 0.75 ? 'Gibbosa menguante' : phase < 0.77 ? 'Cuarto menguante' : 'Menguante'}</div>
        <div>Iluminación: {illum}%</div>
        <div>Distancia: ~{dist.toLocaleString()} km</div>
      </div>
    </div>
  );
}

