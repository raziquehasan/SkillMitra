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
};

export default nextConfig;
