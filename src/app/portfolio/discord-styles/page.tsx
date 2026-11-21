import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StyleLibrary } from "@/demos/discord/style-library";
import { discordStyles, styleFamilies } from "@/demos/discord/discord-styles";
import { pageMetadata } from "@/lib/metadata";
import styles from "../portfolio.module.css";

export const metadata = pageMetadata(
  "Discord Style Library",
  "Browse 120 Discord category and channel naming styles. Every design has a permanent code, a preview, and names you can copy.",
  "/portfolio/discord-styles",
);

export default function DiscordStylesPage() {
  return (
    <>
      <section className={`night-band ${styles.showcase}`} aria-labelledby="styles-title">
        <div className="site-container">
          <header className={styles.header}>
            <div>
              <p className="eyebrow kicker-chip">Discord style library</p>
              <h1 id="styles-title">Channel &amp; category styles</h1>
              <p>
                {discordStyles.length} naming styles in {styleFamilies.length} families. Each one has a permanent code: the number is the family and the letter is the design.
                Tell us “use <code>02F</code> for my server,” or mix them: <code>04B</code> for categories and <code>09C</code> for channels.
              </p>
            </div>
            <Link className="text-link" href="/portfolio">Back to portfolio <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </header>
        </div>
      </section>
      <section className="section" aria-label="Style catalog">
        <div className="site-container">
          <StyleLibrary />
        </div>
      </section>
    </>
  );
}
