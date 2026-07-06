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
  experimental: {
    serverActions: {
      allowedOrigins: [
        "foodnerve.com",
        "darkpore.com",
        "foodnerve.org",
        "foodnerve.net",
        "www.foodnerve.com",
        "www.darkpore.com",
        "www.foodnerve.org",
        "www.foodnerve.net",
      ],
    },
  },

};

export default nextConfig;
