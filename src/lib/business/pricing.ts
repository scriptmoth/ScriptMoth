import type { QuoteOption } from "./rules";

export type CustomField = { key: string; label: string; choices?: string[] };
export type ComplexityOption = { label: string; cents: number; description?: string };
export type PricingRules = {
  category?: string; order?: number; max?: number; min?: number; tiers?: { from: number; cents: number }[];
  setup?: number; requires?: string[]; conflicts?: string[]; suggests?: string[];
  fields?: CustomField[]; note?: string;
  /** Explicitly priced upgrades, added to the unit price. `standard` names the level that is included. */
  complexity?: ComplexityOption[]; standard?: { label: string; description?: string };
  /** A starting price that is confirmed after review. */
  manual?: boolean; discount?: number; minimum?: number; default?: boolean;
  /** Plain-language copy for customers. */
  description?: string; example?: string; time?: string;
  /** Shared infrastructure keys (set up once) and third-party accounts the customer may need. */
  needs?: string[]; thirdParty?: string[];
  /** No price has been set yet. Shown as "price pending review", never as free. */
  unpriced?: boolean;
  /** Additional page features whose names must not repeat a selected named page. */
  pageNames?: boolean;
  /** Base packages: feature IDs covered by the package price. With `choose`, only that many units are covered.
   *  `always` lists features that come with the package on top of the chosen ones. */
  includes?: PackageIncludes;
};
export type PackageIncludes = { ids: string[]; choose?: number; always?: string[] };
export type Feature = QuoteOption & PricingRules;
export type Selection = { id: string; quantity: number; complexity?: string; settings?: Record<string, string> };
export type PriceLine = {
  id: string; label: string; quantity: number; cents: number | null;
  kind: QuoteOption["kind"] | "setup" | "discount" | "minimum";
  /** Amount covered by the base package. */
  included?: number; listed?: number | null; complexity?: string;
};

export function resolvedBase(features: Feature[], item?: {
  slug: string; title: string; recurring: boolean; cents: number | null; includes?: PackageIncludes; manual?: boolean; needs?: string[];
}): Feature | undefined {
  const base = features.find(feature => feature.kind === "base");
  if (!item) return base;
  return { ...base, id: item.slug, label: item.title, kind: item.recurring ? "recurring" : "base", cents: item.cents,
    manual: item.recurring ? false : item.manual ?? base?.manual, includes: item.includes, needs: item.needs ?? base?.needs };
}

export function parseSelections(value: string): Selection[] {
  const source: unknown = JSON.parse(value);
  if (!Array.isArray(source) || source.length > 100) throw new Error("Check your selected features.");
  const seen = new Set<string>();
  return source.map(item => {
    if (!item || typeof item.id !== "string" || item.id.length > 120 || seen.has(item.id) ||
      !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100 ||
      (item.complexity !== undefined && (typeof item.complexity !== "string" || item.complexity.length > 60))) {
      throw new Error("Check your feature quantities and settings.");
    }
    seen.add(item.id);
    const settings: Record<string, string> = Object.create(null);
    if (item.settings !== undefined) {
      if (!item.settings || Array.isArray(item.settings) || typeof item.settings !== "object") throw new Error("Check feature customization.");
      const entries = Object.entries(item.settings);
      if (entries.length > 10) throw new Error("Too many custom settings.");
      for (const [key, value] of entries) {
        if (!/^[a-z][a-z0-9_-]{0,39}$/.test(key) || typeof value !== "string" || value.length > 500) throw new Error("Check feature customization.");
        settings[key] = value.trim();
      }
    }
    return { id: item.id, quantity: item.quantity, complexity: item.complexity, settings };
  });
}

const unitPrice = (item: Feature, quantity: number) =>
  [...(item.tiers ?? [])].sort((a, b) => b.from - a.from).find(tier => quantity >= tier.from)?.cents ?? item.cents;

/** Which units of which features the base package pays for. Customers always get the most valuable eligible units. */
export function packageCoverage(base: Feature | undefined, lookup: Map<string, Feature>, selected: Selection[]) {
  const covered = new Map<string, number>();
  const includes = base?.includes;
  if (!includes) return { covered, fixed: [] as string[] };
  const fixed = (includes.choose ? includes.always ?? [] : [...includes.ids, ...includes.always ?? []]).filter(id => lookup.has(id));
  for (const id of fixed) covered.set(id, 1);
  if (!includes.choose) return { covered, fixed };
  const units = selected.filter(item => includes.ids.includes(item.id)).flatMap(item => {
    const feature = lookup.get(item.id);
    const unit = feature ? unitPrice(feature, item.quantity) : null;
    return unit === null ? [] : Array.from({ length: item.quantity }, () => ({ id: item.id, unit }));
  }).sort((a, b) => b.unit - a.unit || a.id.localeCompare(b.id)).slice(0, includes.choose);
  for (const unit of units) covered.set(unit.id, (covered.get(unit.id) ?? 0) + 1);
  return { covered, fixed };
}

