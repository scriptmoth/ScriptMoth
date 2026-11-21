"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Maximize2 } from "lucide-react";
import styles from "./showcase.module.css";

const FRAME = { width: 1440, height: 900, visible: 660 }; // crop the bottom so the card shows a "peek"
const features = [
  "Overview with member growth, upcoming events, and quick actions",
  "Searchable, sortable member directory with officer notes",
  "Character profiles with jobs, roles, availability, and raid history",
  "Month and week calendar with RSVPs, attendance, and recurring events",
  "Raid planner for four statics: 8-player slots, bench, and progression",
  "Discord tools: roles, welcome messages, role menus, moderation, commands",
  "Live Discord-style embed builder with saveable templates",
  "Recruitment applications, community polls and contests, analytics, and settings",
];

/** A live, scaled-down render of the demo used as its portfolio thumbnail. */
function LivePreview() {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  useEffect(() => {
    const node = box.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / FRAME.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={box} className={styles.frame} style={{ aspectRatio: `${FRAME.width} / ${FRAME.visible}` }}>
      <iframe src="/demos/astral-archive?embed=1" title="The Astral Archive dashboard preview" loading="lazy" tabIndex={-1} aria-hidden="true"
        width={FRAME.width} height={FRAME.height} style={{ transform: `scale(${scale})` }} />
    </div>
  );
}

export function AstralArchiveShowcase({ headingLevel = "h3" }: { headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <article className={styles.card}>
      <Link href="/demos/astral-archive" className={styles.preview} aria-label="Explore the Astral Archive live demo">
        <LivePreview />
        <span className={styles.open}><Maximize2 size={15} aria-hidden="true" /> Open full screen</span>
      </Link>
      <div className={styles.body}>
        <div className={styles.intro}>
        <p className={styles.kicker}>Bot dashboard · FFXIV Free Company</p>
        <Heading className={styles.title}>The Astral Archive</Heading>
        <p className={styles.summary}>
          A staff dashboard for a fictional Final Fantasy XIV Free Company and its Discord server: 85 members, four raid statics,
          weekly events, and a bot that runs it all. Every page works. Search the roster, plan a raid, build an embed, or review an application.
        </p>
        <div className={styles.actions}>
          <Link href="/demos/astral-archive" className={styles.cta}>Explore live demo <ArrowUpRight size={17} aria-hidden="true" /></Link>
          <Link href="/products/custom-bot-dashboard" className="text-link">See the package</Link>
        </div>
        <p className={styles.note}>Fictional data. Nothing in the demo connects to Discord or the game. Your changes stay in your browser and can be reset.</p>
        </div>
        <ul className={styles.features}>{features.map(item => <li key={item}>{item}</li>)}</ul>
      </div>
    </article>
  );
}
