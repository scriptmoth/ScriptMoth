import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ServiceCard } from "@/components/cards";
import { CarrdGallery } from "@/components/carrd/carrd-gallery";
import { DiscordSetupGallery } from "@/components/discord/discord-setup-gallery";
import { ToyhouseGallery } from "@/components/toyhouse/toyhouse-gallery";
import { TumblrGallery } from "@/components/tumblr/tumblr-gallery";
import { HeroCommand } from "@/components/hero-command";
import { Art, ButtonLink, Divider, SectionHeading, Window } from "@/components/ui";
import { catalog, currency } from "@/lib/business/catalog";
import { money } from "@/lib/business/rules";
import { processSteps, services } from "@/data/services";
import { assets } from "@/lib/assets";

export const dynamic = "force-dynamic";

export default function Home() {
  const featuredProducts = catalog().filter(product => product.featured_order !== null);
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="site-container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow"><span aria-hidden="true">&gt;_</span> Independent development studio</p>
            <h1 id="hero-title">Personal websites and <em>Discord bots</em></h1>
            <p className="hero-description">Scriptmoth builds portfolios for artists, bots for Discord servers, and tools for roleplay groups that need a shared roster or quest log.</p>
            <div className="button-row">
              <ButtonLink href="/products">Compare packages</ButtonLink>
              <ButtonLink href="/contact" variant="secondary">Build a project</ButtonLink>
            </div>
          </div>
          <figure className="hero-figure">
            <div className="hero-mark">
              <Art artwork={assets.logo} alt="Scriptmoth, a purple and cream moth with a terminal prompt" className="hero-logo"
                sizes="(max-width: 700px) 74vw, (max-width: 1100px) 43vw, 490px" eager />
              <Art artwork={assets.logo} className="hero-logo-moth"
                sizes="(max-width: 700px) 74vw, (max-width: 1100px) 43vw, 490px" eager />
              <span className="hero-sparkle sparkle" aria-hidden="true" />
              <span className="hero-heart" aria-hidden="true" />
            </div>
            <HeroCommand />
          </figure>
        </div>
      </section>

      {featuredProducts.length > 0 && <section className="section section-band" aria-labelledby="featured-products-title">
        <div className="site-container">
          <SectionHeading eyebrow="Packages" title="Featured packages" id="featured-products-title">
            <Link className="text-link" href="/products">All packages <ArrowRight size={16} aria-hidden="true" /></Link>
          </SectionHeading>
          <div className="project-grid featured-products">
            {featuredProducts.map(({ id, slug, title, summary, cents, pricing }) => (
              <article key={id} className="service-card service-card--preview">
                <h3><Link className="card-link" href={`/products/${slug}`}>{title}</Link></h3>
                <p className="catalog-price">{cents === null ? "Custom quote" : `${pricing === "quote" ? "From " : ""}${money(cents, currency())}`}</p>
                <p>{summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>}

      <section className="section section--services site-container" aria-labelledby="services-title">
        <SectionHeading eyebrow="Services" title="What we build" id="services-title">
          <Link className="text-link" href="/services">Custom development <ArrowRight size={16} aria-hidden="true" /></Link>
        </SectionHeading>
        <div className="services-grid">
          {services.map((service) => <ServiceCard key={service.id} service={service} />)}
        </div>
      </section>

      <div className="site-container"><Divider /></div>

      <section className="section gallery-band" aria-labelledby="portfolio-title">
        <div className="site-container">
          <SectionHeading eyebrow="Portfolio" title="Live package demos" id="portfolio-title">
            <Link className="text-link" href="/portfolio">Browse portfolio <ArrowRight size={16} aria-hidden="true" /></Link>
          </SectionHeading>
          <CarrdGallery />
        </div>
      </section>

      <section className="section section-band" aria-labelledby="tumblr-home-title">
        <div className="site-container">
          <SectionHeading eyebrow="Tumblr" title="Custom Tumblr themes" id="tumblr-home-title">
            <Link className="text-link" href="/portfolio#tumblr-themes">Browse Tumblr demos <ArrowRight size={16} aria-hidden="true" /></Link>
          </SectionHeading>
          <TumblrGallery />
        </div>
      </section>

      <section className="section" aria-labelledby="toyhouse-home-title">
        <div className="site-container">
          <SectionHeading eyebrow="Toyhouse" title="OC and profile designs" id="toyhouse-home-title">
            <Link className="text-link" href="/portfolio#toyhouse-profiles">Browse Toyhouse demos <ArrowRight size={16} aria-hidden="true" /></Link>
          </SectionHeading>
          <ToyhouseGallery />
        </div>
      </section>

      <section className="section section-band" aria-labelledby="discord-setup-home-title">
        <div className="site-container">
          <SectionHeading eyebrow="Discord" title="Server setup layouts" id="discord-setup-home-title">
            <Link className="text-link" href="/portfolio#discord-setup">Browse Discord demos <ArrowRight size={16} aria-hidden="true" /></Link>
          </SectionHeading>
          <DiscordSetupGallery />
        </div>
      </section>

      <section className="section section-band section-band--studio" aria-labelledby="studio-title">
        <div className="site-container split-section">
          <div>
            <SectionHeading eyebrow="The studio" title="Meet Moth" id="studio-title" />
            <p>Moth learned to code by customizing MySpace pages. Today they build websites, bots, and the occasional tool that started as a 2 AM idea.</p>
            <Link className="text-link" href="/about">About Scriptmoth <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <Window label="scriptmoth / workshop" className="workshop-window">
            <div className="workshop-art">
              <Art artwork={assets.coding} alt="Moth-shaped coding terminal" sizes="(max-width: 600px) 140px, 190px" />
            </div>
          </Window>
        </div>
      </section>

      <section className="section site-container" aria-labelledby="process-title">
        <SectionHeading eyebrow="Development process" title="From inquiry to handover" id="process-title">
          <Art artwork={assets.process} className="process-art" sizes="54px" />
        </SectionHeading>
        <ol className="process-grid">
          {processSteps.map(({ title, description }) => (
            <li key={title}><h3>{title}</h3><p>{description}</p></li>
          ))}
        </ol>
      </section>

      <section className="site-container contact-band" aria-labelledby="contact-title">
        <Art artwork={assets.contact} sizes="(max-width: 600px) 80px, 110px" />
        <div><h2 id="contact-title">Have a project in mind?</h2><p>Start with what you want to make and who will use it.</p></div>
        <ButtonLink href="/contact">Build a project</ButtonLink>
      </section>
    </>
  );
}
