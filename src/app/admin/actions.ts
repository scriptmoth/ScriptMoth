"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { requireAdmin } from "@/lib/business/auth";
import { setting } from "@/lib/business/catalog";
import { audit, db, transaction } from "@/lib/business/db";
import { readUploads } from "@/lib/business/files";
import { flushNotifications } from "@/lib/business/notify";
import { textValue } from "@/lib/business/rules";
import type { ActionResult } from "@/components/business/forms";
import { handleDeleteFile, handleClient, handleTicket } from "./handlers/clients";
import { handleHostingPlan, handleProduct, handleQuoteOption } from "./handlers/catalog";
import { handleInquiry, handleSendQuote } from "./handlers/inquiries";
import { handleProjectIntent } from "./handlers/projects";
import { handlePolicy, handleSettings, handleTemplate } from "./handlers/settings";
import type { AdminHandlerCtx } from "./handlers/context";

export async function administer(_previous: ActionResult, form: FormData): Promise<ActionResult> {
  const actor = await requireAdmin();
  const get = (key: string, max = 120, required = false) => textValue(form, key, max, required);
  try {
    const intent = get("intent");
    const reference = get("id");
    const id = reference || randomUUID();
    const files = ["product", "project_entry"].includes(intent) ? await readUploads(form, intent === "product") : [];
    const ctx: AdminHandlerCtx = { form, get, id, reference, actor, files };
    transaction(db(), () => {
      switch (intent) {
        case "product": handleProduct(ctx); break;
        case "quote_option": handleQuoteOption(ctx); break;
        case "inquiry": handleInquiry(ctx); break;
        case "send_quote": handleSendQuote(ctx); break;
        case "client": handleClient(ctx); break;
        case "project":
        case "milestone":
        case "project_entry":
        case "invoice":
        case "hosting_service": handleProjectIntent({ ...ctx, intent }); break;
        case "ticket": handleTicket(ctx); break;
        case "hosting_plan": handleHostingPlan(ctx); break;
        case "settings": handleSettings(ctx); break;
        case "policy": handlePolicy(ctx); break;
        case "template": handleTemplate(ctx); break;
        case "delete_file": handleDeleteFile(ctx); break;
        default: throw new Error("Choose a valid operation.");
      }
      audit(actor.id, `admin.${intent}`, id);
    });
    after(flushNotifications);
    revalidatePath("/", "layout");
    return { message: "Saved." };
  } catch (error) {
    if (error instanceof Error && !("code" in error)) return { error: error.message };
    console.error("Scriptmoth admin change failed", error instanceof Error && "code" in error ? error.code : "");
    return { error: "The change could not be saved." };
  }
}

export async function retryNotifications(): Promise<ActionResult> {
  const actor = await requireAdmin();
  if (setting("maintenance") === "yes") return { error: "Email retry is paused during maintenance." };
  audit(actor.id, "admin.notifications.retry", "outbox");
  await flushNotifications();
  return { message: "Delivery attempt finished. Check the pending count for any remaining messages." };
}