import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DiscordStylesCallout } from "@/demos/discord/styles-callout";
import { Art, ButtonLink, Window } from "@/components/ui";
import { catalog, currency } from "@/lib/business/catalog";
import { money } from "@/lib/business/rules";
import { processSteps, services } from "@/data/services";
import { assets } from "@/lib/assets";
import { HomeHero } from "./_home/home-hero";
import { HomeShowcase } from "./_home/home-showcase";
import styles from "./_home/home.module.css";

export const dynamic = "force-dynamic";

/** Where each service row points on the combined /products page. */
const serviceHref: Record<string, string> = {
  websites: "/products#website-packages",
  discord: "/products#discord-packages",
  "discord-setup": "/products#discord-server-setup",
  community: "/products#custom-rp-bot",
  hosting: "/hosting",
};

export default function Home() {
  const featuredProducts = catalog().filter(product => product.featured_order !== null);
  return (
    <div className={styles.home}>
      <HomeHero />

      <HomeShowcase />

      <section className={styles.make} aria-labelledby="services-title">
        <div className={`site-container ${styles.makeSpread}`}>
          <header className={styles.makeIntro}>
            <p className={styles.sectionKicker}><span aria-hidden="true">✦</span> What Scriptmoth makes</p>
            <h2 id="services-title" className={styles.display}>Small, useful things for <em>people who make things</em></h2>
            <p>It’s just me, so the list is short. Start from a package, or ask for something custom.</p>
            <Link className="text-link" href="/products#custom">Something custom <ArrowRight size={16} aria-hidden="true" /></Link>
            {featuredProducts.length === 0 && <Link className="text-link" href="/products">Compare packages</Link>}
          </header>
          <ol className={styles.serviceList}>
            {services.map(({ id, title, summary, art }) => (
              <li key={id} className={styles.service}>
                <span className={styles.serviceArt}><Art artwork={art} sizes="56px" /></span>
                <div>
                  <h3><Link href={serviceHref[id] ?? "/products"}>{title}</Link></h3>
                  <p>{summary}</p>
                </div>
                <ArrowRight className={styles.serviceArrow} size={20} aria-hidden="true" />
              </li>
            ))}
          </ol>
        </div>

        {featuredProducts.length > 0 && (
          <div className={`site-container ${styles.priceList}`} aria-labelledby="featured-products-title" role="region">
            <header>
              <h3 id="featured-products-title">Popular packages</h3>
              <Link className="text-link" href="/products">All packages <ArrowRight size={16} aria-hidden="true" /></Link>
            </header>
            <ul>
              {featuredProducts.map(({ id, slug, title, summary, cents, pricing }) => (
                <li key={id}>
                  <h4><Link href={`/products/${slug}`}>{title}</Link></h4>
                  <span className={styles.leader} aria-hidden="true" />
                  <span className={styles.price}>{cents === null ? "Custom quote" : `${pricing === "quote" ? "from " : ""}${money(cents, currency())}`}</span>
                  <p>{summary}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={`site-container ${styles.discordCallout}`}>
          <DiscordStylesCallout id="discord-styles-home" headingLevel="h3" />
        </div>
      </section>

      <section className={styles.studio} aria-labelledby="studio-title">
        <div className={`site-container ${styles.studioSpread}`}>
          <div>
            <p className={styles.sectionKicker}><span aria-hidden="true">✦</span> The studio</p>
            <h2 id="studio-title" className={styles.display}>Meet <em>Moth</em></h2>
            <p className={styles.studioBio}>
              Moth learned to code by customizing MySpace pages. Today they build websites, bots, and the occasional
              tool that started as a 2 AM idea.
            </p>
            <Link className="text-link" href="/about">About Scriptmoth <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <Window label="scriptmoth / workshop" className={`workshop-window ${styles.studioWindow}`}>
            <div className="workshop-art">
              <Art artwork={assets.coding} alt="Moth-shaped coding terminal" sizes="(max-width: 600px) 140px, 190px" />
            </div>
          </Window>
        </div>

        <div className={`site-container ${styles.process}`}>
          <h3 id="process-title">From inquiry to handover</h3>
          <ol aria-labelledby="process-title">
            {processSteps.map(({ title, description }, index) => (
              <li key={title}>
                <span className={styles.step} aria-hidden="true">{index + 1}</span>
                <h4>{title}</h4>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.contact} aria-labelledby="contact-title">
        <div className={`site-container ${styles.contactSpread}`}>
          <div>
            <h2 id="contact-title" className={styles.display}>Have a little project <em>in mind?</em></h2>
            <p>Tell me what you want to make and who it’s for. Half-formed 2 AM ideas count.</p>
            <div className={styles.contactActions}>
              <ButtonLink href="/contact" variant="secondary">Start a project</ButtonLink>
              <Link className="text-link" href="/faq">Read the FAQ first <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </div>
          <div className={styles.envelope} aria-hidden="true">
            <Art artwork={assets.contact} sizes="(max-width: 740px) 120px, 240px" />
            <Art artwork={assets.mark} className={styles.perched} sizes="44px" />
          </div>
        </div>
      </section>
    </div>
  );
}
