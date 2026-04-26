import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@azure/cosmos"],
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
