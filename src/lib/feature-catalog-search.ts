/**
 * Search for the Feature Catalog. Builds a token index once, then ranks systems for a query.
 *
 * A query matches when every meaningful word matches somewhere in a system, by word prefix
 * ("fish" finds "fishing") after light plural stemming ("applications" finds "application").
 * Filler words from natural requests ("I want a fishing bot") are ignored, and a few common
 * abbreviations expand to their synonyms. Keep this file dependency-free so Node can test it.
 */
import type { CatalogSystem } from "../data/feature-catalog.ts";

type Field = "name" | "keywords" | "included" | "uses" | "enhancements" | "categories" | "summary" | "shelf";

/** Higher weights rank a system first when the term is in its name or keywords. */
const weights: Record<Field, number> = { name: 12, keywords: 7, uses: 5, included: 5, categories: 3, enhancements: 3, summary: 2, shelf: 1 };

/** Where a match is worth telling the visitor about, in the order a hint prefers. */
const hintFields: { field: Field; label: string }[] = [
  { field: "uses", label: "Can be used for" },
  { field: "included", label: "Included" },
  { field: "enhancements", label: "Optional enhancement" },
];

const stopWords = new Set([
  "a", "an", "and", "any", "are", "be", "bot", "bots", "can", "could", "discord", "do", "does", "feature", "features",
  "for", "get", "have", "help", "how", "i", "id", "im", "in", "is", "it", "like", "looking", "make", "me", "my", "need",
  "of", "on", "or", "our", "please", "server", "servers", "so", "some", "something", "system", "systems", "that", "the",
  "thing", "to", "we", "want", "what", "where", "which", "with", "would", "you", "your",
]);

/** Abbreviations and alternate words. A term matches if it or any synonym matches. */
const synonyms: Record<string, string[]> = {
  qotd: ["question"],
  rp: ["roleplay"],
  roleplaying: ["roleplay"],
  oc: ["character"],
  char: ["character"],
  mod: ["moderation", "staff"],
  mods: ["moderation", "staff"],
  xp: ["level"],
  money: ["currency", "economy"],
  cash: ["currency"],
  pet: ["companion"],
  apps: ["application"],
  app: ["application"],
  website: ["dashboard", "web"],
  site: ["dashboard", "web"],
  schedule: ["scheduling", "calendar"],
  fish: ["fishing"],
  mine: ["mining"],
  pokemon: ["pokemon", "pokedex"],
  login: ["sign"],
  rpg: ["roleplay", "character"],
};

/** Lowercase, strip accents and apostrophes, and split into words. */
export function tokenize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/['’]/g, "").split(/[^a-z0-9]+/).filter(Boolean);
}

/** Light plural stemming, applied to both the index and the query. */
export function stem(word: string) {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && /(ches|shes|sses|xes)$/.test(word)) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !/(ss|us|is)$/.test(word)) return word.slice(0, -1);
  return word;
}

type IndexedText = { text: string; words: string[] };
export type IndexedSystem = { system: CatalogSystem; fields: Record<Field, IndexedText[]> };

export function buildIndex(systems: CatalogSystem[], labels: { categories: Record<string, string>; shelves: Record<string, string> }): IndexedSystem[] {
  const entry = (text: string): IndexedText => ({ text, words: tokenize(text).map(stem) });
  return systems.map((system) => ({
    system,
    fields: {
      name: [entry(system.name)],
      keywords: (system.keywords ?? []).map(entry),
      included: system.included.map(entry),
      uses: system.uses.map(entry),
      enhancements: system.enhancements.map(entry),
      categories: system.categories.map((id) => entry(labels.categories[id] ?? id)),
      summary: [entry(system.summary)],
      shelf: [entry(labels.shelves[system.shelf] ?? system.shelf)],
    },
  }));
}

/** The meaningful, stemmed words of a query. */
export function queryTerms(query: string) {
  return [...new Set(tokenize(query).filter((word) => !stopWords.has(word)).map(stem))];
}

export type SearchHit = {
  system: CatalogSystem;
  score: number;
  /** A matched line from a section the visitor can't see in the collapsed row, if any. */
  hint?: { label: string; text: string };
};

function termMatches(term: string, words: string[]) {
  const options = [term, ...(synonyms[term] ?? []).map(stem)];
  return options.some((option) => words.some((word) => word.startsWith(option)));
}

/** Systems matching every term, best first. An empty query returns every system in catalog order. */
export function search(index: IndexedSystem[], query: string): SearchHit[] {
  const terms = queryTerms(query);
  if (!terms.length) return index.map(({ system }) => ({ system, score: 0 }));
  const hits: SearchHit[] = [];
  for (const { system, fields } of index) {
    let score = 0;
    let hint: SearchHit["hint"];
    let matchedAll = true;
    for (const term of terms) {
      let best = 0;
      for (const field of Object.keys(weights) as Field[]) {
        const match = fields[field].find(({ words }) => termMatches(term, words));
        if (!match) continue;
        // Exact word matches beat prefix matches, so "game" ranks Game Picker over "gameplay".
        const exact = match.words.includes(term) ? 1.25 : 1;
        best = Math.max(best, weights[field] * exact);
      }
      if (!best) { matchedAll = false; break; }
      score += best;
    }
    if (!matchedAll) continue;
    // Point at the specific use or feature that matched when the name doesn't explain it.
    if (!terms.every((term) => termMatches(term, fields.name[0].words))) {
      for (const { field, label } of hintFields) {
        const match = fields[field].find(({ words }) => terms.some((term) => termMatches(term, words)));
        if (match) { hint = { label, text: match.text }; break; }
      }
    }
    hits.push({ system, score, hint });
  }
  return hits.sort((a, b) => b.score - a.score);
}
