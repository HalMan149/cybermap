"use client";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { ReactNode } from 'react';

const MapContainer = dynamic(async () => (await import('react-leaflet')).MapContainer, { ssr: false });
const TileLayer = dynamic(async () => (await import('react-leaflet')).TileLayer, { ssr: false });

export default function LeafletMap({ children, center = [38.3373, -0.5266], zoom = 3, className }: { children?: ReactNode; center?: [number, number]; zoom?: number; className?: string }) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className ?? 'h-full w-full'}
      minZoom={2}
      maxZoom={17}
      worldCopyJump={false}
      zoomControl={true}
      attributionControl={false}
      style={{ position: 'absolute', inset: 0 }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap & Carto"
        noWrap
      />
      {children}
    </MapContainer>
  );
}

