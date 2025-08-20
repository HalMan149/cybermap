"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

type SidebarProps = { title: string; children: ReactNode; isOpen: boolean; onClose: () => void };

export default function Sidebar({ title, children, isOpen, onClose }: SidebarProps) {
  return (
    <motion.aside
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: isOpen ? 0 : 320, opacity: isOpen ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      className="fixed right-0 top-0 h-full w-80 bg-[#0a233b]/90 backdrop-blur-md border-l border-cyan-400/30 shadow-[0_0_12px_rgba(34,211,238,0.45)] z-[900]"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-400/20">
        <h2 className="text-lg font-semibold text-cyan-200">{title}</h2>
        <button onClick={onClose} className="text-cyan-300 hover:text-white transition-colors">✕</button>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-52px)]">{children}</div>
    </motion.aside>
  );
}

