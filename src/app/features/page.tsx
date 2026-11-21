import Link from "next/link";
import { PageIntro } from "@/components/ui";
import { assets } from "@/lib/assets";
import { pageMetadata } from "@/lib/metadata";
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
        Every system here is a starting point, not a fixed product. Search for an idea, open anything that sparks one, and
        collect the pieces you want into a list for your inquiry.
      </PageIntro>
      <div className="section site-container">
        <FeatureCatalog />
        <p className={styles.priceNote}>
          Looking for prices? Starter bots are on the <Link className="text-link" href="/products">Services</Link> page, and the
          {" "}<Link className="text-link" href="/contact">project builder</Link> shows a live estimate.
        </p>
      </div>
    </>
  );
}
