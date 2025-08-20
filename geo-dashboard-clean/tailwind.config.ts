import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b1021',
        surface: '#0a233b',
        accent: {
          blue: '#22d3ee',
          green: '#34d399',
          magenta: '#e879f9',
        },
      },
      boxShadow: {
        glow: '0 0 12px rgba(34, 211, 238, 0.45)'
      }
    },
  },
  plugins: [],
} satisfies Config

