"use client";

import { useState, type CSSProperties } from "react";
import {
  Cinzel, Cinzel_Decorative, Comic_Neue, Cormorant_Garamond, Fredoka, Nunito, Orbitron, Pixelify_Sans, Righteous, Share_Tech_Mono, VT323,
} from "next/font/google";
import { ArrowUpRight, AtSign, Camera, Cloud, Coffee, Headphones, MessageCircle, Palette, Play, Tv, type LucideIcon } from "lucide-react";
import { Art } from "@/components/ui";
import type { CarrdFont, CarrdSection, CarrdSocial, CarrdTemplate } from "@/data/carrd-templates";
import styles from "./carrd-site.module.css";

const cinzelDecorative = Cinzel_Decorative({ subsets: ["latin"], weight: ["700"], variable: "--carrd-display-regal" });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["500", "700"], variable: "--carrd-label-regal" });
const fredoka = Fredoka({ subsets: ["latin"], weight: ["500", "600"], variable: "--carrd-display-bubbly" });
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "700"], variable: "--carrd-body-bubbly" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "700"], style: ["normal", "italic"], variable: "--carrd-display-ink" });
const righteous = Righteous({ subsets: ["latin"], weight: ["400"], variable: "--carrd-display-arcade" });
const pixelify = Pixelify_Sans({ subsets: ["latin"], weight: ["600", "700"], variable: "--carrd-display-pixel" });
const vt323 = VT323({ subsets: ["latin"], weight: ["400"], variable: "--carrd-label-pixel" });
const comicNeue = Comic_Neue({ subsets: ["latin"], weight: ["400", "700"], variable: "--carrd-body-pixel" });
const orbitron = Orbitron({ subsets: ["latin"], weight: ["600", "800"], variable: "--carrd-display-cyber" });
const shareTechMono = Share_Tech_Mono({ subsets: ["latin"], weight: ["400"], variable: "--carrd-body-cyber" });

const fontClasses = [cinzelDecorative, cinzel, fredoka, nunito, cormorant, righteous, pixelify, vt323, comicNeue, orbitron, shareTechMono]
  .map((font) => font.variable)
  .join(" ");

const fontStacks: Record<CarrdFont, { display: string; label: string; body: string }> = {
  regal: { display: "var(--carrd-display-regal)", label: "var(--carrd-label-regal)", body: "var(--font-sans, system-ui)" },
  bubbly: { display: "var(--carrd-display-bubbly)", label: "var(--carrd-display-bubbly)", body: "var(--carrd-body-bubbly)" },
  ink: { display: "var(--carrd-display-ink)", label: "var(--carrd-display-ink)", body: "var(--carrd-display-ink)" },
  arcade: { display: "var(--carrd-display-arcade)", label: "var(--carrd-display-arcade)", body: "var(--carrd-body-bubbly)" },
  pixel: { display: "var(--carrd-display-pixel)", label: "var(--carrd-label-pixel)", body: "var(--carrd-body-pixel)" },
  cyber: { display: "var(--carrd-display-cyber)", label: "var(--carrd-body-cyber)", body: "var(--carrd-body-cyber)" },
};

const socialIcons: Record<CarrdSocial, { icon: LucideIcon; label: string }> = {
  discord: { icon: MessageCircle, label: "Discord" },
  twitter: { icon: AtSign, label: "Twitter / X" },
  vgen: { icon: Palette, label: "VGen" },
  instagram: { icon: Camera, label: "Instagram" },
  kofi: { icon: Coffee, label: "Ko-fi" },
  bluesky: { icon: Cloud, label: "Bluesky" },
  twitch: { icon: Tv, label: "Twitch" },
  youtube: { icon: Play, label: "YouTube" },
  music: { icon: Headphones, label: "Music" },
};

const motifGlyphs = {
  stars: ["✦", "✧", "✦", "⋆"],
  hearts: ["♡", "♥", "♡", "✿"],
  leaves: ["❦", "✿", "❀", "❧"],
  cards: ["♠", "♥", "♦", "♣"],
  sparkles: ["★", "✩", "♥", "✧"],
  neon: ["◢", "▲", "◆", "✕"],
};

/** Demo links go nowhere; they only show how the page would behave. */
const stay = (event: { preventDefault: () => void }) => event.preventDefault();

