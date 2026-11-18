import { randomUUID } from "node:crypto";
import { one, run } from "@/lib/business/db";
import { authorizedFile } from "@/lib/business/files";
import { notifyClient } from "@/lib/business/notify";
import { classifications, priorities, ticketStatuses } from "@/lib/business/rules";
import type { AdminHandlerCtx } from "./context";

export function handleClient({ form, get, id, actor }: AdminHandlerCtx) {
  if (!one("SELECT id FROM user WHERE id=?", id)) throw new Error("Client not found.");
  if (id === actor.id) throw new Error("Your administrator access cannot be changed here.");
  run("INSERT INTO client_settings (user_id,enabled) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET enabled=excluded.enabled", id, Number(form.get("enabled") === "yes"));
  const note = get("note", 4000);
  if (note) run("INSERT INTO client_notes (id,user_id,author_id,body) VALUES (?,?,?,?)", randomUUID(), id, actor.id, note);
}

export function handleTicket({ get, id, actor }: AdminHandlerCtx) {
  const ticket = one<{ owner_id: string }>("SELECT owner_id FROM tickets WHERE id=?", id);
  if (!ticket) throw new Error("Ticket not found.");
  const status = get("status"), priority = get("priority"), classification = get("classification");
  if (!ticketStatuses.some(item => item === status) || !priorities.some(item => item === priority) ||
    (classification && !classifications.some(item => item === classification))) throw new Error("Check the ticket options.");
  const reply = get("reply", 5000);
  const resolution = get("resolution", 3000);
  run("UPDATE tickets SET status=?,priority=?,classification=?,resolution=? WHERE id=?", status, priority, classification, resolution, id);
  const event = randomUUID();
  if (reply) run("INSERT INTO ticket_replies (id,ticket_id,author_id,body) VALUES (?,?,?,?)", event, id, actor.id, reply);
  if (reply || classification || resolution) notifyClient(event, ticket.owner_id, classification ? "revision" : "support", id);
}

export function handleDeleteFile({ id, actor }: AdminHandlerCtx) {
  if (!authorizedFile(id, actor, false)) throw new Error("File not found.");
  run("DELETE FROM files WHERE id=?", id);
}