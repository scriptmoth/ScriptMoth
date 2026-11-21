"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Castle, Coins, LayoutDashboard, MessagesSquare, Pickaxe, Search, ShieldCheck, Swords, UsersRound, Wrench, X, type LucideIcon } from "lucide-react";
import { ButtonLink, EmptyState } from "@/components/ui";
import { categories, shelves, systems, type CategoryId, type ShelfId } from "@/data/feature-catalog";
import { inquiryHref, systemsById } from "@/lib/feature-catalog";
import { buildIndex, search, type SearchHit } from "@/lib/feature-catalog-search";
import { SystemEntry } from "./system-entry";
import styles from "./catalog.module.css";

type CategoryFilter = "all" | CategoryId;

const index = buildIndex(systems, { categories, shelves: Object.fromEntries(shelves.map(({ id, title }) => [id, title])) });
const categoryIds = Object.keys(categories) as CategoryId[];
const examples = ["fishing", "QOTD", "character applications", "game night", "tickets", "web dashboard"];
const interestKey = "scriptmoth-feature-interest";
const shelfIcons: Record<ShelfId, LucideIcon> = {
  community: MessagesSquare, events: CalendarDays, characters: UsersRound, crafting: Pickaxe, economy: Coins,
  adventure: Swords, world: Castle, moderation: ShieldCheck, utilities: Wrench, web: LayoutDashboard,
};

function readStoredInterest() {
  try {
    const stored = JSON.parse(localStorage.getItem(interestKey) ?? "[]");
    return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === "string" && systemsById.has(id)) : [];
  } catch { return []; }
}

/** Search results grouped by shelf. While searching, the shelf with the best match comes first. */
function groupByShelf(hits: SearchHit[], ranked: boolean) {
  const groups = shelves.map((shelf, position) => ({ shelf, position, hits: hits.filter(({ system }) => system.shelf === shelf.id) }))
    .filter((group) => group.hits.length);
  return ranked ? groups.sort((a, b) => b.hits[0].score - a.hits[0].score) : groups;
}

