"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, type CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowUpRight, Braces, Check, ChevronLeft, ChevronRight, Copy, Heart, ImageOff, Search, X,
} from "lucide-react";
import {
  composeEmbeds, embedFamilies, embedFamily, embedLooks, embedNotes, embedPurpose, embedPurposes, embedStyles,
  embedText, webhookPayload, type ArtSlot, type EmbedLook, type EmbedStyle,
} from "@/demos/discord/discord-embeds";
import { DiscordMessage, EmbedArt } from "./embed-preview";
import { showcaseArt } from "@/demos/showcase-art";
import { useCopy } from "./style-library";
import familyTheme from "./library-family.module.css";
import styles from "./embed-library.module.css";

/* ───────────── Shortlist, shared by the gallery and detail pages ───────────── */

const KEY = "scriptmoth:embed-shortlist";
const listeners = new Set<() => void>();
let cache: string[] | null = null;

function readList(): string[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    cache = [];
  }
  return cache;
}

function writeList(next: string[]) {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode: keep it in memory */ }
  listeners.forEach(listener => listener());
}

const empty: string[] = [];
function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => { if (event.key === KEY) { cache = null; listener(); } };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
}

function useShortlist() {
  const list = useSyncExternalStore(subscribe, readList, () => empty);
  const toggle = (id: string) => writeList(list.includes(id) ? list.filter(item => item !== id) : [...list, id]);
  return { list, toggle };
}

