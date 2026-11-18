import type { MetadataRoute } from "next";
import { carrdTemplates } from "@/data/carrd-templates";
import { toyhouseTemplates } from "@/data/toyhouse-templates";
import { tumblrTemplates } from "@/data/tumblr-templates";
import { navigation, siteUrl } from "@/lib/site";
import { catalog } from "@/lib/business/catalog";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];
  const demos = [...carrdTemplates, ...toyhouseTemplates, ...tumblrTemplates].map(({ slug }) => `/demos/${slug}`);
  const paths = [...navigation.map(({ href }) => href), "/services", "/policies", "/portfolio/discord-styles", ...catalog().map(({ slug }) => `/products/${slug}`), ...demos];
  return paths.map((path) => ({ url: new URL(path, siteUrl).href }));
}
