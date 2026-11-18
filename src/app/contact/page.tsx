import { notFound } from "next/navigation";
import Link from "next/link";
import { QuoteBuilder } from "@/components/business/quote-builder";
import { PricingExplainer } from "@/components/business/pricing-explainer";
import { PageIntro } from "@/components/ui";
import { viewer } from "@/lib/business/auth";
import { availability, quoteSelection, setting, currency } from "@/lib/business/catalog";
import { buildContext, builderOptions, builderPackages } from "@/lib/business/builder";
import { databaseConfigured, one } from "@/lib/business/db";
import type { InquiryData, InquiryRow } from "@/lib/business/inquiries";
import { decodeBuild } from "@/lib/business/pricing";
import { hostingModes, projectTypes, type HostingMode, type ProjectType } from "@/lib/business/rules";
import { assets } from "@/lib/assets";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Build a project", "Configure your Scriptmoth project, see a live estimate, and send a project inquiry.", "/contact");
export const dynamic = "force-dynamic";

export default async function Contact({ searchParams }: { searchParams: Promise<{ type?: string; draft?: string; hosting?: string; build?: string }> }) {
  const query = await searchParams;
  const actor = await viewer();
  const draft = typeof query.draft === "string" && actor ? one<InquiryRow>("SELECT * FROM inquiries WHERE id=? AND owner_id=? AND status='draft'", query.draft, actor.id) : undefined;
  if (query.draft && !draft) notFound();
  const packages = builderPackages();
  const requested = typeof query.type === "string" ? query.type : "";
  const selection = quoteSelection(requested);
  const starter = packages.find(item => item.slug === requested);
  const shared = typeof query.build === "string" ? decodeBuild(query.build) : undefined;
  const initial: Partial<InquiryData> = draft ? JSON.parse(draft.data) : shared ? {
    type: shared.type, product: shared.product, configuration: shared.selection,
    hosting_mode: Object.hasOwn(hostingModes, shared.hosting) ? shared.hosting as HostingMode : "unsure",
  } : { type: starter?.type ?? selection.type, product: starter?.slug ?? selection.product?.slug ?? selection.plan?.id,
    hosting_mode: selection.plan || starter?.recurring || query.hosting === "managed" ? "managed" : query.hosting === "client" ? "client" : "unsure" };
  const status = availability();
  const enabled = databaseConfigured();
  const accepting = enabled && status !== "Closed" && setting("maintenance") !== "yes";
  const activeTypes = new Set(builderOptions().filter(item => item.kind === "base").map(item => item.project_type));
  const contexts = Object.fromEntries((Object.keys(projectTypes) as ProjectType[]).filter(type => activeTypes.has(type)).map(type => {
    const context = buildContext(type, "");
    const versions = Object.fromEntries([["", context.version], ...packages.filter(item => item.type === type).map(item => [item.slug, buildContext(type, item.slug).version])]);
    return [type, { options: context.options, versions }];
  }));
  const notice = !enabled ? "Project inquiries are temporarily unavailable." : status === "Waitlist" ? "Projects are currently waitlisted. You can still submit an inquiry to join the waitlist." :
    status === "Limited Availability" ? "Scriptmoth has limited project openings." : !accepting ? "New project inquiries are currently closed." : "";
  return <>
    <PageIntro eyebrow="Project inquiry" title="Build a project" artwork={assets.contact} tone="cream">
      Pick a starter package, add the features you want, and watch the estimate update as you go. Every price is shown up front.
    </PageIntro>
    <div className="section site-container business-stack">
      {notice && <p className="form-notice">{notice}</p>}
      {shared && <p className="form-notice" role="status">This build was opened from a saved link. Prices reflect the current rates.</p>}
      <QuoteBuilder key={draft?.id ?? initial.type} initial={initial} account={actor ? { name: actor.name, email: actor.email } : undefined}
        initialReference={draft?.id} currency={currency()} contexts={contexts} packages={packages} acceptsSubmissions={accepting} />
      {!actor && <div className="business-toolbar"><Link className="text-link" href="/login">Sign in to save a draft to your account</Link><Link className="text-link" href="/faq">Read the FAQ</Link></div>}
      <PricingExplainer />
    </div>
  </>;
}
