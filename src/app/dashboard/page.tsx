import Link from "next/link";
import { Check, Download, LifeBuoy, MessageSquare, PencilLine, Shield, UserX } from "lucide-react";
import { ButtonLink, PageIntro, Window } from "@/components/ui";
import { SignOut } from "@/components/business/auth-form";
import { ClientForm, AttachmentField } from "@/components/business/client-form";
import { Field } from "@/components/business/forms";
import { BusinessStatus, SleepingMoth } from "@/components/business/presentation";
import { requireViewer } from "@/lib/business/auth";
import { all, one } from "@/lib/business/db";
import { money, priorities, ticketCategories } from "@/lib/business/rules";
import type { InquiryRow } from "@/lib/business/inquiries";
import { assets } from "@/lib/assets";

export const metadata = { title: "Client Dashboard", robots: { index: false } };
type Project = { id: string; title: string; status: string; unread: number };
type Quote = { id: string; status: string; version: number; expires_on: string; data: string };
export default async function Dashboard() {
  const actor = await requireViewer();
  const projects = all<Project>(`SELECT p.id,p.title,p.status,(SELECT count(*) FROM project_entries e
    WHERE e.project_id=p.id AND e.author_id!=? AND e.kind IN ('message','update','action','delivery')
    AND e.created_at>coalesce(r.read_at,'')) unread FROM projects p
    LEFT JOIN project_reads r ON r.project_id=p.id AND r.user_id=? WHERE p.owner_id=? ORDER BY p.created_at DESC`, actor.id, actor.id, actor.id);
  const quotes = all<Quote>("SELECT * FROM quotes WHERE owner_id=? ORDER BY inquiry_id,version DESC", actor.id);
  const inquiries = all<InquiryRow>("SELECT * FROM inquiries WHERE owner_id=? ORDER BY created_at DESC", actor.id);
  const tickets = all<{ id: string; title: string; status: string }>("SELECT id,title,status FROM tickets WHERE owner_id=? ORDER BY created_at DESC", actor.id);
  const settings = one<{ email_updates: number; deletion_requested_at: string }>("SELECT * FROM client_settings WHERE user_id=?", actor.id);
  return <>
    <PageIntro title="Client dashboard" eyebrow="Your Scriptmoth projects" artwork={assets.mark} tone="plain">Welcome, {actor.name || actor.email}.</PageIntro>
    <div className="section site-container business-stack">
      <div className="business-toolbar"><ButtonLink href="/contact">Build a project</ButtonLink>{actor.admin && <Link className="text-link" href="/admin"><Shield size={16} aria-hidden="true" />Studio administration</Link>}<SignOut /></div>
      <div className="business-split">
        <Window label="Projects"><div className="business-panel"><h2>Projects</h2>
          {projects.length ? <ul className="business-list">{projects.map(project => <li key={project.id}><Link className="text-link" href={`/dashboard/projects/${project.id}`}>{project.title}</Link><div className="business-state-row"><BusinessStatus status={project.status} />{project.unread > 0 && <span className="business-meta"><MessageSquare size={14} aria-hidden="true" />{project.unread} unread</span>}</div></li>)}</ul> : <p>Accepted quotes appear here as projects.</p>}
        </div></Window>
        <Window label="Inquiries and drafts"><div className="business-panel"><h2>Inquiries</h2>
          {inquiries.length ? <ul className="business-list">{inquiries.map(inquiry => {
            const data = JSON.parse(inquiry.data);
            return <li key={inquiry.id}><strong>{data.project_name || "Project inquiry"}</strong><div className="business-state-row"><BusinessStatus status={inquiry.status} /><span>{inquiry.id}</span></div>
              {inquiry.status === "draft" && <Link href={`/contact?draft=${inquiry.id}`} className="text-link"><PencilLine size={16} aria-hidden="true" />Resume build</Link>}</li>;
          })}</ul> : <p>Submitted inquiries and account drafts appear here.</p>}
        </div></Window>
      </div>
      {quotes.length > 0 && <Window label="Quotes"><div className="business-panel"><h2>Quotes</h2>
        {quotes.map(item => {
          const quote = JSON.parse(item.data) as { scope: string; rows: { label: string; kind: string; cents: number }[]; terms: string; total: number; currency: string };
          const actionable = item.status === "sent" && item.expires_on >= new Date().toISOString().slice(0, 10);
          return <details key={item.id}><summary className="business-summary">Quote v{item.version} · {money(quote.total, quote.currency)} · {item.status === "sent" && !actionable ? "expired" : item.status}</summary>
            <div className="business-stack"><p>Expires {item.expires_on}</p><p className="business-prose">{quote.scope}</p>
              <ul className="business-list">{quote.rows.map((row, index) => <li key={index}>{row.label} · {money(row.cents, quote.currency)}{row.kind === "recurring" ? "/mo" : ""}</li>)}</ul>
              {quote.terms && <p className="business-prose">{quote.terms}</p>}
              {actionable && <ClientForm title="Quote decision" intent="quote" id={item.id} submit="Accept or decline quote" icon={<Check size={17} aria-hidden="true" />}>
                <Field name="decision" label="Decision" options={[{ id: "accept", title: "Accept quote" }, { id: "decline", title: "Decline quote" }]} required />
              </ClientForm>}
            </div></details>;
        })}
      </div></Window>}
      <div className="business-split">
        <Window label="Support requests"><div className="business-panel"><h2 id="support">Support</h2>
          {tickets.length ? <ul className="business-list">{tickets.map(ticket => <li key={ticket.id}><Link href={`/dashboard/support/${ticket.id}`} className="text-link">{ticket.title}</Link><div><BusinessStatus status={ticket.status} /></div></li>)}</ul> : <SleepingMoth>No support or revision requests yet.</SleepingMoth>}
        </div></Window>
        <ClientForm title="New support or revision request" intent="ticket" submit="Open ticket" icon={<LifeBuoy size={17} aria-hidden="true" />}>
          <Field name="title" label="Subject" max={150} required />
          <Field name="category" label="Category" options={ticketCategories} required />
          <Field name="priority" label="Impact" options={priorities} value="Normal" required />
          <Field name="project" label="Project (required for revisions)" options={projects.map(({ id, title }) => ({ id, title }))} />
          <Field name="affected_feature" label="Affected feature" max={200} />
          <Field name="body" label="What do you need help with?" max={5000} large required />
          <AttachmentField />
        </ClientForm>
      </div>
      <div className="business-split">
        <ClientForm title="Account profile" intent="profile">
          <Field name="name" label="Preferred name" max={100} value={actor.name} required />
          <p>Verified email · {actor.email}</p>
          <label><input type="checkbox" name="email_updates" value="yes" defaultChecked={settings?.email_updates !== 0} /> Email me project and billing updates</label>
          <Link className="text-link" href="/api/account/export"><Download size={16} aria-hidden="true" />Download account data</Link>
        </ClientForm>
        <ClientForm title="Account deletion" intent="delete_account" submit="Request account deletion" icon={<UserX size={17} aria-hidden="true" />}>
          <p>{settings?.deletion_requested_at ? "Your deletion request is awaiting review." : "Ask Scriptmoth to review removal of your account data."}</p>
        </ClientForm>
      </div>
    </div>
  </>;
}
