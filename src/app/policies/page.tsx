import Link from "next/link";
import { ButtonLink, PageIntro } from "@/components/ui";
import { defaultPolicies } from "@/data/policies";
import { assets } from "@/lib/assets";
import { setting } from "@/lib/business/catalog";
import { all, databaseConfigured } from "@/lib/business/db";
import { isEmail, policies } from "@/lib/business/rules";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Business Policies",
  "Scriptmoth’s terms for custom development, payments and cancellations, account privacy, software licenses, and managed hosting.",
  "/policies",
);

export const dynamic = "force-dynamic";

const sections = (Object.keys(policies) as (keyof typeof policies)[]).map(slug => ({
  slug,
  title: policies[slug],
}));

export default function PoliciesPage() {
  const contactEmail = setting("contact_email");
  const published = new Map(databaseConfigured()
    ? all<{ slug: string; body: string }>("SELECT slug, body FROM policies WHERE published = 1")
      .map(({ slug, body }) => [slug, body.trim()] as const)
    : []);

  return (
    <>
      <PageIntro eyebrow="Working with Scriptmoth" title="Business Policies" artwork={assets.process} tone="cream">
        Review the terms before accepting a quote, paying an invoice, or starting a hosting plan.
      </PageIntro>
      <div className="section site-container policies-layout">
        <nav className="info-panel policies-index" aria-labelledby="policies-index-heading">
          <h2 id="policies-index-heading">On this page</h2>
          <ul>
            {sections.map(({ slug, title }) => (
              <li key={slug}><a className="text-link" href={`#${slug}`}>{title}</a></li>
            ))}
          </ul>
        </nav>
        <div className="policies-content">
          {sections.map(({ slug, title }) => {
            const body = published.get(slug);
            return (
              <section key={slug} className="policy-section" id={slug} aria-labelledby={`policy-${slug}`}>
                <h2 id={`policy-${slug}`}>{title}</h2>
                {body ? body.split(/\n\s*\n/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                )) : <><p><strong>Draft for owner review.</strong> The text below is provisional.</p>{defaultPolicies[slug].map(({ heading, text, link }) => (
                  <div key={heading} className="policy-clause">
                    <h3>{heading}</h3>
                    <p>{text} {link && <Link className="text-link" href={link.href}>{link.label}</Link>}</p>
                  </div>
                ))}</>}
              </section>
            );
          })}
          <aside className="info-panel">
            <div>
              <h2>Questions about a policy?</h2>
              <p>For billing, cancellations, or account requests, open a support ticket in the client dashboard. Include your project or inquiry reference if you have one.</p>
            </div>
            <div className="policy-contact-links">
              <ButtonLink href="/dashboard">Client dashboard</ButtonLink>
              {isEmail(contactEmail) ? (
                <a className="text-link" href={`mailto:${contactEmail}`}>Email Scriptmoth</a>
              ) : (
                <Link className="text-link" href="/contact">Build a project</Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
