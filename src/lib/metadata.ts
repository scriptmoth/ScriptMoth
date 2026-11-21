import type { Metadata } from "next";
import { assets } from "./assets";
import { siteDescription, siteUrl } from "./site";

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    ...(siteUrl ? { alternates: { canonical: path } } : {}),
    openGraph: {
      title: path === "/" ? title : `${title} | Scriptmoth`,
      description,
      siteName: "Scriptmoth",
      type: "website",
      ...(siteUrl ? { url: path, images: [{ url: assets.logo.src, width: assets.logo.width, height: assets.logo.height, alt: "Scriptmoth logo" }] } : {}),
    },
  };
}

export const homeMetadata = pageMetadata("Scriptmoth · Handmade websites & Discord bots", siteDescription, "/");
