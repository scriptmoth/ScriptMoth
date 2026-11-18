import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageIntro } from "@/components/ui";
import { AdminForm } from "@/components/business/admin-form";
import { ActionForm, Field } from "@/components/business/forms";
import { requireAdmin } from "@/lib/business/auth";
import { plans, setting } from "@/lib/business/catalog";
import { one } from "@/lib/business/db";
import { emailConfigured, templates } from "@/lib/business/notify";
import { availabilityOptions, policies } from "@/lib/business/rules";
import { retryNotifications } from "../actions";

const toggle = [{ id: "yes", title: "Enabled" }, { id: "no", title: "Disabled" }];
const units = (cents: number | null | undefined) => cents == null ? "" : (cents / 100).toFixed(2);
export const metadata = { title: "Business Settings", robots: { index: false } };

export default async function StudioSettings() {
  await requireAdmin();
  const pending = one<{ total: number }>("SELECT count(*) total FROM outbox WHERE sent_at IS NULL")?.total ?? 0;
  return <><PageIntro eyebrow="Studio administration" title="Business settings" tone="plain">Manage availability, plans, policies, and notification templates.</PageIntro>
    <div className="section site-container business-stack">
      <Link href="/admin" className="text-link"><ArrowLeft className="icon-back" size={16} aria-hidden="true" />Admin overview</Link>
      <div className="business-split">
        <AdminForm intent="settings" title="Studio configuration">
          <Field name="business_name" label="Business display name" value={setting("business_name", "Scriptmoth")} required />
          <Field name="contact_email" label="Public contact email" type="email" value={setting("contact_email")} />
          <Field name="availability" label="Commission availability" options={availabilityOptions} value={setting("availability", "Open")} required />
          <Field name="currency" label="Currency" options={["USD", "CAD", "EUR", "GBP", "AUD", "NZD"]} value={setting("currency", "USD")} required />
          <Field name="show_catalog" label="Public catalog" options={toggle} value={setting("show_catalog", "yes")} required />
          <Field name="payments" label="Online checkout" options={toggle} value={setting("payments", "yes")} required />
          <Field name="maintenance" label="Pause new inquiries for maintenance" options={toggle} value={setting("maintenance", "no")} required />
          <Field name="upload_limit" label="Combined attachment limit in bytes" type="number" value={setting("upload_limit", "4000000")} required />
          <Field name="default_revisions" label="Default revision allowance" value={setting("default_revisions", "One review round")} />
          <Field name="support_warranty" label="Default support terms" value={setting("support_warranty", "14 days to report bugs in agreed features")} />
          <Field name="quote_expiry" label="Default quote expiration in days" type="number" value={setting("quote_expiry", "14")} />
        </AdminForm>
        <ActionForm title="Email delivery queue" action={retryNotifications} submit="Attempt pending delivery">
          <p>{pending} pending · {emailConfigured() ? "Provider configured" : "Email provider unavailable"}</p>
        </ActionForm>
      </div>
      <h2>Hosting plans</h2>
      {[null, ...plans()].map(plan => <details key={plan?.id ?? "new"}><summary className="business-summary">{plan?.title ?? "Create a hosting plan"}</summary>
        <AdminForm title={plan?.title || "New plan"} id={plan?.id} intent="hosting_plan">
          <div className="form-grid">
            <Field name="title" label="Plan name" value={plan?.title} required />
            <Field name="price" label="Monthly management fee" value={units(plan?.cents)} />
            <Field name="services" label="Included services" large value={plan?.services} required />
            <Field name="limits" label="Usage limits" large value={plan?.limits} />
            <Field name="backups" label="Backup policy" large value={plan?.backups} />
            <Field name="coverage" label="Support coverage" large value={plan?.coverage} />
            <Field name="cancellation" label="Cancellation terms" large value={plan?.cancellation} />
            <Field name="provider_price" label="Stripe monthly Price ID" value={plan?.providerPrice} />
          </div>
        </AdminForm>
      </details>)}
      <h2>Business policies</h2>
      {Object.entries(policies).map(([slug, title]) => {
        const row = one<{ body: string; published: number }>("SELECT body,published FROM policies WHERE slug=?", slug);
        return <details key={slug}><summary className="business-summary">{title} · {row?.published ? "Published" : "Owner review required"}</summary>
          <AdminForm title={title} id={slug} intent="policy">
            <Field name="body" label="Policy text" large max={16000} value={row?.body} />
            <label><input name="publish" type="checkbox" value="yes" defaultChecked={Boolean(row?.published)} /> Publish reviewed text publicly</label>
          </AdminForm>
        </details>;
      })}
      <h2>Notification templates</h2>
      {Object.entries(templates).map(([id, value]) => <details key={id}><summary className="business-summary">{id.replaceAll("_", " ")}</summary>
        <AdminForm title="Email body" id={id} intent="template"><Field name="body" label="Template text (use {{reference}} for the record identifier)" large required max={4000} value={setting(`template_${id}`, value)} /></AdminForm>
      </details>)}
    </div></>;
}
