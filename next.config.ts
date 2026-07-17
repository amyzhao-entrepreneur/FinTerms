import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Rocket Ride's ws stack out of the Next bundler (avoids bufferUtil.mask errors).
  serverExternalPackages: ["rocketride", "ws", "bufferutil", "utf-8-validate"],
};

export default nextConfig;
