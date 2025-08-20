"use client";
import TopNav from "@/components/TopNav";
import Sidebar from "@/components/Sidebar";
import LeafletMap from "@/components/LeafletMap";
import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
const CyberOverlays = dynamic(() => import('@/components/CyberOverlays'), { ssr: false });

type Victim = { victim: string; country: string; date: string };

export default function CyberMapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setSidebarOpen(false), 6000);
    return () => clearTimeout(id);
  }, []);
  const [layers, setLayers] = useState({ ransomware: true, groups: false, ddos: false });
  const [victims, setVictims] = useState<Victim[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/cyber/recent-victims');
        if (res.ok) {
          const data = await res.json();
          setVictims(Array.isArray(data) ? data.slice(0, 200) : []);
        }
      } catch {}
    })();
  }, []);

  return (
    <div className="h-screen w-screen" style={{ background: '#0b1021' }}>
      <TopNav />
      <div className="pt-16 h-full w-full relative overflow-hidden">
        <LeafletMap
          className="absolute inset-0"
          minZoom={2}
          maxBounds={[[-60, -180], [85, 180]]}
          maxBoundsViscosity={0.2}
          fitBoundsOnMount={true}
          lockMinZoomToFit={true}
        >
          <CyberOverlays victims={victims} layers={layers} />
        </LeafletMap>
        <button onClick={() => setSidebarOpen(s => !s)} className="fixed right-0 top-1/2 -translate-y-1/2 z-[3000] px-2 py-3 rounded-l bg-cyan-400/20 border border-cyan-400/40 text-cyan-100 hover:text-white">
          {sidebarOpen ? '❮' : '❯'}
        </button>
        <Sidebar title="Ciberataques – Capas" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={layers.ransomware} onChange={e => setLayers(s => ({...s, ransomware: e.target.checked}))} />Ataques ransomware</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={layers.groups} onChange={e => setLayers(s => ({...s, groups: e.target.checked}))} />Grupos activos</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={layers.ddos} onChange={e => setLayers(s => ({...s, ddos: e.target.checked}))} />DDoS</label>
          </div>
          <div><h4 className="text-cyan-300 font-medium mb-1">Leyenda</h4><ul className="text-xs text-cyan-100/80 space-y-1"><li>Azul: ransomware</li><li>Verde: grupos</li><li>Magenta: DDoS</li></ul></div>
          <div className="text-xs text-cyan-100/70">Última actualización: —</div>
        </Sidebar>
      </div>
    </div>
  );
}


