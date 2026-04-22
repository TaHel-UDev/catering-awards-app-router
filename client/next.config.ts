import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['lucide-react'],

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'directus-zw8w80skgo4cw4ogk8o048o4.31.130.155.182.sslip.io',
      },
      {
        protocol: 'https',
        hostname: 'admin-panel.tahel-web.ru',
      },
    ],
  },
};

export default nextConfig;
