import type { CSSProperties } from "react";
import { BookOpen, Bot, ChevronRight, Database, ExternalLink, Globe, Info, Sparkles, Star, Tag, type LucideIcon } from "lucide-react";
import { ButtonLink, PageIntro } from "@/components/ui";
import { resourceSections, type Stars } from "@/data/hosting-resources";
import { assets } from "@/lib/assets";
import { pageMetadata } from "@/lib/metadata";
import styles from "./resources.module.css";

export const metadata = pageMetadata("Resources", "Compare third-party hosting providers for websites, Discord bots, and databases.", "/resources");

const sectionIcons: Record<(typeof resourceSections)[number]["icon"], LucideIcon> = {
  globe: Globe,
  bot: Bot,
  database: Database,
};

const initials = (name: string) => name.split(/[\s.]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();

/** Stable pastel hue per provider so every avatar gets its own colour */
const hue = (name: string) => [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

const easeWord = (n: Stars) => (n >= 4 ? "Easy" : n === 3 ? "Moderate" : "Advanced");
const budgetWord = (n: Stars) => (n === 5 ? "Cheapest" : n === 4 ? "Very cheap" : n === 3 ? "Affordable" : "Pricier");

function StarRating({ label, value, word, tone }: { label: string; value: Stars; word: string; tone: "ease" | "budget" }) {
  return (
    <div className={styles.ratingRow} data-tone={tone}>
      <span className={styles.ratingLabel}>{label}</span>
      <span className={styles.stars} role="img" aria-label={`${label}: ${value} out of 5 stars, ${word}`}>
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} size={18} aria-hidden="true" className={i <= value ? styles.starOn : styles.starOff} style={{ "--i": i } as CSSProperties} />
        ))}
      </span>
      <span className={styles.ratingWord} aria-hidden="true">{word}</span>
    </div>
  );
}

function LegendStars({ tone }: { tone: "ease" | "budget" }) {
  return <span className={styles.legendStars} data-tone={tone} aria-hidden="true">{[1, 2, 3, 4, 5].map(i => <Star key={i} size={15} />)}</span>;
}

export default function ResourcesPage() {
  return (
    <>
      <PageIntro eyebrow="Deployment resources" title="Compare hosting providers" artwork={assets.hosting} tone="lavender">
        Compare what each service runs, how much setup it takes, and what it costs to get started.
      </PageIntro>
      <div className={`section site-container ${styles.page}`}>
        <nav className={styles.jumpLinks} aria-label="Provider categories">
          {resourceSections.map(section => {
            const Icon = sectionIcons[section.icon];
            return (
              <a key={section.id} href={`#${section.id}`}>
                <Icon size={17} aria-hidden="true" /> {section.title}
                <span className={styles.count}>{section.providers.length}</span>
              </a>
            );
          })}
        </nav>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <LegendStars tone="ease" />
            <p><strong>Setup</strong>: more stars, less to configure. 4–5 is guided setup, 3 means configuring an app or worker, 1–2 means managing containers or a server.</p>
          </div>
          <div className={styles.legendItem}>
            <LegendStars tone="budget" />
            <p><strong>Budget</strong>: more stars, cheaper to start. Prices are in USD unless noted, separate from Scriptmoth’s fees, and can change, so check the provider’s pricing page. <strong>Usual range</strong> is a rough monthly estimate for a small project.</p>
          </div>
        </div>

        {resourceSections.map(section => {
          const Icon = sectionIcons[section.icon];
          return (
            <section key={section.id} id={section.id} data-section={section.id} className={styles.section} aria-labelledby={`${section.id}-title`}>
              <header>
                <h2 id={`${section.id}-title`}><Icon className={styles.sectionIcon} size={26} aria-hidden="true" /> {section.title}</h2>
                <p>{section.description}</p>
              </header>
              <div className={styles.grid}>
                {section.providers.map(provider => (
                  <article key={provider.name} className={styles.card}>
                    <div className={styles.cardHead}>
                      <span className={styles.avatar} aria-hidden="true" style={{ "--hue": hue(provider.name) } as CSSProperties}>{initials(provider.name)}</span>
                      <div className={styles.titleBlock}>
                        <h3>{provider.name}</h3>
                        {provider.freeStart
                          ? <span className={styles.freeTag}><Sparkles size={12} aria-hidden="true" /> Free to start</span>
                          : <span className={styles.paidTag}>Paid plans</span>}
                      </div>
                    </div>
                    <p className={styles.fit}><span>Best for</span> {provider.fit}</p>
                    <div className={styles.ratings}>
                      <StarRating label="Setup" value={provider.ease} word={easeWord(provider.ease)} tone="ease" />
                      <StarRating label="Budget" value={provider.budget} word={budgetWord(provider.budget)} tone="budget" />
                    </div>
                    <div className={styles.costRow}>
                      <p className={styles.cost}><span>Starts at</span> {provider.cost}</p>
                      <p className={styles.range}><span>Usual range</span> <b><strong>{provider.range}</strong><small>/mo</small></b></p>
                    </div>
                    <details className={styles.details}>
                      <summary><Info size={15} aria-hidden="true" /> Good to know<ChevronRight className={styles.chevron} size={15} aria-hidden="true" /></summary>
                      <p>{provider.note}</p>
                    </details>
                    <div className={styles.links}>
                      <a href={provider.docs} aria-label={`Read ${provider.name} documentation`}><BookOpen size={14} aria-hidden="true" /> Docs <ExternalLink className={styles.extIcon} size={12} aria-hidden="true" /></a>
                      <a href={provider.pricing} aria-label={`View ${provider.name} pricing and limits`}><Tag size={14} aria-hidden="true" /> Pricing <ExternalLink className={styles.extIcon} size={12} aria-hidden="true" /></a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
        <aside className="info-panel">
          <div><h2>Already have a provider in mind?</h2><p>Include the provider and plan in your inquiry so Scriptmoth can check compatibility before development starts.</p></div>
          <div className="button-row">
            <ButtonLink href="/contact?type=hosting">Build a project</ButtonLink>
            <ButtonLink href="/hosting" variant="outline">Hosting options</ButtonLink>
          </div>
        </aside>
      </div>
    </>
  );
}
