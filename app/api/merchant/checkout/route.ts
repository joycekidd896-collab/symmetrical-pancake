import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://couponqueen.online").replace(/\/$/, "");

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) return jsonError("Supabase is not configured.", 500);
    if (!STRIPE_SECRET_KEY) return jsonError("Stripe checkout is not configured yet.", 503);

    const auth = request.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) return jsonError("Merchant sign-in is required.", 401);

    const token = auth.slice(7);
    const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` };
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers, cache: "no-store" });
    if (!userRes.ok) return jsonError("Your merchant session has expired.", 401);
    const user = await userRes.json();
    if (!user?.id || !user?.email) return jsonError("Could not verify your merchant account.", 401);

    const body = await request.json().catch(() => ({}));
    const planId = typeof body.planId === "string" ? body.planId : "";
    if (!planId) return jsonError("A merchant plan is required.");

    const planRes = await fetch(
      `${SUPABASE_URL}/rest/v1/merchant_plans?id=eq.${encodeURIComponent(planId)}&is_active=eq.true&select=id,name,monthly_price_cents,stripe_price_id&limit=1`,
      { headers, cache: "no-store" },
    );
    if (!planRes.ok) return jsonError("Could not verify the selected merchant plan.", 502);
    const plans = await planRes.json();
    const plan = plans[0];
    if (!plan) return jsonError("That merchant plan is unavailable.", 404);
    if (!plan.stripe_price_id) return jsonError("That plan is not connected to Stripe yet.", 409);

    const merchantRes = await fetch(
      `${SUPABASE_URL}/rest/v1/merchants?owner_user_id=eq.${encodeURIComponent(user.id)}&select=id,business_name,city,state,description,is_active&limit=1`,
      { headers, cache: "no-store" },
    );
    if (!merchantRes.ok) return jsonError("Could not verify your merchant profile.", 502);
    const merchants = await merchantRes.json();
    const merchant = merchants[0];
    if (!merchant) return jsonError("Complete merchant setup before starting billing.", 409);
    if (!merchant.is_active) return jsonError("This merchant account is currently inactive.", 403);

    const requestedName = typeof body.businessName === "string" ? body.businessName.trim() : "";
    const requestedCity = typeof body.city === "string" ? body.city.trim() : "";
    const requestedState = typeof body.state === "string" ? body.state.trim() : "";
    const requestedDescription = typeof body.description === "string" ? body.description.trim() : "";

    const updates: Record<string, string | null> = {};
    if (requestedName && requestedName !== merchant.business_name) updates.business_name = requestedName;
    if (requestedCity && requestedCity !== merchant.city) updates.city = requestedCity;
    if (requestedState && requestedState !== merchant.state) updates.state = requestedState;
    if (requestedDescription && requestedDescription !== merchant.description) updates.description = requestedDescription;
    if (Object.keys(updates).length) {
      await fetch(`${SUPABASE_URL}/rest/v1/merchants?id=eq.${encodeURIComponent(merchant.id)}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify(updates),
      });
    }

    const params = new URLSearchParams();
    params.set("mode", "subscription");
    params.set("line_items[0][price]", plan.stripe_price_id);
    params.set("line_items[0][quantity]", "1");
    params.set("success_url", `${SITE_URL}/businesses/dashboard?checkout=success`);
    params.set("cancel_url", `${SITE_URL}/businesses/pricing?checkout=cancelled`);
    params.set("customer_email", user.email);
    params.set("client_reference_id", merchant.id);
    params.set("metadata[user_id]", user.id);
    params.set("metadata[merchant_id]", merchant.id);
    params.set("metadata[plan_id]", plan.id);
    params.set("subscription_data[metadata][user_id]", user.id);
    params.set("subscription_data[metadata][merchant_id]", merchant.id);
    params.set("subscription_data[metadata][plan_id]", plan.id);
    params.set("subscription_data[metadata][subscription_type]", "merchant");

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const stripe = await stripeRes.json().catch(() => ({}));
    if (!stripeRes.ok || !stripe.url) {
      return jsonError(stripe?.error?.message || "Stripe could not start checkout.", stripeRes.status || 502);
    }

    return NextResponse.json({ url: stripe.url });
  } catch (error) {
    console.error("merchant checkout error", error);
    return jsonError("Could not start secure checkout.", 500);
  }
}
