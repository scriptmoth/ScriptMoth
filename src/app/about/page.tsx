import Link from "next/link";
import { Art, ButtonLink, PageIntro, Window } from "@/components/ui";
import { assets } from "@/lib/assets";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "About",
  "Meet Moth, the developer behind Scriptmoth’s websites and Discord tools.",
  "/about",
);

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="The studio" title="About Scriptmoth" tone="cream" artwork={assets.mark}>
        Scriptmoth builds websites, Discord bots, Discord server setup, and tools for artists, hobbyists, and roleplay groups.
      </PageIntro>
      <section className="section site-container about-layout" aria-labelledby="studio-intro">
        <div>
          <h2 id="studio-intro">Meet Moth</h2>
          <p>Hey, I&apos;m Moth! I&apos;m the person behind Scriptmoth.</p>
          <p>I got into coding back when everyone was customizing their MySpace pages and spending way too much time on Gaia Online. I had the best MySpace layout, by the way. At least I thought so. I also went through a pretty big Neocities phase, so I&apos;ve been messing around with HTML and CSS for a long, long time.</p>
          <p>I&apos;ve always liked making websites, especially the kind that have a little too much personality. Custom cursors, weird layouts, tiny pixel graphics, all that stuff. I miss when the internet was a little more fun to look at.</p>
          <p>These days I mostly build websites, bots, and little tools that I think would be useful. Sometimes it&apos;s something someone asks for, sometimes it&apos;s just an idea I got at 2 AM and decided I needed to make.</p>
          <p>Anyway, that&apos;s pretty much how Scriptmoth started. I like making stuff, so here we are.</p>
          <ButtonLink href="/services" variant="secondary">View services</ButtonLink>
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
            <h2>How I work</h2>
            <p>Tell me what you use today and where it gets in the way. Once we agree on what to build, you’ll get an early layout or prototype to try.</p>
          </div>
        </section>
        <section className="info-panel">
          <div>
            <h2>Project inquiries</h2>
            <p>Choose the features you need, see a live estimate as you configure, and send your inquiry from the same page.</p>
            <Link className="text-link" href="/contact">Build a project</Link>
          </div>
        </section>
      </div>
    </>
  );
}
