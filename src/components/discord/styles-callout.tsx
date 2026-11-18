import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Art, ButtonLink } from "@/components/ui";
import { discordStyles, styleFamilies } from "@/data/discord-styles";
import { assets } from "@/lib/assets";

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
