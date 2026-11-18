import Link from "next/link";
import { ArrowDown, ArrowUpRight, Maximize2 } from "lucide-react";
import { CarrdSite } from "@/components/carrd/carrd-site";
import { CarrdGallery } from "@/components/carrd/carrd-gallery";
import { DiscordSetupGallery } from "@/components/discord/discord-setup-gallery";
import { ToyhouseGallery } from "@/components/toyhouse/toyhouse-gallery";
import { TumblrGallery } from "@/components/tumblr/tumblr-gallery";
import { carrdTemplates } from "@/data/carrd-templates";
import { pageMetadata } from "@/lib/metadata";
import styles from "./portfolio.module.css";

export const metadata = pageMetadata("Portfolio", "Live one-page site demos, Tumblr themes, Toyhouse profiles, and Discord server setup layouts you can click through.", "/portfolio");

const featured = carrdTemplates[0];

export default function PortfolioPage() {
  return (
    <>
      <section className={styles.showcase} aria-labelledby="portfolio-title">
        <div className="site-container">
          <header className={styles.header}>
            <div>
              <p className="eyebrow">Portfolio</p>
              <h1 id="portfolio-title">Package examples</h1>
              <p>Click through a one-page site, Tumblr theme, Toyhouse profile, or Discord server layout below. Site, Tumblr, and Toyhouse demos also open as full pages.</p>
            </div>
            <a className="text-link" href="#carrd-sites">Browse examples <ArrowDown className="icon-down" size={16} aria-hidden="true" /></a>
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
        </div>
      </section>

      <section className="section" id="carrd-sites" aria-labelledby="carrd-title">
        <div className="site-container">
          <header className={styles.sectionHeader}>
            <p className="eyebrow">One-page sites</p>
            <h2 id="carrd-title">One-page site packages</h2>
            <p>Terms, prices, and examples on one shareable link. Every design opens as a real page, so you can see exactly how visitors would experience it.</p>
          </header>
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
              <Link className="text-link" href="/services#tumblr-themes">Service details</Link>
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
              <Link className="text-link" href="/services#toyhouse-profiles">Service details</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-band" id="discord-setup" aria-labelledby="discord-setup-title">
        <div className="site-container">
          <header className={styles.sectionHeader}>
            <p className="eyebrow">Discord servers</p>
            <h2 id="discord-setup-title">Discord server setup</h2>
            <p>Three fully different styles — cute aesthetic naming, clean literary RP names, and gaming/ops prefixes — each with its own embed look. Mix and match what you like in a quote.</p>
          </header>
          <DiscordSetupGallery />
        </div>
      </section>
    </>
  );
}
