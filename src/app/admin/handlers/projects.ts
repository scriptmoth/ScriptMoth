import { randomUUID } from "node:crypto";
import { plans } from "@/lib/business/catalog";
import { one, run } from "@/lib/business/db";
import { storeUploads } from "@/lib/business/files";
import { notifyClient } from "@/lib/business/notify";
import { amount, dateValue, projectStatuses } from "@/lib/business/rules";
import type { AdminIntentCtx } from "./context";

export function handleProjectIntent({ get, id, actor, files, intent }: AdminIntentCtx) {
  const project = one<{ id: string; owner_id: string; status: string }>("SELECT id,owner_id,status FROM projects WHERE id=?", id);
  if (!project) throw new Error("Project not found.");
  const due = dateValue(get("due_on"));
  const event = randomUUID();
  if (intent === "project") {
    const status = get("status");
    if (!projectStatuses.some(item => item === status)) throw new Error("Choose a project status.");
    run("UPDATE projects SET title=?,status=?,due_on=? WHERE id=?", get("title", 150, true), status, due, id);
    if (status !== project.status) notifyClient(event, project.owner_id, status === "Awaiting Client Review" ? "feedback" : "status", id);
  } else if (intent === "milestone") {
    const milestone = get("milestone");
    if (milestone) {
      if (run("UPDATE milestones SET completed_at=CURRENT_TIMESTAMP WHERE id=? AND project_id=? AND completed_at IS NULL", milestone, id).changes) notifyClient(event, project.owner_id, "milestone", id);
    } else run("INSERT INTO milestones (id,project_id,title,due_on) VALUES (?,?,?,?)", event, id, get("title", 150, true), due);
  } else if (intent === "project_entry") {
    const kind = get("kind");
    const body = get("body", 5000, files.length === 0);
    if (!["message", "update", "note", "task", "time", "action", "delivery"].includes(kind) ||
      (files.length && ["note", "task", "time"].includes(kind))) throw new Error("Choose a supported entry type.");
    if (kind === "time" && (!/^\d{1,5}$/.test(body) || Number(body) < 1)) throw new Error("Enter work time in whole minutes.");
    run("INSERT INTO project_entries (id,project_id,author_id,kind,body) VALUES (?,?,?,?,?)", event, id, actor.id, kind, body);
    storeUploads(files, { project: id, entry: event }, actor);
    if (["message", "update", "action", "delivery"].includes(kind)) notifyClient(event, project.owner_id, kind === "action" || kind === "delivery" ? "feedback" : "message", id);
  } else if (intent === "invoice") {
    const kind = get("kind");
    if (!["deposit", "milestone", "balance", "one-time"].includes(kind)) throw new Error("Choose an invoice type.");
    const cents = amount(get("price", 120, true));
    if (!cents) throw new Error("Enter a positive invoice amount.");
    const accepted = one<{ data: string }>("SELECT q.data FROM quotes q JOIN projects p ON p.quote_id=q.id WHERE p.id=?", id);
    const quote = accepted ? JSON.parse(accepted.data) : null;
    const issued = one<{ total: number }>("SELECT coalesce(sum(cents),0) total FROM invoices WHERE project_id=? AND status!='refunded'", id)?.total ?? 0;
    if (!quote || cents + issued > quote.total) throw new Error("Invoices cannot exceed the accepted one-time quote total.");
    run("INSERT INTO invoices (id,project_id,kind,title,cents,currency,due_on) VALUES (?,?,?,?,?,?,?)", event, id, kind, get("title", 150, true), cents, quote.currency, due);
    notifyClient(event, project.owner_id, "invoice", id);
  } else {
    const plan = plans().find(item => item.id === get("plan"));
    if (!plan) throw new Error("Choose a hosting plan.");
    run("INSERT OR IGNORE INTO hosting_plans VALUES (?,?,?)", plan.id, plan.title, JSON.stringify(plan));
    const existing = get("service");
    const maintenance = get("maintenance", 1200);
    const data = JSON.stringify({ provider: get("provider"), deployment: get("deployment"), backup: get("backup", 1200),
      status: get("status", 120, true), renewal: due, maintenance, billing: get("billing", 120) });
    if (existing) {
      if (!run("UPDATE hosting_services SET plan_id=?,data=? WHERE id=? AND project_id=?", plan.id, data, existing, id).changes) throw new Error("Service not found.");
    } else run("INSERT INTO hosting_services (id,project_id,plan_id,data) VALUES (?,?,?,?)", event, id, plan.id, data);
    if (maintenance) notifyClient(event, project.owner_id, "maintenance", id);
  }
}