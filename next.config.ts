import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/github-trending',
  images: { unoptimized: true },
};

export default nextConfig;
