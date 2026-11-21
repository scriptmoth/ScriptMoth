import Link from "next/link";
import { PageIntro } from "@/components/ui";
import { assets } from "@/lib/assets";
import { pageMetadata } from "@/lib/metadata";
import { showcaseInvite } from "@/data/bot-showcase";
import { FeatureCatalog } from "./feature-catalog";
import styles from "./catalog.module.css";

export const metadata = pageMetadata(
  "Feature Catalog",
  "Browse and search the systems Scriptmoth builds for custom Discord bots and dashboards: questions and trivia, events, characters, gathering and crafting, economies, combat and quests, moderation, and websites.",
  "/features",
);

export default function FeaturesPage() {
  return (
    <>
      <PageIntro eyebrow="Feature catalog" title="A library of bot systems" artwork={assets.bot} tone="lavender">
        Browse the features I can build into a custom Discord bot. Open an entry to see what it does, where it fits,
        and whether you can try it in the showcase. Add the features you want to your enquiry.
      </PageIntro>
      <div className="section site-container">
        <section className={styles.showcase} aria-labelledby="try-moth">
          <div>
            <h2 id="try-moth">Try moth.exe on Discord</h2>
            <p>Join the Scriptmoth showcase, open <strong>#try-the-bot</strong>, and run <code>/moth try</code>. Use the “Has a Discord demo” filter below to find features with commands to try.</p>
          </div>
          <a className="button button--primary" href={showcaseInvite}>Join the Discord showcase</a>
        </section>
        <FeatureCatalog />
        <p className={styles.priceNote}>
          Looking for prices? Starter bots are on the <Link className="text-link" href="/products">Services</Link> page, and the
          {" "}<Link className="text-link" href="/contact">project builder</Link> shows a live estimate.
        </p>
      </div>
    </>
  );
}
