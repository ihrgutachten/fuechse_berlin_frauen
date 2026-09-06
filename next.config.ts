import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["unpdf"],
  // Cloud/agent browsers often hit 127.0.0.1 while the server listens as localhost.
  // Without this, /_next/static chunks get 403 → blank white page.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
