import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Geo Dashboard',
  description: 'Dashboard geoespacial con mapas interactivos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}

