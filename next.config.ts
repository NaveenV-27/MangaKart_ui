import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // ⚠️ WARNING: This allows images from ANY external domain and is discouraged.
    // It's much safer to list the specific domains, like in your original file,
    // but using the modern 'remotePatterns' syntax.
    remotePatterns: [
      // {
      //   protocol: 'http',
      //   hostname: '**', // Matches all hostnames for http
      // },
      {
        protocol: 'https',
        hostname: '**', // Matches all hostnames for https
      },
    ],
  },
};

export default nextConfig;
