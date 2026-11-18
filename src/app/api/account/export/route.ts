import { viewer } from "@/lib/business/auth";
import { all } from "@/lib/business/db";

export async function GET() {
  const actor = await viewer();
  if (!actor) return new Response(null, { status: 401 });
  const id = actor.id;
  const data = {
    profile: { name: actor.name, email: actor.email },
    preferences: all("SELECT email_updates,deletion_requested_at FROM client_settings WHERE user_id=?", id),
    inquiries: all("SELECT id,status,data,estimate,created_at FROM inquiries WHERE owner_id=?", id),
    quotes: all("SELECT id,status,version,expires_on,data FROM quotes WHERE owner_id=?", id),
    projects: all("SELECT id,title,project_type,scope,status,due_on FROM projects WHERE owner_id=?", id),
    milestones: all("SELECT m.* FROM milestones m JOIN projects p ON p.id=m.project_id WHERE p.owner_id=?", id),
    messages: all("SELECT e.project_id,e.kind,e.body,e.created_at FROM project_entries e JOIN projects p ON p.id=e.project_id WHERE p.owner_id=? AND e.kind IN ('message','update','action','delivery')", id),
    invoices: all("SELECT i.id,i.project_id,i.kind,i.title,i.cents,i.currency,i.status,i.due_on FROM invoices i JOIN projects p ON p.id=i.project_id WHERE p.owner_id=?", id),
    tickets: all("SELECT * FROM tickets WHERE owner_id=?", id),
    replies: all("SELECT r.ticket_id,r.body,r.created_at FROM ticket_replies r JOIN tickets t ON t.id=r.ticket_id WHERE t.owner_id=?", id),
  };
  return Response.json(data, { headers: { "Cache-Control": "private, no-store", "Content-Disposition": 'attachment; filename="scriptmoth-account.json"' } });
}
