"use client";

import Link from "next/link";
import { useState } from "react";

export default function CreateOfferPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ title: "", discount: "", business: "", category: "Dining", location: "", description: "", expires: "" });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: React.FormEvent) => { event.preventDefault(); setSaved(true); };

  return (
    <main className="queen-page">
      <header className="site-header">
        <Link href="/" className="brand-wrap" aria-label="Coupon Queen home"><div className="brand-crown">♕</div><div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">The Crown Jewel of Savings</div></div></Link>
        <nav aria-label="Main navigation"><Link href="/coupons">Coupons</Link><Link href="/businesses">Businesses</Link></nav><div className="header-sparkle">✦</div>
      </header>
      <section className="create-shell">
        <Link href="/businesses/dashboard" className="back">← Merchant Dashboard</Link>
        <div className="create-heading"><div><div className="section-kicker">♛ THE BUSINESS KINGDOM</div><h1>Create a Royal Offer</h1><p>Build a deal that customers will be proud to redeem.</p></div><div className="crown-badge">♕</div></div>
        {saved && <div className="success">✓ Offer details captured. Publishing to the live Deal Vault is the next connection.</div>}
        <form className="offer-form" onSubmit={submit}>
          <div className="form-grid">
            <label>Offer title<input required value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Weekend Dinner Special" /></label>
            <label>Discount<input required value={form.discount} onChange={(e) => update("discount", e.target.value)} placeholder="$10 OFF" /></label>
            <label>Business name<input required value={form.business} onChange={(e) => update("business", e.target.value)} placeholder="Your business" /></label>
            <label>Category<select value={form.category} onChange={(e) => update("category", e.target.value)}><option>Dining</option><option>Shopping</option><option>Beauty</option><option>Services</option><option>Online</option><option>Other</option></select></label>
            <label>Location<input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="City, State" /></label>
            <label>Expiration<input value={form.expires} onChange={(e) => update("expires", e.target.value)} placeholder="September 30, 2026" /></label>
          </div>
          <label>Offer description<textarea required value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Tell customers why this deal deserves a crown." rows={6} /></label>
          <div className="form-actions"><Link href="/businesses/dashboard" className="secondary">Cancel</Link><button type="submit" className="queen-button primary-button">Save Offer →</button></div>
        </form>
      </section>
      <footer className="site-footer"><Link href="/" className="footer-brand"><span>♕</span>COUPON QUEEN</Link><div className="footer-tagline">The Crown Jewel of Savings</div><div className="footer-sparkles">✦ ✧ ✦</div></footer>
      <style jsx>{`.create-shell{max-width:900px;margin:0 auto;padding:45px 28px 90px}.back{color:var(--queen-turquoise-dark);font-weight:900}.create-heading{display:flex;justify-content:space-between;align-items:center;gap:20px;margin:28px 0}.create-heading h1{margin:8px 0;color:var(--queen-espresso);font-size:clamp(34px,5vw,54px);line-height:1}.create-heading p{margin:10px 0;color:var(--queen-muted)}.crown-badge{display:grid;place-items:center;width:82px;height:82px;border-radius:24px;background:var(--queen-cream);color:var(--queen-gold);font-size:42px}.success{margin-bottom:18px;padding:14px 18px;border:1px solid rgba(32,199,201,.35);border-radius:14px;background:rgba(32,199,201,.08);color:var(--queen-turquoise-dark);font-weight:800}.offer-form{padding:30px;border:1px solid var(--queen-border);border-radius:24px;background:white;box-shadow:0 14px 40px rgba(53,32,24,.07)}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.offer-form label{display:grid;gap:7px;color:var(--queen-espresso);font-size:12px;font-weight:850}.offer-form input,.offer-form select,.offer-form textarea{width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid var(--queen-border);border-radius:12px;background:white;color:var(--queen-espresso);font:inherit}.offer-form textarea{margin-top:0;resize:vertical}.offer-form>label{margin-top:18px}.form-actions{display:flex;justify-content:flex-end;align-items:center;gap:12px;margin-top:24px}.secondary{padding:12px 18px;color:var(--queen-muted);font-weight:850}.queen-button{border:0;cursor:pointer}.primary-button{padding:13px 20px;border-radius:12px}@media(max-width:650px){.create-shell{padding:30px 18px 65px}.create-heading{align-items:start}.crown-badge{display:none}.form-grid{grid-template-columns:1fr}.offer-form{padding:22px}}`}</style>
    </main>
  );
}
