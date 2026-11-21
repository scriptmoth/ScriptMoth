"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, Maximize2 } from "lucide-react";
import styles from "./demo-gallery.module.css";

const FRAME_WIDTH = 1280;
const thumbnailWidths: Record<string, number> = {
  "strawberry-milk": 980,
  "midnight-tarot": 1050,
  "glitter-guestbook": 1030,
  "neon-district": 1050,
  "soft-atelier": 1070,
  "lantern-festival": 1070,
  "petal-index": 1140,
};

export type DemoGalleryItem = {
  slug: string;
  name: string;
  useCase: string;
  vibe: string;
  summary: string;
  swatches: string[];
  contactHref: string;
};

function LiveThumb({ slug, name, frameHeight }: { slug: string; name: string; frameHeight: number }) {
  const box = useRef<HTMLDivElement>(null);
  const previewWidth = thumbnailWidths[slug] ?? FRAME_WIDTH;
  const previewHeight = Math.round(frameHeight * previewWidth / FRAME_WIDTH);
  const [scale, setScale] = useState(0.28);

  useEffect(() => {
    const node = box.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / previewWidth));
    observer.observe(node);
    return () => observer.disconnect();
  }, [previewWidth]);

  return (
    <div ref={box} className={styles.thumb} style={{ aspectRatio: `${FRAME_WIDTH} / ${frameHeight}` }}>
      <iframe
        src={`/demos/${slug}?embed=1`}
        title={`${name} preview`}
        loading="lazy"
        tabIndex={-1}
        aria-hidden="true"
        width={previewWidth}
        height={previewHeight}
        style={{ transform: `scale(${scale})` }}
      />
    </div>
  );
}

export function DemoGallery({ items, frameHeight }: { items: DemoGalleryItem[]; frameHeight: number }) {
  return (
    <ul className={styles.grid}>
      {items.map((item) => (
        <li key={item.slug} className={styles.item} style={{ "--example-accent": item.swatches[2], "--example-backdrop": item.swatches[0] } as CSSProperties}>
          <Link href={`/demos/${item.slug}`} className={styles.preview} aria-label={`Open the ${item.name} demo`}>
            <LiveThumb slug={item.slug} name={item.name} frameHeight={frameHeight} />
            <span className={styles.open}><Maximize2 size={15} aria-hidden="true" /> Open full page</span>
          </Link>
          <div className={styles.meta}>
            <div className={styles.swatches} aria-hidden="true">
              {item.swatches.map((color, index) => (
                <span key={index} style={{ background: color }} />
              ))}
            </div>
            <p className={styles.vibe}>{item.useCase} · {item.vibe.split(" · ")[0]}</p>
            <h3>{item.name}</h3>
            <p>{item.summary}</p>
            <div className={styles.links}>
              <Link href={`/demos/${item.slug}`} className="text-link">View live demo <ArrowUpRight size={15} aria-hidden="true" /></Link>
              <Link href={item.contactHref} className="text-link">Request this style</Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