function SectionBody({ section, interactive }: { section: CarrdSection; interactive: boolean }) {
  switch (section.kind) {
    case "list":
      return <ol className={styles.terms}>{section.items.map((item) => <li key={item}>{item}</li>)}</ol>;
    case "pairs":
      return (
        <dl className={styles.prices}>
          {section.pairs.map(({ label, value, note }) => (
            <div key={label}>
              <dt>{label}{note && <small>{note}</small>}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      );
    case "gallery":
      return (
        <ul className={styles.examples}>
          {section.gallery.map(({ title, art, tint }) => (
            <li key={title} style={{ "--tint": tint } as CSSProperties}>
              <Art artwork={art} sizes="120px" />
              <span>{title}</span>
            </li>
          ))}
        </ul>
      );
    case "links":
      return (
        <ul className={styles.linkList}>
          {section.links.map(({ label, detail }) => (
            <li key={label}>
              <a href="#" onClick={stay} tabIndex={interactive ? undefined : -1}>
                <span><strong>{label}</strong>{detail && <small>{detail}</small>}</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      );
    case "text":
      return <div className={styles.prose}>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>;
  }
}

export function CarrdSite({ template, interactive = true }: { template: CarrdTemplate; interactive?: boolean }) {
  const [active, setActive] = useState<number | null>(null);
  const { palette, owner, extras } = template;
  const fonts = fontStacks[template.font];
  const glyphs = motifGlyphs[template.motif];
  const section = active === null ? null : template.sections[active];

  const vars = {
    "--c-card": palette.card,
    "--c-ink": palette.ink,
    "--c-soft": palette.soft,
    "--c-accent": palette.accent,
    "--c-tab": palette.tab,
    "--c-tab-active": palette.tabActive,
    "--c-tab-active-ink": palette.tabActiveInk,
    "--c-panel": palette.panel,
    "--c-glow": palette.glow,
    "--f-display": fonts.display,
    "--f-label": fonts.label,
    "--f-body": fonts.body,
  } as CSSProperties;

  const select = (index: number) => setActive((current) => (current === index ? null : index));

  return (
    <div className={`${styles.wrap} ${fontClasses}`} style={vars}>
      <article className={styles.card} data-layout={template.layout} data-motif={template.motif} aria-label={`${owner.name}: ${template.useCase}`}>
        {extras?.windowTitle && (
          <div className={styles.titleBar} aria-hidden="true">
            <span>{extras.windowTitle}</span>
            <span className={styles.windowButtons}><i>_</i><i>□</i><i>×</i></span>
          </div>
        )}
        {extras?.ticker && (
          <div className={styles.ticker} aria-hidden="true">
            <span>{extras.ticker}</span><span>{extras.ticker}</span>
          </div>
        )}

        <div className={styles.artSide}>
          <div className={styles.decor} aria-hidden="true">
            <span className={styles.ring} />
            <span className={styles.planet} />
            {glyphs.map((glyph, index) => <span key={index} className={styles.glyph}>{glyph}</span>)}
          </div>
          <Art artwork={owner.art} sizes="(max-width: 700px) 60vw, 320px" className={styles.character} eager />
          <span className={styles.status}>{owner.status}</span>
          <ul className={styles.socials} aria-label="Social links">
            {template.socials.map((social) => {
              const { icon: Icon, label } = socialIcons[social];
              return (
                <li key={social}>
                  <a href="#" aria-label={label} title={label} tabIndex={interactive ? undefined : -1} onClick={stay}>
                    <Icon size={20} aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
          {extras?.counter && (
            <p className={styles.counter}>
              <span>visitors:</span>
              <span className={styles.digits} aria-label={`${Number(extras.counter)} visitors`}>{extras.counter}</span>
            </p>
          )}
        </div>

        <div className={styles.content}>
          <header className={styles.titles}>
            <h1 data-text={owner.name}><span aria-hidden="true">{glyphs[0]} </span>{owner.name}</h1>
            <p>{owner.subtitle}</p>
          </header>

          <nav className={styles.tabs} aria-label={`${template.useCase} sections`}>
            {template.sections.map((entry, index) => (
              <button
                key={entry.label}
                type="button"
                aria-pressed={active === index}
                aria-controls={`${template.slug}-panel`}
                tabIndex={interactive ? undefined : -1}
                onClick={() => select(index)}
              >
                <span className={styles.numeral} aria-hidden="true">{template.markers[index]}</span>
                <span className={styles.tabGlyph} aria-hidden="true">{glyphs[0]}</span>
                <span className={styles.tabLabel}>{entry.label}</span>
              </button>
            ))}
          </nav>

          <section id={`${template.slug}-panel`} className={styles.panel} aria-live="polite">
            <div key={active ?? "intro"} className={styles.panelBody}>
              {section ? (
                <>
                  <h2>{section.title ?? section.label}</h2>
                  <SectionBody section={section} interactive={interactive} />
                </>
              ) : (
                <p><strong>{template.introLabel}:</strong> {template.intro}<span className={styles.cursor} aria-hidden="true" /></p>
              )}
            </div>
          </section>
          <p className={styles.credit}>site by scriptmoth</p>
        </div>
      </article>
    </div>
  );
}
