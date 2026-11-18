import Link from "next/link";
import { Calculator, CalendarClock, Eye, FileText, FolderKanban, Inbox, LayoutDashboard, LifeBuoy, Package, Paperclip, Receipt, Send, Server, Settings, Users, type LucideIcon } from "lucide-react";
import { PageIntro, Window } from "@/components/ui";
import { AdminForm } from "@/components/business/admin-form";
import { Field } from "@/components/business/forms";
import { BusinessStatus } from "@/components/business/presentation";
import { requireAdmin } from "@/lib/business/auth";
import { all, one } from "@/lib/business/db";
import { fileUrl } from "@/lib/business/files";
import type { InquiryData, InquiryRow } from "@/lib/business/inquiries";
import { setting } from "@/lib/business/catalog";
import { hostingModes, money } from "@/lib/business/rules";
import { assets } from "@/lib/assets";

export const metadata = { title: "Studio administration", robots: { index: false } };
const adminLinks: [string, string, LucideIcon][] = [["catalog", "Catalog", Package], ["builder", "Builder pricing", Calculator], ["clients", "Clients", Users], ["settings", "Business settings", Settings]];
const countIcons: Record<string, LucideIcon> = { new_inquiries: Inbox, pending_quotes: FileText, active_projects: FolderKanban, awaiting_review: Eye, unpaid_invoices: Receipt, open_tickets: LifeBuoy, hosted_services: Server };
const countLabels: Record<string, string> = {
  new_inquiries: "New inquiries", pending_quotes: "Pending quotes", active_projects: "Active projects",
  awaiting_review: "Awaiting review", unpaid_invoices: "Unpaid invoices", open_tickets: "Open tickets", hosted_services: "Hosted services",
};
export default async function Admin() {
  const actor = await requireAdmin();
  const counts = one<Record<string, number>>(`SELECT
    (SELECT count(*) FROM inquiries WHERE status='new') new_inquiries,
    (SELECT count(*) FROM quotes WHERE status='sent' AND expires_on>=date('now')) pending_quotes,
    (SELECT count(*) FROM projects WHERE status NOT IN ('Completed','Cancelled')) active_projects,
    (SELECT count(*) FROM projects WHERE status='Awaiting Client Review') awaiting_review,
    (SELECT count(*) FROM invoices WHERE status='open') unpaid_invoices,
    (SELECT count(*) FROM tickets WHERE status NOT IN ('Resolved','Closed')) open_tickets,
    (SELECT count(*) FROM hosting_services) hosted_services`);
  const inquiries = all<InquiryRow>("SELECT * FROM inquiries WHERE status!='draft' ORDER BY created_at DESC LIMIT 100");
  const projects = all<{ id: string; title: string; status: string; due_on: string | null }>("SELECT id,title,status,due_on FROM projects ORDER BY due_on NULLS LAST, created_at DESC");
  const tickets = all<{ id: string; title: string; status: string; priority: string }>("SELECT id,title,status,priority FROM tickets ORDER BY created_at DESC");
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + (Number(setting("quote_expiry", "14")) || 14) * 86400000);
  const expiry = expiryDate.toISOString().slice(0, 10);
  return <>
    <PageIntro title="Studio administration" eyebrow="Scriptmoth operations" artwork={assets.mark} tone="plain">Review new inquiries and manage active work.</PageIntro>
    <div className="section site-container business-stack">
      <nav className="business-toolbar" aria-label="Studio administration">
        {adminLinks.map(([path, title, Icon]) =>
          <Link className="text-link" href={`/admin/${path}`} key={path}><Icon size={16} aria-hidden="true" />{title}</Link>)}
        <Link className="text-link" href="/dashboard"><LayoutDashboard size={16} aria-hidden="true" />Client dashboard</Link>
      </nav>
      <Window label="Studio overview"><dl className="business-panel admin-counts">
        {Object.entries(counts ?? {}).map(([key, value]) => {
          const Icon = countIcons[key];
          return <div key={key}><dt>{Icon && <Icon size={14} aria-hidden="true" />}{countLabels[key] ?? key}</dt><dd>{value}</dd></div>;
        })}
      </dl></Window>
      <div className="business-split">
        <Window label="Projects and deadlines"><div className="business-panel"><h2>Projects</h2>
          {projects.length ? <ul className="business-list">{projects.map(project => <li key={project.id}>
            <Link className="text-link" href={`/admin/projects/${project.id}`}>{project.title}</Link><div className="business-state-row"><BusinessStatus status={project.status} />{project.due_on && <span className="business-meta"><CalendarClock size={14} aria-hidden="true" />Due {project.due_on}</span>}</div>
          </li>)}</ul> : <p>No accepted projects yet.</p>}
        </div></Window>
        <Window label="Support and revisions"><div className="business-panel"><h2>Tickets</h2>
          {tickets.length ? <ul className="business-list">{tickets.map(ticket => <li key={ticket.id}>
            <Link className="text-link" href={`/admin/support/${ticket.id}`}>{ticket.title}</Link><div className="business-state-row"><BusinessStatus status={ticket.status} /><span>{ticket.priority}</span></div>
          </li>)}</ul> : <p>No tickets yet.</p>}
        </div></Window>
      </div>
      <Window label="Project inquiries"><div className="business-panel"><h2>Project inquiries</h2>
        {!inquiries.length && <p>Submitted project inquiries will appear here.</p>}
        {inquiries.map(inquiry => {
          const data = JSON.parse(inquiry.data) as InquiryData;
          const price = JSON.parse(inquiry.estimate) as { total: number; monthly: number; currency: string; pricingVersion?: string; lines: { label: string; id: string; cents: number | null; quantity?: number }[] };
          return <details key={inquiry.id}><summary className="business-summary">{data.project_name || "Project inquiry"} · {inquiry.status}</summary>
            <div className="business-stack">
              <p>{inquiry.id} · {inquiry.created_at}</p>
              <p>{data.name} · {inquiry.email}{data.discord ? ` · ${data.discord}` : ""}</p>
              <p className="business-prose">{data.description}</p>
              {data.hosting_mode && <p>Hosting responsibility · {hostingModes[data.hosting_mode]}</p>}
              {data.hosting_provider && <p className="business-prose">Client’s provider and plan · {data.hosting_provider}</p>}
              {[["Requirements", data.features], ["Budget", data.budget], ["Desired date", data.deadline], ["Hosting", data.hosting], ["References", data.references], ["Discord style codes", data.showcase_ids?.join(", ")], ["Style notes", data.showcase_notes], ["Existing project", data.existing]].map(([label, value]) => value && <p className="business-prose" key={label}><strong>{label}</strong> · {value}</p>)}
              <h3>Submitted estimate · {money(price.total, price.currency)} · {money(price.monthly, price.currency)}/mo</h3>
              <ul className="business-list">{price.lines.map(line => <li key={line.id}>{line.label}{(line.quantity ?? 1) > 1 ? ` × ${line.quantity}` : ""} · {line.cents === null ? "Custom estimate" : money(line.cents, price.currency)}
                {data.configuration?.filter(item => item.id === line.id).map(item => <p key={item.id}>{[item.complexity, ...Object.entries(item.settings ?? {}).filter(([, value]) => value).map(([key, value]) => `${key} = ${value}`)].filter(Boolean).join(" · ")}</p>)}
              </li>)}</ul>
              {price.pricingVersion && <p>Pricing version <code>{price.pricingVersion.slice(0, 12)}</code></p>}
              {all<{ id: string; filename: string }>("SELECT id,filename FROM files WHERE inquiry_id=?", inquiry.id).map(file => <a key={file.id} className="text-link" href={fileUrl(file.id, actor)}><Paperclip size={16} aria-hidden="true" />{file.filename}</a>)}
              <div className="business-split">
                <AdminForm title="Inquiry status" intent="inquiry" id={inquiry.id}>
                  <Field name="status" label="Status" options={["new", "reviewing", "closed"]} value={inquiry.status} required />
                </AdminForm>
                <AdminForm title="Send a formal quote" intent="send_quote" id={inquiry.id} submit="Send to client" icon={<Send size={17} aria-hidden="true" />}>
                  <p>The client needs a verified account with the same email address.</p>
                  <Field name="scope" label="Agreed scope and included features" large required max={8000} />
                  <Field name="lines" label="Line items (Label | Amount | one-time, recurring, or discount)" large required max={5000} />
                  <Field name="terms" label="Terms and milestone payment schedule" large max={4000} />
                  <Field name="expires_on" label="Expires on" type="date" value={expiry} required />
                </AdminForm>
              </div>
              {all<{ id: string; version: number; status: string; expires_on: string }>("SELECT id,version,status,expires_on FROM quotes WHERE inquiry_id=? ORDER BY version DESC", inquiry.id).map(quote => <p key={quote.id}>Quote v{quote.version} · {quote.status} · expires {quote.expires_on}</p>)}
            </div>
          </details>;
        })}
      </div></Window>
    </div>
  </>;
}
