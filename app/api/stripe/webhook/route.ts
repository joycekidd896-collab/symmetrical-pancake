import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { SUPABASE_URL } from "../../../../lib/supabase-config";

export const runtime = "nodejs";

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function verifyStripeSignature(payload: string, header: string) {
  if (!STRIPE_WEBHOOK_SECRET) throw new Error("Stripe webhook secret is not configured.");
  const fields = header.split(",");
  const timestamp = fields.find((item) => item.startsWith("t="))?.slice(2);
  const signatures = fields.filter((item) => item.startsWith("v1=")).map((item) => item.slice(3));
  if (!timestamp || !signatures.length) return false;
  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = crypto.createHmac("sha256", STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${payload}`).digest("hex");
  return signatures.some((signature) => {
    try {
      return crypto.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(signature, "utf8"));
    } catch {
      return false;
    }
  });
}

function timestamp(value: number | null | undefined) {
  return typeof value === "number" ? new Date(value * 1000).toISOString() : null;
}

async function supabase(path: string, init: RequestInit = {}) {
  if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase service configuration is missing.");
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
}

async function claimWebhookEvent(eventId: string, eventType: string) {
  const insert = await supabase("/rest/v1/stripe_webhook_events?on_conflict=stripe_event_id", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates,return=representation",
    },
    body: JSON.stringify({ stripe_event_id: eventId, event_type: eventType, status: "processing" }),
  });
  if (!insert.ok) {
    const detail = await insert.text().catch(() => "");
    throw new Error(`Could not record Stripe webhook event. ${detail}`);
  }

  const insertedRows = await insert.json().catch(() => []);
  if (Array.isArray(insertedRows) && insertedRows.length > 0) return true;

  const existingResponse = await supabase(`/rest/v1/stripe_webhook_events?stripe_event_id=eq.${encodeURIComponent(eventId)}&select=status,received_at&limit=1`);
  if (!existingResponse.ok) return false;
  const existingRows = await existingResponse.json().catch(() => []);
  const existing = existingRows[0];
  if (!existing) return false;
  if (existing.status === "processed") return false;

  const receivedAt = existing.received_at ? new Date(existing.received_at).getTime() : 0;
  const staleProcessing = existing.status === "processing" && Number.isFinite(receivedAt) && receivedAt > 0 && Date.now() - receivedAt > 10 * 60 * 1000;

  if (existing.status === "failed" || staleProcessing) {
    const reclaimFilter = staleProcessing ? "status=eq.processing&received_at=lt." + encodeURIComponent(new Date(Date.now() - 10 * 60 * 1000).toISOString()) : "status=eq.failed";
    const reclaim = await supabase(`/rest/v1/stripe_webhook_events?stripe_event_id=eq.${encodeURIComponent(eventId)}&${reclaimFilter}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ status: "processing", processed_at: null, error_message: null, received_at: new Date().toISOString() }),
    });
    return reclaim.ok;
  }

  return false;
}

