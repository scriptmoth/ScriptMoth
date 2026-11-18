import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { PageIntro, Window } from "@/components/ui";
import { AdminForm } from "@/components/business/admin-form";
import { Field } from "@/components/business/forms";
import { requireAdmin } from "@/lib/business/auth";
import { all } from "@/lib/business/db";

export const metadata = { title: "Client Administration", robots: { index: false } };
export default async function ClientAdmin({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const actor = await requireAdmin();
  const { q } = await searchParams;
  const term = typeof q === "string" ? q.trim().slice(0, 120) : "";
  const clients = all<{ id: string; email: string; name: string; enabled: number; deletion_requested_at: string | null }>(`
    SELECT u.id,u.email,u.name,coalesce(c.enabled,1) enabled,c.deletion_requested_at FROM user u LEFT JOIN client_settings c ON c.user_id=u.id
    WHERE instr(lower(u.name),lower(?))>0 OR instr(lower(u.email),lower(?))>0 OR ?='' ORDER BY u.email LIMIT 100
  `, term, term, term);
  return <><PageIntro eyebrow="Studio administration" title="Clients" tone="plain">Find account records, projects, and internal notes.</PageIntro>
    <div className="section site-container business-stack">
      <Link href="/admin" className="text-link"><ArrowLeft className="icon-back" size={16} aria-hidden="true" />Admin overview</Link>
      <form className="business-toolbox business-toolbar"><Field name="q" label="Search by name or email" value={term} /><button className="button button--outline"><Search size={16} aria-hidden="true" />Search</button></form>
      <Window label="Client directory"><div className="business-panel">
        {!clients.length && <p>No matching clients.</p>}
        {clients.map(client => <details key={client.id}><summary className="business-summary">{client.name || client.email}</summary>
          <div className="business-stack"><p>{client.email} · {client.enabled ? "Enabled" : "Disabled"}</p>
            {client.deletion_requested_at && <p>Deletion requested {client.deletion_requested_at}. Review retention requirements and coordinate deletion with the client.</p>}
            <ul className="business-list">{all<{ id: string; title: string }>("SELECT id,title FROM projects WHERE owner_id=?", client.id).map(project => <li key={project.id}><Link className="text-link" href={`/admin/projects/${project.id}`}>{project.title}</Link></li>)}</ul>
            {all<{ id: string; body: string; created_at: string }>("SELECT id,body,created_at FROM client_notes WHERE user_id=? ORDER BY created_at DESC", client.id).map(note => <p key={note.id} className="business-prose">{note.created_at} · {note.body}</p>)}
            {client.id !== actor.id && <AdminForm intent="client" id={client.id} title="Account access and internal note">
              <label><input type="checkbox" value="yes" name="enabled" defaultChecked={Boolean(client.enabled)} /> Portal access enabled</label>
              <Field name="note" label="Add internal note" large max={4000} />
            </AdminForm>}
          </div>
        </details>)}
      </div></Window>
    </div>
  </>;
}
