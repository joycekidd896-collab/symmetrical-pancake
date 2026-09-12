import { NextResponse } from "next/server";
import crypto from "node:crypto";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
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
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase service configuration is missing.");
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

export async function POST(request: Request) {
  try {
    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) return jsonError("Stripe webhook is not configured.", 503);
    const signature = request.headers.get("stripe-signature");
    const payload = await request.text();
    if (!signature || !verifyStripeSignature(payload, signature)) return jsonError("Invalid Stripe signature.", 400);

    const event = JSON.parse(payload);
    if (!["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
      return NextResponse.json({ received: true });
    }

    const subscription = event.data?.object;
    if (!subscription?.id) return NextResponse.json({ received: true });

    let metadata = subscription.metadata || {};
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

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return jsonError("Webhook processing failed.", 500);
  }
}
