import type { NextConfig } from "next";

// Keep Next's floating development controls out of the shared studio preview.
const config: NextConfig = {
  // A second preview server can run alongside `next dev` by setting NEXT_DIST_DIR.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  devIndicators: false,
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  async redirects() {
    return [
      // Renamed demo and retired project pages, so old links and bookmarks don't 404.
      { source: "/services", destination: "/products", permanent: true },
      // Single-Page Website was merged into the One-Page Site package.
      { source: "/products/single-page-website", destination: "/products/carrd-site", permanent: true },
      { source: "/demos/starlit-atelier", destination: "/demos/celestial-observatory", permanent: true },
      { source: "/demos/starfall-codex", destination: "/demos/soft-atelier", permanent: true },
      { source: "/portfolio/:slug((?!discord-styles$|discord-embeds$|discord-embeds/).*)", destination: "/portfolio", permanent: false },
    ];
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }, {
      // Portfolio thumbnails embed the client demo pages, so only those may be framed (same origin only).
      source: "/((?!demos/).*)",
      headers: [{ key: "X-Frame-Options", value: "DENY" }],
    }, {
      source: "/demos/:path*",
      headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
    }];
  },
};

export default config;
