import { all, one, run } from "./db";
import { setting } from "./catalog";

export const templates = {
  inquiry: "Got it! Your Scriptmoth inquiry {{reference}} came through.",
  admin_inquiry: "A new Scriptmoth inquiry is ready for review. Reference {{reference}}.",
  quote: "Your quote is ready for review in the Scriptmoth portal.",
  quote_accepted: "The client accepted a Scriptmoth quote.",
  quote_declined: "The client declined a Scriptmoth quote.",
  payment: "Scriptmoth received a payment. View your invoice in the portal.",
  status: "Your Scriptmoth project status changed.",
  milestone: "A milestone was completed. Visit your Scriptmoth project for details.",
  feedback: "Your Scriptmoth project needs your feedback.",
  message: "You have a new Scriptmoth project message.",
  invoice: "A Scriptmoth invoice is available in your portal.",
  invoice_due: "A Scriptmoth invoice is due. Visit your portal to view it.",
  revision: "Your Scriptmoth revision request was updated.",
  support: "Your Scriptmoth support ticket has a reply.",
  renewal: "Your Scriptmoth hosting renewal is approaching.",
  maintenance: "Scriptmoth posted a hosting maintenance notice.",
} as const;
type Template = keyof typeof templates;
export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.SCRIPTMOTH_MAIL_FROM);
export async function sendEmail(to: string, subject: string, body: string, key?: string) {
  if (!emailConfigured()) throw new Error("Email delivery is unavailable.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST", signal: AbortSignal.timeout(8000),
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", ...(key ? { "Idempotency-Key": key } : {}) },
    body: JSON.stringify({ from: process.env.SCRIPTMOTH_MAIL_FROM, to: [to], subject, text: body }),
  });
  if (!response.ok) throw new Error("Email provider rejected delivery.");
}
export function enqueue(id: string, recipient: string, template: Template, reference: string) {
  if (!recipient || recipient.length > 254) return;
  run("INSERT OR IGNORE INTO outbox (id,recipient,template,data) VALUES (?,?,?,?)", id, recipient, template, reference);
}
export function notifyClient(id: string, owner: string, template: Template, reference: string) {
  const recipient = one<{ email: string; enabled: number; email_updates: number }>(`
    SELECT u.email,coalesce(c.enabled,1) enabled,coalesce(c.email_updates,1) email_updates
    FROM user u LEFT JOIN client_settings c ON c.user_id=u.id WHERE u.id=?
  `, owner);
  if (recipient?.enabled && recipient.email_updates) enqueue(id, recipient.email, template, reference);
}
export async function flushNotifications() {
  if (!emailConfigured()) return;
  const rows = all<{ id: string; recipient: string; template: Template; data: string }>(
    "SELECT id,recipient,template,data FROM outbox WHERE sent_at IS NULL ORDER BY created_at LIMIT 20",
  );
  for (const row of rows) {
    const body = setting(`template_${row.template}`, templates[row.template]).replaceAll("{{reference}}", row.data);
    try {
      await sendEmail(row.recipient, "Scriptmoth • " + row.template.replaceAll("_", " "), body, row.id);
      run("UPDATE outbox SET sent_at=CURRENT_TIMESTAMP WHERE id=?", row.id);
    } catch {
      console.error("Scriptmoth notification delivery failed", row.id);
      break;
    }
  }
}
