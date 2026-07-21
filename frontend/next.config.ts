import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    // In development, proxy API calls to the Laravel backend directly.
    // In Docker, Nginx routes /api before requests reach Next.js.
    const backend = process.env.BACKEND_URL ?? "http://localhost:8000";
    return [
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
      { source: "/docs/:path*", destination: `${backend}/docs/:path*` },
    ];
  },
};

export default nextConfig;
