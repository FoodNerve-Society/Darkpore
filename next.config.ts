import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Root-level dev origins (fixes the HMR block and soft-reloads)
  allowedDevOrigins: [
    "foodnerve.org.localhost",
    "foodnerve.com.localhost",
    "darkpore.localhost",
  ],
  // Keep serverActions for any actual form submissions on custom domains
  experimental: {
    serverActions: {
      allowedOrigins: [
        "foodnerve.org.localhost",
        "foodnerve.com.localhost",
        "darkpore.localhost",
      ],
    },
  },

};

export default nextConfig;
