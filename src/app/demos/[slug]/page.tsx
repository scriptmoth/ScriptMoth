import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { CarrdSite } from "@/components/carrd/carrd-site";
import { ToyhouseBootstrap } from "@/components/toyhouse/toyhouse-bootstrap";
import { ToyhouseProfile } from "@/components/toyhouse/toyhouse-profile";
import { TumblrTheme } from "@/components/tumblr/tumblr-theme";
import { carrdTemplates, findCarrdTemplate } from "@/data/carrd-templates";
import { findToyhouseTemplate, toyhouseTemplates } from "@/data/toyhouse-templates";
import { findTumblrTemplate, tumblrTemplates } from "@/data/tumblr-templates";
import { pageMetadata } from "@/lib/metadata";
import styles from "./demo.module.css";

type DemoPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ embed?: string }>;
};

function switcherColor(slug: string) {
  const carrd = findCarrdTemplate(slug);
  if (carrd) return { fill: carrd.palette.tabActive, border: carrd.palette.accent };
  const tumblr = findTumblrTemplate(slug);
  if (tumblr) return { fill: tumblr.palette.accent, border: tumblr.palette.glow };
  const toyhouse = findToyhouseTemplate(slug)!;
  return { fill: toyhouse.palette.accent, border: toyhouse.palette.headerBar };
}

export function generateStaticParams() {
  return [...carrdTemplates, ...toyhouseTemplates, ...tumblrTemplates].map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: DemoPageProps) {
  const { slug } = await params;
  const template = findCarrdTemplate(slug) ?? findToyhouseTemplate(slug) ?? findTumblrTemplate(slug);
  if (!template) return {};
  return { ...pageMetadata(`${template.name} demo`, template.summary, `/demos/${template.slug}`), robots: { index: false } };
}

export default async function DemoPage({ params, searchParams }: DemoPageProps) {
  const { slug } = await params;
  const { embed } = await searchParams;
  const carrd = findCarrdTemplate(slug);
  const toyhouse = findToyhouseTemplate(slug);
  const tumblr = findTumblrTemplate(slug);
  const template = carrd ?? toyhouse ?? tumblr;
  if (!template) notFound();
  const embedded = embed === "1";
  const siblings = carrd ? carrdTemplates : tumblr ? tumblrTemplates : toyhouseTemplates;
  const portfolioAnchor = carrd ? "carrd-sites" : tumblr ? "tumblr-themes" : "toyhouse-profiles";
  const contactType = carrd ? "carrd-site" : tumblr ? "tumblr-theme" : "toyhouse-profile";
  const backdrop = carrd
    ? carrd.palette.backdrop
    : tumblr
      ? tumblr.palette.backdrop
      : toyhouse!.palette.backdrop;

  const stage = (
    <div className={styles.page} style={{ background: backdrop }}>
      <div className={styles.stage}>
        {carrd ? (
          <CarrdSite template={carrd} interactive={!embedded} />
        ) : tumblr ? (
          <TumblrTheme template={tumblr} interactive={!embedded} />
        ) : (
          <ToyhouseProfile template={toyhouse!} interactive={!embedded} />
        )}
      </div>

      {!embedded && (
        <nav className={styles.bar} aria-label="Demo controls">
          <Link href={`/portfolio#${portfolioAnchor}`} className={styles.back}><ArrowLeft size={16} aria-hidden="true" /> Portfolio</Link>
          <span className={styles.label}>Package preview · <strong>{template.name}</strong></span>
          <ul className={styles.switcher} aria-label="Other designs">
            {siblings.map((entry) => {
              const color = switcherColor(entry.slug);
              return (
                <li key={entry.slug}>
                  <Link
                    href={`/demos/${entry.slug}`}
                    aria-current={entry.slug === template.slug ? "page" : undefined}
                    title={entry.name}
                    aria-label={entry.name}
                    style={{ background: color.fill, borderColor: color.border }}
                  />
                </li>
              );
            })}
          </ul>
          <Link href={`/contact?type=${contactType}&design=${template.slug}`} className={styles.cta}>
            Build a project like this <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </nav>
      )}
    </div>
  );

  return toyhouse ? <ToyhouseBootstrap>{stage}</ToyhouseBootstrap> : stage;
}
