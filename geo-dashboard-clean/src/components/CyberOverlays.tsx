"use client";
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
const CircleMarker = dynamic(async () => (await import('react-leaflet')).CircleMarker, { ssr: false });
const Polyline = dynamic(async () => (await import('react-leaflet')).Polyline, { ssr: false });

export type Victim = { victim: string; country: string; date: string };

export default function CyberOverlays({ victims, layers }: { victims: Victim[]; layers: { ransomware: boolean; groups: boolean; ddos: boolean }}) {
  const centroids = useMemo<Record<string, [number, number]>>(() => ({
    US: [39.8, -98.6], ES: [40.42, -3.70], GB: [54.8, -4.6], FR: [46.6, 2.6], DE: [51.2, 10.5],
    IN: [22.5, 79.0], CN: [35.9, 104.2], RU: [61.5, 105.3], BR: [-10.8, -52.9], JP: [36.2, 138.2]
  }), []);

  return (
    <>
      {layers.ransomware && victims.map((v, i) => {
        const c = centroids[v.country as keyof typeof centroids];
        if (!c) return null;
        return <CircleMarker key={i} center={c} radius={4} pathOptions={{ color: '#22d3ee', fillColor: '#22d3ee', fillOpacity: 0.7 }} />
      })}
      {layers.ddos && (
        <Polyline positions={[[40.42, -3.70], [39.8, -98.6]]} pathOptions={{ color: '#e879f9', opacity: 0.6 }} />
      )}
    </>
  );
}


