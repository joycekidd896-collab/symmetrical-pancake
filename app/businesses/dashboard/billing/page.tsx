"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Plan = {
  id: string;
  name: string;
  monthly_price_cents: number;
  description: string;
  stripe_price_id: string | null;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function MerchantBillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Merchant billing is not configured.");
        const requested = new URLSearchParams(window.location.search).get("plan");
        const headers = { apikey: SUPABASE_KEY };
        const plansRes = await fetch(`${SUPABASE_URL}/rest/v1/merchant_plans?is_active=eq.true&select=id,name,monthly_price_cents,description,stripe_price_id&order=monthly_price_cents.asc`, { headers, cache: "no-store" });
        if (!plansRes.ok) throw new Error("Could not load merchant plans.");
        const livePlans: Plan[] = await plansRes.json();
        setPlans(livePlans);
        const selected = livePlans.find((p) => p.id === requested) || livePlans.find((p) => p.stripe_price_id) || livePlans[0];
        if (selected) setPlanId(selected.id);

        const token = localStorage.getItem("cq_access_token");
        if (!token) return;
        const authHeaders = { ...headers, Authorization: `Bearer ${token}` };
        const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: authHeaders, cache: "no-store" });
        if (!userRes.ok) return;
        const user = await userRes.json();
        const merchantRes = await fetch(`${SUPABASE_URL}/rest/v1/merchants?owner_user_id=eq.${encodeURIComponent(user.id)}&select=business_name,city,state,description&limit=1`, { headers: authHeaders, cache: "no-store" });
        if (merchantRes.ok) {
          const rows = await merchantRes.json();
          if (rows[0]) {
            setName(rows[0].business_name || "");
            setCity(rows[0].city || "");
            setState(rows[0].state || "");
            setDescription(rows[0].description || "");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load billing.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const chosenPlan = plans.find((p) => p.id === planId);

  const continueToCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (!chosenPlan) throw new Error("Please choose a merchant plan.");
      if (!chosenPlan.stripe_price_id) throw new Error("This plan is not connected to Stripe yet. Please choose another available plan.");
      const token = localStorage.getItem("cq_access_token");
      if (!token) {
        localStorage.setItem("cq_selected_plan", planId);
        window.location.href = `/businesses/login?mode=login&next=/businesses/dashboard/billing?plan=${encodeURIComponent(planId)}`;
        return;
      }

      const res = await fetch("/api/merchant/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ planId, businessName: name.trim(), city: city.trim(), state: state.trim(), description: description.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || "Could not start secure Stripe checkout.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue to checkout.");
      setSaving(false);
    }
  };

  return (
    <main className="queen-page">
      <header className="site-header">
        <Link href="/" className="brand-wrap"><div className="brand-crown">♕</div><div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">The Crown Jewel of Savings</div></div></Link>
        <nav><Link href="/coupons">Coupons</Link><Link href="/businesses">Businesses</Link></nav>
      </header>
      <section className="billing-shell">
        <div className="section-kicker">♛ SECURE MERCHANT BILLING</div>
        <h1>Choose Your Membership</h1>
        <p className="intro">Your plan, business profile, and Stripe checkout all stay connected to the production merchant account.</p>
        {error && <div className="error" role="alert">✕ {error}</div>}
        {loading ? <div className="billing-card loading">Opening merchant billing…</div> : (
          <form onSubmit={continueToCheckout} className="billing-card">
            <label>Membership plan<select value={planId} onChange={(e) => setPlanId(e.target.value)}>{plans.map((plan) => <option key={plan.id} value={plan.id} disabled={!plan.stripe_price_id}>{plan.name} · ${(plan.monthly_price_cents / 100).toFixed(0)}/month{plan.stripe_price_id ? "" : " · Stripe pending"}</option>)}</select></label>
            <label>Business name<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your business name" autoComplete="organization" /></label>
            <div className="two"><label>City<input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" autoComplete="address-level2" /></label><label>State<input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" autoComplete="address-level1" /></label></div>
            <label>Business description<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell customers what your business offers." rows={5} /></label>
            {chosenPlan && <div className="plan-pill">♛ {chosenPlan.name} · ${(chosenPlan.monthly_price_cents / 100).toFixed(0)}/month</div>}
            <button className="queen-button primary-button" disabled={saving || !chosenPlan?.stripe_price_id} type="submit">{saving ? "Opening Secure Checkout…" : "Continue to Stripe Checkout →"}</button>
            <Link href="/businesses/pricing" className="back">← Compare plans</Link>
          </form>
        )}
      </section>
      <footer className="site-footer"><Link href="/" className="footer-brand"><span>♕</span>COUPON QUEEN</Link><div className="footer-tagline">The Crown Jewel of Savings</div></footer>
      <style jsx>{`
        .billing-shell{max-width:680px;margin:0 auto;padding:65px 24px 100px}.billing-shell h1{margin:8px 0;color:var(--queen-espresso);font-size:clamp(38px,6vw,58px);line-height:1}.intro{margin:14px 0 25px;color:var(--queen-muted);line-height:1.7}.billing-card{display:grid;gap:17px;padding:30px;border:1px solid var(--queen-border);border-radius:24px;background:white;box-shadow:0 16px 45px rgba(53,32,24,.08)}.loading{color:var(--queen-muted)}.billing-card label{display:grid;gap:7px;color:var(--queen-espresso);font-size:12px;font-weight:850}.billing-card input,.billing-card select,.billing-card textarea{box-sizing:border-box;width:100%;padding:13px 14px;border:1px solid var(--queen-border);border-radius:12px;background:white;color:var(--queen-espresso);font:inherit}.two{display:grid;grid-template-columns:1fr 1fr;gap:14px}.plan-pill{justify-self:start;padding:9px 13px;border-radius:999px;background:rgba(218,174,67,.14);color:var(--queen-espresso);font-size:11px;font-weight:950}.primary-button{padding:14px 20px;border:0;border-radius:12px;cursor:pointer;font-weight:900}.primary-button:disabled{opacity:.55;cursor:not-allowed}.back{text-align:center;color:var(--queen-muted);font-weight:850}.error{margin-bottom:18px;padding:14px;border-radius:14px;background:#fff0f0;color:#9b2c2c;font-weight:800}@media(max-width:620px){.two{grid-template-columns:1fr}}
      `}</style>
    </main>
  );
}
