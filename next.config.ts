import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // XLSX xử lý file hệ thống ở server/build time.
  // Externalize để Next/Turbopack dùng package Node.js nguyên bản thay vì bundle lại.
  serverExternalPackages: ["xlsx"],
};

export default nextConfig;
