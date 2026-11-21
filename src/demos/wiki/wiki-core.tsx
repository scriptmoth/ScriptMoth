"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Artwork } from "@/lib/assets";
import { findWikiCharacter, findWikiPlace, searchWiki, wikiCharacters, wikiTags, wikiTimeline, type WikiTemplate } from "@/demos/wiki/wiki-templates";

export type Route =
  | { view: "home" }
  | { view: "characters"; tag?: string }
  | { view: "character"; slug: string }
  | { view: "places" }
  | { view: "place"; slug: string }
  | { view: "timeline" };

export type Go = (route: Route) => void;

export interface SkinProps {
  template: WikiTemplate;
  route: Route;
  go: Go;
  random: () => void;
}

const home: Route = { view: "home" };
const tags = new Set(wikiTags().map(({ tag }) => tag));
const emptyHash = () => "";
const browserHash = () => window.location.hash;

function subscribeToRoute(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
  };
}

function parseRoute(hash: string): Route {
  const [path, query] = hash.slice(1).split("?");
  const [view, slug, extra] = path.split("/");
  if (extra !== undefined) return home;
  if (view === "character" && slug && findWikiCharacter(slug)) return { view, slug };
  if (view === "place" && slug && findWikiPlace(slug)) return { view, slug };
  if (slug !== undefined) return home;
  if (view === "characters") {
    const tag = new URLSearchParams(query).get("tag");
    return tag && tags.has(tag) ? { view, tag } : { view };
  }
  if (view === "places" || view === "timeline") return { view };
  return home;
}

function routeHash(route: Route): string {
  switch (route.view) {
    case "home": return "";
    case "character":
    case "place": return `#${route.view}/${route.slug}`;
    case "characters": return route.tag ? `#characters?${new URLSearchParams({ tag: route.tag })}` : "#characters";
    default: return `#${route.view}`;
  }
}

export function useWikiRouter(interactive: boolean) {
  const hash = useSyncExternalStore(subscribeToRoute, interactive ? browserHash : emptyHash, emptyHash);
  const route = parseRoute(hash);
  const root = useRef<HTMLDivElement>(null);

  const go: Go = (next) => {
    if (!interactive) return;
    const target = routeHash(next);
    if (target !== browserHash()) {
      window.history.pushState(null, "", `${window.location.pathname}${window.location.search}${target}`);
      window.dispatchEvent(new Event("hashchange"));
    }
    const top = root.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) root.current?.scrollIntoView({ block: "start" });
  };

  const random = () => {
    const others = wikiCharacters.filter((c) => route.view !== "character" || c.slug !== route.slug);
    go({ view: "character", slug: others[Math.floor(Math.random() * others.length)].slug });
  };

  return { route, go, random, root };
}

/** Search box state. `open` jumps to a result and clears the box. */
export function useWikiSearch(go: Go) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchWiki(query), [query]);
  const open = (kind: "character" | "place", slug: string) => {
    setQuery("");
    go({ view: kind, slug });
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && results[0]) open(results[0].kind, results[0].slug);
    if (event.key === "Escape") setQuery("");
  };
  return { query, setQuery, results, open, onKeyDown, active: query.trim().length > 0 };
}

export function filterCharacters(query: string, tag?: string) {
  const needle = query.trim().toLowerCase();
  return wikiCharacters.filter((character) =>
    (!tag || character.tags.includes(tag)) &&
    (!needle || [character.name, character.title, character.summary, ...character.tags].some((value) => value.toLowerCase().includes(needle))));
}

export const eventsForCharacter = (slug: string) => wikiTimeline.filter((event) => event.characters.includes(slug));
export const eventsForPlace = (slug: string) => wikiTimeline.filter((event) => event.place === slug);
export const timelineEras = () => [...new Set(wikiTimeline.map((event) => event.era))];
export const field = (fields: { label: string; value: string }[], label: string) => fields.find((f) => f.label === label)?.value ?? "";

/** "foxfolk" → "Foxfolk", "gate-road" → "Gate road". */
export const tagLabel = (tag: string) => tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, " ");

export function Pic({ art, alt = "", className, lazy = true }: { art: Artwork; alt?: string; className?: string; lazy?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={art.src} alt={alt} width={art.width} height={art.height} className={className} loading={lazy ? "lazy" : undefined} />;
}
