import TopNav from "@/components/TopNav";
import MapCard from "@/components/MapCard";

export default function Page() {
  return (
    <div className="h-screen w-screen" style={{ background: '#0b1021' }}>
      <TopNav />
      <main className="pt-16 px-4 mx-auto max-w-7xl">
        <h1 className="text-2xl font-semibold text-cyan-200 mb-4">Panel de mapas</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MapCard title="España – Datos ambientales" description="Temperatura, incendios, alertas" href="/maps/spain" />
          <MapCard title="Mundial – Ciberataques" description="Ransomware, grupos activos, DDoS" href="/maps/cyber" />
          <MapCard title="Espacio y fenómenos" description="Día/Noche, auroras, clima espacial" href="/maps/space" />
          <MapCard title="Geología y sismología" description="Terremotos, volcanes, alertas" href="/maps/geo" />
        </div>
      </main>
    </div>
  );
}

