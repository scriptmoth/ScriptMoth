import { randomUUID } from "node:crypto";
import { currency } from "@/lib/business/catalog";
import { one, run } from "@/lib/business/db";
import { notifyClient } from "@/lib/business/notify";
import { amount, dateValue, list, quoteTotal } from "@/lib/business/rules";
import type { AdminHandlerCtx } from "./context";

export function handleInquiry({ get, id }: AdminHandlerCtx) {
  const status = get("status");
  if (!["new", "reviewing", "closed"].includes(status) || !run("UPDATE inquiries SET status=? WHERE id=? AND status!='draft'", status, id).changes) throw new Error("Inquiry not found.");
}

export function handleSendQuote({ get, id }: AdminHandlerCtx) {
  const inquiry = one<{ email: string; owner_id: string | null }>("SELECT email,owner_id FROM inquiries WHERE id=? AND status!='draft'", id);
  if (!inquiry) throw new Error("Inquiry not found.");
  const verified = one<{ id: string }>("SELECT id FROM user WHERE lower(email)=lower(?) AND emailVerified=1", inquiry.email);
  const owner = inquiry.owner_id || verified?.id;
  if (!owner) throw new Error("The client needs a verified account with the inquiry email before receiving a quote.");
  if (one("SELECT id FROM quotes WHERE inquiry_id=? AND status='accepted'", id)) throw new Error("This inquiry already has an accepted quote.");
  const expires = dateValue(get("expires_on"));
  if (!expires || expires < new Date().toISOString().slice(0, 10)) throw new Error("Choose a future expiration date.");
  const rows = list(get("lines", 5000, true)).map(line => {
    const [label, price, kind, ...extra] = line.split("|").map(item => item.trim());
    if (!label || !price || extra.length || !["one-time", "recurring", "discount"].includes(kind ?? "one-time")) throw new Error("Use Label | Amount | one-time, recurring, or discount.");
    return { label, kind: kind ?? "one-time", cents: amount(price) * (kind === "discount" ? -1 : 1) };
  });
  const total = quoteTotal(rows);
  const version = (one<{ version: number }>("SELECT max(version) version FROM quotes WHERE inquiry_id=?", id)?.version ?? 0) + 1;
  const quote = randomUUID();
  run("UPDATE inquiries SET owner_id=?,status='reviewing' WHERE id=?", owner, id);
  run("UPDATE quotes SET status='superseded' WHERE inquiry_id=? AND status='sent'", id);
  run("INSERT INTO quotes (id,inquiry_id,owner_id,version,status,expires_on,data) VALUES (?,?,?,?,'sent',?,?)",
    quote, id, owner, version, expires, JSON.stringify({ scope: get("scope", 8000, true), rows, total, currency: currency(), terms: get("terms", 4000) }));
  notifyClient(`quote:${quote}`, owner, "quote", id);
}