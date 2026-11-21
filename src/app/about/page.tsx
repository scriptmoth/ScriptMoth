import Link from "next/link";
import { Art, ButtonLink, PageIntro, Window } from "@/components/ui";
import { assets } from "@/lib/assets";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "About",
  "Meet Moth, the developer behind Scriptmoth, and learn how the studio builds websites, Discord bots, and roleplay tools.",
  "/about",
);

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="The studio" title="About Scriptmoth" tone="cream" artwork={assets.mark}>
        Scriptmoth is an independent development studio building websites, Discord bots, and roleplay tools for artists, writers, and online communities.
      </PageIntro>
      <section className="section site-container about-layout" aria-labelledby="studio-intro">
        <div>
          <h2 id="studio-intro">Meet Moth</h2>
          <p>I&apos;m Moth, the developer behind Scriptmoth. I learned HTML and CSS by customizing MySpace pages and experimenting with layouts on Neocities, back when I spent a lot of time on Gaia Online.</p>
          <p>That era still shapes my work. I like building practical tools with the character of the early web, from custom cursors and pixel art to layouts that reflect the communities using them.</p>
          <ButtonLink href="/products" variant="secondary">Browse packages and pricing</ButtonLink>
        </div>
        <Window label="moth / workshop" className="workshop-window">
          <div className="workshop-art">
            <Art artwork={assets.coding} alt="Scriptmoth’s moth-shaped coding terminal" sizes="(max-width: 600px) 155px, 208px" />
          </div>
        </Window>
      </section>
      <div className="section site-container about-notes">
        <section className="info-panel">
          <div>
            <h2>Project process</h2>
            <p>We start with what you use today, where it falls short, and what you need the project to do. Once we agree on the scope, I share an early layout or prototype for you to try before I finish the build.</p>
          </div>
        </section>
        <section className="info-panel">
          <div>
            <h2>Project inquiries</h2>
            <p>Choose a starter package and select the features you need. The project builder updates your estimate as you make changes and lets you submit an inquiry from the same page.</p>
            <Link className="text-link" href="/contact">Open the project builder</Link>
          </div>
        </section>
        <section className="info-panel">
          <div>
            <h2>Development and AI use</h2>
            <p>I write Scriptmoth&apos;s code by hand in Visual Studio Code. Some bugs have earned a few tears.</p>
            <p>I occasionally use AI tools to help diagnose straightforward bugs. I also consult official documentation, GitHub issues, Stack Overflow, and community forums, and I test the fixes myself.</p>
          </div>
        </section>
        <section className="info-panel">
          <div>
            <h2>Artwork sources</h2>
            <p>I sourced the artwork in my project demos online and use it to illustrate layouts and features. The rights to the demo artwork remain with the respective rights holders.</p>
            <p>Scriptmoth&apos;s moth graphics were commissioned.</p>
          </div>
        </section>
      </div>
    </>
  );
}