export function priceBuild(options: Feature[], selected: Selection[], base?: Feature) {
  const lookup = new Map(options.filter(item => item.kind !== "base").map(item => [item.id, item]));
  const configured = new Map(selected.map(item => [item.id, item]));
  const { covered, fixed } = packageCoverage(base, lookup, selected);
  const available = new Set([...configured.keys(), ...fixed]);
  const lines: PriceLine[] = [];
  const review = new Set<string>();
  const custom = new Set<string>();
  const provisional = new Set<string>();
  const issues: { id: string; related?: string; message: string }[] = [];
  const used: Feature[] = base ? [base] : [];
  const append = (item: Feature, quantity: number, complexity?: { label: string; cents: number }) => {
    const unit = unitPrice(item, quantity);
    const adjustment = complexity?.cents ?? 0;
    const coveredUnits = Math.min(covered.get(item.id) ?? 0, quantity);
    const listed = unit === null ? null : (unit + adjustment) * quantity;
    const included = coveredUnits ? (unit ?? 0) * coveredUnits : 0;
    const cents = listed !== null ? listed - included : coveredUnits === quantity && !adjustment ? 0 : null;
    lines.push({ id: item.id, label: item.label, quantity, kind: item.kind, cents, listed, complexity: complexity?.label, included: coveredUnits ? included : undefined });
    if (item.setup) lines.push({ id: item.id + ":setup", label: item.label + " setup", quantity: 1, kind: "setup", cents: item.setup });
    used.push(item);
    if (cents === null) { review.add(item.label); custom.add(item.label); }
    else if (item.manual && cents > 0) { review.add(item.label); provisional.add(item.label); }
  };
  if (base) {
    append(base, 1);
    used.pop();
  } else review.add("Project starting price");
  for (const id of fixed) if (!configured.has(id)) append(lookup.get(id)!, 1);

  const pageFeatures = selected.filter(item => lookup.get(item.id)?.pageNames);
  if (pageFeatures.length) {
    const normalize = (label: string) => label.toLowerCase().replace(/[^a-z0-9 -]/g, "").trim().replace(/ (web )?page$/, "");
    const namedPages = options.filter(item => item.category === "Pages" && !item.pageNames && item.kind !== "base" && available.has(item.id));
    const reserved = new Set(["home", "homepage", ...namedPages.map(item => normalize(item.label))]);
    const names: string[] = [];
    for (const pages of pageFeatures) {
      const listed = (pages.settings?.names ?? "").split(/[,\n]/).map(normalize).filter(Boolean);
      if (namedPages.length && listed.length !== pages.quantity) {
        issues.push({ id: pages.id, message: `Name each ${lookup.get(pages.id)!.label.toLowerCase()} to keep it separate from the named pages you selected.` });
      }
      names.push(...listed);
    }
    if (new Set(names).size !== names.length || names.some(name => reserved.has(name))) {
      issues.push({ id: pageFeatures[0].id, message: "Additional pages must have distinct names and exclude the homepage and selected named pages." });
    }
  }
  for (const selection of selected) {
    const item = lookup.get(selection.id);
    if (!item) {
      issues.push({ id: selection.id, message: "A saved feature is unavailable. Remove it and choose again." });
      continue;
    }
    if (selection.quantity < (item.min ?? 1) || selection.quantity > (item.max ?? 1)) {
      issues.push({ id: item.id, message: `${item.label} supports quantities from ${item.min ?? 1} to ${item.max ?? 1}.` });
      continue;
    }
    const complexity = item.complexity?.find(option => option.label === selection.complexity);
    if (selection.complexity && !complexity) issues.push({ id: item.id, message: `Choose a current complexity option for ${item.label}.` });
    for (const [key, value] of Object.entries(selection.settings ?? {})) {
      const definition = item.fields?.find(field => field.key === key);
      if (!definition || (value && definition.choices && !definition.choices.includes(value))) {
        issues.push({ id: item.id, message: `Check the customization for ${item.label}.` });
      }
    }
    for (const dependency of item.requires ?? []) {
      if (!available.has(dependency)) issues.push({ id: item.id, related: dependency, message: `${item.label} needs ${lookup.get(dependency)?.label ?? "a feature that is currently unavailable"}.` });
    }
    for (const conflict of item.conflicts ?? []) {
      if (available.has(conflict)) issues.push({ id: item.id, related: conflict, message: `${item.label} and ${lookup.get(conflict)?.label ?? "a selected feature"} cannot be combined.` });
    }
    append(item, selection.quantity, complexity);
  }
  const sum = (kinds: PriceLine["kind"][]) => lines.reduce((total, line) => total + (kinds.includes(line.kind) ? line.cents ?? 0 : 0), 0);
  const subtotal = sum(["base", "feature", "addon", "setup"]);
  const monthly = sum(["recurring"]);
  const setup = sum(["setup"]);
  const discount = Math.min(base?.discount ?? 0, subtotal);
  if (discount) lines.push({ id: "discount", label: "Package discount", quantity: 1, kind: "discount", cents: -discount });
  const minimum = Math.max((base?.minimum ?? 0) - (subtotal - discount), 0);
  if (minimum) lines.push({ id: "minimum", label: "Minimum order adjustment", quantity: 1, kind: "minimum", cents: minimum });
  const development = sum(["base", "feature", "discount", "minimum"]);
  const group = (key: "needs" | "thirdParty") => {
    const map = new Map<string, string[]>();
    for (const item of used) for (const entry of item[key] ?? []) map.set(entry, [...(map.get(entry) ?? []), item.label]);
    return [...map].map(([name, by]) => ({ name, by: [...new Set(by)] }));
  };
  return {
    lines, subtotal, monthly, setup, discount, total: subtotal - discount + minimum,
    review: [...review], custom: [...custom], provisional: [...provisional], issues,
    buckets: { development, setup: sum(["addon", "setup"]), monthly },
    needs: group("needs"), thirdParty: group("thirdParty"),
  };
}
export type PriceResult = ReturnType<typeof priceBuild>;

