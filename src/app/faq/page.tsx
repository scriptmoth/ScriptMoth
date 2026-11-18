import Link from "next/link";
import { FaqBrowser } from "@/components/explore";
import { ButtonLink, PageIntro } from "@/components/ui";
import { assets } from "@/lib/assets";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "FAQ",
  "What Scriptmoth builds, how estimates and revisions work, payment and ownership basics, and what hosting can include.",
  "/faq",
);

export default function FaqPage() {
  return (
    <>
      <PageIntro eyebrow="FAQ" title="Frequently asked questions" artwork={assets.faq} tone="lavender">
        Project scope, estimates, revisions, payment, ownership, and hosting—summarized in plain language.
      </PageIntro>
      <div className="section site-container site-container--narrow faq-library">
        <FaqBrowser />
        <aside className="info-panel faq-contact">
          <div>
            <h2>Questions about your project?</h2>
            <p>Add them in the notes field when you build your project inquiry. For legal detail, see the <Link className="text-link" href="/policies">Policies</Link> page.</p>
          </div>
          <ButtonLink href="/contact">Build a project</ButtonLink>
        </aside>
      </div>
    </>
  );
}
