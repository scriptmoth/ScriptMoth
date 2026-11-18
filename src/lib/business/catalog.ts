/**
 * Runtime catalog: merges seed products and hosting plans from `data/catalog.ts`
 * with database overrides. Prefer this module for pages and admin; edit seeds in
 * `data/builder.ts` (packages) and `data/catalog.ts` (listing metadata / hosting).
 */
import { products, hostingPlans } from "@/data/catalog";
import { assets, type Artwork } from "@/lib/assets";
import { all, databaseConfigured, one, run } from "./db";
import { availabilityOptions, projectTypes, type ProjectType } from "./rules";

export type Product = {
  id: string; slug: string; status: string; featured_order: number | null;
  title: string; category: string; projectType: ProjectType; summary: string;
  description: string; cents: number | null; pricing: "fixed" | "quote";
  included: string[]; extras: string; delivery: string; requirements: string[];
  images: string[]; demo: string; related: string[]; faq: string[];
  revisions: string; support: string; art: Artwork; placeholder: boolean;
};
type ProductRow = Pick<Product, "id" | "slug" | "status" | "featured_order"> & { data: string };
const featured = ["custom-discord-bot", "personal-website", "oc-wiki"];

const launchProducts: Product[] = products.map(product => ({
  ...product, slug: product.id, status: "published",
  featured_order: featured.includes(product.id) ? featured.indexOf(product.id) : null,
  cents: product.price * 100, pricing: "quote",
  description: product.summary, delivery: "", requirements: [], images: [], related: [], faq: [], demo: product.demo ?? "",
  revisions: "One review round", support: "14 days to report bugs in agreed features", placeholder: true,
}));

export function saveProduct(product: Product) {
  const { id, slug, status, featured_order, ...data } = product;
  run(`INSERT INTO products (id,slug,status,featured_order,data) VALUES (?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,status=excluded.status,featured_order=excluded.featured_order,data=excluded.data`,
  id, slug, status, featured_order, JSON.stringify(data));
}
export function catalog(publishedOnly = true): Product[] {
  const stored = databaseConfigured() ? all<ProductRow>("SELECT * FROM products") : [];
  const products = new Map(launchProducts.map(product => [product.id, product]));
  for (const { data, ...keys } of stored) products.set(keys.id, { ...JSON.parse(data), ...keys });
  return [...products.values()].filter(product => !publishedOnly || (setting("show_catalog", "yes") === "yes" && product.status === "published"))
    .sort((a, b) => (a.featured_order ?? Infinity) - (b.featured_order ?? Infinity) || a.title.localeCompare(b.title));
}
export type HostingPlan = {
  id: string; title: string; cents: number | null; services: string; limits: string; backups: string;
  coverage: string; cancellation: string; providerPrice: string;
};
export function plans() {
  const defaults: HostingPlan[] = hostingPlans.map(plan => ({
    id: plan.id, title: plan.title, cents: plan.price === null ? null : plan.price * 100,
    services: plan.summary, limits: "", backups: "", coverage: "", cancellation: "", providerPrice: "",
  }));
  const result = new Map(defaults.map(plan => [plan.id, plan]));
  if (databaseConfigured()) {
    for (const row of all<{ id: string; title: string; data: string }>("SELECT * FROM hosting_plans")) {
      result.set(row.id, { ...JSON.parse(row.data), id: row.id, title: row.title });
    }
  }
  return [...result.values()];
}
export const setting = (key: string, fallback = "") => databaseConfigured()
  ? one<{ value: string }>("SELECT value FROM business_settings WHERE key=?", key)?.value ?? fallback : fallback;
export const availability = () => setting("availability", availabilityOptions[0]);
export const currency = () => setting("currency", "USD");
export const categoryArt = (category: string) => ({
  "Discord Bots": assets.bot, "Discord Servers": assets.community,
  "Roleplay & Community Systems": assets.community,
  Websites: assets.websites, Hosting: assets.hosting,
}[category] ?? assets.coding);

/** Prefill aliases from older marketing links. */
const legacy: Record<string, ProjectType> = {
  websites: "personal-site", discord: "discord-bot", "discord-setup": "discord-setup", community: "roleplay-bot",
};
export function quoteSelection(prefill: string) {
  const product = catalog().find(item => item.slug === prefill);
  const plan = plans().find(item => item.id === prefill);
  const type = product?.projectType ?? (plan ? "hosting" : legacy[prefill] ?? (Object.hasOwn(projectTypes, prefill) ? prefill as ProjectType : ""));
  return { type, product, plan };
}
