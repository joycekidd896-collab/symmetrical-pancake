"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SUPABASE_KEY, SUPABASE_URL } from "../../../../lib/supabase-config";

type Plan = {
  id: string;
  name: string;
  monthly_price_cents: number;
  description: string;
  stripe_price_id: string | null;
};

export default function MerchantBillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stripeConfigured, setStripeConfigured] = useState<boolean | null>(null);
  const [stripeMessage, setStripeMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Merchant billing is not configured.");
        const requested =
          new URLSearchParams(window.location.search).get("plan") ||
          localStorage.getItem("cq_selected_plan") ||
          "";
        const headers = { apikey: SUPABASE_KEY };
        const pr = await fetch(
          `${SUPABASE_URL}/rest/v1/merchant_plans?is_active=eq.true&select=id,name,monthly_price_cents,description,stripe_price_id&order=monthly_price_cents.asc`,
          { headers, cache: "no-store" },
        );
        if (!pr.ok) throw new Error("Could not load merchant plans.");

        const livePlans: Plan[] = await pr.json();
        setPlans(livePlans);
        const selected =
          livePlans.find((p) => p.id === requested) ||
          livePlans.find((p) => p.stripe_price_id) ||
          livePlans[0];

        if (selected) {
          setPlanId(selected.id);
          localStorage.setItem("cq_selected_plan", selected.id);
        }

        const stripeStatus = await fetch("/api/merchant/stripe-status", { cache: "no-store" }).catch(() => null);
        if (stripeStatus) {
          const statusData = await stripeStatus.json().catch(() => ({}));
          setStripeConfigured(statusData.configured === true);
          setStripeMessage(typeof statusData.message === "string" ? statusData.message : "");
        } else {
          setStripeConfigured(false);
          setStripeMessage("Could not verify the production Stripe connection.");
        }

        const token = localStorage.getItem("cq_access_token");
        if (!token) return;

        const authHeaders = { ...headers, Authorization: `Bearer ${token}` };
        const ur = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: authHeaders,
          cache: "no-store",
        });
        if (!ur.ok) return;

        const user = await ur.json();
        const mr = await fetch(
          `${SUPABASE_URL}/rest/v1/merchants?owner_user_id=eq.${encodeURIComponent(user.id)}&select=id,business_name,city,state,description&limit=1`,
          { headers: authHeaders, cache: "no-store" },
        );
        if (!mr.ok) throw new Error("Could not check your merchant profile.");

        const rows = await mr.json();
        if (!rows[0]) {
          window.location.href = `/businesses/onboarding?plan=${encodeURIComponent(selected?.id || requested)}`;
          return;
        }

        const merchant = rows[0];
        setName(merchant.business_name || "");
        setCity(merchant.city || "");
        setState(merchant.state || "");
        setDescription(merchant.description || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load billing.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const chosenPlan = plans.find((p) => p.id === planId);
  const allSelectedPlanDataReady = Boolean(chosenPlan?.stripe_price_id && stripeConfigured);

  const continueToCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (!chosenPlan) throw new Error("Please choose a merchant plan.");
      if (!chosenPlan.stripe_price_id) throw new Error("This plan is not connected to Stripe yet.");
      if (!stripeConfigured) throw new Error("Production Stripe checkout is not connected yet. The site owner must add the production Stripe secret in Vercel.");

      const token = localStorage.getItem("cq_access_token");
      if (!token) {
        localStorage.setItem("cq_selected_plan", planId);
        window.location.href = `/businesses/login?mode=login&next=/businesses/dashboard/billing?plan=${encodeURIComponent(planId)}`;
        return;
      }

      const res = await fetch("/api/merchant/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId,
          businessName: name.trim(),
          city: city.trim(),
          state: state.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not start secure Stripe checkout.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue to checkout.");
      setSaving(false);
    }
  };

  return (
    <main className="queen-page">
      <header className="site-header">
        <Link href="/" className="brand-wrap">
          <div className="brand-crown">♕</div>
          <div>
            <div className="brand-name">COUPON QUEEN</div>
            <div className="brand-tagline">The Crown Jewel of Savings</div>
          </div>
        </Link>
        <nav>
          <Link href="/coupons">Coupons</Link>
          <Link href="/businesses">Businesses</Link>
        </nav>
      </header>

      <section className="billing-shell">
        <div className="section-kicker">♛ SECURE MERCHANT BILLING</div>
        <h1>Choose Your Membership</h1>
        <p className="intro">
          Your plan, business profile, and Stripe checkout stay connected to the production merchant account.
        </p>
        {stripeConfigured === false && !loading && (
          <div className="setup-status" role="status">
            <strong>Stripe activation is the final billing step.</strong>
            <span>{stripeMessage || "Production Stripe has not been connected yet."}</span>
          </div>
        )}
        {stripeConfigured === true && !loading && (
          <div className="ready-status" role="status">
            <strong>✓ Stripe production connection verified.</strong>
            <span>Merchant plan pricing is ready for secure subscription checkout.</span>
          </div>
        )}
        {error && <div className="error" role="alert">✕ {error}</div>}
        {loading ? (
          <div className="billing-card loading">Opening merchant billing…</div>
        ) : (
          <form onSubmit={continueToCheckout} className="billing-card">
            <label>
              Membership plan
              <select
                value={planId}
                onChange={(e) => {
                  setPlanId(e.target.value);
                  localStorage.setItem("cq_selected_plan", e.target.value);
                }}
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id} disabled={!p.stripe_price_id}>
                    {p.name} · ${(p.monthly_price_cents / 100).toFixed(0)}/month{p.stripe_price_id ? "" : " · Stripe pending"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Business name
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your business name" autoComplete="organization" />
            </label>
            <div className="two">
              <label>City<input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" /></label>
              <label>State<input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" /></label>
            </div>
            <label>
              Business description
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell customers what your business offers." rows={5} />
            </label>
            {chosenPlan && <div className="plan-pill">♛ {chosenPlan.name} · ${(chosenPlan.monthly_price_cents / 100).toFixed(0)}/month</div>}
            <button className="queen-button primary-button" disabled={saving || !allSelectedPlanDataReady} type="submit">
              {saving ? "Opening Secure Checkout…" : !stripeConfigured ? "Stripe Activation Required" : "Continue to Stripe Checkout →"}
            </button>
            <Link href="/businesses/pricing" className="back">← Compare plans</Link>
          </form>
        )}
      </section>

      <footer className="site-footer">
        <Link href="/" className="footer-brand"><span>♕</span>COUPON QUEEN</Link>
        <div className="footer-tagline">The Crown Jewel of Savings</div>
      </footer>

      <style jsx>{`
        .billing-shell{max-width:680px;margin:0 auto;padding:65px 24px 100px}
        .billing-shell h1{margin:8px 0;color:var(--queen-espresso);font-size:clamp(38px,6vw,58px);line-height:1}
        .intro{margin:14px 0 25px;color:var(--queen-muted);line-height:1.7}
        .billing-card{display:grid;gap:17px;padding:30px;border:1px solid var(--queen-border);border-radius:24px;background:white;box-shadow:0 16px 45px rgba(53,32,24,.08)}
        .loading{color:var(--queen-muted)}
        .billing-card label{display:grid;gap:7px;color:var(--queen-espresso);font-size:12px;font-weight:850}
        .billing-card input,.billing-card select,.billing-card textarea{box-sizing:border-box;width:100%;padding:13px 14px;border:1px solid var(--queen-border);border-radius:12px;background:white;color:var(--queen-espresso);font:inherit}
        .two{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .plan-pill{justify-self:start;padding:9px 13px;border-radius:999px;background:rgba(218,174,67,.14);color:var(--queen-espresso);font-size:11px;font-weight:950}
        .primary-button{padding:14px 20px;border:0;border-radius:12px;cursor:pointer;font-weight:900}
        .primary-button:disabled{opacity:.55;cursor:not-allowed}
        .back{text-align:center;color:var(--queen-muted);font-weight:850}
        .error{margin-bottom:18px;padding:14px;border-radius:14px;background:#fff0f0;color:#9b2c2c;font-weight:800}
        .setup-status,.ready-status{display:grid;gap:5px;margin:0 0 18px;padding:16px 18px;border-radius:16px;font-size:12px;line-height:1.5}
        .setup-status{background:#fff8e6;border:1px solid #edd79d;color:var(--queen-espresso)}
        .ready-status{background:#effcfb;border:1px solid #b8e7df;color:var(--queen-turquoise-dark)}
        .setup-status span,.ready-status span{font-weight:650;opacity:.85}
        @media(max-width:620px){.two{grid-template-columns:1fr}}
      `}</style>
    </main>
  );
}
