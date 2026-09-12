"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Plan = {
  id: string;
  name: string;
  monthly_price_cents: number;
  description: string;
  features: string[] | null;
  stripe_price_id: string | null;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Pricing is not configured yet.");
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/merchant_plans?is_active=eq.true&select=id,name,monthly_price_cents,description,features,stripe_price_id&order=monthly_price_cents.asc`,
          { headers: { apikey: SUPABASE_KEY }, cache: "no-store" },
        );
        if (!res.ok) throw new Error("Could not load merchant plans.");
        setPlans(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load merchant plans.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="queen-page">
      <header className="site-header">
        <Link href="/" className="brand-wrap">
          <div className="brand-crown">♕</div>
          <div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">The Crown Jewel of Savings</div></div>
        </Link>
        <nav><Link href="/coupons">Coupons</Link><Link href="/businesses">Businesses</Link></nav>
        <Link href="/businesses/login?mode=signup" className="header-cta">Join the Kingdom</Link>
      </header>

      <section className="pricing-hero">
        <div className="section-kicker">✦ MERCHANT MEMBERSHIP ✦</div>
        <h1>Turn Local Deals Into <span>More Customers.</span></h1>
        <p>Choose the merchant membership that fits your business. Your selected plan is carried directly into secure checkout.</p>
        <div className="trust-row"><span>✓ Production pricing</span><span>✓ Secure Stripe checkout</span><span>✓ Merchant-owned offers</span></div>
      </section>

      {error ? <div className="pricing-error">{error}</div> : null}
      <section className="pricing-grid">
        {loading ? <div className="loading-card">Loading current merchant plans…</div> : plans.length ? plans.map((plan, index) => <PlanCard key={plan.id} plan={plan} featured={index === 1 || plans.length === 1} />) : <div className="loading-card">No active merchant plans are configured yet.</div>}
      </section>

      <section className="pricing-bottom">
        <div><div className="section-kicker">♛ READY TO GROW?</div><h2>Start with the plan that fits your business.</h2><p>Coupon Queen keeps plan selection and billing connected to the same production merchant records used by your dashboard.</p></div>
        <Link href="/businesses/onboarding" className="queen-button primary-button">Start Merchant Setup →</Link>
      </section>

      <footer className="site-footer"><Link href="/" className="footer-brand"><span>♕</span>COUPON QUEEN</Link><div className="footer-tagline">The Crown Jewel of Savings</div></footer>

      <style jsx>{`
        .pricing-hero{max-width:900px;margin:0 auto;padding:75px 25px 45px;text-align:center}.pricing-hero h1{margin:12px 0 18px;color:var(--queen-espresso);font-size:clamp(42px,7vw,72px);line-height:.98}.pricing-hero h1 span{color:var(--queen-turquoise-dark)}.pricing-hero p{max-width:680px;margin:0 auto;color:var(--queen-muted);font-size:16px;line-height:1.8}.trust-row{display:flex;justify-content:center;gap:18px;flex-wrap:wrap;margin-top:24px;color:var(--queen-espresso);font-size:12px;font-weight:850}.pricing-grid{max-width:1080px;margin:15px auto 70px;padding:0 25px;display:grid;grid-template-columns:repeat(2,1fr);gap:22px}.plan-card{position:relative;padding:34px;border:1px solid var(--queen-border);border-radius:28px;background:white;box-shadow:0 18px 50px rgba(53,32,24,.08)}.plan-card.featured{border-color:var(--queen-gold);box-shadow:0 22px 60px rgba(53,32,24,.13)}.popular{position:absolute;right:20px;top:20px;padding:6px 10px;border-radius:999px;background:var(--queen-gold);color:white;font-size:9px;font-weight:950;letter-spacing:.1em}.plan-card h2{margin:0;color:var(--queen-espresso);font-size:28px}.plan-description{color:var(--queen-muted);font-size:13px;line-height:1.6;min-height:42px}.price{margin:20px 0;color:var(--queen-espresso);font-size:45px;font-weight:950}.price small{font-size:13px;color:var(--queen-muted);font-weight:700}.feature-list{display:grid;gap:11px;margin:0 0 25px;padding:0;list-style:none;color:var(--queen-muted);font-size:13px}.feature-list li::first-letter{color:var(--queen-turquoise-dark)}.plan-button{display:block;text-align:center;width:100%;box-sizing:border-box}.pricing-bottom{max-width:1030px;margin:0 auto 80px;padding:30px;border:1px solid var(--queen-border);border-radius:24px;background:var(--queen-cream);display:flex;justify-content:space-between;align-items:center;gap:25px}.pricing-bottom h2{margin:8px 0;color:var(--queen-espresso);font-size:28px}.pricing-bottom p{margin:0;color:var(--queen-muted);line-height:1.6;font-size:13px;max-width:650px}.primary-button{padding:14px 20px;border-radius:12px;text-decoration:none;white-space:nowrap}.header-cta{padding:9px 14px;border-radius:10px;background:var(--queen-turquoise);color:white;font-size:11px;font-weight:900;text-decoration:none}.loading-card,.pricing-error{max-width:1030px;margin:0 auto 35px;padding:20px;border:1px solid var(--queen-border);border-radius:18px;background:white;color:var(--queen-muted);text-align:center}.pricing-error{color:#9b2c2c;background:#fff6f6}.disabled-button{opacity:.55;cursor:not-allowed}@media(max-width:760px){.pricing-grid{grid-template-columns:1fr}.pricing-bottom{margin:0 20px 60px;flex-direction:column;align-items:flex-start}.header-cta{display:none}}
      `}</style>
    </main>
  );
}

function PlanCard({ plan, featured }: { plan: Plan; featured: boolean }) {
  const features = Array.isArray(plan.features) ? plan.features : [];
  const checkoutReady = Boolean(plan.stripe_price_id);
  return (
    <article className={`plan-card ${featured ? "featured" : ""}`}>
      {featured && <div className="popular">FEATURED</div>}
      <h2>{plan.name}</h2>
      <p className="plan-description">{plan.description}</p>
      <div className="price">${(plan.monthly_price_cents / 100).toFixed(0)}<small>/month</small></div>
      <ul className="feature-list">{features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>
      {checkoutReady ? <Link href={`/businesses/dashboard/billing?plan=${encodeURIComponent(plan.id)}`} className="queen-button primary-button plan-button">Choose {plan.name} →</Link> : <button type="button" className="queen-button primary-button plan-button disabled-button" disabled>Stripe setup pending</button>}
    </article>
  );
}
