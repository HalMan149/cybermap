"use client";
const feeds = [
  { label: 'AIA 304Å', src: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0304.jpg' },
  { label: 'AIA 171Å', src: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0171.jpg' },
  { label: 'AIA 193Å', src: 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0193.jpg' }
];

export default function SDOPanel() {
  return (
    <div className="space-y-3">
      {feeds.map(f => (
        <div key={f.label} className="rounded-xl border border-cyan-400/20 bg-[#0a233b]/70 p-3 shadow-[0_0_12px_rgba(34,211,238,0.45)]">
          <div className="text-sm text-cyan-200 font-medium mb-2">{f.label}</div>
          <img src={f.src} alt={f.label} className="w-full h-auto rounded-md" />
        </div>
      ))}
    </div>
  );
}