function ShortlistTray({ list, toggle }: { list: string[]; toggle: (id: string) => void }) {
  if (!list.length) return null;
  const href = `/contact?type=discord-server-setup&showcase=${encodeURIComponent(list.join(","))}`;
  return (
    <div className={styles.tray} role="region" aria-label="Your embed shortlist">
      <p className={styles.trayLabel}><Heart size={15} aria-hidden="true" /> Shortlist</p>
      <ul>
        {list.map(id => (
          <li key={id}>
            <Link href={`/portfolio/discord-embeds/${id.toLowerCase()}`}><code>{id}</code></Link>
            <button type="button" onClick={() => toggle(id)} aria-label={`Remove ${id}`}><X size={13} aria-hidden="true" /></button>
          </li>
        ))}
      </ul>
      <Link className={styles.trayLink} href={href}>
        Request a quote with {list.length === 1 ? "this design" : `these ${list.length}`} <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}

/* ───────────── Shared controls ───────────── */

function LookPicker({ look, onChange, name }: { look: EmbedLook; onChange: (look: EmbedLook) => void; name: string }) {
  return (
    <fieldset className={styles.segmented}>
      <legend className="sr-only">Decoration</legend>
      {embedLooks.map(option => (
        <label key={option.id} title={option.blurb}>
          <input type="radio" name={name} value={option.id} checked={look === option.id} onChange={() => onChange(option.id)} />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

const recipeNames: Record<EmbedStyle["recipe"], string> = {
  hero: "Banner on top", poster: "Poster image", sticker: "Sticker & author", chapters: "Chapters with a banner between",
  ribbon: "Art strip under the text", masthead: "Banner header card", signature: "Author label", attachment: "Posted banner image",
  split: "Two parts with a strip between", closing: "Banner at the end",
};
const buttonNames: Record<EmbedStyle["buttons"], string> = {
  solid: "Blurple buttons", soft: "Gray buttons", success: "Green call to action", links: "Link buttons", menu: "Dropdown menu", emoji: "Emoji buttons",
};

const layoutNames: Record<EmbedStyle["layout"], string> = {
  stack: "Stacked text", fields: "Fields", grid: "Inline grid", frame: "Framed", tree: "Branching",
  quote: "Block quotes", code: "Code block", list: "Bullet list", cards: "Multi-embed",
};

/** Shown wherever art appears: the previews use example art that clients can't use. */
export function ArtNotice({ compact = false }: { compact?: boolean }) {
  return (
    <p className={`${styles.artNotice} ${compact ? styles.artNoticeCompact : ""}`} role="note">
      <ImageOff size={compact ? 15 : 18} aria-hidden="true" />
      <span>
        <strong>Example art only.</strong> The banners, dividers, and thumbnails in these previews show where images go.
        They aren’t included with a design and can’t be used in your server. You’ll provide your own images, and we’ll fit them into the layout.
      </span>
    </p>
  );
}

function matches(style: EmbedStyle, query: string) {
  if (!query) return true;
  const haystack = [style.id, style.name, embedFamily(style.family)?.title, layoutNames[style.layout], style.mark, ...style.tags].join(" ").toLowerCase();
  return query.toLowerCase().split(/\s+/).every(term => haystack.includes(term));
}

const detailHref = (style: EmbedStyle, purpose: string, look: EmbedLook) =>
  `/portfolio/discord-embeds/${style.id.toLowerCase()}?for=${purpose}&look=${look}`;

/* ───────────── Gallery ───────────── */

export function EmbedLibrary() {
  const [query, setQuery] = useState("");
  const [familyFilter, setFamilyFilter] = useState("all");
  const [purposeId, setPurposeId] = useState(embedPurposes[0].id);
  const [look, setLook] = useState<EmbedLook>("elaborate");
  const { list, toggle } = useShortlist();
  const { copied, copy } = useCopy();
  const purpose = embedPurpose(purposeId);

  const groups = useMemo(() => embedFamilies
    .filter(group => familyFilter === "all" || group.number === familyFilter)
    .map(group => ({ ...group, styles: group.styles.filter(style => matches(style, query.trim())) }))
    .filter(group => group.styles.length > 0), [familyFilter, query]);
  const count = groups.reduce((sum, group) => sum + group.styles.length, 0);

  return (
    <div className={styles.library}>
      <div className={styles.toolbar} role="search">
        <label className={styles.search}>
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search embed designs</span>
          <input type="search" value={query} onChange={event => setQuery(event.target.value)}
            placeholder="Search: E03A, moon, gold, code block" autoComplete="off" />
        </label>
        <label className={styles.select}>
          <span className="sr-only">Family</span>
          <select value={familyFilter} onChange={event => setFamilyFilter(event.target.value)}>
            <option value="all">All looks ({embedStyles.length} designs)</option>
            {embedFamilies.map(group => <option key={group.number} value={group.number}>E{group.number} · {group.title}</option>)}
          </select>
        </label>
        <label className={styles.select}>
          <span className={styles.selectLabel}>Preview as</span>
          <select value={purposeId} onChange={event => setPurposeId(event.target.value)}>
            {embedPurposes.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
        <LookPicker look={look} onChange={setLook} name="gallery-look" />
        <p className={styles.count} aria-live="polite">{count} {count === 1 ? "design" : "designs"}</p>
      </div>

      <ArtNotice />

      {groups.length === 0 && (
        <p className={styles.empty}>No designs match “{query}”. Try a code like <code>E04A</code> or a word like <em>moon</em>.</p>
      )}

      {groups.map(group => (
        <section key={group.number} className={`${styles.family} ${familyTheme.theme}`} data-family={group.number} aria-labelledby={`efamily-${group.number}`}>
          <header className={`${styles.familyHead} ${familyTheme.head}`} style={group.number === "03" ? { "--family-art": `url(${showcaseArt.whiteTulips})` } as CSSProperties : undefined}>
            <span className={`${styles.familyNumber} ${familyTheme.number}`} aria-hidden="true">E{group.number}</span>
            <div>
              <h3 id={`efamily-${group.number}`}>{group.title}</h3>
              <p>{group.blurb}</p>
            </div>
          </header>
          <ul className={styles.grid}>
            {group.styles.map(style => {
              const message = composeEmbeds(style, purpose, { look });
              const picked = list.includes(style.id);
              return (
                <li key={style.id} className={`${styles.card} ${familyTheme.card}`} id={`embed-${style.id}`} style={{ "--card-accent": style.color } as CSSProperties}>
                  <header className={styles.cardHead}>
                    <h4><Link href={detailHref(style, purpose.id, look)}><code>{style.id}</code> {style.name}</Link></h4>
                    <div className={styles.cardActions}>
                      <button type="button" className={styles.iconButton} onClick={() => copy(`${style.id}:text`, embedText(message))}
                        aria-label={`Copy ${style.id} text`} title="Copy formatted text">
                        {copied === `${style.id}:text` ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                      </button>
                      <button type="button" className={styles.iconButton} aria-pressed={picked} onClick={() => toggle(style.id)}
                        aria-label={`${picked ? "Remove" : "Add"} ${style.id} ${picked ? "from" : "to"} shortlist`} title="Shortlist">
                        <Heart size={15} aria-hidden="true" fill={picked ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </header>
                  <Link className={styles.previewLink} href={detailHref(style, purpose.id, look)} aria-label={`Open ${style.id} ${style.name}`}>
                    <DiscordMessage style={style} message={message} buttons={look === "elaborate"} />
                  </Link>
                  <footer className={styles.cardFoot}>
                    <span className={styles.swatch} style={{ background: style.color }} aria-hidden="true" />
                    <code>{style.color.toUpperCase()}</code>
                    <span className={styles.pill}>{layoutNames[style.layout]}</span>
                    <span className={styles.pill}>{recipeNames[style.recipe]}</span>
                    <Link className={styles.open} href={detailHref(style, purpose.id, look)}>Customize <ChevronRight size={14} aria-hidden="true" /></Link>
                  </footer>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <ShortlistTray list={list} toggle={toggle} />
    </div>
  );
}

/* ───────────── Detail page ───────────── */

const artSizes = { banner: "wide, about 4:1", strip: "thin strip, about 20:1, transparent", thumbnail: "square, at least 256 px" };

const slotInfo: { slot: Exclude<ArtSlot, "icon">; label: string; looks: string }[] = [
  { slot: "banner", label: "Header banner", looks: "Elaborate" },
  { slot: "strip", label: "Divider strip", looks: "Elaborate" },
  { slot: "thumbnail", label: "Thumbnail & icon", looks: "Decorated, Elaborate" },
];

export function EmbedStudio({ id, initialPurpose, initialLook }: { id: string; initialPurpose?: string; initialLook?: string }) {
  const index = embedStyles.findIndex(style => style.id === id);
  const style = embedStyles[index];
  const prev = embedStyles[(index - 1 + embedStyles.length) % embedStyles.length];
  const next = embedStyles[(index + 1) % embedStyles.length];
  const [purposeId, setPurposeId] = useState(embedPurpose(initialPurpose).id);
  const [look, setLook] = useState<EmbedLook>(embedLooks.some(option => option.id === initialLook) ? initialLook as EmbedLook : "decorated");
  const [buttons, setButtons] = useState(look === "elaborate");
  const { list, toggle } = useShortlist();
  const { copied, copy } = useCopy();
  const purpose = embedPurpose(purposeId);
  const message = composeEmbeds(style, purpose, { look });
  const json = JSON.stringify(webhookPayload(style, message, buttons), null, 2);
  const picked = list.includes(style.id);
  const group = embedFamily(style.family)!;
  const notes = embedNotes(style);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("for", purposeId);
    url.searchParams.set("look", look);
    window.history.replaceState(null, "", url);
  }, [purposeId, look]);

  return (
    <div className={styles.studio}>
      <nav className={styles.studioNav} aria-label="Embed designs">
        <Link className="text-link" href={`/portfolio/discord-embeds#embed-${style.id}`}><ArrowLeft size={16} aria-hidden="true" /> Back to gallery</Link>
        <span className={styles.pager}>
          <Link href={detailHref(prev, purposeId, look)} aria-label={`Previous: ${prev.id} ${prev.name}`}><ChevronLeft size={16} aria-hidden="true" /> {prev.id}</Link>
          <Link href={detailHref(next, purposeId, look)} aria-label={`Next: ${next.id} ${next.name}`}>{next.id} <ChevronRight size={16} aria-hidden="true" /></Link>
        </span>
      </nav>

      <header className={styles.studioHead}>
        <div>
          <p className="eyebrow">E{group.number} · {group.title}</p>
          <h1 id="embed-title"><code>{style.id}</code> {style.name}</h1>
          <ul className={styles.tags} aria-label="Tags">
            <li>{layoutNames[style.layout]}</li>
            {style.tags.slice(1).map(tag => <li key={tag}>{tag}</li>)}
          </ul>
        </div>
        <div className={styles.studioActions}>
          <button type="button" className={styles.ghostButton} aria-pressed={picked} onClick={() => toggle(style.id)}>
            <Heart size={16} aria-hidden="true" fill={picked ? "currentColor" : "none"} /> {picked ? "Shortlisted" : "Shortlist"}
          </button>
          <button type="button" className={styles.ghostButton} onClick={() => copy("text", embedText(message))}>
            {copied === "text" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />} {copied === "text" ? "Copied" : "Copy text"}
          </button>
          <button type="button" className={styles.solidButton} onClick={() => copy("json", json)}>
            {copied === "json" ? <Check size={16} aria-hidden="true" /> : <Braces size={16} aria-hidden="true" />} {copied === "json" ? "Copied" : "Copy JSON"}
          </button>
        </div>
      </header>

      <div className={styles.controls}>
        <div className={styles.tabs} role="radiogroup" aria-label="Content">
          {embedPurposes.map(option => (
            <button key={option.id} type="button" role="radio" aria-checked={option.id === purposeId}
              className={styles.tab} onClick={() => setPurposeId(option.id)}>{option.label}</button>
          ))}
        </div>
        <div className={styles.controlRow}>
          <LookPicker look={look} onChange={setLook} name="studio-look" />
          <label className={styles.toggle}>
            <input type="checkbox" checked={buttons} onChange={event => setButtons(event.target.checked)} />
            <span>Buttons</span>
          </label>
          <p className={styles.lookBlurb}>{embedLooks.find(option => option.id === look)?.blurb}</p>
        </div>
      </div>

      <div className={styles.stage}>
        <DiscordMessage style={style} message={message} buttons={buttons} />
      </div>

      <div className={styles.panels}>
        <section className={styles.panel} aria-labelledby="embed-color">
          <h2 id="embed-color">Color & format</h2>
          <dl className={styles.specs}>
            <dt>Sidebar</dt>
            <dd>
              <button type="button" className={styles.colorButton} onClick={() => copy("color", style.color.toUpperCase())}>
                <span className={styles.swatch} style={{ background: style.color }} aria-hidden="true" />
                <code>{style.color.toUpperCase()}</code>
                <span className={styles.copiedNote}>{copied === "color" ? "copied" : "copy"}</span>
              </button>
              {style.palette && style.palette.length > 1 && (
                <span className={styles.paletteRow} aria-label="Card colors">
                  {style.palette.map((hex, n) => <span key={n} className={styles.swatch} style={{ background: hex }} title={hex} />)}
                </span>
              )}
            </dd>
            <dt>Layout</dt><dd>{layoutNames[style.layout]}</dd>
            <dt>Arrangement</dt><dd>{recipeNames[style.recipe]}</dd>
            <dt>Buttons</dt><dd>{buttonNames[style.buttons]}</dd>
            <dt>Embeds</dt><dd>{message.embeds.length} in one message</dd>
          </dl>
          {notes.length > 0
            ? <ul className={styles.notes}>{notes.map(note => <li key={note}>{note}</li>)}</ul>
            : <p className={styles.muted}>Works as-is in any bot or webhook that sends embeds.</p>}
        </section>

        <section className={styles.panel} aria-labelledby="embed-art">
          <h2 id="embed-art">Where images go</h2>
          <ArtNotice compact />
          <ul className={styles.artList}>
            {slotInfo.map(({ slot, label, looks }) => (
              <li key={slot} className={styles[`artItem_${slot}`]}>
                <div className={styles.artFrame}><EmbedArt style={style} slot={slot} /></div>
                <span>
                  <strong>{label}</strong>
                  <small>{looks} · {artSizes[slot]}</small>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <details className={styles.json}>
        <summary>Webhook JSON</summary>
        <p className={styles.muted}>
          Paste into Discohook or send it to a webhook. Image links are placeholders: replace each <code>example.com/your-art/…</code> link with a link to your own image.{message.attachments.length > 0 && " This design posts its banner as a plain image: upload it as a file with the message."}
          Reactions in the preview are added by members, so they aren’t part of the JSON.
          {buttons && " Buttons only show when a bot or app sends the message; plain webhooks drop them."}
        </p>
        <pre><code>{json}</code></pre>
      </details>

      <section className={styles.cta} aria-label="Order this design">
        <p>Like <strong>{style.id}</strong>? Add it to your quote and tell me what to change: wording, colors, emoji, or art.</p>
        <Link className={styles.trayLink} href={`/contact?type=discord-server-setup&showcase=${style.id}`}>
          Request a quote with {style.id} <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </section>

      <ShortlistTray list={list} toggle={toggle} />
    </div>
  );
}
