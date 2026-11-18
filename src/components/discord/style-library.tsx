"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronDown, Copy, Hash, Search, X } from "lucide-react";
import { channelNotes, channelTemplate, styleFamilies, type DiscordStyle } from "@/data/discord-styles";
import styles from "./style-library.module.css";

const total = styleFamilies.reduce((sum, group) => sum + group.styles.length, 0);

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(key);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1600);
  };
  return { copied, copy };
}

function matches(style: DiscordStyle, familyTitle: string, query: string) {
  if (!query) return true;
  const haystack = [style.id, style.name, familyTitle, style.category, ...style.channels].join(" ").toLowerCase();
  return query.toLowerCase().split(/\s+/).every(term => haystack.includes(term));
}

function StyleCard({ style, open, onToggle, picked, onPick, copied, copy }: {
  style: DiscordStyle; open: boolean; onToggle: () => void; picked: boolean; onPick: () => void;
  copied: string | null; copy: (key: string, text: string) => void;
}) {
  const all = [style.category, ...style.channels].join("\n");
  const notes = [...new Set(style.channels.flatMap(channelNotes))];
  return (
    <li className={styles.card} id={`style-${style.id}`}>
      <header className={styles.cardHead}>
        <h4><code>{style.id}</code> {style.name}</h4>
        <div className={styles.cardActions}>
          <button type="button" className={styles.iconButton} onClick={() => copy(`${style.id}:all`, all)}
            aria-label={`Copy all names for ${style.id} ${style.name}`}>
            {copied === `${style.id}:all` ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            <span>{copied === `${style.id}:all` ? "Copied" : "Copy"}</span>
          </button>
          <button type="button" className={styles.pickButton} aria-pressed={picked} onClick={onPick}>
            {picked ? <Check size={15} aria-hidden="true" /> : null}
            <span>{picked ? "Added" : "Add to quote"}</span>
            <span className="sr-only"> {style.id}</span>
          </button>
        </div>
      </header>

      <div className={styles.sidebar} aria-label={`${style.name} preview`}>
        <button type="button" className={styles.category} onClick={() => copy(`${style.id}:cat`, style.category)}
          title="Copy category name">
          <ChevronDown size={12} aria-hidden="true" />
          <span>{style.category}</span>
          {copied === `${style.id}:cat` && <em>copied</em>}
        </button>
        <ul>
          {style.channels.map((channel, index) => (
            <li key={index}>
              <button type="button" className={styles.channel} onClick={() => copy(`${style.id}:${index}`, channel)}
                title="Copy channel name">
                <Hash size={16} aria-hidden="true" />
                <span>{channel}</span>
                {copied === `${style.id}:${index}` && <em>copied</em>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <details className={styles.details} open={open} onToggle={event => {
        if ((event.currentTarget as HTMLDetailsElement).open !== open) onToggle();
      }}>
        <summary>Formatting details</summary>
        <dl>
          <dt>Category</dt>
          <dd><code>{style.category}</code></dd>
          <dt>Channel pattern</dt>
          <dd>
            {[...new Set(style.channels.map(channel => channelTemplate(channel) ?? channel))].map(pattern =>
              <code key={pattern}>{pattern}</code>)}
          </dd>
        </dl>
        {notes.length > 0
          ? <ul className={styles.notes}>{notes.map(note => <li key={note}>{note}</li>)}</ul>
          : <p className={styles.ok}>Works as-is for text and voice channels.</p>}
        <p className={styles.hint}>Click any line in the preview to copy just that name.</p>
      </details>
    </li>
  );
}

export function StyleLibrary() {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [picked, setPicked] = useState<string[]>([]);
  const { copied, copy } = useCopy();

  const groups = useMemo(() => styleFamilies
    .filter(group => family === "all" || group.number === family)
    .map(group => ({ ...group, styles: group.styles.filter(style => matches(style, group.title, query.trim())) }))
    .filter(group => group.styles.length > 0), [family, query]);
  const shown = groups.flatMap(group => group.styles.map(style => style.id));
  const count = shown.length;
  const allOpen = count > 0 && shown.every(id => open.has(id));

  const toggleOpen = (id: string) => setOpen(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const togglePick = (id: string) => setPicked(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  const quoteHref = `/contact?type=discord-server-setup&showcase=${encodeURIComponent(picked.join(","))}`;

  return (
    <div className={styles.library}>
      <div className={styles.toolbar} role="search">
        <label className={styles.search}>
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search styles</span>
          <input type="search" value={query} onChange={event => setQuery(event.target.value)}
            placeholder="Search by code, name, or symbol: 02F, café, ୨୧" autoComplete="off" />
        </label>
        <label className={styles.select}>
          <span className="sr-only">Category</span>
          <select value={family} onChange={event => setFamily(event.target.value)}>
            <option value="all">All categories ({total} styles)</option>
            {styleFamilies.map(group => <option key={group.number} value={group.number}>{group.number} · {group.title}</option>)}
          </select>
        </label>
        <p className={styles.count} aria-live="polite">{count} matching {count === 1 ? "style" : "styles"}</p>
        <button type="button" className="text-link" disabled={!count}
          onClick={() => setOpen(prev => {
            const next = new Set(prev);
            for (const id of shown) if (allOpen) next.delete(id); else next.add(id);
            return next;
          })}>
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      {groups.length === 0 && (
        <p className={styles.empty}>No styles match “{query}”. Try a code like <code>04B</code> or a word like <em>moon</em>.</p>
      )}

      {groups.map(group => (
        <section key={group.number} className={styles.family} aria-labelledby={`family-${group.number}`}>
          <header className={styles.familyHead}>
            <span className={styles.familyNumber} aria-hidden="true">{group.number}</span>
            <div>
              <h3 id={`family-${group.number}`}>{group.title}</h3>
              <p>{group.blurb}</p>
            </div>
          </header>
          <ul className={styles.grid}>
            {group.styles.map(style => (
              <StyleCard key={style.id} style={style} open={open.has(style.id)} onToggle={() => toggleOpen(style.id)}
                picked={picked.includes(style.id)} onPick={() => togglePick(style.id)} copied={copied} copy={copy} />
            ))}
          </ul>
        </section>
      ))}

      {picked.length > 0 && (
        <div className={styles.tray} role="region" aria-label="Styles added to your quote">
          <ul>
            {picked.map(id => (
              <li key={id}>
                <code>{id}</code>
                <button type="button" onClick={() => togglePick(id)} aria-label={`Remove ${id}`}><X size={13} aria-hidden="true" /></button>
              </li>
            ))}
          </ul>
          <Link className={styles.trayLink} href={quoteHref}>Request a quote with {picked.length === 1 ? "this style" : "these styles"} <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
      )}
    </div>
  );
}
