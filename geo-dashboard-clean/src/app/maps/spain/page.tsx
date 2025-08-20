"use client";
import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";
import LeafletMap from "@/components/LeafletMap";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function SpainMapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // límites aproximados de España incluyendo Canarias
  const bounds = {
    southWest: [27.5, -19.0] as [number, number],
    northEast: [43.9, 4.5] as [number, number],
  };
  useEffect(() => {
    const id = setTimeout(() => setSidebarOpen(false), 6000);
    return () => clearTimeout(id);
  }, []);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  return (
    <div className="h-screen w-screen" style={{ background: '#0b1021' }}>
      <TopNav />
      <div className="pt-16 h-full w-full relative overflow-hidden">
        <LeafletMap
          className="absolute inset-0"
          center={[40.4168, -3.7038]}
          zoom={5}
          minZoom={4}
          maxBounds={[[bounds.southWest[0], bounds.southWest[1]], [bounds.northEast[0], bounds.northEast[1]]]}
          maxBoundsViscosity={1.0}
        >
        </LeafletMap>
        {/* Pestaña lateral siempre visible para mostrar/ocultar */}
        <button onClick={() => setSidebarOpen(s => !s)} className="fixed right-0 top-1/2 -translate-y-1/2 z-[3000] px-2 py-3 rounded-l bg-cyan-400/20 border border-cyan-400/40 text-cyan-100 hover:text-white">
          {sidebarOpen ? '❮' : '❯'}
        </button>
        <Sidebar title="España – Capas" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="layer" onChange={() => setActiveLayer('temp')} checked={activeLayer === 'temp'} />Temperatura</label>
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="layer" onChange={() => setActiveLayer('fires')} checked={activeLayer === 'fires'} />Incendios</label>
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="layer" onChange={() => setActiveLayer('emergencies')} checked={activeLayer === 'emergencies'} />Emergencias</label>
          </div>
          <div><h4 className="text-cyan-300 font-medium mb-1">Leyenda</h4><p className="text-xs text-cyan-100/80">Colores y símbolos según la capa.</p></div>
          <div className="text-xs text-cyan-100/70">Última actualización: —</div>
        </Sidebar>
      </div>
    </div>
  );
}


