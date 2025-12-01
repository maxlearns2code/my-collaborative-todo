import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.licdn.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      // add more if you switch to other avatar sources:
      // {
      //   protocol: "https",
      //   hostname: "avatars.githubusercontent.com",
      // },
    ],
  },
};

export default nextConfig;
