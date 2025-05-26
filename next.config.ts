import type { NextConfig } from "next";
import { env } from "process";

const nextConfig: NextConfig = {
  allowedDevOrigins: [env.REPLIT_DOMAINS?.split(",")[0] || ""],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
        pathname: '/AZj3csfZ2LFkOMfNCTsVxw/**',
      },
    ],
  },
};

module.exports = nextConfig;
