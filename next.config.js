/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Static export for Capacitor native apps
  
  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },
}
module.exports = nextConfig
