"use client";

import { useState, type CSSProperties } from "react";
import {
  Cinzel, Cinzel_Decorative, Comic_Neue, Cormorant_Garamond, Fredoka, Nunito, Orbitron, Pixelify_Sans, Righteous, Share_Tech_Mono, VT323,
} from "next/font/google";
import { AtSign, Camera, Cloud, Coffee, Headphones, MessageCircle, Palette, Play, Tv, type LucideIcon } from "lucide-react";
import { Art } from "@/components/ui";
import type { CarrdFont, CarrdSection, CarrdSocial, CarrdTemplate } from "@/demos/carrd/carrd-templates";
import { showcaseArt } from "@/demos/showcase-art";
import { portfolioArtwork } from "@/demos/portfolio-art";
import styles from "./carrd-site.module.css";
import shrine from "./glitter-guestbook.module.css";

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

function SectionBody({ section, guestbookHref }: { section: CarrdSection; guestbookHref?: string }) {
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
              {guestbookHref && label === "sign my guestbook" ? (
                <a className={styles.directoryEntry} href={guestbookHref}><strong>{label}</strong>{detail && <small>{detail}</small>}</a>
              ) : <div className={styles.directoryEntry}><strong>{label}</strong>{detail && <small>{detail}</small>}</div>}
            </li>
          ))}
        </ul>
      );
    case "text":
      return <div className={styles.prose}>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>;
  }
}

function Guestbook({ id }: { id: string }) {
  const [notes, setNotes] = useState<string[]>([]);
  return (
    <section className={shrine.guestbook} id={id}>
      <h2><span aria-hidden="true">✉ </span>Guestbook</h2>
      <form onSubmit={event => {
        event.preventDefault();
        const form = event.currentTarget;
        const message = String(new FormData(form).get("message") ?? "").trim();
        if (!message) return;
        setNotes(current => [...current, message]);
        form.reset();
      }}>
        <label htmlFor={`${id}-message`}>Leave a note for the shrine</label>
        <div><input id={`${id}-message`} name="message" maxLength={120} required /><button type="submit">Sign</button></div>
      </form>
      <p>Preview notes stay in this visit.</p>
      <ul aria-live="polite">{notes.map((note, index) => <li key={index}>{note}</li>)}</ul>
    </section>
  );
}

function FanShrine({ template, interactive }: { template: CarrdTemplate; interactive: boolean }) {
  const [active, setActive] = useState(0);
  const { owner, sections, extras } = template;
  const section = sections[active];
  const panelId = `${template.slug}-panel`;
  const guestbookId = `${template.slug}-guestbook`;

  return (
    <article className={shrine.shell} inert={!interactive || undefined} aria-label={`${owner.name}: ${template.useCase}`}>
      <div className={shrine.masthead}>
        <span><i aria-hidden="true">✦</i> {extras?.windowTitle}</span>
        {extras?.counter && <span>Visitors <strong>{extras.counter}</strong></span>}
      </div>
      <header className={shrine.hero}>
        <div className={shrine.welcome}>
          <p className={shrine.kicker}>{owner.subtitle}</p>
          <h1>{owner.name}</h1>
          <p className={shrine.intro}>{template.intro}</p>
          <a className={shrine.primary} href={`#${guestbookId}`}>Sign the guestbook <span aria-hidden="true">↘</span></a>
        </div>
        <div className={shrine.sleeve} aria-hidden="true">
          <div className={shrine.disc} />
          <span className={shrine.sticker}>✦</span>
          <span className={shrine.album}>STARLIGHT<br />FAN CLUB</span>
        </div>
      </header>
      <div className={shrine.desk}>
        <Guestbook id={guestbookId} />
        <div className={shrine.journal}>
          <nav aria-label="Fan shrine sections" className={shrine.tabs}>
            {sections.map((entry, index) => (
              <button key={entry.label} type="button" aria-pressed={active === index} aria-controls={panelId} onClick={() => setActive(index)}>{entry.label}</button>
            ))}
          </nav>
          <section className={shrine.panel} id={panelId} aria-live="polite">
            <h2>{section.title ?? section.label}</h2>
            <SectionBody section={section} guestbookHref={`#${guestbookId}`} />
          </section>
        </div>
      </div>
      <footer className={shrine.footer}><span>{owner.status}</span><span>site by scriptmoth</span></footer>
    </article>
  );
}

