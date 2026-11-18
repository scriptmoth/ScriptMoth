import Link from "next/link";
import { ArrowLeft, Check, CheckCheck, CreditCard, Flag, LifeBuoy, MailCheck, MessagesSquare, Paperclip, Receipt, Send, Server, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { PageIntro, Window } from "@/components/ui";
import { AdminForm } from "./admin-form";
import { ClientForm, AttachmentField } from "./client-form";
import { Field } from "./forms";
import { BusinessStatus, HostingHealth, SleepingMoth } from "./presentation";
import { all, one } from "@/lib/business/db";
import { currency, plans } from "@/lib/business/catalog";
import { fileUrl, type Actor } from "@/lib/business/files";
import { money, projectStatuses } from "@/lib/business/rules";
import { paymentsConfigured } from "@/lib/business/payments";

type Project = { id: string; owner_id: string; title: string; scope: string; status: string; due_on: string | null };
type Invoice = { id: string; title: string; cents: number; currency: string; kind: string; status: string; due_on: string | null; receipt_url: string | null };
const entryLabels: Record<string, string> = {
  message: "Message", update: "Update", action: "Action item", delivery: "Deliverable",
  note: "Internal note", task: "Internal task", time: "Work time",
};

export function ProjectWorkspace({ id, actor, admin }: { id: string; actor: Actor; admin: boolean }) {
  const project = one<Project>("SELECT * FROM projects WHERE id=? AND (?=1 OR owner_id=?)", id, Number(admin && actor.admin), actor.id);
  if (!project) notFound();
  const milestones = all<{ id: string; title: string; due_on: string | null; completed_at: string | null }>("SELECT * FROM milestones WHERE project_id=? ORDER BY due_on NULLS LAST", id);
  const entries = all<{ id: string; kind: string; body: string; created_at: string; author_id: string; resolved_at: string | null }>(
    "SELECT * FROM project_entries WHERE project_id=? AND (?=1 OR kind IN ('message','update','action','delivery')) ORDER BY created_at DESC", id, Number(admin),
  );
  const files = all<{ id: string; filename: string; entry_id: string | null; uploader_id: string | null }>(
    "SELECT id,filename,entry_id,uploader_id FROM files WHERE project_id=?", id,
  );
  const invoices = all<Invoice>("SELECT id,title,cents,currency,kind,status,due_on,receipt_url FROM invoices WHERE project_id=? ORDER BY created_at DESC", id);
  const hosting = all<{ id: string; title: string; plan_id: string; data: string; subscription_id: string | null }>(
    "SELECT s.*,p.title FROM hosting_services s JOIN hosting_plans p ON p.id=s.plan_id WHERE s.project_id=?", id,
  );
  const completed = milestones.filter(item => item.completed_at).length;
  return <>
    <PageIntro eyebrow={admin ? "Studio administration" : "Client project"} title={project.title} tone="plain">{project.status}{project.due_on ? ` · Delivery target ${project.due_on}` : ""}</PageIntro>
    <div className="section site-container business-stack">
      <nav className="business-toolbar workspace-nav" aria-label="Project sections">
        <Link className="text-link" href={admin ? "/admin" : "/dashboard"}><ArrowLeft className="icon-back" size={16} aria-hidden="true" />{admin ? "Admin overview" : "Client dashboard"}</Link>
        <a className="text-link" href="#milestones"><Flag size={16} aria-hidden="true" />Milestones</a>
        <a className="text-link" href="#activity"><MessagesSquare size={16} aria-hidden="true" />Activity and files</a>
        <a className="text-link" href="#invoices"><Receipt size={16} aria-hidden="true" />Invoices</a>
        <a className="text-link" href="#hosting"><Server size={16} aria-hidden="true" />Hosting</a>
      </nav>
      <div className="business-split">
        <Window label="Agreed scope"><div className="business-panel"><h2>Project scope</h2><p className="business-prose">{project.scope}</p></div></Window>
        <Window label="Milestones"><div className="business-panel"><h2 id="milestones">Milestones</h2>
          {!milestones.length && <p>Milestones will appear as they are scheduled.</p>}
          {milestones.length > 0 && <div className="milestone-progress">
            <progress aria-label="Milestones completed" value={completed} max={milestones.length} />
            <span>{completed} of {milestones.length} complete</span>
          </div>}
          <ul className="business-list">{milestones.map(item => <li key={item.id}><div className="business-state-row"><strong>{item.title}</strong><BusinessStatus status={item.completed_at ? "Completed" : item.due_on ? `Due ${item.due_on}` : "Upcoming"} /></div>
            {admin && !item.completed_at && <AdminForm title="Milestone progress" intent="milestone" id={id} submit="Mark complete" icon={<Check size={17} aria-hidden="true" />}><input name="milestone" type="hidden" value={item.id} /></AdminForm>}
          </li>)}</ul>
        </div></Window>
      </div>
      {admin && <div className="business-split">
        <AdminForm title="Project status" intent="project" id={id}>
          <Field name="title" label="Project name" value={project.title} required /><Field name="status" label="Status" options={projectStatuses} value={project.status} required />
          <Field name="due_on" label="Confirmed delivery target" type="date" value={project.due_on} />
        </AdminForm>
        <AdminForm title="Add a milestone" intent="milestone" id={id}>
          <Field name="title" label="Milestone" required /><Field name="due_on" label="Due date" type="date" />
        </AdminForm>
      </div>}
      <Window label="Project activity"><div className="business-panel"><h2 id="activity">Messages, updates and deliverables</h2>
        {!entries.length && <SleepingMoth>No project messages or updates yet.</SleepingMoth>}
        <ul className="business-list">{entries.map(entry => <li key={entry.id}>
          <strong>{entryLabels[entry.kind] ?? entry.kind}{["note", "task", "time"].includes(entry.kind) ? " · internal" : ""}</strong><p>Posted {entry.created_at} (UTC)</p>
          <p className="business-prose">{entry.body}{entry.kind === "time" ? " minutes" : ""}</p>
          {files.filter(file => file.entry_id === entry.id).map(file => <div key={file.id}>
            <a className="text-link" href={fileUrl(file.id, actor)}><Paperclip size={16} aria-hidden="true" />{file.filename}</a>
            {(admin || file.uploader_id === actor.id) && <details><summary className="business-summary">Manage {file.filename}</summary>
              {admin ? <AdminForm title="Remove attachment" intent="delete_file" id={file.id} submit="Delete file" icon={<Trash2 size={17} aria-hidden="true" />} />
                : <ClientForm title="Remove attachment" intent="delete_file" id={file.id} submit="Delete file" icon={<Trash2 size={17} aria-hidden="true" />} />}
            </details>}
          </div>)}
          {["action", "delivery"].includes(entry.kind) && (entry.resolved_at ? <p>{entry.kind === "delivery" ? "Approved" : "Completed"}</p>
            : !admin && <ClientForm intent="resolve" id={id} title="Review" submit={entry.kind === "delivery" ? "Approve deliverable" : "Mark action complete"} icon={entry.kind === "delivery" ? <CheckCheck size={17} aria-hidden="true" /> : <Check size={17} aria-hidden="true" />}><input type="hidden" name="entry" value={entry.id} /></ClientForm>)}
        </li>)}</ul>
      </div></Window>
      {admin ? <AdminForm intent="project_entry" id={id} title="Post an entry" submit="Post" icon={<Send size={17} aria-hidden="true" />}>
        <Field name="kind" label="Type" options={[
          { id: "message", title: "Client message" }, { id: "update", title: "Client update" }, { id: "action", title: "Client action item" }, { id: "delivery", title: "Deliverable for approval" },
          { id: "note", title: "Internal note" }, { id: "task", title: "Internal task" }, { id: "time", title: "Internal work time, in minutes" },
        ]} required />
        <Field name="body" label="Message, description, or time in minutes" large max={5000} /><AttachmentField />
      </AdminForm> : <div className="business-split">
        <ClientForm title="Send a message or files" intent="message" id={id} submit="Send message" icon={<Send size={17} aria-hidden="true" />}><Field name="body" label="Message" large max={5000} /><AttachmentField /></ClientForm>
        <ClientForm title="Activity notifications" intent="read" id={id} submit="Mark all as read" icon={<MailCheck size={17} aria-hidden="true" />} />
      </div>}
      <div className="business-split">
        <Window label="Invoices"><div className="business-panel"><h2 id="invoices">Invoices and payments</h2>
          {!invoices.length && <p>No invoices issued yet.</p>}
          <ul className="business-list">{invoices.map(invoice => <li key={invoice.id}>
            <strong>{invoice.title} · {money(invoice.cents, invoice.currency)}</strong><div className="business-state-row"><BusinessStatus status={invoice.status.replaceAll("_", " ")} /><span>{invoice.kind}{invoice.due_on ? ` · Due ${invoice.due_on}` : ""}</span></div>
            {invoice.receipt_url && <a className="text-link" href={invoice.receipt_url}><Receipt size={16} aria-hidden="true" />View receipt</a>}
            {!admin && invoice.status === "open" && (paymentsConfigured() ? <form action="/api/payments/checkout" method="post">
              <input type="hidden" name="invoice" value={invoice.id} /><button className="button button--outline"><CreditCard size={17} aria-hidden="true" />Pay with Stripe</button>
            </form> : <p>Online payment is unavailable.</p>)}
          </li>)}</ul>
        </div></Window>
        {admin && <AdminForm title="Issue an invoice" intent="invoice" id={id} submit="Issue invoice" icon={<Receipt size={17} aria-hidden="true" />}>
          <Field name="title" label="Invoice title" required />
          <Field name="kind" label="Invoice type" options={["deposit", "milestone", "balance", "one-time"]} required />
          <Field name="price" label="Amount from accepted quote" required /><Field name="due_on" label="Due date" type="date" />
        </AdminForm>}
      </div>
      <Window label="Hosting"><div className="business-panel"><h2 id="hosting">Hosting services</h2>
        {!hosting.length && <p>No hosting service is linked to this project.</p>}
        {hosting.map(service => {
          const details = JSON.parse(service.data);
          const plan = plans().find(item => item.id === service.plan_id);
          return <section key={service.id} className="business-panel">
            <h3>{service.title}</h3><div className="business-state-row">{details.status && <HostingHealth status={details.status} />}{details.renewal && <span>Renews {details.renewal}</span>}{details.billing && <span>{details.billing}</span>}</div>
            {plan?.cents != null && <p>{money(plan.cents, currency())} per month management fee</p>}
            {details.maintenance && <p className="business-prose">{details.maintenance}</p>}
            {admin ? <><p>{details.provider} · {details.deployment}</p><p>{details.backup}</p><HostingEditor id={id} service={service.id} plan={service.plan_id} data={details} /></>
              : !service.subscription_id && plan?.providerPrice && paymentsConfigured() ? <form action="/api/payments/checkout" method="post">
                <input type="hidden" name="hosting" value={service.id} /><button className="button button--outline"><CreditCard size={17} aria-hidden="true" />Set up Stripe subscription</button>
              </form> : null}
          </section>;
        })}
        {admin && <HostingEditor id={id} />}
      </div></Window>
      {!admin && <Link className="text-link" href="/dashboard#support"><LifeBuoy size={16} aria-hidden="true" />Open a support or revision request</Link>}
    </div>
  </>;
}

function HostingEditor({ id, service, plan, data }: { id: string; service?: string; plan?: string; data?: Record<string, string> }) {
  return <AdminForm intent="hosting_service" id={id} title={service ? "Edit hosting service" : "Add hosting service"}>
    {service && <input type="hidden" name="service" value={service} />}
    <Field name="plan" label="Hosting plan" options={plans()} value={plan} required />
    <Field name="provider" label="Deployment provider" value={data?.provider} /><Field name="deployment" label="Deployment identifier" value={data?.deployment} />
    <Field name="status" label="Service health" value={data?.status} required /><Field name="billing" label="Billing status" value={data?.billing} />
    <Field name="due_on" label="Renewal date" type="date" value={data?.renewal} />
    <Field name="backup" label="Backups and monitoring" large value={data?.backup} />
    <Field name="maintenance" label="Client maintenance announcement" large value={data?.maintenance} />
  </AdminForm>;
}
