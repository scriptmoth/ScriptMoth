"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Maximize2 } from "lucide-react";
import { tumblrTemplates } from "@/data/tumblr-templates";
import styles from "../carrd/carrd-gallery.module.css";

const FRAME_WIDTH = 1280;
const FRAME_HEIGHT = 900;

function LiveThumb({ slug, name }: { slug: string; name: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.28);

  useEffect(() => {
    const node = box.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / FRAME_WIDTH));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className={styles.thumb} style={{ aspectRatio: `${FRAME_WIDTH} / ${FRAME_HEIGHT}` }}>
      <iframe
        src={`/demos/${slug}?embed=1`}
        title={`${name} preview`}
        loading="lazy"
        tabIndex={-1}
        aria-hidden="true"
        width={FRAME_WIDTH}
        height={FRAME_HEIGHT}
        style={{ transform: `scale(${scale})` }}
      />
    </div>
  );
}

export function TumblrGallery() {
  return (
    <ul className={styles.grid}>
      {tumblrTemplates.map((template) => (
        <li key={template.slug} className={styles.item}>
          <Link href={`/demos/${template.slug}`} className={styles.preview} aria-label={`Open the ${template.name} demo`}>
            <LiveThumb slug={template.slug} name={template.name} />
            <span className={styles.open}><Maximize2 size={15} aria-hidden="true" /> Open full page</span>
          </Link>
          <div className={styles.meta}>
            <div className={styles.swatches} aria-hidden="true">
              {[template.palette.chip, template.palette.accent, template.palette.glow, template.palette.soft].map((color, index) => (
                <span key={index} style={{ background: color }} />
              ))}
            </div>
            <p className={styles.vibe}>{template.useCase} · {template.vibe.split(" · ")[0]}</p>
            <h3>{template.name}</h3>
            <p>{template.summary}</p>
            <div className={styles.links}>
              <Link href={`/demos/${template.slug}`} className="text-link">View live demo <ArrowUpRight size={15} aria-hidden="true" /></Link>
              <Link href={`/contact?type=tumblr-theme&design=${template.slug}`} className="text-link">Request this style</Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
