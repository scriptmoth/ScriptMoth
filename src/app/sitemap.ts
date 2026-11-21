import { embedStyles } from "@/demos/discord/discord-embeds";
import type { MetadataRoute } from "next";
import { carrdTemplates } from "@/demos/carrd/carrd-templates";
import { toyhouseTemplates } from "@/demos/toyhouse/toyhouse-templates";
import { tumblrTemplates } from "@/demos/tumblr/tumblr-templates";
import { wikiTemplates } from "@/demos/wiki/wiki-templates";
import { navigation, siteUrl } from "@/lib/site";
import { catalog } from "@/lib/business/catalog";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];
  const demos = [...carrdTemplates, ...toyhouseTemplates, ...tumblrTemplates, ...wikiTemplates].map(({ slug }) => `/demos/${slug}`);
  const paths = [...navigation.map(({ href }) => href), "/policies", "/portfolio/discord-styles", "/portfolio/discord-embeds", ...embedStyles.map(({ id }) => `/portfolio/discord-embeds/${id.toLowerCase()}`), ...catalog().map(({ slug }) => `/products/${slug}`), ...demos];
  return paths.map((path) => ({ url: new URL(path, siteUrl).href }));
}
