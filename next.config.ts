import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // Public marketing site: server-rendered so titles, headings, links and
  // core copy exist in crawlable HTML (per Blueprint §10 / Homepage §9).
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Enforce one trailing-slash policy across public routes.
  trailingSlash: true,
};

export default nextConfig;
