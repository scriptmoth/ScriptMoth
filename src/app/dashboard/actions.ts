"use server";

import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { requireViewer, auth } from "@/lib/business/auth";
import { audit, db, one, run, transaction } from "@/lib/business/db";
import { authorizedFile, readUploads, storeUploads } from "@/lib/business/files";
import { enqueue, flushNotifications } from "@/lib/business/notify";
import { priorities, textValue, ticketCategories } from "@/lib/business/rules";
import type { ActionResult } from "@/components/business/forms";

export async function clientAction(_previous: ActionResult, form: FormData): Promise<ActionResult> {
  const actor = await requireViewer();
  const get = (key: string, max = 120, required = false) => textValue(form, key, max, required);
  try {
    const intent = get("intent"), id = get("id"), event = randomUUID();
    if (intent === "profile") {
      const name = get("name", 100, true);
      // The display name is the only account field edited here.
      await auth();
      run("UPDATE user SET name=?,updatedAt=CURRENT_TIMESTAMP WHERE id=?", name, actor.id);
    }
    const uploads = ["message", "ticket", "reply"].includes(intent) ? await readUploads(form) : [];
    transaction(db(), () => {
      switch (intent) {
        case "profile":
          run("INSERT INTO client_settings (user_id,email_updates) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET email_updates=excluded.email_updates", actor.id, Number(form.get("email_updates") === "yes"));
          break;
        case "delete_account":
          run("INSERT INTO client_settings (user_id,deletion_requested_at) VALUES (?,CURRENT_TIMESTAMP) ON CONFLICT(user_id) DO UPDATE SET deletion_requested_at=CURRENT_TIMESTAMP", actor.id);
          break;
        case "quote": {
          const decision = get("decision");
          if (decision !== "accept" && decision !== "decline") throw new Error("Choose a decision.");
          const quote = one<{ id: string; inquiry_id: string; owner_id: string; data: string }>("SELECT * FROM quotes WHERE id=? AND owner_id=? AND status='sent' AND expires_on>=date('now')", id, actor.id);
          if (!quote) throw new Error("The quote is expired or no longer available.");
          run("UPDATE quotes SET status=?,decided_at=CURRENT_TIMESTAMP WHERE id=?", decision === "accept" ? "accepted" : "declined", id);
          if (decision === "accept") {
            const inquiry = one<{ data: string }>("SELECT data FROM inquiries WHERE id=?", quote.inquiry_id);
            const request = inquiry ? JSON.parse(inquiry.data) : {};
            const snapshot = JSON.parse(quote.data);
            run("INSERT INTO projects (id,quote_id,owner_id,title,project_type,scope,status) VALUES (?,?,?,?,?,?,'Planning')",
              event, id, actor.id, request.project_name || "Scriptmoth project", request.type || "other", snapshot.scope);
            run("UPDATE inquiries SET status='closed' WHERE id=?", quote.inquiry_id);
          }
          enqueue(event, process.env.SCRIPTMOTH_INQUIRY_EMAIL ?? "", decision === "accept" ? "quote_accepted" : "quote_declined", id);
          break;
        }
        case "message":
        case "read":
        case "resolve": {
          if (!one("SELECT id FROM projects WHERE id=? AND owner_id=?", id, actor.id)) throw new Error("Project not found.");
          if (intent === "message") {
            const body = get("body", 5000, uploads.length === 0);
            run("INSERT INTO project_entries (id,project_id,author_id,kind,body) VALUES (?,?,?,'message',?)", event, id, actor.id, body);
            storeUploads(uploads, { project: id, entry: event }, actor);
            enqueue(event, process.env.SCRIPTMOTH_INQUIRY_EMAIL ?? "", "message", id);
          } else if (intent === "read") {
            run("INSERT INTO project_reads VALUES (?,?,CURRENT_TIMESTAMP) ON CONFLICT(project_id,user_id) DO UPDATE SET read_at=CURRENT_TIMESTAMP", id, actor.id);
          } else if (!run("UPDATE project_entries SET resolved_at=CURRENT_TIMESTAMP WHERE id=? AND project_id=? AND kind IN ('action','delivery') AND resolved_at IS NULL", get("entry"), id).changes) throw new Error("Action not found.");
          break;
        }
        case "ticket": {
          const project = get("project");
          const category = get("category"), priority = get("priority");
          if (!ticketCategories.some(value => value === category) || !priorities.some(value => value === priority)) throw new Error("Choose a request category and impact.");
          if ((project && !one("SELECT id FROM projects WHERE id=? AND owner_id=?", project, actor.id)) || (category === "Revision" && !project)) throw new Error("Choose one of your projects.");
          run("INSERT INTO tickets (id,owner_id,project_id,category,title,body,affected_feature,priority) VALUES (?,?,?,?,?,?,?,?)",
            event, actor.id, project || null, category, get("title", 150, true), get("body", 5000, true), get("affected_feature", 200), priority);
          storeUploads(uploads, { ticket: event }, actor);
          enqueue(event, process.env.SCRIPTMOTH_INQUIRY_EMAIL ?? "", "support", event);
          break;
        }
        case "reply": {
          if (!one("SELECT id FROM tickets WHERE id=? AND owner_id=? AND status NOT IN ('Resolved','Closed')", id, actor.id)) throw new Error("This ticket cannot receive replies.");
          run("INSERT INTO ticket_replies (id,ticket_id,author_id,body) VALUES (?,?,?,?)", event, id, actor.id, get("body", 5000, !uploads.length));
          storeUploads(uploads, { ticket: id }, actor);
          enqueue(event, process.env.SCRIPTMOTH_INQUIRY_EMAIL ?? "", "support", id);
          break;
        }
        case "delete_file": {
          if (authorizedFile(id, actor, false)?.uploader_id !== actor.id) throw new Error("File not found.");
          run("DELETE FROM files WHERE id=?", id);
          break;
        }
        default: throw new Error("Choose a valid action.");
      }
      audit(actor.id, `client.${intent}`, id || event);
    });
    after(flushNotifications);
    revalidatePath("/dashboard", "layout");
    revalidatePath("/admin", "layout");
    return { message: "Saved." };
  } catch (error) {
    if (error instanceof Error && !("code" in error)) return { error: error.message };
    console.error("Scriptmoth client change failed", error instanceof Error && "code" in error ? error.code : "");
    return { error: "The change could not be saved." };
  }
}
