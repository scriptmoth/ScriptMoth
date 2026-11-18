export const projectTypes = {
  "discord-bot": "Discord Bot",
  "discord-setup": "Discord Server Setup",
  "roleplay-bot": "RP / Community Bot",
  "personal-site": "Personal Website",
  "oc-wiki": "OC Wiki / Worldbuilding",
  "community-site": "Community Website",
  "web-app": "Dashboard / Web Application",
  "improvement": "Existing Project Improvements",
  "hosting": "Hosting / Maintenance",
  "other": "Other / Not Sure",
} as const;
export type ProjectType = keyof typeof projectTypes;
export const productCategories = ["Discord Bots", "Discord Servers", "Roleplay & Community Systems", "Websites", "Hosting"] as const;
export const productStatuses = ["draft", "published", "archived"] as const;
export const projectStatuses = [
  "Inquiry Received", "Awaiting Details", "Quote Prepared", "Awaiting Approval",
  "Awaiting Deposit", "Planning", "In Development", "Testing", "Awaiting Client Review",
  "Revisions", "Ready for Delivery", "Completed", "On Hold", "Cancelled",
] as const;
export const ticketCategories = ["Bug Report", "Feature Request", "Hosting Issue", "Billing Question", "General Question", "Revision"] as const;
export const ticketStatuses = ["Open", "Awaiting Client", "In Progress", "Resolved", "Closed"] as const;
export const priorities = ["Low", "Normal", "High", "Urgent"] as const;
export const classifications = ["Bug covered by agreed scope", "Included revision", "New feature requiring quotation", "Hosting or maintenance issue", "General support"] as const;
export const availabilityOptions = ["Open", "Limited Availability", "Waitlist", "Closed"] as const;
export const hostingModes = { unsure: "I’m not sure", client: "I’ll host it myself", managed: "Scriptmoth manages hosting" } as const;
export type HostingMode = keyof typeof hostingModes;
export const policies = {
  terms: "Terms of Service",
  privacy: "Privacy Policy",
  refunds: "Refund and Cancellation Policy",
  licensing: "Software Ownership and Licensing",
  hosting: "Hosting Terms",
} as const;

export type QuoteOption = { id: string; label: string; kind: "base" | "feature" | "addon" | "recurring"; cents: number | null };

export function amount(value: string) {
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(value)) throw new Error("Enter a valid amount with up to two decimal places.");
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
export function quoteTotal(items: { cents: number; kind: string }[]) {
  const total = items.filter(item => item.kind !== "recurring").reduce((sum, item) => sum + item.cents, 0);
  if (total <= 0) throw new Error("The one-time quote total must be positive.");
  return total;
}
export const money = (cents: number, currency = "USD") => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
export const isEmail = (value: string) => value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export function dateValue(value: string) {
  if (!value) return null;
  if (!/^\d{4}-\d\d-\d\d$/.test(value)) throw new Error("Enter a valid date.");
  const date = new Date(value);
  if (!Number.isFinite(date.valueOf()) || date.toISOString().slice(0, 10) !== value) throw new Error("Enter a valid date.");
  return value;
}
export function textValue(form: FormData, key: string, max: number, required = false) {
  const raw = form.get(key);
  const value = typeof raw === "string" ? raw.trim() : "";
  if (value.length > max || (required && !value)) throw new Error(`Check the ${key.replaceAll("_", " ")} field.`);
  return value;
}
export const list = (value: string) => value.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
export function webUrl(value: string) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("Use a valid HTTP or HTTPS link.");
  return url.href;
}
