/**
 * Static package and hosting seed data.
 *
 * Package titles, prices, summaries, and included lines come from `starterPackages`
 * in `data/builder.ts`. This file adds listing art, categories, and extras.
 * Runtime catalog merges these seeds with the database in `lib/business/catalog.ts`.
 */
import { assets, type Artwork } from "@/lib/assets";

import { starterPackages } from "@/data/builder";
import type { ProjectType } from "@/lib/business/rules";

type Product = {
  id: string;
  title: string;
  price: number;
  art: Artwork;
  summary: string;
  included: string[];
  extras: string;
  projectType: ProjectType;
  category: string;
  demo?: string;
};
const listings: Record<string, { art: Artwork; extras: string; category: string; demo?: string }> = {
  "carrd-site": { art: assets.gallery, category: "Websites", demo: "/portfolio#carrd-sites", extras: "Extra sections, a larger gallery, animations, and a custom domain setup" },
  "toyhouse-profile": { art: assets.gallery, category: "Websites", demo: "/portfolio#toyhouse-profiles", extras: "Extra character pages, matching folder codes, masterlist layouts, and Premium CSS polish checked against Toyhouse’s sanitizer" },
  "tumblr-theme": { art: assets.gallery, category: "Websites", demo: "/portfolio#tumblr-themes", extras: "Extra post types, infinite-scroll polish, custom permalink pages, and appearance-option toggles in the Tumblr editor" },
  "custom-discord-bot": { art: assets.bot, category: "Discord Bots", extras: "Extra modules, branded embeds, moderation, tickets, and Discord server setup" },
  "community-engagement-bot": { art: assets.bot, category: "Discord Bots", extras: "More modules, question review, trivia scoring, moderation, tickets, and Discord server setup" },
  "discord-server-setup": { art: assets.community, category: "Discord Servers", demo: "/portfolio#discord-setup", extras: "Extra embeds, interest roles, existing-server cleanup, and emoji placement" },
  "custom-rp-bot": { art: assets.community, category: "Roleplay & Community Systems", extras: "Inventories, currency, quests, progression, a web dashboard, and Discord server setup" },
  "single-page-website": { art: assets.websites, category: "Websites", extras: "Extra pages, galleries, contact forms, and animations" },
  "personal-website": { art: assets.websites, category: "Websites", extras: "Extra pages, filterable galleries, contact forms, and editable content" },
  "oc-wiki": { art: assets.gallery, category: "Websites", extras: "Timelines, lore articles, relationships, and bulk imports" },
  "community-website": { art: assets.gallery, category: "Websites", extras: "Member accounts, applications, event calendars, and dashboards" },
  "custom-bot-dashboard": { art: assets.community, category: "Websites", extras: "New bot integrations, extra screens, analytics, and multiple servers" },
};

export const products: Product[] = starterPackages.filter(item => item.product && item.dollars !== null).map(item => ({
  id: item.slug, title: item.title, price: item.dollars!, summary: item.summary, included: item.included,
  projectType: item.type, ...listings[item.slug],
}));

export const hostingPlans = [
  {
    id: "basic-hosting",
    title: "Basic Hosting",
    price: 15,
    summary: "Hosting for one small site or bot, with uptime checks.",
  },
  {
    id: "managed-hosting",
    title: "Managed Hosting",
    price: 30,
    summary: "Hosting, monitoring, and help deploying updates.",
  },
  {
    id: "managed-plus",
    title: "Managed Plus",
    price: 60,
    summary: "Monitoring, planned maintenance, routine backups, and support within agreed hours.",
  },
  {
    id: "custom-infrastructure",
    title: "Custom Infrastructure",
    price: null,
    summary: "Hosting for larger bots, databases, or multi-service projects.",
  },
] as const;
