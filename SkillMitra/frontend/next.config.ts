import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable webpack cache to avoid permission issues
  webpack: (config) => {
    config.cache = false;
    return config;
  },
  // Disable image optimization to fix Docker filesystem issues
  images: {
    unoptimized: true,
  },
  // Add empty turbopack config to avoid conflicts with webpack config
  turbopack: {},
  // Allow browser preview in development
  allowedDevOrigins: ['127.0.0.1'],
  // API rewrites to proxy backend requests
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
