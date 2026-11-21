import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Art, ButtonLink } from "@/components/ui";
import { discordStyles, styleFamilies } from "@/demos/discord/discord-styles";
import { embedFamilies, embedStyles } from "@/demos/discord/discord-embeds";
import { assets } from "@/lib/assets";

/** Discord packages that include server channels and embeds, so the style libraries apply. */
export const discordStylePackages = new Set(["discord-server-setup", "custom-discord-bot", "community-engagement-bot", "custom-rp-bot"]);

type Props = {
  /** Where “Request a quote” should start the builder. */
  quoteType?: string;
  headingLevel?: "h2" | "h3";
  id?: string;
};

/** Points visitors to the Discord style library at /portfolio/discord-styles. */
export function DiscordStylesCallout({ quoteType = "discord-server-setup", headingLevel = "h2", id = "discord-styles" }: Props) {
  const Heading = headingLevel;
  return (
    <section className="info-panel showcase-callout" id={id} aria-labelledby={`${id}-title`}>
      <div className="showcase-callout-art" aria-hidden="true"><Art artwork={assets.community} sizes="96px" /></div>
      <div className="showcase-callout-copy">
        <p className="eyebrow">Discord style library</p>
        <Heading id={`${id}-title`}>Pick how your channels look</Heading>
        <p>
          Browse {discordStyles.length} category and channel naming styles, each with a preview and names you can copy.
          Every style has a permanent code, like <code>02F</code>. Use one for the whole server, or mix them: <code>04B</code> for categories and <code>09C</code> for channels.
          Add the codes you like to your quote.
        </p>
        <ul className="showcase-sections" aria-label="Style families">
          {styleFamilies.map(group => <li key={group.number}><code>{group.number}</code> {group.title}</li>)}
        </ul>
        <div className="button-row">
          <ButtonLink href="/portfolio/discord-styles">Browse the style library</ButtonLink>
          <Link className="text-link" href={`/contact?type=${quoteType}`}>Request a quote <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}

/** One-line style library link for cards and package pages. */
export function DiscordStylesLink({ children = "Browse Discord channel styles" }: { children?: string }) {
  return <Link className="text-link" href="/portfolio/discord-styles">{children} <ArrowUpRight size={15} aria-hidden="true" /></Link>;
}

/** Points visitors to the Discord embed library at /portfolio/discord-embeds. */
export function DiscordEmbedsCallout({ quoteType = "discord-server-setup", headingLevel = "h2", id = "discord-embeds" }: Props) {
  const Heading = headingLevel;
  return (
    <section className="info-panel showcase-callout" id={id} aria-labelledby={`${id}-title`}>
      <div className="showcase-callout-art" aria-hidden="true"><Art artwork={assets.community} sizes="96px" /></div>
      <div className="showcase-callout-copy">
        <p className="eyebrow">Discord embed library</p>
        <Heading id={`${id}-title`}>Pick how your embeds look</Heading>
        <p>
          Browse {embedStyles.length} embed designs for rules, welcome messages, FAQs, role menus, and more. Preview each one inside a Discord message,
          from simple text to a layout with a banner and thumbnail (example art; you provide your own images). Every design has a code, like <code>E03A</code>. Shortlist the ones you like and add them to your quote.
        </p>
        <ul className="showcase-sections" aria-label="Embed looks">
          {embedFamilies.map(group => <li key={group.number}><code>E{group.number}</code> {group.title}</li>)}
        </ul>
        <div className="button-row">
          <ButtonLink href="/portfolio/discord-embeds">Browse the embed library</ButtonLink>
          <Link className="text-link" href={`/contact?type=${quoteType}`}>Request a quote <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}

/** Compact links to both style libraries, for package cards. */
export function DiscordLibraryLinks() {
  return (
    <p className="package-extras">
      <strong>See the styles</strong> ·{" "}
      <Link className="text-link" href="/portfolio/discord-styles">{discordStyles.length} channel styles</Link>{" · "}
      <Link className="text-link" href="/portfolio/discord-embeds">{embedStyles.length} embed designs</Link>
    </p>
  );
}
