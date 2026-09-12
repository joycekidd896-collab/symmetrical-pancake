"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const draftKey = "cq_merchant_coupon_draft";
const api = (table: string) => `${SUPABASE_URL}/rest/v1/${table}`;

type Draft = { title: string; discount: string; categoryId: string; description: string; terms: string; expiresAt: string };
type Category = { id: string; name: string };
type Merchant = { id: string; business_name: string; city: string | null; state: string | null };
type PlanInfo = { name: string; price: number };

export default function CreateCouponPage() {
  const [form, setForm] = useState<Draft>({ title: "", discount: "", categoryId: "", description: "", terms: "One redemption per customer.\nMerchant terms may apply.", expiresAt: "" });
  const [categories, setCategories] = useState<Category[]>([]);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Merchant database is not configured.");
        const raw = localStorage.getItem(draftKey);
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Partial<Draft>;
            setForm((current) => ({ ...current, ...parsed }));
          } catch {}
        }

        const token = localStorage.getItem("cq_access_token");
        if (!token) { window.location.href = "/businesses/login"; return; }
        const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` };
        const auth = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers, cache: "no-store" });
        if (!auth.ok) { window.location.href = "/businesses/login"; return; }
        const user = await auth.json();

        const merchantRes = await fetch(`${api("merchants")}?owner_user_id=eq.${encodeURIComponent(user.id)}&select=id,business_name,city,state&order=created_at.asc&limit=1`, { headers, cache: "no-store" });
        if (!merchantRes.ok) throw new Error(`Could not access your merchant profile (${merchantRes.status}).`);
        const merchants: Merchant[] = await merchantRes.json();
        const currentMerchant = merchants[0];
        if (!currentMerchant) throw new Error("Please complete your merchant profile before creating a coupon.");
        setMerchant(currentMerchant);

        const subscriptionRes = await fetch(`${api("subscriptions")}?merchant_id=eq.${encodeURIComponent(currentMerchant.id)}&status=in.(trialing,active)&select=merchant_plan_id,merchant_plans(id,name,monthly_price_cents)&order=created_at.desc&limit=1`, { headers, cache: "no-store" });
        if (!subscriptionRes.ok) throw new Error(`Could not verify your merchant subscription (${subscriptionRes.status}).`);
        const subscription = (await subscriptionRes.json())[0];
        if (!subscription?.merchant_plan_id) throw new Error("An active merchant subscription is required before you can publish a coupon.");
        const livePlan = Array.isArray(subscription.merchant_plans) ? subscription.merchant_plans[0] : subscription.merchant_plans;
        if (livePlan) setPlan({ name: livePlan.name, price: livePlan.monthly_price_cents });

        const categoryRes = await fetch(`${api("categories")}?select=id,name&order=name.asc`, { headers, cache: "no-store" });
        if (!categoryRes.ok) throw new Error("Could not load coupon categories.");
        const liveCategories: Category[] = await categoryRes.json();
        if (!liveCategories.length) throw new Error("No coupon categories are configured yet.");
        setCategories(liveCategories);
        setForm((current) => ({ ...current, categoryId: liveCategories.some((category) => category.id === current.categoryId) ? current.categoryId : liveCategories[0].id }));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load merchant coupon setup.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loading) localStorage.setItem(draftKey, JSON.stringify(form));
  }, [form, loading]);

  const update = (key: keyof Draft, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSaved(false); setError("");
    try {
      if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Merchant database is not configured.");
      if (!merchant || !plan) throw new Error("Your merchant account must have an active subscription before publishing.");
      if (!form.categoryId || !categories.some((category) => category.id === form.categoryId)) throw new Error("Please choose a valid coupon category.");
      const token = localStorage.getItem("cq_access_token");
      if (!token) { window.location.href = "/businesses/login"; return; }
      if (!form.title.trim() || !form.discount.trim() || !form.description.trim()) throw new Error("Please complete the required coupon fields.");
      const expiration = new Date(`${form.expiresAt}T23:59:59`);
      if (!form.expiresAt || !Number.isFinite(expiration.getTime())) throw new Error("Please choose a valid expiration date.");
      if (expiration.getTime() <= Date.now()) throw new Error("Expiration must be in the future.");
      const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation" };
      const response = await fetch(api("coupons"), { method: "POST", headers, body: JSON.stringify({ merchant_id: merchant.id, category_id: form.categoryId, title: form.title.trim(), description: form.description.trim(), terms: form.terms.trim() || null, discount_text: form.discount.trim(), status: "active", starts_at: new Date().toISOString(), expires_at: expiration.toISOString(), per_customer_limit: 1 }) });
      if (!response.ok) { const detail = await response.text().catch(() => ""); throw new Error(`Could not publish the coupon (${response.status}). ${detail || "Please try again."}`); }
      setSaved(true); localStorage.removeItem(draftKey); setForm((current) => ({ ...current, title: "", discount: "", description: "", terms: "One redemption per customer.\nMerchant terms may apply.", expiresAt: "" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not publish the coupon.");
    } finally { setSaving(false); }
  };

  const today = new Date().toISOString().slice(0, 10);
  return <main className="queen-page"><header className="site-header"><Link href="/" className="brand-wrap"><div className="brand-crown">♕</div><div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">The Crown Jewel of Savings</div></div></Link><nav><Link href="/coupons">Coupons</Link><Link href="/businesses">Businesses</Link></nav></header><section className="create-shell"><Link href="/businesses/dashboard" className="back">← Merchant Dashboard</Link><div className="create-heading"><div><div className="section-kicker">♛ THE BUSINESS KINGDOM</div><h1>Create a Royal Coupon</h1><p>Publish a production coupon using your active merchant membership and live categories.</p></div><div className="crown-badge">♕</div></div>{plan&&<div className="plan-meter"><div><strong>{plan.name}</strong><span>${(plan.price/100).toFixed(0)}/month · Active membership</span></div><span>✓ Ready to publish</span></div>}{saved&&<div className="success">✓ Coupon saved as active. Public visibility begins after merchant approval.</div>}{error&&<div className="error" role="alert">✕ {error}</div>}{loading?<div className="loading-card">Preparing your production coupon form…</div>:<form className="offer-form" onSubmit={submit}><div className="form-grid"><label>Coupon title<input required value={form.title} onChange={e=>update("title",e.target.value)} placeholder="Weekend Dinner Special"/></label><label>Discount<input required value={form.discount} onChange={e=>update("discount",e.target.value)} placeholder="$10 OFF"/></label><label>Category<select required value={form.categoryId} onChange={e=>update("categoryId",e.target.value)}>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Location<input value={merchant?[merchant.city,merchant.state].filter(Boolean).join(", "):""} readOnly placeholder="City, State"/></label><label>Expiration date<input required type="date" min={today} value={form.expiresAt} onChange={e=>update("expiresAt",e.target.value)}/></label></div><label className="wide-label">Coupon description<textarea required value={form.description} onChange={e=>update("description",e.target.value)} placeholder="Tell customers why this deal deserves a crown." rows={6}/></label><label className="wide-label">Terms & conditions<textarea value={form.terms} onChange={e=>update("terms",e.target.value)} rows={4}/></label><div className="form-actions"><Link href="/businesses/dashboard" className="secondary">Cancel</Link><button disabled={saving} type="submit" className="queen-button primary-button">{saving?"Publishing Coupon…":"Publish Coupon →"}</button></div></form>}</section><footer className="site-footer"><Link href="/" className="footer-brand"><span>♕</span>COUPON QUEEN</Link><div className="footer-tagline">The Crown Jewel of Savings</div></footer><style jsx>{`.create-shell{max-width:900px;margin:0 auto;padding:45px 28px 90px}.back{color:var(--queen-turquoise-dark);font-weight:900}.create-heading{display:flex;justify-content:space-between;align-items:center;gap:20px;margin:28px 0}.create-heading h1{margin:8px 0;color:var(--queen-espresso);font-size:clamp(34px,5vw,54px);line-height:1}.create-heading p{margin:10px 0;color:var(--queen-muted)}.crown-badge{display:grid;place-items:center;width:82px;height:82px;border-radius:24px;background:var(--queen-cream);color:var(--queen-gold);font-size:42px}.plan-meter{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:18px;padding:16px 18px;border:1px solid var(--queen-border);border-radius:16px;background:var(--queen-cream);color:var(--queen-espresso)}.plan-meter div{display:grid;gap:3px}.plan-meter span{font-size:11px;color:var(--queen-muted)}.success,.error{margin-bottom:18px;padding:14px 18px;border-radius:14px;font-weight:800}.success{border:1px solid rgba(32,199,201,.35);background:rgba(32,199,201,.08);color:var(--queen-turquoise-dark)}.error{border:1px solid rgba(180,50,50,.25);background:rgba(180,50,50,.06);color:#9b2c2c}.loading-card{padding:22px;border:1px solid var(--queen-border);border-radius:18px;background:white;color:var(--queen-muted);text-align:center}.offer-form{padding:30px;border:1px solid var(--queen-border);border-radius:24px;background:white;box-shadow:0 14px 40px rgba(53,32,24,.07)}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.offer-form label{display:grid;gap:7px;color:var(--queen-espresso);font-size:12px;font-weight:850}.wide-label{margin-top:18px}.offer-form input,.offer-form select,.offer-form textarea{width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid var(--queen-border);border-radius:12px;background:white;color:var(--queen-espresso);font:inherit}.offer-form textarea{resize:vertical}.form-actions{display:flex;justify-content:flex-end;align-items:center;gap:12px;margin-top:24px}.secondary{padding:12px 18px;color:var(--queen-muted);font-weight:850}.queen-button{border:0;cursor:pointer;text-decoration:none}.queen-button:disabled{opacity:.6}.primary-button{padding:13px 20px;border-radius:12px}@media(max-width:650px){.create-shell{padding:30px 18px 65px}.create-heading{align-items:start}.crown-badge{display:none}.form-grid{grid-template-columns:1fr}.offer-form{padding:22px}.plan-meter{align-items:flex-start;flex-wrap:wrap}}`}</style></main>;
}
