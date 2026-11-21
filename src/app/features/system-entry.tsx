"use client";

import Link from "next/link";
import { ArrowUpRight, Check, ChevronDown, Plus } from "lucide-react";
import type { CatalogSystem } from "@/data/feature-catalog";
import { systemsById } from "@/lib/feature-catalog";
import type { SearchHit } from "@/lib/feature-catalog-search";
import styles from "./catalog.module.css";

const teaserCount = 4;

export function SystemEntry({ system, hint, open, interested, onToggle, onInterest, onJump }: {
  system: CatalogSystem;
  hint?: SearchHit["hint"];
  open: boolean;
  interested: boolean;
  onToggle: () => void;
  onInterest: () => void;
  onJump: (id: string) => void;
}) {
  const panelId = `${system.id}-details`;
  const extraUses = system.uses.length - teaserCount;
  return (
    <li id={system.id} className={styles.tile} data-open={open || undefined} data-picked={interested || undefined}>
      <h3 className={styles.tileHeading}>
        <button type="button" className={styles.tileToggle} aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
          <span className={styles.tileName}>{system.name}</span>
          <span className={styles.tileSummary}>{system.summary}</span>
          {hint
            ? <span className={styles.tileHint}><span>{hint.label}</span> {hint.text}</span>
            : <span className={styles.tileUses}>
              {system.uses.slice(0, teaserCount).join(" · ")}{extraUses > 0 && <em> +{extraUses} more</em>}
            </span>}
          <ChevronDown className={styles.tileChevron} size={18} aria-hidden="true" />
        </button>
      </h3>
      <button type="button" className={styles.quickAdd} aria-pressed={interested} onClick={onInterest}
        aria-label={interested ? `Remove ${system.name} from your list` : `Add ${system.name} to your list`}
        title={interested ? "On your list" : "Add to your list"}>
        {interested ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
      </button>
      <div id={panelId} className={styles.card} hidden={!open}>
        {open && <SystemDetails system={system} interested={interested} onInterest={onInterest} onJump={onJump} />}
      </div>
    </li>
  );
}

function SystemDetails({ system, interested, onInterest, onJump }: {
  system: CatalogSystem;
  interested: boolean;
  onInterest: () => void;
  onJump: (id: string) => void;
}) {
  const related = system.related.map((id) => systemsById.get(id)).filter((item): item is CatalogSystem => Boolean(item));
  return (
    <>
      <div className={styles.cardColumns}>
        <div className={styles.cardColumn}>
          <h4><span aria-hidden="true">01</span> What’s included</h4>
          <ul className={styles.includedList}>{system.included.map((line) => <li key={line}>{line}</li>)}</ul>
        </div>
        <div className={styles.cardColumn}>
          <h4><span aria-hidden="true">02</span> Can be used for</h4>
          <ul className={styles.useList}>{system.uses.map((line) => <li key={line}>{line}</li>)}</ul>
        </div>
        <div className={styles.cardColumn}>
          <h4><span aria-hidden="true">03</span> Optional enhancements</h4>
          <ul className={styles.extraList}>{system.enhancements.map((line) => <li key={line}>{line}</li>)}</ul>
        </div>
      </div>

      {(related.length > 0 || system.demos) && <div className={styles.cardFooter}>
        {related.length > 0 && <div className={styles.related}>
          <h4>Pairs well with</h4>
          <ul>{related.map((item) => (
            <li key={item.id}><button type="button" onClick={() => onJump(item.id)}>{item.name}</button></li>
          ))}</ul>
        </div>}
        {system.demos && <div className={styles.demoLinks}>
          <h4>See something similar</h4>
          <ul>{system.demos.map(({ label, href }) => (
            <li key={href}><Link className="text-link" href={href}>{label}<ArrowUpRight size={14} aria-hidden="true" /></Link></li>
          ))}</ul>
        </div>}
      </div>}

      <div className={styles.cardActions}>
        <button type="button" className={styles.interestButton} aria-pressed={interested} onClick={onInterest}>
          {interested ? <Check size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
          {interested ? "On your list" : "I’m interested in this"}
        </button>
        <span className={styles.cardNote}>Rename it, reskin it, and combine it with other systems. Your quote confirms the final scope.</span>
      </div>
    </>
  );
}