async function finishWebhookEvent(eventId: string, status: "processed" | "failed", errorMessage?: string) {
  const response = await supabase(`/rest/v1/stripe_webhook_events?stripe_event_id=eq.${encodeURIComponent(eventId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ status, processed_at: new Date().toISOString(), error_message: errorMessage || null }),
  });
  if (!response.ok) console.error("Could not finalize Stripe webhook event", await response.text().catch(() => ""));
}

async function getStripeSubscription(subscriptionId: string) {
  if (!STRIPE_SECRET_KEY) throw new Error("Stripe secret is not configured.");
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.id) throw new Error(data?.error?.message || "Could not retrieve the Stripe subscription.");
  return data;
}

async function syncSubscription(subscription: any, fallbackMetadata: Record<string, string> = {}) {
  if (!subscription?.id) return NextResponse.json({ received: true });

  let metadata = { ...(fallbackMetadata || {}), ...(subscription.metadata || {}) };
  if (!metadata.user_id || !metadata.merchant_id || !metadata.plan_id) {
    const lookup = await supabase(`/rest/v1/subscriptions?stripe_subscription_id=eq.${encodeURIComponent(subscription.id)}&select=user_id,merchant_id,merchant_plan_id&limit=1`);
    if (lookup.ok) {
      const rows = await lookup.json();
      const existing = rows[0];
      if (existing) {
        metadata = {
          ...metadata,
          user_id: metadata.user_id || existing.user_id,
          merchant_id: metadata.merchant_id || existing.merchant_id,
          plan_id: metadata.plan_id || existing.merchant_plan_id,
        };
      }
    }
  }

  if (!metadata.user_id || !metadata.merchant_id || !metadata.plan_id) {
    console.error("Stripe subscription missing Coupon Queen metadata", subscription.id);
    return jsonError("Subscription metadata is incomplete.", 400);
  }

  const priceId = subscription.items?.data?.[0]?.price?.id || null;
  const row = {
    user_id: metadata.user_id,
    merchant_id: metadata.merchant_id,
    merchant_plan_id: metadata.plan_id,
    subscription_type: "merchant",
    stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : null,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    status: subscription.status,
    current_period_start: timestamp(subscription.current_period_start),
    current_period_end: timestamp(subscription.current_period_end),
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    updated_at: new Date().toISOString(),
  };

  const save = await supabase("/rest/v1/subscriptions?on_conflict=stripe_subscription_id", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(row),
  });
  if (!save.ok) {
    const detail = await save.text().catch(() => "");
    console.error("Could not save Stripe subscription", detail);
    return jsonError("Could not sync the merchant subscription.", 500);
  }

  console.log("Coupon Queen Stripe subscription synced", subscription.id, metadata.merchant_id);
  return NextResponse.json({ received: true });
}

export async function POST(request: Request) {
  let eventId = "";

  try {
    if (!STRIPE_WEBHOOK_SECRET || !SUPABASE_SERVICE_ROLE_KEY) {
      return jsonError("Stripe webhook is not configured.", 503);
    }

    const signature = request.headers.get("stripe-signature");
    const payload = await request.text();
    if (!signature || !verifyStripeSignature(payload, signature)) return jsonError("Invalid Stripe signature.", 400);

    const event = JSON.parse(payload);
    eventId = typeof event?.id === "string" ? event.id : "";
    if (!eventId) return jsonError("Stripe event id is missing.", 400);

    const claimed = await claimWebhookEvent(eventId, event.type || "unknown");
    if (!claimed) return NextResponse.json({ received: true, duplicate: true });

    try {
      let response: NextResponse;

      if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
        response = await syncSubscription(event.data?.object) as NextResponse;
      } else if (event.type === "checkout.session.completed") {
        const session = event.data?.object;
        const subscriptionId = typeof session?.subscription === "string" ? session.subscription : null;
        if (!subscriptionId) {
          await finishWebhookEvent(eventId, "processed");
          return NextResponse.json({ received: true });
        }

        const fallbackMetadata = {
          user_id: session?.metadata?.user_id || "",
          merchant_id: session?.metadata?.merchant_id || "",
          plan_id: session?.metadata?.plan_id || "",
        };
        const subscription = await getStripeSubscription(subscriptionId);
        response = await syncSubscription(subscription, fallbackMetadata) as NextResponse;
      } else {
        response = NextResponse.json({ received: true });
      }

      if (response.status >= 400) {
        await finishWebhookEvent(eventId, "failed", `Webhook handler returned HTTP ${response.status}.`);
      } else {
        await finishWebhookEvent(eventId, "processed");
      }
      return response;
    } catch (error) {
      await finishWebhookEvent(eventId, "failed", error instanceof Error ? error.message : "Webhook processing failed.");
      throw error;
    }
  } catch (error) {
    console.error("Stripe webhook error", error);
    return jsonError("Webhook processing failed.", 500);
  }
}
