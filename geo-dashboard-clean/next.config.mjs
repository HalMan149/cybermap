/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Evita que errores de tipos rompan el build en CI
    ignoreBuildErrors: true,
  },
};

export default nextConfig;


