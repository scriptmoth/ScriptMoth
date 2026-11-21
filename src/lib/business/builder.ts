import { createHash } from "node:crypto";
import { builderBases, hiddenFeatures, packageNeeds, seedFeatures, starterPackages } from "@/data/builder";
import { catalog, currency, plans, setting } from "./catalog";
import { all, databaseConfigured } from "./db";
import { priceBuild, resolvedBase, type Feature, type PricingRules, type Selection } from "./pricing";
import { projectTypes, type ProjectType } from "./rules";

type FeatureRow = Feature & { project_type: ProjectType; active: number };
export function builderOptions(includeDisabled = false) {
  const map = new Map<string, FeatureRow>();
  const overrides = databaseConfigured() ? all<{ option_id: string; rules: string }>("SELECT * FROM builder_rules") : [];
  const rules = new Map(overrides.map(row => [row.option_id, JSON.parse(row.rules) as PricingRules]));
  for (const type of Object.keys(projectTypes) as ProjectType[]) {
    const base = builderBases[type];
    const id = `${type}:base`;
    map.set(id, { id, label: base.label, kind: "base", cents: base.dollars === null ? null : base.dollars * 100,
      note: base.summary, description: base.summary, project_type: type, active: 1 });
    for (const item of seedFeatures(type)) map.set(item.id, { ...item, project_type: type, active: 1 });
  }
  if (databaseConfigured()) for (const item of all<FeatureRow>("SELECT * FROM quote_options")) map.set(item.id, { ...map.get(item.id), ...item });
  return [...map.values()].map(item => ({ ...item, ...rules.get(item.id) })).filter(item => includeDisabled || item.active)
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}

export function builderPackages() {
  const products = new Map(catalog().map(product => [product.slug, product]));
  const options = builderOptions();
  return [
    ...starterPackages.flatMap(item => {
      const common = { slug: item.slug, type: item.type, recurring: false, manual: item.manual,
        hidden: hiddenFeatures(item, options.filter(option => option.project_type === item.type)),
        includes: item.includes && { ...item.includes, ids: item.includes.ids.map(id => `${item.type}:${id}`), always: item.includes.always?.map(id => `${item.type}:${id}`) }, needs: packageNeeds[item.slug] };
      if (!item.product) return [{ ...common, title: item.title, cents: item.dollars === null ? null : item.dollars * 100, summary: item.summary, included: item.included }];
      const product = products.get(item.slug);
      if (!product || setting(`builder_product_${product.id}`, "yes") !== "yes") return [];
      return [{ ...common, title: product.title, cents: product.cents, summary: product.summary, included: product.included }];
    }),
    ...plans().map(plan => ({
      slug: plan.id, title: plan.title, cents: plan.cents, type: "hosting" as const, summary: plan.services, included: [] as string[],
      recurring: true, manual: undefined, includes: undefined, needs: undefined, hidden: [] as string[],
    })),
  ];
}
export type BuilderPackage = ReturnType<typeof builderPackages>[number];
export function buildContext(type: ProjectType, product: string) {
  const packages = builderPackages();
  const item = packages.find(item => item.slug === product && item.type === type);
  if (product && !item) throw new Error("That starter package is no longer available. Choose another package.");
  const hidden = new Set(item?.hidden);
  const options: Feature[] = builderOptions().filter(option => option.project_type === type && !hidden.has(option.id));
  if (!options.some(item => item.kind === "base")) throw new Error("This project type is currently unavailable.");
  const base = resolvedBase(options, item);
  const currentCurrency = currency();
  if (type !== "hosting") for (const plan of packages.filter(item => item.recurring)) {
    options.push({ id: `plan:${plan.slug}`, label: plan.title, cents: plan.cents, kind: "recurring", category: "Hosting plans",
      description: plan.summary, note: "Monthly management fee. Provider infrastructure usage and third-party fees are billed separately.",
      conflicts: packages.filter(item => item.recurring && item.slug !== plan.slug).map(item => `plan:${item.slug}`) });
  }
  const version = createHash("sha256").update(JSON.stringify({ engine: 2, options, base, currency: currentCurrency })).digest("hex");
  return { options, base, currency: currentCurrency, version };
}
export function calculateBuild(type: ProjectType, selections: Selection[], product: string) {
  const { options, base, currency, version } = buildContext(type, product);
  const result = priceBuild(options, selections, base);
  return { ...result, currency, pricingVersion: version };
}

/** What a starter package's included builder features would cost one by one, at current builder prices.
 *  For choose-N packages it counts the most valuable picks, matching how coverage is priced. */
export function packageValue(slug: string) {
  const item = starterPackages.find(entry => entry.slug === slug);
  if (!item?.includes) return null;
  const prices = new Map(builderOptions().map(option => [option.id, option.cents]));
  const cents = (ids: string[] = []) => ids.map(id => prices.get(`${item.type}:${id}`) ?? 0);
  const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
  const { ids, choose, always } = item.includes;
  const picked = choose ? cents(ids).sort((a, b) => b - a).slice(0, choose) : cents(ids);
  return { cents: sum(picked) + sum(cents(always)), choose: choose ?? 0 };
}
