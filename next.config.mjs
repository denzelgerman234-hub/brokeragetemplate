/** @type {import('next').NextConfig} */
const nextConfig = {
  // Avoid duplicate development mounts and trim large package barrel imports.
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "clsx"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
