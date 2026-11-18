import { origin, viewer } from "@/lib/business/auth";
import { beginCheckout } from "@/lib/business/payments";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== origin()) return new Response("Forbidden", { status: 403 });
  const actor = await viewer();
  if (!actor) return new Response("Sign in to continue.", { status: 401 });
  const length = Number(request.headers.get("content-length"));
  if (length < 1 || length > 2048) return new Response("Invalid checkout request.", { status: 400 });
  try {
    const form = await request.formData();
    const invoice = String(form.get("invoice") ?? "");
    const hosting = String(form.get("hosting") ?? "");
    if (invoice.length > 80 || hosting.length > 80) return new Response("Invalid checkout request.", { status: 400 });
    const url = await beginCheckout(actor, invoice, hosting);
    return new Response(null, { status: 303, headers: { Location: url, "Cache-Control": "no-store" } });
  } catch {
    return new Response("Checkout could not be started. Return to your project and try again, or contact Scriptmoth.", { status: 409 });
  }
}
