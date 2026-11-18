"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { discordSetupExamples } from "@/data/discord-setup-examples";
import { DiscordSetupMock } from "./discord-setup-mock";
import styles from "./discord-setup.module.css";

export function DiscordSetupGallery() {
  const [slug, setSlug] = useState(discordSetupExamples[0].slug);
  const example = discordSetupExamples.find((item) => item.slug === slug) ?? discordSetupExamples[0];

  return (
    <div className={styles.gallery}>
      <ul className={styles.picker} aria-label="Discord setup examples">
        {discordSetupExamples.map((item) => (
          <li key={item.slug}>
            <button
              type="button"
              className={styles.pick}
              aria-pressed={item.slug === example.slug}
              style={{ ["--pick-accent" as string]: item.accent }}
              onClick={() => setSlug(item.slug)}
            >
              <span className={styles.pickIcon} aria-hidden="true">{item.serverIcon}</span>
              <span className={styles.pickCopy}>
                <span className={styles.pickUse}>{item.useCase}</span>
                <span className={styles.pickName}>{item.name}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <aside className={styles.styleCard} aria-label="Style notes for this example">
        <div>
          <p className={styles.styleEyebrow}>Channel naming</p>
          <p className={styles.styleTitle}>{example.namingStyle}</p>
          <p className={styles.styleSamples}>
            {example.namingSamples.map((sample) => (
              <code key={sample}>{sample}</code>
            ))}
          </p>
        </div>
        <div>
          <p className={styles.styleEyebrow}>Embed look</p>
          <p className={styles.styleTitle}>{example.embedStyleLabel}</p>
          <p className={styles.styleHint}>{example.summary}</p>
        </div>
      </aside>

      <DiscordSetupMock example={example} onSelectExample={setSlug} />

      <div className={styles.caption}>
        <p>
          Compare styles across examples — pick the naming system you like, the embed look you like, or mix both in your quote.
        </p>
        <div className={styles.captionLinks}>
          <Link className="text-link" href="/products/discord-server-setup">
            See the package <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <Link className="text-link" href={`/contact?type=discord-server-setup&design=${example.slug}`}>
            Build a setup like {example.name} <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
