import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Scriptmoth",
    short_name: "Scriptmoth",
    start_url: "/",
    display: "standalone",
    background_color: "#1e1128",
    theme_color: "#1e1128",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
