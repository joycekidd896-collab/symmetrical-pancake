"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type Limit = {
  plan_id: string;
  plan_name: string;
  monthly_price_cents: number;
  max_active_offers: number;
  active_offer_count: number;
  can_create_offer: boolean;
};

type Draft = {
  title: string;
  discount: string;
  business: string;
  category: string;
  location: string;
  description: string;
  expiresAt: string;
};

const draftKey = "cq_merchant_offer_draft";
const api = (table: string) => `${SUPABASE_URL}/rest/v1/${table}`;

export default function CreateOfferPage() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState<Limit | null>(null);
  const [form, setForm] = useState<Draft>({
    title: "",
    discount: "",
    business: "",
    category: "Dining",
    location: "",
    description: "",
    expiresAt: "",
  });

  useEffect(() => {
    const load = async () => {
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        setError("Merchant database is not configured.");
        return;
      }

      const raw = localStorage.getItem(draftKey);
      if (raw) {
        try {
          setForm(JSON.parse(raw));
        } catch {}
      }

      const token = localStorage.getItem("cq_access_token");
      if (!token) {
        window.location.href = "/businesses/login";
        return;
      }

      const headers = {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
      };

      const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers,
        cache: "no-store",
      });
      if (!userResponse.ok) {
        localStorage.removeItem("cq_access_token");
        localStorage.removeItem("cq_refresh_token");
        window.location.href = "/businesses/login";
        return;
      }

      const user = await userResponse.json();
      const businessResponse = await fetch(
        `${api("businesses")}?owner_id=eq.${encodeURIComponent(user.id)}&select=id,name,location,category&order=created_at.asc&limit=1`,
        { headers: { ...headers, "Accept-Profile": "public" }, cache: "no-store" }
      );

      if (!businessResponse.ok) {
        const detail = await businessResponse.text().catch(() => "");
        setError(`Could not access your business vault (${businessResponse.status}). ${detail || "The merchant database is not available."}`);
        return;
      }

      const business = (await businessResponse.json())[0];
      if (business) {
        setForm((current) => ({
          ...current,
          business: current.business || business.name || "",
          location: current.location || business.location || "",
          category: current.category || business.category || "Dining",
        }));
      }

      const limitResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/get_my_merchant_offer_limit`,
        {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: "{}",
          cache: "no-store",
        }
      );

      if (limitResponse.ok) {
        const rows = await limitResponse.json();
        setLimit(rows[0] || null);
      } else {
        const detail = await limitResponse.text().catch(() => "");
        setError(`Could not verify your merchant plan (${limitResponse.status}). ${detail || "Please start or restore an active merchant subscription."}`);
      }
    };

    load();
  }, []);

  useEffect(() => {
    localStorage.setItem(draftKey, JSON.stringify(form));
  }, [form]);

  const update = (key: keyof Draft, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error("Merchant database is not configured.");
      }

      const token = localStorage.getItem("cq_access_token");
      if (!token) {
        window.location.href = "/businesses/login";
        return;
      }

      const headers = {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        "Accept-Profile": "public",
        "Content-Profile": "public",
      };

      const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers,
        cache: "no-store",
      });
      if (!userResponse.ok) {
        throw new Error("Your merchant session expired. Please sign in again.");
      }

      const user = await userResponse.json();
      const businessResponse = await fetch(
        `${api("businesses")}?owner_id=eq.${encodeURIComponent(user.id)}&select=id,name&order=created_at.asc&limit=1`,
        { headers, cache: "no-store" }
      );
      if (!businessResponse.ok) {
        const detail = await businessResponse.text().catch(() => "");
        throw new Error(`Could not access your business vault (${businessResponse.status}). ${detail || "Please try again."}`);
      }

      const businesses = await businessResponse.json();
      let businessId = businesses[0]?.id;

      if (!businessId) {
        const createBusinessResponse = await fetch(api("businesses"), {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: form.business.trim(),
            owner_id: user.id,
            location: form.location.trim() || null,
            category: form.category,
            description: "Coupon Queen merchant",
          }),
        });
        if (!createBusinessResponse.ok) {
          const detail = await createBusinessResponse.text().catch(() => "");
          throw new Error(`Could not create your business profile (${createBusinessResponse.status}). ${detail || "Please try again."}`);
        }
        const created = await createBusinessResponse.json();
        businessId = created?.[0]?.id;
      }

      if (!businessId) {
        throw new Error("Could not establish your business profile.");
      }

      const subscriptionResponse = await fetch(
        `${api("merchant_subscriptions")}?business_id=eq.${encodeURIComponent(businessId)}&status=in.(trialing,active)&select=plan_id&limit=1`,
        { headers, cache: "no-store" }
      );
      if (!subscriptionResponse.ok) {
        const detail = await subscriptionResponse.text().catch(() => "");
        throw new Error(`Could not verify your merchant subscription (${subscriptionResponse.status}). ${detail || "Please try again."}`);
      }

      const subscriptions = await subscriptionResponse.json();
      const planId = subscriptions[0]?.plan_id;
      if (!planId) {
        throw new Error("An active merchant subscription is required before you can publish an offer. Choose a merchant plan to continue.");
      }

      const maxOffers = planId === "growth" ? 20 : 5;
      const planName = planId === "growth" ? "Royal Growth" : "Royal Starter";

      const limitResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/get_my_merchant_offer_limit`,
        {
          method: "POST",
          headers,
          body: "{}",
          cache: "no-store",
        }
      );
      if (limitResponse.ok) {
        const rows = await limitResponse.json();
        const currentLimit = rows[0];
        if (currentLimit && !currentLimit.can_create_offer) {
          throw new Error(`Your ${currentLimit.plan_name || planName} limit is ${currentLimit.max_active_offers || maxOffers} active offers. Upgrade your plan to publish more offers.`);
        }
      }

      const expiry = form.expiresAt
        ? new Date(`${form.expiresAt}T23:59:59`).toISOString()
        : null;
      if (form.expiresAt && Number.isNaN(new Date(`${form.expiresAt}T23:59:59`).getTime())) {
        throw new Error("Please choose a valid expiration date.");
      }

      const offerResponse = await fetch(api("business_offers"), {
        method: "POST",
        headers,
        body: JSON.stringify({
          business_id: businessId,
          discount: form.discount.trim(),
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          location: form.location.trim() || null,
          expires: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59`).toLocaleDateString() : null,
          expires_at: expiry,
          active: true,
        }),
      });
      if (!offerResponse.ok) {
        const detail = await offerResponse.text().catch(() => "");
        throw new Error(`Could not save the offer (${offerResponse.status}). ${detail || "Please try again."}`);
      }

      setSaved(true);
      localStorage.removeItem(draftKey);
      setLimit((current) =>
        current
          ? {
              ...current,
              active_offer_count: current.active_offer_count + 1,
              can_create_offer: current.active_offer_count + 1 < current.max_active_offers,
            }
          : current
      );
      setForm((current) => ({ ...current, title: "", discount: "", description: "", expiresAt: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the offer");
    } finally {
      setSaving(false);
    }
  };

  const blocked = !!limit && !limit.can_create_offer;

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
        <nav><Link href="/coupons">Coupons</Link><Link href="/businesses">Businesses</Link></nav>
      </header>

      <section className="create-shell">
        <Link href="/businesses/dashboard" className="back">← Merchant Dashboard</Link>
        <div className="create-heading">
          <div><div className="section-kicker">♛ THE BUSINESS KINGDOM</div><h1>Create a Royal Offer</h1><p>Publish a real offer with a clear expiration date.</p></div>
          <div className="crown-badge">♕</div>
        </div>

        {limit && <div className={`plan-meter ${blocked ? "blocked" : ""}`}>
          <div><strong>{limit.plan_name}</strong><span>${(limit.monthly_price_cents / 100).toFixed(0)}/month</span></div>
          <div><strong>{limit.active_offer_count} / {limit.max_active_offers}</strong><span>active offers</span></div>
          {blocked && <Link href="/businesses/pricing">Upgrade Plan →</Link>}
        </div>}

        {saved && <div className="success">✓ Offer saved! It is now live in the Deal Vault.</div>}
        {error && <div className="error" role="alert">✕ {error}</div>}

        <form className="offer-form" onSubmit={submit}>
          <div className="form-grid">
            <label>Offer title<input required disabled={blocked} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Weekend Dinner Special" /></label>
            <label>Discount<input required disabled={blocked} value={form.discount} onChange={(e) => update("discount", e.target.value)} placeholder="$10 OFF" /></label>
            <label>Business name<input required disabled={blocked} value={form.business} onChange={(e) => update("business", e.target.value)} placeholder="Your business" /></label>
            <label>Category<select disabled={blocked} value={form.category} onChange={(e) => update("category", e.target.value)}><option>Dining</option><option>Shopping</option><option>Beauty</option><option>Services</option><option>Online</option><option>Other</option></select></label>
            <label>Location<input disabled={blocked} value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="City, State" /></label>
            <label>Expiration date<input required disabled={blocked} type="date" min={new Date().toISOString().slice(0, 10)} value={form.expiresAt} onChange={(e) => update("expiresAt", e.target.value)} /></label>
          </div>
          <label>Offer description<textarea required disabled={blocked} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Tell customers why this deal deserves a crown." rows={6} /></label>
          <div className="form-actions">
            <Link href="/businesses/dashboard" className="secondary">Cancel</Link>
            {blocked ? <Link href="/businesses/pricing" className="queen-button primary-button">Upgrade to Publish More →</Link> : <button disabled={saving} type="submit" className="queen-button primary-button">{saving ? "Saving Offer..." : "Save Offer →"}</button>}
          </div>
        </form>
      </section>

      <footer className="site-footer"><Link href="/" className="footer-brand"><span>♕</span>COUPON QUEEN</Link><div className="footer-tagline">The Crown Jewel of Savings</div></footer>
      <style jsx>{`.create-shell{max-width:900px;margin:0 auto;padding:45px 28px 90px}.back{color:var(--queen-turquoise-dark);font-weight:900}.create-heading{display:flex;justify-content:space-between;align-items:center;gap:20px;margin:28px 0}.create-heading h1{margin:8px 0;color:var(--queen-espresso);font-size:clamp(34px,5vw,54px);line-height:1}.create-heading p{margin:10px 0;color:var(--queen-muted)}.crown-badge{display:grid;place-items:center;width:82px;height:82px;border-radius:24px;background:var(--queen-cream);color:var(--queen-gold);font-size:42px}.plan-meter{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:18px;padding:16px 18px;border:1px solid var(--queen-border);border-radius:16px;background:var(--queen-cream);color:var(--queen-espresso)}.plan-meter div{display:grid;gap:3px}.plan-meter span{font-size:11px;color:var(--queen-muted)}.plan-meter a{color:var(--queen-turquoise-dark);font-weight:900;font-size:12px}.plan-meter.blocked{border-color:var(--queen-gold)}.success,.error{margin-bottom:18px;padding:14px 18px;border-radius:14px;font-weight:800}.success{border:1px solid rgba(32,199,201,.35);background:rgba(32,199,201,.08);color:var(--queen-turquoise-dark)}.error{border:1px solid rgba(180,50,50,.25);background:rgba(180,50,50,.06);color:#9b2c2c}.offer-form{padding:30px;border:1px solid var(--queen-border);border-radius:24px;background:white;box-shadow:0 14px 40px rgba(53,32,24,.07)}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.offer-form label{display:grid;gap:7px;color:var(--queen-espresso);font-size:12px;font-weight:850}.offer-form input,.offer-form select,.offer-form textarea{width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid var(--queen-border);border-radius:12px;background:white;color:var(--queen-espresso);font:inherit}.offer-form textarea{resize:vertical}.offer-form>label{margin-top:18px}.form-actions{display:flex;justify-content:flex-end;align-items:center;gap:12px;margin-top:24px}.secondary{padding:12px 18px;color:var(--queen-muted);font-weight:850}.queen-button{border:0;cursor:pointer;text-decoration:none}.queen-button:disabled{opacity:.6}.primary-button{padding:13px 20px;border-radius:12px}@media(max-width:650px){.create-shell{padding:30px 18px 65px}.create-heading{align-items:start}.crown-badge{display:none}.form-grid{grid-template-columns:1fr}.offer-form{padding:22px}.plan-meter{align-items:flex-start;flex-wrap:wrap}}`}</style>
    </main>
  );
}
