"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const draftKey = "cq_merchant_coupon_draft";
const api = (table: string) => `${SUPABASE_URL}/rest/v1/${table}`;

type Draft = { title: string; discount: string; category: string; location: string; description: string; terms: string; expiresAt: string };
type Limit = { planName: string; price: number; max: number; count: number; merchantId: string; categoryId: string };

export default function CreateOfferPage() {
  const [form, setForm] = useState<Draft>({ title: "", discount: "", category: "Dining", location: "", description: "", terms: "One redemption per customer.\nMerchant terms may apply.", expiresAt: "" });
  const [limit, setLimit] = useState<Limit | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      if (!SUPABASE_URL || !SUPABASE_KEY) { setError("Merchant database is not configured."); return; }
      const raw = localStorage.getItem(draftKey);
      if (raw) try { setForm(JSON.parse(raw)); } catch {}
      const token = localStorage.getItem("cq_access_token");
      if (!token) { window.location.href = "/businesses/login"; return; }
      const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` };
      const auth = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers, cache: "no-store" });
      if (!auth.ok) { window.location.href = "/businesses/login"; return; }
      const user = await auth.json();

      const merchantRes = await fetch(`${api("merchants")}?owner_user_id=eq.${encodeURIComponent(user.id)}&select=id,business_name,city,state&order=created_at.asc&limit=1`, { headers, cache: "no-store" });
      if (!merchantRes.ok) throw new Error(`Could not access your merchant profile (${merchantRes.status}).`);
      const merchant = (await merchantRes.json())[0];
      if (!merchant) { setError("Please complete your merchant profile before creating a coupon."); return; }
      const location = [merchant.city, merchant.state].filter(Boolean).join(", ");
      setForm(c => ({ ...c, location: c.location || location }));

      const subscriptionRes = await fetch(`${api("subscriptions")}?merchant_id=eq.${encodeURIComponent(merchant.id)}&status=in.(trialing,active)&select=merchant_plan_id,merchant_plans(id,name,monthly_price_cents)&order=created_at.desc&limit=1`, { headers, cache: "no-store" });
      if (!subscriptionRes.ok) throw new Error(`Could not verify your merchant subscription (${subscriptionRes.status}).`);
      const subscription = (await subscriptionRes.json())[0];
      if (!subscription?.merchant_plan_id) { setError("An active merchant subscription is required before you can publish a coupon."); return; }
      const plan = Array.isArray(subscription.merchant_plans) ? subscription.merchant_plans[0] : subscription.merchant_plans;
      const planName = plan?.name || "Merchant Plan";
      const max = /growth/i.test(planName) ? 20 : 5;

      const categoryRes = await fetch(`${api("categories")}?name=eq.${encodeURIComponent(form.category)}&select=id&limit=1`, { headers, cache: "no-store" });
      if (!categoryRes.ok) throw new Error("Could not load coupon categories.");
      const category = (await categoryRes.json())[0];
      if (!category) throw new Error(`The ${form.category} category is not configured yet.`);

      const countRes = await fetch(`${api("coupons")}?merchant_id=eq.${encodeURIComponent(merchant.id)}&status=eq.active&select=id&or=(expires_at.is.null,expires_at.gt.${encodeURIComponent(new Date().toISOString())})`, { headers, cache: "no-store" });
      const count = countRes.ok ? (await countRes.json()).length : 0;
      setLimit({ planName, price: plan?.monthly_price_cents || 0, max, count, merchantId: merchant.id, categoryId: category.id });
    })().catch(e => setError(e instanceof Error ? e.message : "Could not load merchant coupon setup."));
  }, []);

  useEffect(() => { localStorage.setItem(draftKey, JSON.stringify(form)); }, [form]);
  const update = (key: keyof Draft, value: string) => setForm(c => ({ ...c, [key]: value }));
  const blocked = !!limit && limit.count >= limit.max;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSaved(false); setError("");
    try {
      if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Merchant database is not configured.");
      if (!limit) throw new Error("Merchant account setup is not ready yet.");
      if (blocked) throw new Error(`Your ${limit.planName} limit is ${limit.max} active coupons. Upgrade your plan to publish more.`);
      const token = localStorage.getItem("cq_access_token");
      if (!token) { window.location.href = "/businesses/login"; return; }
      const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation" };
      const d = form.expiresAt ? new Date(`${form.expiresAt}T23:59:59`) : null;
      if (!d || !Number.isFinite(d.getTime())) throw new Error("Please choose a valid expiration date.");
      const payload = {
        merchant_id: limit.merchantId,
        category_id: limit.categoryId,
        title: form.title.trim(),
        description: form.description.trim(),
        terms: form.terms.trim(),
        discount_text: form.discount.trim(),
        status: "active",
        starts_at: new Date().toISOString(),
        expires_at: d.toISOString(),
        per_customer_limit: 1,
      };
      if (!payload.title || !payload.discount_text || !payload.description) throw new Error("Please complete the required coupon fields.");
      const response = await fetch(api("coupons"), { method: "POST", headers, body: JSON.stringify(payload) });
      if (!response.ok) { const detail = await response.text().catch(() => ""); throw new Error(`Could not publish the coupon (${response.status}). ${detail || "Please try again."}`); }
      setSaved(true); localStorage.removeItem(draftKey); setLimit(l => l ? { ...l, count: l.count + 1 } : l); setForm(c => ({ ...c, title: "", discount: "", description: "", terms: "One redemption per customer.\nMerchant terms may apply.", expiresAt: "" }));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not publish the coupon."); }
    finally { setSaving(false); }
  };

  return <main className="queen-page"><header className="site-header"><Link href="/" className="brand-wrap"><div className="brand-crown">♕</div><div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">The Crown Jewel of Savings</div></div></Link><nav><Link href="/coupons">Coupons</Link><Link href="/businesses">Businesses</Link></nav></header><section className="create-shell"><Link href="/businesses/dashboard" className="back">← Merchant Dashboard</Link><div className="create-heading"><div><div className="section-kicker">♛ THE BUSINESS KINGDOM</div><h1>Create a Royal Coupon</h1><p>Publish a real production coupon directly into the Coupon Queen marketplace.</p></div><div className="crown-badge">♕</div></div>{limit&&<div className={`plan-meter ${blocked?"blocked":""}`}><div><strong>{limit.planName}</strong><span>${(limit.price/100).toFixed(0)}/month</span></div><div><strong>{limit.count} / {limit.max}</strong><span>active coupons</span></div>{blocked&&<Link href="/businesses/pricing">Upgrade Plan →</Link>}</div>}{saved&&<div className="success">✓ Coupon published to the Deal Vault.</div>}{error&&<div className="error" role="alert">✕ {error}</div>}<form className="offer-form" onSubmit={submit}><div className="form-grid"><label>Coupon title<input required disabled={blocked} value={form.title} onChange={e=>update("title",e.target.value)} placeholder="Weekend Dinner Special"/></label><label>Discount<input required disabled={blocked} value={form.discount} onChange={e=>update("discount",e.target.value)} placeholder="$10 OFF"/></label><label>Category<select disabled={blocked} value={form.category} onChange={e=>update("category",e.target.value)}><option>Dining</option><option>Shopping</option><option>Beauty</option><option>Services</option><option>Online</option><option>Other</option></select></label><label>Location<input disabled value={form.location} onChange={e=>update("location",e.target.value)} placeholder="City, State"/></label><label>Expiration date<input required disabled={blocked} type="date" min={new Date().toISOString().slice(0,10)} value={form.expiresAt} onChange={e=>update("expiresAt",e.target.value)}/></label></div><label>Coupon description<textarea required disabled={blocked} value={form.description} onChange={e=>update("description",e.target.value)} placeholder="Tell customers why this deal deserves a crown." rows={6}/></label><label>Terms & conditions<textarea disabled={blocked} value={form.terms} onChange={e=>update("terms",e.target.value)} rows={4}/></label><div className="form-actions"><Link href="/businesses/dashboard" className="secondary">Cancel</Link>{blocked?<Link href="/businesses/pricing" className="queen-button primary-button">Upgrade to Publish More →</Link>:<button disabled={saving} type="submit" className="queen-button primary-button">{saving?"Publishing Coupon...":"Publish Coupon →"}</button>}</div></form></section><footer className="site-footer"><Link href="/" className="footer-brand"><span>♕</span>COUPON QUEEN</Link><div className="footer-tagline">The Crown Jewel of Savings</div></footer><style jsx>{`.create-shell{max-width:900px;margin:0 auto;padding:45px 28px 90px}.back{color:var(--queen-turquoise-dark);font-weight:900}.create-heading{display:flex;justify-content:space-between;align-items:center;gap:20px;margin:28px 0}.create-heading h1{margin:8px 0;color:var(--queen-espresso);font-size:clamp(34px,5vw,54px);line-height:1}.create-heading p{margin:10px 0;color:var(--queen-muted)}.crown-badge{display:grid;place-items:center;width:82px;height:82px;border-radius:24px;background:var(--queen-cream);color:var(--queen-gold);font-size:42px}.plan-meter{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:18px;padding:16px 18px;border:1px solid var(--queen-border);border-radius:16px;background:var(--queen-cream);color:var(--queen-espresso)}.plan-meter div{display:grid;gap:3px}.plan-meter span{font-size:11px;color:var(--queen-muted)}.plan-meter a{color:var(--queen-turquoise-dark);font-weight:900;font-size:12px}.plan-meter.blocked{border-color:var(--queen-gold)}.success,.error{margin-bottom:18px;padding:14px 18px;border-radius:14px;font-weight:800}.success{border:1px solid rgba(32,199,201,.35);background:rgba(32,199,201,.08);color:var(--queen-turquoise-dark)}.error{border:1px solid rgba(180,50,50,.25);background:rgba(180,50,50,.06);color:#9b2c2c}.offer-form{padding:30px;border:1px solid var(--queen-border);border-radius:24px;background:white;box-shadow:0 14px 40px rgba(53,32,24,.07)}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.offer-form label{display:grid;gap:7px;color:var(--queen-espresso);font-size:12px;font-weight:850}.offer-form input,.offer-form select,.offer-form textarea{width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid var(--queen-border);border-radius:12px;background:white;color:var(--queen-espresso);font:inherit}.offer-form textarea{resize:vertical}.offer-form>label{margin-top:18px}.form-actions{display:flex;justify-content:flex-end;align-items:center;gap:12px;margin-top:24px}.secondary{padding:12px 18px;color:var(--queen-muted);font-weight:850}.queen-button{border:0;cursor:pointer;text-decoration:none}.queen-button:disabled{opacity:.6}.primary-button{padding:13px 20px;border-radius:12px}@media(max-width:650px){.create-shell{padding:30px 18px 65px}.create-heading{align-items:start}.crown-badge{display:none}.form-grid{grid-template-columns:1fr}.offer-form{padding:22px}.plan-meter{align-items:flex-start;flex-wrap:wrap}}`}</style></main>;
}
