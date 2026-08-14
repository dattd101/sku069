import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/go": ["./db/link.txt"],
  },
};

export default nextConfig;