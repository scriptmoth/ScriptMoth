import Stripe from "stripe";
import { origin } from "./auth";
import { currency, plans, setting } from "./catalog";
import { audit, db, one, run, transaction } from "./db";
import { notifyClient } from "./notify";
import type { Actor } from "./files";

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is unavailable.");
  return new Stripe(key, { timeout: 10000, maxNetworkRetries: 1 });
}
export const paymentsConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && origin() && setting("payments", "yes") === "yes");

type Checkout = { project_id: string; stripe_session: string | null };
type Invoice = Checkout & { cents: number; currency: string; title: string };
type Hosting = Checkout & { plan_id: string };

async function checkout(stripe: Stripe, row: Checkout, id: string, actor: Actor, settings: Stripe.Checkout.SessionCreateParams, kind: "invoice" | "hosting") {
  if (row.stripe_session) {
    const existing = await stripe.checkout.sessions.retrieve(row.stripe_session);
    if (existing.status === "open" && existing.url) return existing.url;
    if (existing.status !== "expired") throw new Error("Checkout is already complete or awaiting confirmation.");
  }
  const root = origin();
  const projectUrl = `${root}/dashboard/projects/${row.project_id}`;
  const session = await stripe.checkout.sessions.create({
    ...settings, customer_email: actor.email, metadata: { kind, id },
    success_url: projectUrl, cancel_url: projectUrl,
  }, { idempotencyKey: `scriptmoth:${kind}:${id}:${row.stripe_session ?? "initial"}` });
  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  if (kind === "invoice") run("UPDATE invoices SET stripe_session=? WHERE id=? AND status='open'", session.id, id);
  else run("UPDATE hosting_services SET stripe_session=? WHERE id=? AND subscription_id IS NULL", session.id, id);
  return session.url;
}

export async function beginCheckout(actor: Actor, invoice: string, hosting: string) {
  if (!paymentsConfigured()) throw new Error("Online payment is unavailable.");
  if (Boolean(invoice) === Boolean(hosting)) throw new Error("Choose one invoice or hosting service.");
  const stripe = stripeClient();
  if (invoice) {
    const row = one<Invoice>(`SELECT i.project_id,i.stripe_session,i.cents,i.currency,i.title
      FROM invoices i JOIN projects p ON p.id=i.project_id WHERE i.id=? AND p.owner_id=? AND i.status='open'`, invoice, actor.id);
    if (!row) throw new Error("Invoice not found or no longer payable.");
    return checkout(stripe, row, invoice, actor, { mode: "payment", allowed_payment_method_types: ["card"],
      line_items: [{ quantity: 1, price_data: { currency: row.currency.toLowerCase(), product_data: { name: row.title }, unit_amount: row.cents } }],
      payment_intent_data: { metadata: { scriptmoth_invoice: invoice } } }, "invoice");
  }
  const row = one<Hosting>(`SELECT s.project_id,s.stripe_session,s.plan_id FROM hosting_services s
    JOIN projects p ON p.id=s.project_id WHERE s.id=? AND p.owner_id=? AND s.subscription_id IS NULL`, hosting, actor.id);
  const plan = row && plans().find(item => item.id === row.plan_id);
  if (!row || !plan?.providerPrice || plan.cents === null) throw new Error("Subscription is unavailable.");
  const price = await stripe.prices.retrieve(plan.providerPrice);
  if (!price.active || price.currency !== currency().toLowerCase() || price.unit_amount !== plan.cents || price.recurring?.interval !== "month" || price.recurring.interval_count !== 1) {
    throw new Error("Subscription pricing needs review.");
  }
  return checkout(stripe, row, hosting, actor, { mode: "subscription", allowed_payment_method_types: ["card"],
    line_items: [{ quantity: 1, price: plan.providerPrice }], subscription_data: { metadata: { scriptmoth_service: hosting } } }, "hosting");
}

function identifier(value: string | { id: string } | null) {
  return typeof value === "string" ? value : value?.id ?? null;
}

