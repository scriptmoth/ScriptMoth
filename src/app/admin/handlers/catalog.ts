import { catalog, categoryArt, plans, saveProduct } from "@/lib/business/catalog";
import { builderOptions } from "@/lib/business/builder";
import { readPricingRules } from "@/lib/business/price-rules-validation";
import { run } from "@/lib/business/db";
import { parseFaqLine } from "@/data/faq";
import { amount, list, productCategories, productStatuses, projectTypes, webUrl } from "@/lib/business/rules";
import type { AdminHandlerCtx } from "./context";

export function handleProduct({ form, get, id, reference, files }: AdminHandlerCtx) {
  const previous = catalog(false).find(item => item.id === reference);
  if (reference && !previous) throw new Error("Package not found.");
  const slug = get("slug", 75, true);
  const status = get("status");
  const category = get("category");
  const projectType = get("project_type");
  const pricing = get("pricing");
  const cents = get("price") ? amount(get("price")) : null;
  const order = get("featured_order");
  const faq = list(get("faq", 5000)).map(item => {
    const parsed = parseFaqLine(item);
    if (!parsed) throw new Error("Check product options and FAQ formatting. Use one “question | answer” per line.");
    return `${parsed.question} | ${parsed.answer}`;
  });
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || catalog(false).some(item => item.slug === slug && item.id !== id)) throw new Error("Use a unique lowercase URL slug.");
  if (!productStatuses.some(item => item === status) || !productCategories.some(item => item === category) ||
    !Object.hasOwn(projectTypes, projectType) || (pricing !== "quote" && pricing !== "fixed") || (pricing === "fixed" && cents === null) ||
    (order && !/^\d{1,4}$/.test(order))) throw new Error("Check product options and FAQ formatting.");
  const retained = form.getAll("keep_image").map(String).filter(value => previous?.images.includes(value));
  if (retained.length + files.length > 12) throw new Error("Use at most 12 screenshots per product.");
  for (const image of files) run("INSERT INTO product_images VALUES (?,?,?)", image.id, image.type, image.bytes);
  saveProduct({
    id, slug, status, category, projectType: projectType as keyof typeof projectTypes,
    title: get("title", 100, true), summary: get("summary", 300, true), description: get("description", 6000, true),
    cents, pricing, featured_order: order ? Number(order) : null, art: previous?.art ?? categoryArt(category),
    included: list(get("included", 5000)), extras: get("extras", 4000), delivery: get("delivery"),
    requirements: list(get("requirements", 4000)), demo: get("demo", 2000) ? webUrl(get("demo", 2000)) : "",
    related: list(get("related", 2000)), faq, images: [...retained, ...files.map(image => image.id)],
    revisions: get("revisions"), support: get("support", 2000), placeholder: form.get("placeholder") === "yes",
  });
  for (const image of previous?.images ?? []) if (!retained.includes(image)) run("DELETE FROM product_images WHERE id=?", image);
  run("INSERT OR REPLACE INTO business_settings VALUES (?,?)", `builder_product_${id}`, form.get("builder") === "yes" ? "yes" : "no");
}

export function handleQuoteOption({ form, get, id }: AdminHandlerCtx) {
  const type = get("project_type");
  const kind = get("kind");
  if (!Object.hasOwn(projectTypes, type) || !["base", "feature", "addon", "recurring"].includes(kind)) throw new Error("Choose a project type and line type.");
  const cents = get("price") ? amount(get("price")) : null;
  const active = Number(form.get("active") === "yes");
  const rules = readPricingRules(form);
  const options = builderOptions(true);
  const old = options.find(item => item.id === id);
  const siblings = options.filter(item => item.project_type === type && item.id !== id);
  if (old && (old.project_type !== type || old.kind !== kind)) throw new Error("Create a new option to change the project type or pricing kind.");
  if (kind === "base" && siblings.some(item => item.kind === "base")) throw new Error("Edit the existing base for this project type.");
  if ([...rules.requires ?? [], ...rules.conflicts ?? [], ...rules.suggests ?? []].some(key => !siblings.some(item => item.id === key && item.kind !== "base"))) throw new Error("Use option IDs from this project type for dependency, conflict, and suggestion rules.");
  const byId = new Map(siblings.map(item => [item.id, item]));
  const visited = new Set<string>();
  const reachesSelf = (key: string): boolean => {
    if (key === id) return true;
    if (visited.has(key)) return false;
    visited.add(key);
    return Boolean(byId.get(key)?.requires?.some(reachesSelf));
  };
  if (rules.requires?.some(reachesSelf)) throw new Error("Dependencies cannot form a loop.");
  run(`INSERT INTO quote_options VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET
    project_type=excluded.project_type,label=excluded.label,kind=excluded.kind,cents=excluded.cents,active=excluded.active`,
  id, type, get("label", 120, true), kind, cents, active);
  run("INSERT OR REPLACE INTO builder_rules VALUES (?,?)", id, JSON.stringify(rules));
}

export function handleHostingPlan({ get, id, reference }: AdminHandlerCtx) {
  if (reference && !plans().some(plan => plan.id === id)) throw new Error("Plan not found.");
  const providerPrice = get("provider_price");
  if (providerPrice && !/^price_[A-Za-z0-9]+$/.test(providerPrice)) throw new Error("Enter a Stripe Price ID.");
  const title = get("title", 120, true);
  const data = { cents: get("price") ? amount(get("price")) : null, services: get("services", 3000, true),
    limits: get("limits", 1500), backups: get("backups", 1500), coverage: get("coverage", 1500), cancellation: get("cancellation", 1500), providerPrice };
  run("INSERT INTO hosting_plans VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,data=excluded.data", id, title, JSON.stringify(data));
}