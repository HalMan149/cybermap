"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  { href: "/", label: "Dashboard" },
  { href: "/maps/spain", label: "España" },
  { href: "/maps/cyber", label: "Ciberataques" },
  { href: "/maps/space", label: "Espacio" },
  { href: "/maps/geo", label: "Geología" },
];

export default function TopNav() {
  const pathname = usePathname();
  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-[#0a233b]/80 backdrop-blur-md border-b border-cyan-400/20">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-6">
        <div className="font-bold text-cyan-300">Geo Dashboard</div>
        <nav className="flex items-center gap-3 text-sm">
          {routes.map(r => (
            <Link key={r.href} href={r.href} className={`px-2.5 py-1.5 rounded-md transition-colors ${pathname === r.href ? 'bg-cyan-400/20 text-white' : 'text-cyan-200 hover:text-white hover:bg-cyan-400/10'}`}>
              {r.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