/** Features that would lose a requirement if `id` were removed. */
export function dependents(options: Feature[], selected: Selection[], id: string) {
  const picked = new Set(selected.map(item => item.id));
  return options.filter(item => picked.has(item.id) && item.id !== id && item.requires?.includes(id));
}
/** Requirements of `id` that are not yet selected or included. */
export function missingRequirements(options: Feature[], selected: Selection[], id: string, base?: Feature) {
  const lookup = new Map(options.filter(item => item.kind !== "base").map(item => [item.id, item]));
  const { fixed } = packageCoverage(base, lookup, selected);
  const have = new Set([...selected.map(item => item.id), ...fixed]);
  const missing: Feature[] = [];
  const visit = (current: string) => {
    for (const dependency of lookup.get(current)?.requires ?? []) {
      const feature = lookup.get(dependency);
      if (!feature || have.has(dependency) || missing.includes(feature)) continue;
      missing.push(feature);
      visit(dependency);
    }
  };
  visit(id);
  return missing;
}

/** Shareable build links. Contact and attachment fields are never included. */
export type SharedBuild = { type: string; product: string; hosting: string; selection: Selection[] };
const toBase64Url = (text: string) => btoa(String.fromCharCode(...new TextEncoder().encode(text))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromBase64Url = (text: string) => new TextDecoder().decode(Uint8Array.from(atob(text.replace(/-/g, "+").replace(/_/g, "/")), char => char.charCodeAt(0)));
export function encodeBuild(build: SharedBuild) {
  return toBase64Url(JSON.stringify({ v: 1, t: build.type, p: build.product, h: build.hosting,
    s: build.selection.map(item => [item.id, item.quantity, item.complexity ?? "", item.settings && Object.keys(item.settings).length ? item.settings : 0]) }));
}
export function decodeBuild(value: string): SharedBuild | undefined {
  try {
    if (value.length > 12000) return undefined;
    const data = JSON.parse(fromBase64Url(value));
    if (data?.v !== 1 || typeof data.t !== "string" || typeof data.p !== "string" || typeof data.h !== "string" || !Array.isArray(data.s)) return undefined;
    const selection = parseSelections(JSON.stringify(data.s.map((item: unknown[]) => ({
      id: item[0], quantity: item[1], complexity: item[2] || undefined, settings: item[3] || undefined,
    }))));
    // Plain objects only, so the build can be passed from a server component to the client builder.
    return { type: data.t, product: data.p, hosting: data.h, selection: selection.map(item => ({ ...item, settings: { ...item.settings } })) };
  } catch { return undefined; }
}
