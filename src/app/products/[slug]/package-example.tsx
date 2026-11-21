import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CarrdGallery } from "@/demos/carrd/carrd-gallery";
import { AstralArchiveShowcase } from "@/demos/astral-archive/showcase";
import { DiscordMessage } from "@/demos/discord/embed-preview";
import { ToyhouseGallery } from "@/demos/toyhouse/toyhouse-gallery";
import { TumblrGallery } from "@/demos/tumblr/tumblr-gallery";
import { WikiGallery } from "@/demos/wiki/wiki-gallery";
import { composeEmbeds, embedPurpose, embedStyles } from "@/demos/discord/discord-embeds";
import styles from "./package-detail.module.css";

/** Sample Discord messages, drawn with the same renderer as the embed library. */
function DiscordSamples({ purposes }: { purposes: string[] }) {
  const style = embedStyles[0];
  return (
    <div className={styles.exampleMessages}>
      {purposes.map(id => {
        const purpose = embedPurpose(id);
        return <DiscordMessage key={id} style={style} message={composeEmbeds(style, purpose, { look: "elaborate" })} buttons />;
      })}
    </div>
  );
}

type Example = { intro: string; body: ReactNode; more?: { href: string; label: string } };

const examples: Record<string, Example> = {
  "carrd-site": {
    intro: "Every design below is a working one-page site. Click through it here, or open it as a full page.",
    body: <CarrdGallery />,
    more: { href: "/portfolio#carrd-sites", label: "More in the portfolio" },
  },
  "tumblr-theme": {
    intro: "Live Tumblr themes with styled photo, text, and quote posts. Switch designs to compare layouts.",
    body: <TumblrGallery />,
    more: { href: "/portfolio#tumblr-themes", label: "More in the portfolio" },
  },
  "toyhouse-profile": {
    intro: "Real Toyhouse profile codes, rendered with Toyhouse’s own tab markup.",
    body: <ToyhouseGallery />,
    more: { href: "/portfolio#toyhouse-profiles", label: "More in the portfolio" },
  },
  "oc-wiki": {
    intro: "Each demo is a working wiki: search, filter by tag, open character pages, and follow the timeline.",
    body: <WikiGallery />,
    more: { href: "/portfolio#oc-wikis", label: "More in the portfolio" },
  },
  "discord-server-setup": {
    intro: "Server setups come with branded embeds for your key channels. These are the welcome and rules posts from a sample server.",
    body: <DiscordSamples purposes={["welcome", "rules"]} />,
    more: { href: "/portfolio/discord-embeds", label: "Browse all embed designs" },
  },
  "custom-discord-bot": {
    intro: "Bot replies are styled to match your server. Here’s a sample help-ticket panel a bot posts.",
    body: <DiscordSamples purposes={["tickets"]} />,
    more: { href: "/portfolio/discord-embeds", label: "Browse all embed designs" },
  },
  "community-engagement-bot": {
    intro: "Engagement bots post events and prompts as styled embeds. Here’s a sample events post.",
    body: <DiscordSamples purposes={["events"]} />,
    more: { href: "/portfolio/discord-embeds", label: "Browse all embed designs" },
  },
  "custom-bot-dashboard": {
    intro: "A full staff dashboard for a fictional Final Fantasy XIV Free Company. The package starts with sign-in, a settings screen, and change history; this demo shows how far it can grow with add-ons.",
    body: <AstralArchiveShowcase />,
    more: { href: "/demos/astral-archive", label: "Explore live demo" },
  },
  "custom-rp-bot": {
    intro: "Roleplay systems post menus and announcements as styled embeds. Here’s a sample role-selection panel.",
    body: <DiscordSamples purposes={["roles"]} />,
    more: { href: "/portfolio/discord-embeds", label: "Browse all embed designs" },
  },
};

export function PackageExample({ slug, title }: { slug: string; title: string }) {
  const example = examples[slug];
  if (!example) return null;
  return (
    <section className={`${styles.panel} ${styles.example}`} aria-labelledby="package-example">
      <div className={styles.exampleHead}>
        <div>
          <h2 id="package-example">See an example</h2>
          <p>{example.intro}</p>
        </div>
        {example.more && <Link className="text-link" href={example.more.href}>
          {example.more.label} <ArrowUpRight size={16} aria-hidden="true" />
        </Link>}
      </div>
      <div className={styles.exampleBody} aria-label={`${title} example`}>{example.body}</div>
    </section>
  );
}