export function CarrdSite({ template, interactive = true }: { template: CarrdTemplate; interactive?: boolean }) {
  const [active, setActive] = useState(template.layout === "split" ? 1 : 0);
  const { palette, owner, extras } = template;
  const exhibit = portfolioArtwork[template.slug];
  const flow = template.layout === "stacked" || template.layout === "ticket";
  const fonts = fontStacks[template.font];
  const glyphs = motifGlyphs[template.motif];
  const section = template.sections[active];
  const scene = template.layout === "sidebar" ? `url(${showcaseArt.teahouseReef})`
    : template.layout === "split" ? "radial-gradient(ellipse at 48% 38%, #b490ff66, transparent 65%)"
    : template.layout === "stacked" ? "repeating-conic-gradient(#ffe4ef 0% 25%, #f2add0 0% 50%)"
    : exhibit ? `url(${exhibit.src})`
    : "none";

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
    "--c-scene": scene,
    ...(template.layout === "sidebar" && {
      "--c-sea-glass": `url(${showcaseArt.seaGlass})`,
      "--c-reef-fish": `url(${showcaseArt.reefFish})`,
      "--c-reef-bubble": `url(${showcaseArt.reefBubble})`,
    }),
    "--f-display": fonts.display,
    "--f-label": fonts.label,
    "--f-body": fonts.body,
  } as CSSProperties;

  if (template.layout === "retro") {
    return <div className={`${styles.wrap} ${fontClasses}`} style={vars}><FanShrine template={template} interactive={interactive} /></div>;
  }

  return (
    <div className={`${styles.wrap} ${fontClasses}`} style={vars}>
      <article className={styles.card} data-layout={template.layout} data-motif={template.motif} data-flow={flow || undefined} inert={!interactive || undefined} aria-label={`${owner.name}: ${template.useCase}`}>
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
          {template.layout === "cyber" ? (
            <figure className={styles.releaseArt}>
              <div aria-hidden="true" />
              <figcaption>NIGHT // SHIFT <small>GHOST//WIRE · EP</small></figcaption>
            </figure>
          ) : <Art artwork={owner.art} sizes="(max-width: 700px) 60vw, 320px" className={styles.character} eager />}
          <span className={styles.status}>{owner.status}</span>
          <ul className={styles.socials} aria-label="Example social platforms">
            {template.socials.map((social) => {
              const { icon: Icon, label } = socialIcons[social];
              return (
                <li key={social}>
                  <span role="img" aria-label={label} title={label}>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={styles.content}>
          <header className={styles.titles}>
            <h1 data-text={owner.name}><span aria-hidden="true">{glyphs[0]} </span>{owner.name}</h1>
            <p>{owner.subtitle}</p>
          </header>
          <p className={styles.opening}><strong>{template.introLabel}</strong> {template.intro}</p>

          <nav className={styles.tabs} aria-label={`${template.useCase} sections`}>
            {template.sections.map((entry, index) => (
              flow ? <a key={entry.label} href={`#${template.slug}-section-${index}`}>{entry.label}</a> : (
                <button key={entry.label} type="button" aria-pressed={active === index}
                  aria-controls={`${template.slug}-panel`} onClick={() => setActive(index)}>
                  <span className={styles.numeral} aria-hidden="true">{template.markers[index]}</span>
                  <span className={styles.tabGlyph} aria-hidden="true">{glyphs[0]}</span>
                  <span className={styles.tabLabel}>{entry.label}</span>
                </button>
              )
            ))}
          </nav>

          {flow ? (
            <div className={styles.sectionStack}>
              {template.sections.map((entry, index) => (
                <section key={entry.label} id={`${template.slug}-section-${index}`} className={styles.panel}>
                  <h2>{entry.title ?? entry.label}</h2><SectionBody section={entry} />
                </section>
              ))}
            </div>
          ) : (
            <section id={`${template.slug}-panel`} className={styles.panel} aria-live="polite">
              <div key={active} className={styles.panelBody}>
                <h2>{section.title ?? section.label}</h2><SectionBody section={section} />
              </div>
            </section>
          )}
          {template.layout === "sidebar" && (
            <figure className={styles.wavePrint}>
              <Art artwork={exhibit} sizes="200px" />
              <figcaption>From Lin’s collection of sea prints</figcaption>
            </figure>
          )}
          <p className={styles.credit}>site by scriptmoth</p>
        </div>
      </article>
    </div>
  );
}
