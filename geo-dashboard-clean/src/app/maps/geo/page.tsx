"use client";
import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";
import LeafletMap from "@/components/LeafletMap";
import { useState } from "react";
import { motion } from "framer-motion";

export default function GeoMapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [layers, setLayers] = useState({ volcanoes: true, earthquakes: true, alerts: false });
  return (
    <div className="h-screen w-screen" style={{ background: '#0b1021' }}>
      <TopNav />
      <div className="pt-16 h-full w-full relative">
        <LeafletMap className="absolute inset-0" zoom={2}></LeafletMap>
        <motion.button onClick={() => setSidebarOpen(s => !s)} className="absolute top-20 right-4 z-50 px-3 py-2 rounded-lg bg-cyan-400/20 border border-cyan-400/40 text-cyan-200 hover:text-white" whileTap={{ scale: 0.98 }}>Capas</motion.button>
        <Sidebar title="Geología – Capas" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          {Object.entries({ volcanoes: 'Volcanes', earthquakes: 'Terremotos (USGS)', alerts: 'Alertas sísmicas' }).map(([k, label]) => (
            <label key={k} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={(layers as any)[k]} onChange={e => setLayers(s => ({...s, [k]: e.target.checked}))} />{label}</label>
          ))}
          <div><h4 className="text-cyan-300 font-medium mb-1">Leyenda</h4><ul className="text-xs text-cyan-100/80 space-y-1"><li>Azul: volcanes</li><li>Verde: terremotos</li><li>Magenta: alertas</li></ul></div>
          <div className="text-xs text-cyan-100/70">Última actualización: —</div>
        </Sidebar>
      </div>
    </div>
  );
}

