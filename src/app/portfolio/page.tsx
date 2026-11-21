import Link from "next/link";
import { ArrowUpRight, BookOpen, LayoutDashboard, LayoutTemplate, Maximize2, MessageCircle, NotebookPen, UserRound } from "lucide-react";
import { CarrdSite } from "@/demos/carrd/carrd-site";
import { CarrdGallery } from "@/demos/carrd/carrd-gallery";
import { AstralArchiveShowcase } from "@/demos/astral-archive/showcase";
import { DiscordEmbedsCallout, DiscordStylesCallout } from "@/demos/discord/styles-callout";
import { ToyhouseGallery } from "@/demos/toyhouse/toyhouse-gallery";
import { TumblrGallery } from "@/demos/tumblr/tumblr-gallery";
import { WikiGallery } from "@/demos/wiki/wiki-gallery";
import { carrdTemplates } from "@/demos/carrd/carrd-templates";
import { discordStyles } from "@/demos/discord/discord-styles";
import { embedStyles } from "@/demos/discord/discord-embeds";
import { showcaseInvite } from "@/data/bot-showcase";
import { pageMetadata } from "@/lib/metadata";
import styles from "./portfolio.module.css";

export const metadata = pageMetadata("Portfolio", "Try Scriptmoth’s Discord bot demos and browse bot dashboards, one-page websites, Tumblr themes, Toyhouse profiles, and character wikis.", "/portfolio");

const featured = carrdTemplates[0];
const sections = [
  { id: "discord-bots", label: "Discord bots", icon: MessageCircle },
  { id: "dashboards", label: "Bot dashboards", icon: LayoutDashboard },
  { id: "carrd-sites", label: "One-page sites", icon: LayoutTemplate },
  { id: "tumblr-themes", label: "Tumblr themes", icon: NotebookPen },
  { id: "toyhouse-profiles", label: "Toyhouse profiles", icon: UserRound },
  { id: "oc-wikis", label: "Character wikis", icon: BookOpen },
  { id: "discord-setup", label: "Discord styles", icon: MessageCircle },
];

export default function PortfolioPage() {
  return (
    <>
      <section className={`night-band ${styles.showcase}`} id="discord-bots" aria-labelledby="portfolio-title">
        <div className="site-container">
          <header className={styles.header}>
            <div>
              <p className="eyebrow kicker-chip">Portfolio</p>
              <h1 id="portfolio-title">Discord bots and creative work</h1>
              <p>Try moth.exe to see what a custom bot could do for your server. You can also browse my bot dashboards, websites, Tumblr themes, Toyhouse profiles, and character wikis.</p>
            </div>
            <a className="button button--primary" href={showcaseInvite}>Try a bot on Discord <ArrowUpRight size={16} aria-hidden="true" /></a>
          </header>
          <nav aria-label="Portfolio categories" className={styles.sectionNav}>
            {sections.map(({ id, label, icon: Icon }) => (
              <a key={id} href={`#${id}`}><Icon size={17} aria-hidden="true" />{label}</a>
            ))}
          </nav>
          <div className={styles.captionLinks}>
            <Link className="text-link" href="/features">Browse bot features <ArrowUpRight size={16} aria-hidden="true" /></Link>
            <Link className="text-link" href="/contact?type=discord-bot">Ask about a custom bot <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="section" id="dashboards" aria-labelledby="dashboards-title">
        <div className="site-container">
          <header className={styles.sectionHeader}>
            <p className="eyebrow">Bot dashboards</p>
            <h2 id="dashboards-title">Staff dashboards for Discord bots</h2>
            <p>Run the bot from a browser tab: members, applications, events, raid statics, and embeds. This one is for a Final Fantasy XIV Free Company.</p>
          </header>
          <AstralArchiveShowcase />
        </div>
      </section>

      <section className="section section-band" id="carrd-sites" aria-labelledby="carrd-title">
        <div className="site-container">
          <header className={styles.sectionHeader}>
            <p className="eyebrow">One-page sites</p>
            <h2 id="carrd-title">Commission sheets, bios, and shrines</h2>
            <p>Everything that fits on one link in your bio: commission terms, BYF/DNI, an OC profile, a fan shrine. Every design opens as a real page.</p>
          </header>
          <div className={styles.featured} style={{ background: featured.palette.backdrop }}>
            <CarrdSite template={featured} />
          </div>
          <div className={styles.caption}>
            <p>Live demo <span aria-hidden="true">·</span> {featured.name}</p>
            <div className={styles.captionLinks}>
              <Link className="text-link" href={`/demos/${featured.slug}`}>Open full page <Maximize2 size={15} aria-hidden="true" /></Link>
              <Link className="text-link" href="/contact?type=carrd-site">Build a project like this <ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
          </div>
          <CarrdGallery />
        </div>
      </section>

      <section className="section section-band" id="tumblr-themes" aria-labelledby="tumblr-title">
        <div className="site-container">
          <header className={styles.sectionHeader}>
            <p className="eyebrow">Tumblr themes</p>
            <h2 id="tumblr-title">Custom Tumblr blogs</h2>
            <p>Sidebar or grid themes with styled photo, text, and quote posts. Built for Tumblr’s theme editor — no separate host.</p>
          </header>
          <TumblrGallery />
          <div className={styles.caption} style={{ marginTop: "1.2rem" }}>
            <p>Want a theme for your blog?</p>
            <div className={styles.captionLinks}>
              <Link className="text-link" href="/products/tumblr-theme">See the package <ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="toyhouse-profiles" aria-labelledby="toyhouse-title">
        <div className="site-container">
          <header className={styles.sectionHeader}>
            <p className="eyebrow">Toyhouse codes</p>
            <h2 id="toyhouse-title">OC and profile designs</h2>
            <p>Built on Toyhouse’s Bootstrap 4 stack — real tab markup, inline styles, and paste-in HTML. No separate host; images go on Toyhouse.</p>
          </header>
          <ToyhouseGallery />
          <div className={styles.caption} style={{ marginTop: "1.2rem" }}>
            <p>Want one for your OC?</p>
            <div className={styles.captionLinks}>
              <Link className="text-link" href="/products/toyhouse-profile">See the package <ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-band" id="oc-wikis" aria-labelledby="wiki-title">
        <div className="site-container">
          <header className={styles.sectionHeader}>
            <p className="eyebrow">OC &amp; character wikis</p>
            <h2 id="wiki-title">Character and world wikis</h2>
            <p>A searchable home for your characters, places, and lore. Each demo is a working wiki: search, filter by tag, open character pages, and follow the timeline.</p>
          </header>
          <WikiGallery />
          <div className={styles.caption} style={{ marginTop: "1.2rem" }}>
            <p>Want a wiki for your world?</p>
            <div className={styles.captionLinks}>
              <Link className="text-link" href="/products/oc-wiki">See the package <ArrowUpRight size={16} aria-hidden="true" /></Link>
              <Link className="text-link" href="/contact?type=oc-wiki">Request a quote</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-band" id="discord-setup" aria-labelledby="discord-setup-title">
        <div className="site-container">
          <header className={styles.sectionHeader}>
            <p className="eyebrow">Discord servers &amp; bots</p>
            <h2 id="discord-setup-title">Discord channel &amp; embed styles</h2>
            <p>{discordStyles.length} channel naming styles and {embedStyles.length} embed designs. Each has a code you can paste into your quote.</p>
          </header>
          <DiscordStylesCallout id="discord-styles-portfolio" headingLevel="h3" />
          <DiscordEmbedsCallout id="discord-embeds-portfolio" headingLevel="h3" />
        </div>
      </section>
    </>
  );
}
