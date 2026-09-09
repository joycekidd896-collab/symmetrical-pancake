"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
type Plan = "starter" | "growth";

export default function MerchantOnboardingPage() {
  const [plan, setPlan] = useState<Plan>("starter");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Dining");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const selected = localStorage.getItem("cq_selected_plan");
    if (selected === "growth" || selected === "starter") setPlan(selected);
    const token = localStorage.getItem("cq_access_token");
    if (!token) window.location.href = `/businesses/login?mode=signup&plan=${selected === "growth" ? "growth" : "starter"}`;
    else setLoading(false);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      if (!URL || !KEY) throw new Error("Merchant database is not configured.");
      const token = localStorage.getItem("cq_access_token");
      if (!token) throw new Error("Your merchant session has expired. Please sign in again.");
      const headers = { apikey: KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const userRes = await fetch(`${URL}/auth/v1/user`, { headers, cache: "no-store" });
      if (!userRes.ok) throw new Error("Your merchant session has expired. Please sign in again.");
      const user = await userRes.json();
      const existingRes = await fetch(`${URL}/rest/v1/businesses?owner_id=eq.${encodeURIComponent(user.id)}&select=id&limit=1`, { headers, cache: "no-store" });
      if (!existingRes.ok) throw new Error("Could not check your business profile.");
      const existing = await existingRes.json();
      if (!existing[0]?.id) {
        const createRes = await fetch(`${URL}/rest/v1/businesses`, { method: "POST", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify({ name: name.trim(), owner_id: user.id, location: location.trim() || null, category, description: description.trim() || null }) });
        if (!createRes.ok) {
          const detail = await createRes.text().catch(() => "");
          throw new Error(`Could not create your business profile. ${detail}`);
        }
      }
      localStorage.setItem("cq_selected_plan", plan);
      const checkoutRes = await fetch(`${URL}/functions/v1/merchant-checkout`, { method: "POST", headers, body: JSON.stringify({ plan }) });
      const checkout = await checkoutRes.json().catch(() => ({}));
      if (!checkoutRes.ok || !checkout.url) throw new Error(checkout.error || "Could not start secure Stripe checkout.");
      window.location.href = checkout.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue.");
      setSaving(false);
    }
  };

  if (loading) return <main className="queen-page"><section className="auth-shell"><div className="section-kicker">♛ THE BUSINESS KINGDOM</div><h1>Preparing Your Kingdom…</h1></section></main>;

  return <main className="queen-page"><header className="site-header"><Link href="/" className="brand-wrap"><div className="brand-crown">♕</div><div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">The Crown Jewel of Savings</div></div></Link><nav><Link href="/coupons">Coupons</Link><Link href="/businesses">Businesses</Link></nav></header><section className="auth-shell"><div className="section-kicker">♛ THE BUSINESS KINGDOM</div><h1>Build Your Business Kingdom</h1><p>We need your business profile before we send you to secure Stripe checkout for your {plan === "growth" ? "Royal Growth · $59/month" : "Royal Starter · $29/month"} membership.</p>{error&&<div className="error" role="alert">✕ {error}</div>}<form onSubmit={submit} className="auth-card"><label>Business name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Your business name"/></label><label>Location<input value={location} onChange={e=>setLocation(e.target.value)} placeholder="City, State"/></label><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option>Dining</option><option>Shopping</option><option>Beauty</option><option>Services</option><option>Online</option><option>Other</option></select></label><label>Business description<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Tell customers what makes your business special." rows={5}/></label><button disabled={saving} className="queen-button primary-button" type="submit">{saving ? "Opening Secure Checkout…" : `Continue to ${plan === "growth" ? "Royal Growth" : "Royal Starter"} →`}</button></form><Link href="/businesses/pricing" className="back">← Change Plan</Link></section><footer className="site-footer"><Link href="/" className="footer-brand"><span>♕</span>COUPON QUEEN</Link><div className="footer-tagline">The Crown Jewel of Savings</div></footer><style jsx>{`.auth-shell{max-width:620px;margin:0 auto;padding:65px 28px 110px;text-align:center}.auth-shell h1{margin:8px 0;color:var(--queen-espresso);font-size:clamp(38px,6vw,58px);line-height:1}.auth-shell>p{margin:14px auto 25px;max-width:540px;color:var(--queen-muted);line-height:1.7}.auth-card{display:grid;gap:18px;text-align:left;padding:30px;border:1px solid var(--queen-border);border-radius:24px;background:white;box-shadow:0 16px 45px rgba(53,32,24,.08)}.auth-card label{display:grid;gap:7px;color:var(--queen-espresso);font-size:12px;font-weight:850}.auth-card input,.auth-card select,.auth-card textarea{padding:14px;border:1px solid var(--queen-border);border-radius:12px;background:white;color:var(--queen-espresso);font:inherit}.primary-button{padding:14px 20px;border:0;border-radius:12px;cursor:pointer;font-weight:900}.primary-button:disabled{opacity:.6}.error{margin-bottom:18px;padding:14px;border-radius:14px;background:rgba(180,50,50,.06);color:#9b2c2c;font-weight:800}.back{display:block;margin-top:15px;color:var(--queen-muted);font-weight:800}`}</style></main>;
}