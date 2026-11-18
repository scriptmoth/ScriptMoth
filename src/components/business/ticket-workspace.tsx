import Link from "next/link";
import { ArrowLeft, FolderOpen, Paperclip, Send } from "lucide-react";
import { notFound } from "next/navigation";
import { PageIntro, Window } from "@/components/ui";
import { AdminForm } from "./admin-form";
import { AttachmentField, ClientForm } from "./client-form";
import { Field } from "./forms";
import { all, one } from "@/lib/business/db";
import { fileUrl, type Actor } from "@/lib/business/files";
import { classifications, priorities, ticketStatuses } from "@/lib/business/rules";

export function TicketWorkspace({ id, actor, admin }: { id: string; actor: Actor; admin: boolean }) {
  const ticket = one<{ title: string; body: string; status: string; priority: string; category: string; classification: string | null; resolution: string | null; project_id: string | null; affected_feature: string }>(
    "SELECT title,body,status,priority,category,classification,resolution,project_id,affected_feature FROM tickets WHERE id=? AND (?=1 OR owner_id=?)", id, Number(admin && actor.admin), actor.id,
  );
  if (!ticket) notFound();
  const replies = all<{ id: string; body: string; created_at: string; author_id: string }>("SELECT * FROM ticket_replies WHERE ticket_id=? ORDER BY created_at", id);
  const attachments = all<{ id: string; filename: string }>("SELECT id,filename FROM files WHERE ticket_id=?", id);
  const root = admin ? "/admin" : "/dashboard";
  return <><PageIntro eyebrow={ticket.category} title={ticket.title} tone="plain">{ticket.status} · {ticket.priority} impact</PageIntro>
    <div className="section site-container business-stack">
      <div className="business-toolbar"><Link className="text-link" href={root}><ArrowLeft className="icon-back" size={16} aria-hidden="true" />{admin ? "Admin overview" : "Back to dashboard"}</Link>
        {ticket.project_id && <Link className="text-link" href={`${root}/projects/${ticket.project_id}`}><FolderOpen size={16} aria-hidden="true" />Open associated project</Link>}
      </div>
      <Window label="Ticket conversation"><div className="business-panel">
        <h2>Request</h2><p className="business-prose">{ticket.body}</p>
        {ticket.affected_feature && <p>Affected feature · {ticket.affected_feature}</p>}
        {ticket.classification && <p>{ticket.classification}</p>}
        {ticket.resolution && <p className="business-prose">{ticket.resolution}</p>}
        <ul className="business-list">{replies.map(reply => <li key={reply.id}><p>{reply.author_id === actor.id ? "You" : "Reply"} · {reply.created_at} UTC</p><p className="business-prose">{reply.body}</p></li>)}</ul>
        {attachments.map(file => <p key={file.id}><a className="text-link" href={fileUrl(file.id, actor)}><Paperclip size={16} aria-hidden="true" />{file.filename}</a></p>)}
      </div></Window>
      {admin ? <AdminForm intent="ticket" id={id} title="Ticket status and reply">
        <Field name="status" label="Status" options={ticketStatuses} value={ticket.status} required />
        <Field name="priority" label="Priority" options={priorities} value={ticket.priority} required />
        <Field name="classification" label="Classification" options={classifications} value={ticket.classification} />
        <Field name="resolution" label="Client-visible resolution" large value={ticket.resolution} />
        <Field name="reply" label="Reply to the client" large max={5000} />
      </AdminForm> : !["Resolved", "Closed"].includes(ticket.status) && <ClientForm intent="reply" id={id} title="Reply" submit="Send reply" icon={<Send size={17} aria-hidden="true" />}>
        <Field name="body" label="Message" large max={5000} /><AttachmentField />
      </ClientForm>}
    </div></>;
}
