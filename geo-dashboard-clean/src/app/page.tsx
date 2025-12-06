import TopNav from "@/components/TopNav";
import MapCard from "@/components/MapCard";
import MoonPhase from "@/components/MoonPhase";
import SDOPanel from "@/components/SDOPanel";

export default function Page() {
  return (
    <div className="h-screen w-screen" style={{ background: '#0b1021' }}>
      <TopNav />
      <main className="pt-16 px-4 mx-auto max-w-7xl">
        <h1 className="text-2xl font-semibold text-cyan-200 mb-4">Panel de mapas</h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start lg:gap-6 xl:gap-8">
          <div className="lg:col-span-3"><MoonPhase /></div>
          <div className="lg:col-span-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <MapCard title="España – Datos ambientales" description="Temperatura, incendios, alertas" href="/maps/spain" />
              <MapCard title="Mundial – Ciberataques" description="Ransomware, grupos activos, DDoS" href="/maps/cyber" />
              <MapCard title="Espacio y fenómenos" description="Día/Noche, auroras, clima espacial" href="/maps/space" />
              <MapCard title="Geología y sismología" description="Terremotos, volcanes, alertas" href="/maps/geo" />
            </div>
          </div>
          <div className="lg:col-span-3"><SDOPanel /></div>
        </div>
      </main>
    </div>
  );
}



