import Link from "next/link";
import type { CSSProperties } from "react";
import { Art, ButtonLink } from "@/components/ui";
import { assets } from "@/lib/assets";
import { HeroDesk } from "./hero-desk";
import styles from "./home.module.css";

const made = ["Personal websites", "Discord bots", "Toyhouse profiles", "Tumblr themes", "Character wikis", "Server setups", "Roleplay tools", "Little galleries"];

/** Per-layer position and motion, read by the CSS as custom properties. */
const layer = (depth: number, delay: number, tilt: number) =>
  ({ "--depth": depth, "--delay": `${delay}ms`, "--tilt": `${tilt}deg` }) as CSSProperties;

function Browser({ path, preview, alt }: { path: string; preview: { src: string; width: number; height: number }; alt: string }) {
  return (
    <>
      <span className={styles.browserBar}>
        <span className={styles.browserDots} aria-hidden="true"><i /><i /><i /></span>
        <span className={styles.browserPath}>{path}</span>
      </span>
      <Art artwork={preview} alt={alt} sizes="(max-width: 760px) 70vw, 460px" eager />
    </>
  );
}

export function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`site-container ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.heroKicker}><span aria-hidden="true">&gt;_</span> Handmade since the MySpace days</p>
          <h1 id="hero-title">
            Cozy corners of the internet, <span className={styles.scribble}>coded by hand.
              <svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true">
                <path d="M3 9c22-5 42-6 62-3s38 5 60 1 48-6 72-2" />
              </svg>
            </span>
          </h1>
          <p className={styles.heroLede}>
            Scriptmoth builds personal websites, Discord bots, Toyhouse and Tumblr themes, character wikis,
            and roleplay tools for artists, writers, and the communities around them.
          </p>
          <div className={styles.heroActions}>
            <ButtonLink href="#work" arrow={false}>See the work</ButtonLink>
            <ButtonLink href="/contact" variant="secondary" arrow={false}>Start a project</ButtonLink>
          </div>
          <p className={styles.heroNote}>
            Every demo is clickable. Go poke at one.
            <svg className={styles.noteArrow} viewBox="0 0 90 46" aria-hidden="true">
              <path d="M4 38c14 6 34 4 46-8s16-22 32-24" />
              <path d="M72 1l11 5-8 9" />
            </svg>
          </p>
        </div>

        <HeroDesk className={styles.desk}>
          <span className={styles.orbit} aria-hidden="true" />
          <span className={styles.moon} aria-hidden="true" />

          <div className={`${styles.layer} ${styles.layerSite}`} style={layer(10, 120, -2.5)}>
            <Link href="/demos/jade-teahouse" className={`${styles.piece} ${styles.browser}`}>
              <span className={styles.tape}>character site</span>
              <Browser path="~/demos/jade-teahouse" alt="Jade Teahouse, a one-page character site for an original character named Lin Qiao"
                preview={{ src: "/assets/portfolio/jade-teahouse/preview.webp", width: 1280, height: 785 }} />
            </Link>
          </div>

          <div className={`${styles.layer} ${styles.layerProfile}`} style={layer(20, 260, 3.5)}>
            <Link href="/demos/lantern-festival" className={`${styles.piece} ${styles.browser}`}>
              <span className={styles.tape}>toyhouse profile</span>
              <Browser path="~/demos/lantern-festival" alt="Lantern Festival, a tabbed Toyhouse profile for a character named Pip"
                preview={{ src: "/assets/portfolio/lantern-festival/preview.webp", width: 1070, height: 773 }} />
            </Link>
          </div>

          <div className={`${styles.layer} ${styles.layerBot}`} style={layer(30, 420, -1.5)}>
            <Link href="/products#discord-packages" className={`${styles.piece} ${styles.discord}`}
              aria-label="Discord bots: a sample welcome message from a Scriptmoth bot. View Discord packages">
              <span className={styles.tape}>discord bot</span>
              <span className={styles.message} aria-hidden="true">
                <Art artwork={assets.mark} className={styles.avatar} sizes="40px" />
                <span className={styles.messageBody}>
                  <span className={styles.messageMeta}><b>Mothbot</b><em>APP</em><small>Today at 2:14 AM</small></span>
                  <span className={styles.messageText}>welcome in, <mark>@newmoth</mark>! pick a role so we know what you make ✦</span>
                  <span className={styles.roleRow}>
                    <span>🎨 artist</span><span>📜 writer</span><span>🎲 roleplayer</span>
                  </span>
                </span>
              </span>
            </Link>
          </div>

          <div className={`${styles.layer} ${styles.layerSticker}`} style={layer(40, 640, 9)} aria-hidden="true">
            <span className={`${styles.piece} ${styles.sticker}`}>
              <Art artwork={{ src: "/assets/mascot/holding-discord.png", width: 1254, height: 1254 }} sizes="120px" eager />
            </span>
          </div>

          <span className={styles.twinkles} aria-hidden="true"><i /><i /><i /><i /></span>
        </HeroDesk>
      </div>

      <div className={styles.ticker} aria-hidden="true">
        <div className={styles.tickerTrack}>
          {[0, 1].map(copy => (
            <span key={copy}>{made.map(item => <span key={item}>{item}<i /></span>)}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
