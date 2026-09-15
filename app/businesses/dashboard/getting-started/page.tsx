"use client";

import Link from "next/link";

export default function MerchantGettingStartedPage() {
  return (
    <main className="queen-page">
      <header className="site-header">
        <Link href="/businesses/dashboard" className="brand-wrap">
          <div className="brand-crown">♕</div>
          <div>
            <div className="brand-name">COUPON QUEEN</div>
            <div className="brand-tagline">The Crown Jewel of Savings</div>
          </div>
        </Link>
        <nav>
          <Link href="/businesses/dashboard">Dashboard</Link>
          <Link href="/businesses/dashboard/billing">Billing</Link>
          <Link href="/businesses/dashboard/notifications">Notifications</Link>
        </nav>
      </header>

      <section className="shell">
        <div className="kicker">♛ BUSINESS KINGDOM</div>
        <h1>Your First Royal Offer</h1>
        <p className="intro">Use this quick-start path to turn your new merchant membership into a live customer offer.</p>

        <div className="steps">
          <article><span>1</span><div><h2>Confirm your membership</h2><p>Make sure your merchant dashboard shows an active or trialing membership before creating your offer.</p><Link href="/businesses/dashboard/billing">Open Billing →</Link></div></article>
          <article><span>2</span><div><h2>Create one simple offer</h2><p>Start with an easy-to-understand deal: a dollar amount off, percentage off, or a clear service special.</p><Link href="/businesses/dashboard/create">Create First Coupon →</Link></div></article>
          <article><span>3</span><div><h2>Get approved</h2><p>Your coupon can be saved while your merchant account is pending. Public visibility begins after your merchant account is approved and active.</p><Link href="/businesses/dashboard/notifications">Check Notifications →</Link></div></article>
          <article><span>4</span><div><h2>Verify your first customer</h2><p>When a shopper claims your offer, use the secure redemption area to verify the customer’s redemption.</p><Link href="/businesses/dashboard/redemptions">Open Redemption Vault →</Link></div></article>
        </div>

        <section className="tip-card">
          <div className="kicker">✦ SALES TIP</div>
          <h2>Make the first coupon impossible to misunderstand.</h2>
          <p>Lead with the savings, include the basic terms, choose a future expiration date, and make the customer benefit obvious in the first sentence.</p>
        </section>

        <div className="actions">
          <Link href="/businesses/dashboard/create" className="primary">Create My First Coupon →</Link>
          <Link href="/businesses/dashboard" className="secondary">Back to Merchant Dashboard</Link>
        </div>
      </section>

      <style jsx>{`
        .shell{max-width:900px;margin:0 auto;padding:55px 24px 100px}.kicker{color:var(--queen-turquoise-dark);font-size:10px;font-weight:950;letter-spacing:.14em}.shell h1{margin:9px 0 14px;color:var(--queen-espresso);font-size:clamp(42px,7vw,68px);line-height:.98}.intro{max-width:700px;color:var(--queen-muted);font-size:16px;line-height:1.8}.steps{display:grid;gap:14px;margin:32px 0}.steps article{display:grid;grid-template-columns:48px 1fr;gap:15px;padding:20px;border:1px solid var(--queen-border);border-radius:20px;background:#fff;box-shadow:0 14px 40px rgba(53,32,24,.05)}.steps article>span{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:var(--queen-cream);color:var(--queen-espresso);font-weight:950}.steps h2{margin:0 0 7px;color:var(--queen-espresso);font-size:22px}.steps p,.tip-card p{margin:0 0 8px;color:var(--queen-muted);line-height:1.65;font-size:13px}.steps a{color:var(--queen-turquoise-dark);font-size:12px;font-weight:900;text-decoration:none}.tip-card{margin-top:28px;padding:24px;border:1px solid rgba(218,174,67,.35);border-radius:20px;background:var(--queen-cream)}.tip-card h2{margin:7px 0;color:var(--queen-espresso);font-size:26px}.actions{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-top:26px}.primary{display:inline-block;padding:14px 20px;border-radius:12px;background:var(--queen-espresso);color:#fff;text-decoration:none;font-weight:900}.secondary{color:var(--queen-turquoise-dark);font-weight:900;text-decoration:none}@media(max-width:620px){.shell{padding:35px 18px 70px}.steps article{grid-template-columns:1fr}.steps article>span{margin-bottom:2px}}
      `}</style>
    </main>
  );
}
