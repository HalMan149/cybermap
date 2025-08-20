"use client";
"use client";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { ReactNode, useEffect } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';

const MapContainer = dynamic(async () => (await import('react-leaflet')).MapContainer, { ssr: false });
const TileLayer = dynamic(async () => (await import('react-leaflet')).TileLayer, { ssr: false });

type LeafletMapProps = {
  children?: ReactNode;
  center?: [number, number];
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  maxBounds?: any; // keep loose typing to avoid TS friction
  maxBoundsViscosity?: number;
  className?: string;
};

export default function LeafletMap({ children, center = [38.3373, -0.5266], zoom = 3, minZoom = 2, maxZoom = 17, maxBounds, maxBoundsViscosity = 1.0, className }: LeafletMapProps) {
  function BoundsController() {
    const map = useMap();
    useEffect(() => {
      try {
        if (maxBounds) {
          map.setMaxBounds(maxBounds);
          // Evita inercia que empuje la vista fuera
          (map as any).options.inertia = false;
        }
        map.setMinZoom(minZoom);
        map.setMaxZoom(maxZoom);
      } catch {}
    }, [map]);
    useMapEvent('drag', () => {
      if (maxBounds) {
        map.panInsideBounds(maxBounds, { animate: false });
      }
    });
    useMapEvent('moveend', () => {
      if (maxBounds) {
        map.panInsideBounds(maxBounds, { animate: false });
      }
    });
    return null;
  }
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className ?? 'h-full w-full'}
      minZoom={minZoom}
      maxZoom={maxZoom}
      worldCopyJump={false}
      zoomControl={true}
      attributionControl={false}
      maxBounds={maxBounds}
      maxBoundsViscosity={maxBounds ? maxBoundsViscosity : undefined}
      style={{ position: 'absolute', inset: 0 }}
    >
      {maxBounds ? <BoundsController /> : null}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap & Carto"
        noWrap
      />
      {children}
    </MapContainer>
  );
}


