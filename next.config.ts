import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Root-level dev origins (fixes the HMR block and soft-reloads)
  allowedDevOrigins: [
    "foodnerve.org.localhost",
    "foodnerve.com.localhost",
    "foodnerve.net.localhost",
    "darkpore.localhost",
    "society.foodnerve.com.localhost",
    "society.foodnerve.org.localhost",
    "society.foodnerve.net.localhost",
    "society.localhost",
    "society.192.168.1.105.nip.io",
  ],

  async rewrites() {
    return [
      {
        source: '/:key([a-f0-9]{16,64})\\.txt',
        destination: '/api/seo/indexnow-key?key=:key',
      },
    ];
  },
};

export default nextConfig;
