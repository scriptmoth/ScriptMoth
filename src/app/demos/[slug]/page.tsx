import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ChevronUp } from "lucide-react";
import { CarrdSite } from "@/demos/carrd/carrd-site";
import { ToyhouseBootstrap } from "@/demos/toyhouse/toyhouse-bootstrap";
import { ToyhouseProfile } from "@/demos/toyhouse/toyhouse-profile";
import { TumblrTheme } from "@/demos/tumblr/tumblr-theme";
import { WikiSite } from "@/demos/wiki/wiki-site";
import { carrdTemplates, findCarrdTemplate } from "@/demos/carrd/carrd-templates";
import { findToyhouseTemplate, toyhouseTemplates } from "@/demos/toyhouse/toyhouse-templates";
import { findTumblrTemplate, tumblrTemplates } from "@/demos/tumblr/tumblr-templates";
import { findWikiTemplate, wikiTemplates } from "@/demos/wiki/wiki-templates";
import { pageMetadata } from "@/lib/metadata";
import styles from "./demo.module.css";

const previewBackgrounds: Record<string, string> = {
  "celestial-observatory": "star-trails.webp",
  "jade-teahouse": "watercolor-night.webp",
};

type DemoPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ embed?: string }>;
};

function switcherColor(slug: string) {
  const carrd = findCarrdTemplate(slug);
  if (carrd) return { fill: carrd.palette.tabActive, border: carrd.palette.accent };
  const tumblr = findTumblrTemplate(slug);
  if (tumblr) return { fill: tumblr.palette.accent, border: tumblr.palette.glow };
  const wiki = findWikiTemplate(slug);
  if (wiki) return { fill: wiki.palette.accent, border: wiki.palette.head };
  const toyhouse = findToyhouseTemplate(slug)!;
  return { fill: toyhouse.palette.accent, border: toyhouse.palette.headerBar };
}

export function generateStaticParams() {
  return [...carrdTemplates, ...toyhouseTemplates, ...tumblrTemplates, ...wikiTemplates].map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: DemoPageProps) {
  const { slug } = await params;
  const template = findCarrdTemplate(slug) ?? findToyhouseTemplate(slug) ?? findTumblrTemplate(slug) ?? findWikiTemplate(slug);
  if (!template) return {};
  return { ...pageMetadata(`${template.name} demo`, template.summary, `/demos/${template.slug}`), robots: { index: false } };
}

export default async function DemoPage({ params, searchParams }: DemoPageProps) {
  const { slug } = await params;
  const { embed } = await searchParams;
  const carrd = findCarrdTemplate(slug);
  const toyhouse = findToyhouseTemplate(slug);
  const tumblr = findTumblrTemplate(slug);
  const wiki = findWikiTemplate(slug);
  const template = carrd ?? toyhouse ?? tumblr ?? wiki;
  if (!template) notFound();
  const embedded = embed === "1";
  const kind = carrd ? "carrd" : tumblr ? "tumblr" : wiki ? "wiki" : "toyhouse";
  const siblings = { carrd: carrdTemplates, tumblr: tumblrTemplates, wiki: wikiTemplates, toyhouse: toyhouseTemplates }[kind];
  const portfolioAnchor = { carrd: "carrd-sites", tumblr: "tumblr-themes", wiki: "oc-wikis", toyhouse: "toyhouse-profiles" }[kind];
  const contactType = { carrd: "carrd-site", tumblr: "tumblr-theme", wiki: "oc-wiki", toyhouse: "toyhouse-profile" }[kind];
  const backdrop = template.palette.backdrop;
  const backgroundAsset = previewBackgrounds[slug];
  const nativeTumblr = slug === "velvet-midnight";

  const stage = (
    <div className={styles.page} data-embedded={embedded || undefined} data-native-theme={nativeTumblr || undefined}
      style={{ background: backdrop, ...(backgroundAsset && { backgroundImage: `linear-gradient(${slug === "jade-teahouse" ? "#0d293a55, #0d293a7d" : "#140f26ac, #140f26d9"}), url(/assets/portfolio/${slug}/${backgroundAsset})`, backgroundPosition: "center", backgroundSize: "cover" }) }}>
      <div className={styles.stage}>
        {nativeTumblr ? (
          <iframe
            title="Charlie Tumblr theme"
            className={styles.nativeTheme}
            src={`/demos/velvet-midnight/theme${embedded ? "?embed=1" : ""}`}
            sandbox="allow-forms allow-scripts allow-popups allow-popups-to-escape-sandbox"
            tabIndex={embedded ? -1 : undefined}
          />
        ) : carrd ? (
          <CarrdSite template={carrd} interactive={!embedded} />
        ) : tumblr ? (
          <TumblrTheme template={tumblr} interactive={!embedded} />
        ) : wiki ? (
          <WikiSite template={wiki} interactive={!embedded} />
        ) : (
          <ToyhouseProfile template={toyhouse!} interactive={!embedded} />
        )}
      </div>

      {!embedded && (
        <nav className={styles.bar} aria-label="Demo controls">
          <Link href={`/portfolio#${portfolioAnchor}`} className={styles.back}><ArrowLeft size={16} aria-hidden="true" /> Portfolio</Link>
          <span className={styles.label}>Package preview · <strong>{template.name}</strong></span>
          <details className={styles.switcher}>
            <summary>Switch design <ChevronUp size={16} aria-hidden="true" /></summary>
            <ul aria-label="Other designs">
              {siblings.map((entry) => {
                const color = switcherColor(entry.slug);
                return (
                  <li key={entry.slug}>
                    <Link href={`/demos/${entry.slug}`} aria-current={entry.slug === template.slug ? "page" : undefined}>
                      <span aria-hidden="true" style={{ background: color.fill, borderColor: color.border }} />
                      {entry.name}
                    </Link>
                  </li>
                );
              })}
              {nativeTumblr && (
                <>
                  <li className={styles.downloadDivider}><a href="/assets/portfolio/velvet-midnight/tumblr-theme.txt" download>Download Tumblr HTML</a></li>
                  <li><a href="/assets/portfolio/velvet-midnight/tumblr-about.txt" download>Download About HTML</a></li>
                </>
              )}
            </ul>
          </details>
          <Link href={`/contact?type=${contactType}&design=${template.slug}`} className={styles.cta}>
            Build a project like this <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </nav>
      )}
    </div>
  );

  return toyhouse ? <ToyhouseBootstrap>{stage}</ToyhouseBootstrap> : stage;
}
