"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const CHECKOUT_FUNCTION = "merchant-checkout-v2";
type Plan = "starter" | "growth";

export default function MerchantBillingPage() {
  const [plan, setPlan] = useState<Plan | "">("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Dining");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("plan");
    const saved = localStorage.getItem("cq_selected_plan");
    const selected = requested === "starter" || requested === "growth" ? requested : saved;
    if (selected === "starter" || selected === "growth") setPlan(selected);
    else window.location.href = "/businesses/pricing";
  }, []);

  const continueToCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error("Merchant billing is not configured. Please add the Supabase publishable key in Vercel.");
      }
      if (!plan) throw new Error("Please choose a merchant plan first.");

      const token = localStorage.getItem("cq_access_token");
      if (!token) {
        localStorage.setItem("cq_selected_plan", plan);
        window.location.href = `/businesses/login?mode=login&plan=${plan}`;
        return;
      }

      const headers = {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
      };

      const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers, cache: "no-store" });
      if (!userRes.ok) throw new Error("Your merchant session expired. Please sign in again.");
      const user = await userRes.json();

      const existingRes = await fetch(
        `${SUPABASE_URL}/rest/v1/businesses?owner_id=eq.${encodeURIComponent(user.id)}&select=id&order=created_at.asc&limit=1`,
        { headers, cache: "no-store" },
      );
      if (!existingRes.ok) throw new Error("Could not check your business profile.");

      const existing = await existingRes.json();
      if (!existing?.[0]) {
        if (!name.trim()) throw new Error("Enter your business name to continue.");
        const createRes = await fetch(`${SUPABASE_URL}/rest/v1/businesses`, {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            name: name.trim(),
            owner_id: user.id,
            location: location.trim() || null,
            category,
            description: description.trim() || "Coupon Queen merchant",
          }),
        });
        if (!createRes.ok) {
          const detail = await createRes.text().catch(() => "");
          throw new Error(`Could not create your business profile (${createRes.status}). ${detail || "Please try again."}`);
        }
      }

      const checkoutRes = await fetch(`${SUPABASE_URL}/functions/v1/${CHECKOUT_FUNCTION}`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const checkout = await checkoutRes.json().catch(() => ({}));
      if (!checkoutRes.ok || !checkout?.url) {
        throw new Error(checkout?.error || "Could not start secure checkout.");
      }

      localStorage.setItem("cq_selected_plan", plan);
      window.location.href = checkout.url;
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
        <div className="section-kicker">♛ THE BUSINESS KINGDOM</div>
        <h1>Set Up Your Business</h1>
        <p className="intro">
          Your <strong>{plan === "growth" ? "Royal Growth" : "Royal Starter"}</strong> plan is selected. Enter your business details once, then continue to secure Stripe checkout.
        </p>

        {error && <div className="error" role="alert">✕ {error}</div>}

        <form onSubmit={continueToCheckout} className="billing-card">
          <div className="plan-pill">♛ {plan === "growth" ? "Royal Growth · $59/month" : "Royal Starter · $29/month"}</div>

          <label>
            Business name
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your business name" autoComplete="organization" />
          </label>

          <label>
            Location
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" autoComplete="address-level2" />
          </label>

          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Dining</option>
              <option>Shopping</option>
              <option>Beauty</option>
              <option>Services</option>
              <option>Online</option>
              <option>Other</option>
            </select>
          </label>

          <label>
            Business description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell customers what your business offers." rows={5} />
          </label>

          <button className="queen-button primary-button" disabled={saving} type="submit">
            {saving ? "Opening Secure Checkout…" : "Continue to Stripe Checkout →"}
          </button>

          <Link href="/businesses/pricing" className="back">← Change plan</Link>
        </form>
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
        .billing-card label{display:grid;gap:7px;color:var(--queen-espresso);font-size:12px;font-weight:850}
        .billing-card input,.billing-card select,.billing-card textarea{box-sizing:border-box;width:100%;padding:13px 14px;border:1px solid var(--queen-border);border-radius:12px;background:white;color:var(--queen-espresso);font:inherit}
        .plan-pill{justify-self:start;padding:9px 13px;border-radius:999px;background:rgba(218,174,67,.14);color:var(--queen-espresso);font-size:11px;font-weight:950}
        .primary-button{padding:14px 20px;border:0;border-radius:12px;cursor:pointer;font-weight:900}
        .primary-button:disabled{opacity:.6}
        .back{text-align:center;color:var(--queen-muted);font-weight:850}
        .error{margin-bottom:18px;padding:14px;border-radius:14px;background:#fff0f0;color:#9b2c2c;font-weight:800}
      `}</style>
    </main>
  );
}
