import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "foodnerve.com",
        "darkpore.com",
        "foodnerve.org",
      ],
    },
  },

};

export default nextConfig;
