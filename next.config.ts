import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Root-level dev origins (fixes the HMR block and soft-reloads)
  allowedDevOrigins: [
    "foodnerve.org.localhost",
    "foodnerve.com.localhost",
    "darkpore.localhost",
    "society.foodnerve.com.localhost",
    "society.foodnerve.org.localhost",
    "society.localhost",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "foodnerve.com",
        "darkpore.com",
        "foodnerve.org",
        "www.foodnerve.com",
        "www.darkpore.com",
        "www.foodnerve.org",
      ],
    },
  },

};

export default nextConfig;
