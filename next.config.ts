import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 uses Turbopack by default.
  // Empty turbopack config satisfies the requirement and
  // dynamic(ssr:false) handles react-pdf's browser-only dependencies.
  turbopack: {},
};

export default nextConfig;
