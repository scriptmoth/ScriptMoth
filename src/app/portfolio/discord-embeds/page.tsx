import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EmbedLibrary } from "@/demos/discord/embed-library";
import { embedFamilies, embedPurposes, embedStyles } from "@/demos/discord/discord-embeds";
import { pageMetadata } from "@/lib/metadata";
import styles from "../portfolio.module.css";

export const metadata = pageMetadata(
  "Discord Embed Library",
  "Browse 120 Discord embed designs in 12 looks. Preview each as rules, welcome, FAQ, roles, and more, then copy the text or webhook JSON.",
  "/portfolio/discord-embeds",
);

export default function DiscordEmbedsPage() {
  return (
    <>
      <section className={`night-band ${styles.showcase}`} aria-labelledby="embeds-title">
        <div className="site-container">
          <header className={styles.header}>
            <div>
              <p className="eyebrow kicker-chip">Discord embed library</p>
              <h1 id="embeds-title">Embed styles</h1>
              <p>
                {embedStyles.length} embed designs in {embedFamilies.length} looks. Each has a permanent code, like <code>E03A</code>: the number is the look and the letter is the design.
                Every design works for {embedPurposes.map(purpose => purpose.label.toLowerCase()).join(", ")}. Switch “Preview as” to see it.
                Previews use example art to show where your banner, divider, and thumbnail go. That art isn’t for use, so you’ll provide your own images.
              </p>
            </div>
            <Link className="text-link" href="/portfolio/discord-styles">Channel name styles <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </header>
        </div>
      </section>
      <section className="section" aria-label="Embed catalog">
        <div className="site-container">
          <EmbedLibrary />
        </div>
      </section>
    </>
  );
}
