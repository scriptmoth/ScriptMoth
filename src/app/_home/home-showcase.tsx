import Link from "next/link";
import { Art } from "@/components/ui";
import { portfolioArtwork } from "@/demos/portfolio-art";
import { carrdTemplates } from "@/demos/carrd/carrd-templates";
import { tumblrTemplates } from "@/demos/tumblr/tumblr-templates";
import { toyhouseTemplates } from "@/demos/toyhouse/toyhouse-templates";
import { wikiTemplates } from "@/demos/wiki/wiki-templates";
import styles from "./home.module.css";

const projects = [
  {
    slug: "jade-teahouse", title: "Jade Teahouse", category: "One-page website",
    description: "An illustrated character site with a profile, story, and gallery on one shareable page.",
    layout: styles.leadProject, width: 1280, height: 785,
  },
  {
    slug: "meadow-scrapbook", title: "Meadow Scrapbook", category: "Tumblr theme",
    description: "A garden journal with a handmade feel, built around the rhythm of photo, text, and quote posts.",
    layout: styles.meadowProject, width: 1280, height: 860,
  },
  {
    slug: "lantern-festival", title: "Lantern Festival", category: "Toyhouse character profile",
    description: "Meet Pip, a lantern courier with a tabbed profile for their story, stats, and friends.",
    layout: styles.lanternProject, width: 1070, height: 773,
  },
  {
    slug: "petal-index", title: "Petal Index", category: "Character & world wiki",
    description: "A searchable scrapbook for original characters, places, and a shared timeline.",
    layout: styles.wikiProject, width: 1140, height: 695,
  },
];

/** Every demo, filed by type. Swatches come from each template's own palette. */
const drawers = [
  { title: "One-page websites", href: "/portfolio#carrd-sites", contactType: "personal-site",
    demos: carrdTemplates.map(t => ({ slug: t.slug, name: t.name, swatches: [t.palette.tab, t.palette.accent, t.palette.glow] })) },
  { title: "Tumblr themes", href: "/portfolio#tumblr-themes", contactType: "tumblr-theme",
    demos: tumblrTemplates.map(t => ({ slug: t.slug, name: t.name, swatches: [t.palette.chip, t.palette.accent, t.palette.soft] })) },
  { title: "Toyhouse profiles", href: "/portfolio#toyhouse-profiles", contactType: "toyhouse-profile",
    demos: toyhouseTemplates.map(t => ({ slug: t.slug, name: t.name, swatches: [t.palette.accentSoft, t.palette.accent, t.palette.headerBar] })) },
  { title: "Character wikis", href: "/portfolio#oc-wikis", contactType: "oc-wiki",
    demos: wikiTemplates.map(t => ({ slug: t.slug, name: t.name, swatches: [t.palette.accentSoft, t.palette.accent, t.palette.head] })) },
];

function Project({ project }: { project: typeof projects[number] }) {
  const { slug, title, category, description, layout, width, height } = project;
  const preview = { src: `/assets/portfolio/${slug}/preview.webp`, width, height };

  return (
    <article className={`${styles.project} ${layout}`}>
      <Link href={`/demos/${slug}`} className={styles.projectStage} aria-label={`Open the ${title} live demo`}>
        <Art artwork={portfolioArtwork[slug]} className={styles.projectArtwork} sizes="(max-width: 760px) 95vw, 780px" />
        <span className={styles.projectFrame}>
          <Art artwork={preview} sizes="(max-width: 760px) 83vw, 650px" />
        </span>
      </Link>
      <div className={styles.projectCaption}>
        <p className={styles.kicker}>{category}</p>
        <h3><Link href={`/demos/${slug}`}>{title}</Link></h3>
        <p>{description}</p>
        <Link className={styles.textLink} href={`/demos/${slug}`}>View live demo<span className="sr-only"> of {title}</span></Link>
      </div>
    </article>
  );
}

export function HomeShowcase() {
  return (
    <section id="work" aria-labelledby="portfolio-title" className={styles.work}>
      <div className={styles.container}>
        <header className={styles.workHeader}>
          <h2 id="portfolio-title" className={styles.display}>Selected <em>work</em></h2>
          <p>Websites, themes, and worlds you can click through. Each example is a working demo.</p>
        </header>
        <div className={styles.projectSpread}>
          {projects.map(project => <Project key={project.slug} project={project} />)}
        </div>
        <div className={styles.archive}>
          <header className={styles.archiveHeader}>
            <h3>More live demos</h3>
            <p>Every package demo, filed by type. Pick a name to open it.</p>
            <Link href="/portfolio" className={styles.textLink}>Browse the full portfolio <span aria-hidden="true">→</span></Link>
          </header>
          <ul className={styles.drawers}>
            {drawers.map(({ title, href, demos, contactType }) => (
              <li key={title} className={styles.drawer}>
                <h4>{title}</h4>
                <p className={styles.drawerCount}>{demos.length} live {demos.length === 1 ? "demo" : "demos"}</p>
                <ul>
                  {demos.map(({ slug, name, swatches }) => (
                    <li key={slug}>
                      <Link href={`/demos/${slug}`}>
                        <span className={styles.swatches} aria-hidden="true">
                          {swatches.map((color, i) => <i key={i} style={{ background: color }} />)}
                        </span>
                        {name}
                      </Link>
                      <Link className={styles.requestStyle} href={`/contact?type=${contactType}&design=${slug}`}>
                        Request style<span className="sr-only"> for {name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={href} className={styles.drawerMore}>See them side by side<span className="sr-only">: {title}</span> <span aria-hidden="true">→</span></Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
