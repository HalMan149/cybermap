"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MapCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link href={href} className="block">
      <motion.div whileHover={{ y: -4, scale: 1.01 }} className="rounded-xl border border-cyan-400/20 bg-[#0a233b]/70 backdrop-blur-md p-4 shadow-[0_0_12px_rgba(34,211,238,0.45)] hover:border-cyan-300/40 transition-colors h-full">
        <div className="h-40 rounded-lg bg-gradient-to-br from-cyan-500/20 via-emerald-500/10 to-fuchsia-500/20 mb-4" />
        <h3 className="text-cyan-200 font-semibold">{title}</h3>
        <p className="text-cyan-100/80 text-sm mt-1">{description}</p>
      </motion.div>
    </Link>
  );
}



