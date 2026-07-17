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


};

export default nextConfig;
