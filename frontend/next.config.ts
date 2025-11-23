import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.licdn.com",
      },
      // Add more patterns if needed:
      // {
      //   protocol: "https",
      //   hostname: "another-domain.com",
      // },
    ],
  },
  // ...other config options
};

export default nextConfig;
