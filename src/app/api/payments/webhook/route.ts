import { after } from "next/server";
import { databaseConfigured } from "@/lib/business/db";
import { flushNotifications } from "@/lib/business/notify";
import { processStripeEvent, stripeClient } from "@/lib/business/payments";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !process.env.STRIPE_SECRET_KEY || !databaseConfigured()) return new Response(null, { status: 503 });
  const length = Number(request.headers.get("content-length"));
  if (!signature || length < 1 || length > 1_000_000) return new Response(null, { status: 400 });
  const stripe = stripeClient();
  let event;
  try { event = stripe.webhooks.constructEvent(await request.text(), signature, secret); }
  catch { return new Response("Invalid Stripe signature", { status: 400 }); }
  if (event.livemode !== /^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY)) return new Response(null, { status: 400 });
  try {
    await processStripeEvent(stripe, event);
    after(flushNotifications);
    return new Response(null, { status: 200 });
  } catch {
    console.error("Scriptmoth payment processing failed", event.id, event.type);
    return new Response(null, { status: 500 });
  }
}
