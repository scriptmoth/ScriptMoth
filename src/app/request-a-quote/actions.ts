"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { viewer } from "@/lib/business/auth";
import { databaseConfigured } from "@/lib/business/db";
import { saveInquiry } from "@/lib/business/inquiries";
import { flushNotifications } from "@/lib/business/notify";

export async function requestQuote(_previous: { error?: string; reference?: string; draft?: boolean }, form: FormData) {
  if (!databaseConfigured()) return { error: "Quote requests are temporarily unavailable." };
  const actor = await viewer();
  const header = process.env.SCRIPTMOTH_TRUSTED_IP_HEADER;
  const identity = header ? (await headers()).get(header)?.split(",").at(-1)?.trim() || "guest" : "guest";
  const draft = form.get("intent") === "draft";
  try {
    const reference = await saveInquiry(form, actor, draft, identity);
    if (!draft) after(flushNotifications);
    return { reference, draft };
  } catch (error) {
    if (error instanceof Error && !("code" in error)) return { error: error.message };
    console.error("Scriptmoth inquiry persistence failed", error instanceof Error && "code" in error ? error.code : "");
    return { error: "The request could not be saved. Try again shortly." };
  }
}