export function FeatureCatalog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const [interest, setInterest] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState("");
  // Syncing to the URL and storage waits until restored state has rendered, so it never overwrites what it restores.
  const [restored, setRestored] = useState(false);
  const pendingScroll = useRef<string | null>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(query);
  const searching = deferredQuery.trim().length > 0;

  const matches = useMemo(() => search(index, deferredQuery), [deferredQuery]);
  const hits = matches.filter(({ system }) => category === "all" || system.categories.includes(category));
  const groups = groupByShelf(hits, searching);
  const filtered = category !== "all";
  const categoryCounts = useMemo(() => Object.fromEntries(categoryIds.map((id) =>
    [id, matches.filter(({ system }) => system.categories.includes(id)).length])), [matches]);

  // Restore ?q=, ?category=, the saved interest list, and a #system deep link after hydration.
  useEffect(() => {
    function restore() {
      const params = new URLSearchParams(window.location.search);
      const savedCategory = params.get("category");
      setQuery(params.get("q") ?? "");
      if (savedCategory && savedCategory in categories) setCategory(savedCategory as CategoryId);
      setInterest(readStoredInterest());
      const target = decodeURIComponent(window.location.hash.slice(1));
      if (systemsById.has(target)) {
        setOpen(new Set([target]));
        pendingScroll.current = target;
      }
      setRestored(true);
    }
    restore();
  }, []);

  // Keep the URL shareable without adding history entries for every keystroke.
  useEffect(() => {
    if (!restored) return;
    const params = new URLSearchParams();
    if (deferredQuery.trim()) params.set("q", deferredQuery.trim());
    if (category !== "all") params.set("category", category);
    const next = params.size ? `?${params}` : "";
    if (next !== window.location.search) history.replaceState(history.state, "", `${window.location.pathname}${next}${window.location.hash}`);
  }, [restored, deferredQuery, category]);

  useEffect(() => {
    if (!restored) return;
    try { localStorage.setItem(interestKey, JSON.stringify(interest)); } catch {}
  }, [restored, interest]);

  // Scroll to a system after it has been opened by a deep link or a "Pairs well with" jump.
  useEffect(() => {
    const id = pendingScroll.current;
    const entry = id && document.getElementById(id);
    // The entry may not exist until the deferred search catches up with cleared filters.
    if (!entry) return;
    pendingScroll.current = null;
    entry.scrollIntoView({ block: "start" });
    entry.querySelector<HTMLButtonElement>("button[aria-expanded]")?.focus({ preventScroll: true });
  });

  // Press "/" anywhere to jump to the search box.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (event.key !== "/" || event.metaKey || event.ctrlKey || target.closest("input, textarea, select, [contenteditable]")) return;
      event.preventDefault();
      searchInput.current?.focus();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function setHash(id: string | null) {
    const { pathname, search: params } = window.location;
    history.replaceState(history.state, "", `${pathname}${params}${id ? `#${id}` : ""}`);
  }

  function toggle(id: string) {
    const next = new Set(open);
    if (next.has(id)) {
      next.delete(id);
      if (window.location.hash === `#${id}`) setHash(null);
    } else {
      next.add(id);
      setHash(id);
    }
    setOpen(next);
  }

  function jumpTo(id: string) {
    if (!hits.some(({ system }) => system.id === id)) clearAll();
    setOpen(new Set(open).add(id));
    setHash(id);
    pendingScroll.current = id;
  }

  function toggleInterest(id: string) {
    const name = systemsById.get(id)?.name;
    const adding = !interest.includes(id);
    setInterest(adding ? [...interest, id] : interest.filter((item) => item !== id));
    setAnnouncement(adding ? `Added ${name} to your list.` : `Removed ${name} from your list.`);
  }

  function clearAll() {
    setQuery("");
    setCategory("all");
  }

  const picked = interest.map((id) => systemsById.get(id)).filter((system) => system !== undefined);

  return (
    <div className={styles.catalog}>
      <section className={styles.console} aria-label="Search and filter the catalog">
        <div className={styles.consoleBar} aria-hidden="true">
          <span className="window-dots"><i /><i /><i /></span>
          <span>catalog.exe — {systems.length} systems on {shelves.length} shelves</span>
        </div>
        <div className={styles.consoleBody}>
          <label className={styles.searchLabel} htmlFor="catalog-search">What should your bot do?</label>
          <div className={`search-field ${styles.searchField}`}>
            <Search size={20} aria-hidden="true" />
            <input
              ref={searchInput}
              id="catalog-search"
              name="q"
              type="search"
              autoComplete="off"
              spellCheck={false}
              placeholder="Describe it: “a fishing game”, “QOTD”, “character applications”"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-describedby="catalog-search-tip"
            />
            {query ? (
              <button type="button" className={styles.clearSearch} onClick={() => { setQuery(""); searchInput.current?.focus(); }} aria-label="Clear search">
                <X size={18} aria-hidden="true" />
              </button>
            ) : <kbd className={styles.slashKey} aria-hidden="true">/</kbd>}
          </div>
          <p id="catalog-search-tip" className={styles.examples}>
            <span>Try</span>
            {examples.map((example) => (
              <button key={example} type="button" onClick={() => setQuery(example)} aria-pressed={query === example}>{example}</button>
            ))}
          </p>

          <div className="filters" role="group" aria-label="Good for">
            <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")}>
              Everything
              {category === "all" && <span className="filter-sparkle sparkle" aria-hidden="true" />}
            </button>
            {categoryIds.map((id) => (
              <button type="button" key={id} aria-pressed={category === id} onClick={() => setCategory(category === id ? "all" : id)}
                disabled={!categoryCounts[id] && category !== id}>
                {categories[id]} <span className={styles.filterCount}>{categoryCounts[id]}</span>
                {category === id && <span className="filter-sparkle sparkle" aria-hidden="true" />}
              </button>
            ))}
          </div>

          <div className={styles.statusRow}>
            <p className="result-count" role="status">
              {hits.length === systems.length ? `Showing all ${systems.length} systems` : `${hits.length} of ${systems.length} systems`}
              {searching && hits.length > 0 && <> for “{deferredQuery.trim()}”</>}
            </p>
            {(query || filtered) && <button type="button" className={styles.clearAll} onClick={clearAll}>Clear search and filters</button>}
          </div>
        </div>
      </section>

      {hits.length ? (
        <div className={styles.layout}>
          <nav className={styles.shelfIndex} aria-label="Catalog shelves">
            <p className={styles.shelfIndexLabel}>Shelves</p>
            <ol>
              {shelves.map((shelf) => {
                const count = hits.filter(({ system }) => system.shelf === shelf.id).length;
                const Icon = shelfIcons[shelf.id];
                const label = <><Icon size={16} aria-hidden="true" /><span className={styles.shelfIndexTitle}>{shelf.title}</span><span className={styles.shelfIndexCount}>{count}</span></>;
                return (
                  <li key={shelf.id} data-empty={!count || undefined}>
                    {count ? <a href={`#shelf-${shelf.id}`}>{label}</a> : <span>{label}</span>}
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className={styles.shelves}>
            {groups.map(({ shelf, position, hits: shelfHits }) => {
              const Icon = shelfIcons[shelf.id];
              return (
                <section key={shelf.id} className={styles.shelf} aria-labelledby={`shelf-${shelf.id}`}>
                  <header className={styles.shelfHead}>
                    <span className={styles.shelfBadge} aria-hidden="true">
                      <Icon size={22} />
                      <span>{String(position + 1).padStart(2, "0")}</span>
                    </span>
                    <div>
                      <h2 id={`shelf-${shelf.id}`}>{shelf.title} <span className={styles.shelfCount}>{shelfHits.length}</span></h2>
                      <p>{shelf.blurb}</p>
                    </div>
                  </header>
                  <ul className={styles.tiles}>
                    {shelfHits.map(({ system, hint }) => (
                      <SystemEntry key={system.id} system={system} hint={searching ? hint : undefined}
                        open={open.has(system.id)} interested={interest.includes(system.id)}
                        onToggle={() => toggle(system.id)} onInterest={() => toggleInterest(system.id)} onJump={jumpTo} />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={styles.empty}>
          <EmptyState title={searching ? `Nothing on the shelves for “${deferredQuery.trim()}”` : "No systems match this filter"}>
            {filtered && matches.length > 0
              ? <>There {matches.length === 1 ? "is 1 match" : `are ${matches.length} matches`} in other categories. </>
              : "Try a shorter word, or describe what members would do (“collect”, “vote”, “sign up”). "}
            Custom ideas are welcome too.
          </EmptyState>
          <div className={styles.emptyActions}>
            {filtered && matches.length > 0 && <button type="button" className="button button--outline" onClick={() => setCategory("all")}>Show all matches</button>}
            {searching && <ButtonLink href={inquiryHref([], deferredQuery.trim())} variant="secondary">Describe your idea</ButtonLink>}
            <button type="button" className={styles.clearAll} onClick={clearAll}>Browse everything</button>
          </div>
        </div>
      )}

      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
      {picked.length > 0 && (
        <aside className={styles.tray} aria-label="Your list">
          <div className={styles.trayText}>
            <p className={styles.trayTitle}><span aria-hidden="true">✦</span> Your list · {picked.length}</p>
            <p className={styles.trayNames}>{picked.map(({ name }) => name).join(", ")}</p>
          </div>
          <div className={styles.trayActions}>
            <button type="button" className={styles.clearAll} onClick={() => { setInterest([]); setAnnouncement("Cleared your list."); }}>Clear</button>
            <ButtonLink href={inquiryHref(picked)}>Start an inquiry</ButtonLink>
          </div>
        </aside>
      )}
      <aside className={`info-panel ${styles.footnote}`}>
        <div>
          <h2>Don’t see your idea?</h2>
          <p>Most servers end up with a mix of systems plus something of their own. Describe it and it gets scoped from scratch.</p>
        </div>
        <ButtonLink href={inquiryHref(picked)} variant="secondary">Describe your idea</ButtonLink>
      </aside>
    </div>
  );
}