export async function processStripeEvent(stripe: Stripe, event: Stripe.Event) {
  if (one("SELECT id FROM payment_events WHERE id=?", event.id)) return;
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    const id = session.metadata?.id;
    if (!id || session.payment_status !== "paid") return;
    if (session.metadata?.kind === "invoice" && session.mode === "payment") {
      const intentId = identifier(session.payment_intent);
      if (!intentId) return;
      const intent = await stripe.paymentIntents.retrieve(intentId, { expand: ["latest_charge"] });
      const charge = typeof intent.latest_charge === "object" ? intent.latest_charge : null;
      transaction(db(), () => {
        const invoice = one<{ stripe_session: string | null; cents: number; currency: string; owner_id: string; status: string }>(`
          SELECT i.stripe_session,i.cents,i.currency,i.status,p.owner_id FROM invoices i JOIN projects p ON p.id=i.project_id WHERE i.id=?
        `, id);
        if (!invoice || (invoice.stripe_session && invoice.stripe_session !== session.id) || session.amount_total !== invoice.cents ||
          session.currency !== invoice.currency.toLowerCase() || intent.status !== "succeeded" || intent.amount_received !== invoice.cents) return;
        if (!recordPayment(event, id) || invoice.status !== "open") return;
        const refund = charge?.amount_refunded ?? 0;
        const status = refund >= invoice.cents ? "refunded" : refund > 0 ? "partially_refunded" : "paid";
        const receipt = charge?.receipt_url && new URL(charge.receipt_url).origin === "https://pay.stripe.com" ? charge.receipt_url : null;
        run("UPDATE invoices SET status=?,stripe_session=?,payment_intent=?,receipt_url=? WHERE id=?", status, session.id, intentId, receipt, id);
        if (status === "paid") notifyClient(event.id, invoice.owner_id, "payment", id);
      });
      return;
    }
    if (session.metadata?.kind === "hosting" && session.mode === "subscription") {
      const subId = identifier(session.subscription);
      if (subId) await syncSubscription(stripe, event, subId, id, session.id);
    }
  }
  if (event.type === "charge.refunded") {
    const charge = event.data.object;
    const id = identifier(charge.payment_intent);
    if (!id || !charge.amount_refunded) return;
    transaction(db(), () => {
      const invoice = one<{ id: string; cents: number }>("SELECT id,cents FROM invoices WHERE payment_intent=?", id);
      if (!invoice || !recordPayment(event, invoice.id)) return;
      run("UPDATE invoices SET status=? WHERE id=? AND status!='refunded'", charge.amount_refunded >= invoice.cents ? "refunded" : "partially_refunded", invoice.id);
    });
  }
  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const id = subscription.metadata.scriptmoth_service;
    if (id) await syncSubscription(stripe, event, subscription.id, id);
  }
}
function recordPayment(event: Stripe.Event, id: string) {
  const inserted = run("INSERT OR IGNORE INTO payment_events (id,entity_id,event) VALUES (?,?,?)", event.id, id, event.type).changes;
  if (inserted) audit(null, `stripe.${event.type}`, id);
  return Boolean(inserted);
}
async function syncSubscription(stripe: Stripe, event: Stripe.Event, subId: string, id: string, session?: string) {
  const subscription = await stripe.subscriptions.retrieve(subId);
  if (subscription.metadata.scriptmoth_service !== id) return;
  const periodEnd = subscription.items.data[0]?.current_period_end;
  transaction(db(), () => {
    const service = one<{ data: string; subscription_id: string | null; stripe_session: string | null }>("SELECT data,subscription_id,stripe_session FROM hosting_services WHERE id=?", id);
    if (!service || (service.subscription_id && service.subscription_id !== subId) ||
      (service.stripe_session && session && service.stripe_session !== session) || !recordPayment(event, id)) return;
    const current = JSON.parse(service.data);
    const data = JSON.stringify({ ...current, billing: subscription.status, renewal: periodEnd ? new Date(periodEnd * 1000).toISOString().slice(0, 10) : current.renewal });
    run("UPDATE hosting_services SET subscription_id=?,data=? WHERE id=?", subId, data, id);
  });
}
