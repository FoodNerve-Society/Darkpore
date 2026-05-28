import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: [
      'foodnerve.org.localhost',
      'foodnerve.com.localhost',
      'darkpore.localhost',
    ],
  },
};

export default nextConfig;
