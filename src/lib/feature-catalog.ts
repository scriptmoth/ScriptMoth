import { shelves, systems, type CatalogSystem } from "@/data/feature-catalog";

export const systemsById = new Map(systems.map((system) => [system.id, system]));
const quoteTypes = new Map<string, string>(shelves.map(({ id, quoteType }) => [id, quoteType]));
// A roleplay system makes the whole request a roleplay bot; otherwise a bot beats a standalone web app.
const typePriority = ["roleplay-bot", "discord-bot", "web-app"];

/** Link into the quote builder with the chosen systems carried into the notes field. */
export function inquiryHref(picked: CatalogSystem[], idea?: string) {
  const types = new Set(picked.map(({ shelf }) => quoteTypes.get(shelf)));
  const type = typePriority.find((item) => types.has(item)) ?? (idea ? "other" : "discord-bot");
  const params = new URLSearchParams({ type });
  if (picked.length) params.set("systems", picked.map(({ id }) => id).join(","));
  if (idea) params.set("idea", idea.slice(0, 200));
  return `/contact?${params}`;
}

/** Notes text for /contact?systems=…&idea=…, or undefined when neither names anything usable. */
export function inquiryNotes(systemsParam?: string, idea?: string) {
  const names = (systemsParam ?? "").split(",").slice(0, 40).map((id) => systemsById.get(id.trim())?.name).filter(Boolean);
  const lines = [];
  if (names.length) lines.push(`From the Feature Catalog, I’m interested in: ${names.join(", ")}.`);
  const cleanIdea = idea?.replace(/\s+/g, " ").trim().slice(0, 200);
  if (cleanIdea) lines.push(`I searched the catalog for: “${cleanIdea}”.`);
  return lines.length ? lines.join("\n") : undefined;
}
