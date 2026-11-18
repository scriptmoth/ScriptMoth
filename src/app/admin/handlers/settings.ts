import { currency } from "@/lib/business/catalog";
import { all, run } from "@/lib/business/db";
import { templates } from "@/lib/business/notify";
import { availabilityOptions, isEmail, policies } from "@/lib/business/rules";
import type { AdminHandlerCtx } from "./context";

export function handleSettings({ get }: AdminHandlerCtx) {
  const available = get("availability");
  const code = get("currency", 3, true).toUpperCase();
  if (!availabilityOptions.some(item => item === available) || !["USD", "CAD", "EUR", "GBP", "AUD", "NZD"].includes(code)) throw new Error("Choose a supported currency and availability.");
  if (code !== currency() && (all("SELECT id FROM quotes LIMIT 1").length || all("SELECT id FROM products LIMIT 1").length || all("SELECT id FROM hosting_plans LIMIT 1").length || all("SELECT id FROM quote_options LIMIT 1").length)) throw new Error("Currency cannot change after custom pricing or quotes are saved.");
  const limit = Number(get("upload_limit"));
  if (!Number.isInteger(limit) || limit < 100000 || limit > 4000000) throw new Error("Upload limit must be between 100,000 and 4,000,000 bytes.");
  const contact = get("contact_email", 254);
  if (contact && !isEmail(contact)) throw new Error("Enter a valid contact email.");
  const entries = { availability: available, currency: code, show_catalog: get("show_catalog"), maintenance: get("maintenance"),
    upload_limit: String(limit), business_name: get("business_name", 100, true), contact_email: contact,
    default_revisions: get("default_revisions"), support_warranty: get("support_warranty"), quote_expiry: get("quote_expiry"),
    payments: get("payments") };
  for (const [key, value] of Object.entries(entries)) run("INSERT OR REPLACE INTO business_settings VALUES (?,?)", key, value);
}

export function handlePolicy({ form, get, id }: AdminHandlerCtx) {
  if (!Object.hasOwn(policies, id)) throw new Error("Policy not found.");
  const body = get("body", 16000);
  const published = form.get("publish") === "yes";
  if (published && !body) throw new Error("Add the reviewed policy text before publishing.");
  run("INSERT OR REPLACE INTO policies VALUES (?,?,?,?)", id, policies[id as keyof typeof policies], body, Number(published));
}

export function handleTemplate({ get, id }: AdminHandlerCtx) {
  if (!Object.hasOwn(templates, id)) throw new Error("Template not found.");
  run("INSERT OR REPLACE INTO business_settings VALUES (?,?)", `template_${id}`, get("body", 4000, true));
}