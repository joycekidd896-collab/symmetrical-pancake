"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="queen-page">
      <header className="site-header">
        <Link href="/" className="brand-wrap" aria-label="Coupon Queen home">
          <div className="brand-crown">♕</div>
          <div>
            <div className="brand-name">COUPON QUEEN</div>
            <div className="brand-tagline">The Crown Jewel of Savings</div>
          </div>
        </Link>

        <nav aria-label="Main navigation">
          <Link href="/coupons">Coupons</Link>
          <Link href="/businesses">Businesses</Link>
          <Link href="/account/login">Sign In</Link>
        </nav>

        <div className="header-sparkle" aria-hidden="true">✦</div>
      </header>

      <section className="hero-section">
        <div className="hero-diamond diamond-one" aria-hidden="true">◆</div>
        <div className="hero-diamond diamond-two" aria-hidden="true">✦</div>
        <div className="hero-sparkle sparkle-one" aria-hidden="true">✧</div>
        <div className="hero-sparkle sparkle-two" aria-hidden="true">✦</div>

        <div className="hero-content">
          <div className="royal-badge">
            <span>♛</span><span>YOUR SAVINGS ROYALTY</span><span>♛</span>
          </div>

          <h1>Find Deals Worth<span> Crowning</span></h1>

          <p className="hero-description">
            Discover live coupons, local offers, and money-saving deals from businesses across the country — all in one royal destination.
          </p>

          <div className="hero-actions">
            <Link href="/coupons" className="queen-button primary-button">
              <span>🎟️</span>Browse Live Deals<span className="button-arrow">→</span>
            </Link>
            <Link href="/businesses/login?mode=signup" className="queen-button secondary-button">
              Grow Your Business<span className="button-arrow">→</span>
            </Link>
          </div>

          <div className="savings-pointer">
            <span className="pointer-arrow">↘</span>
            <span>Fresh offers. Real savings. Nationwide.</span>
          </div>
        </div>

        <div className="royal-card-preview" aria-label="Coupon Queen featured savings preview">
          <div className="card-crown">♛</div>
          <div className="card-label">LIVE DEAL VAULT</div>
          <div className="card-diamond">◇</div>
          <div className="card-title">Your Next Great Deal</div>
          <div className="card-copy">Search it. Save it. Show it. Redeem it.</div>
          <div className="coupon-ribbon">COUPON QUEEN</div>
        </div>
      </section>

      <section className="benefits-section">
        <div className="section-heading">
          <div className="section-kicker">THE QUEEN'S COLLECTION</div>
          <h2>Everything You Need to Save in Style</h2>
          <p>Built for shoppers who want simple savings and for merchants who want a better way to reach customers.</p>
        </div>

        <div className="benefit-grid">
          <article className="benefit-card">
            <div className="card-icon turquoise-icon">💎</div><div className="card-number">01</div>
            <h3>Live Deal Vault</h3>
            <p>Search active merchant offers by business, category, location, and discount.</p>
            <Link href="/coupons" className="card-link">Explore live deals <span>→</span></Link>
          </article>
          <article className="benefit-card featured-card">
            <div className="card-icon gold-icon">🎟️</div><div className="card-number">02</div>
            <h3>Simple Redemption</h3>
            <p>Claim eligible offers and receive a secure redemption code to present to the business.</p>
            <Link href="/account/login" className="card-link">Sign in to save <span>→</span></Link>
          </article>
          <article className="benefit-card">
            <div className="card-icon espresso-icon">👑</div><div className="card-number">03</div>
            <h3>Merchant Growth</h3>
            <p>Create your business, publish offers, reach more shoppers, and manage redemptions from one place.</p>
            <Link href="/businesses/login?mode=signup" className="card-link">Become a merchant <span>→</span></Link>
          </article>
        </div>
      </section>

      <section className="benefits-section home-growth-section">
        <div className="section-heading">
          <div className="section-kicker">HOW THE KINGDOM WORKS</div>
          <h2>Three Easy Steps to Better Savings</h2>
          <p>No hunting through piles of paper coupons. Coupon Queen brings active offers together in a marketplace built for everyday use.</p>
        </div>

        <div className="benefit-grid">
          <article className="benefit-card compact-home-card">
            <div className="card-number">STEP 01</div>
            <div className="card-icon turquoise-icon">🔎</div>
            <h3>Discover</h3>
            <p>Search the Deal Vault and find offers that fit what you need right now.</p>
          </article>
          <article className="benefit-card featured-card compact-home-card">
            <div className="card-number">STEP 02</div>
            <div className="card-icon gold-icon">💗</div>
            <h3>Claim</h3>
            <p>Sign in, open the offer, and get your server-generated redemption code when eligible.</p>
          </article>
          <article className="benefit-card compact-home-card">
            <div className="card-number">STEP 03</div>
            <div className="card-icon espresso-icon">👑</div>
            <h3>Redeem</h3>
            <p>Show the code to the participating business and enjoy your savings.</p>
          </article>
        </div>
      </section>

      <section className="royal-banner home-merchant-banner">
        <div className="banner-diamond" aria-hidden="true">◆</div>
        <div>
          <div className="banner-kicker">FOR BUSINESS OWNERS</div>
          <h2>Have an offer worth crowning?</h2>
          <p className="banner-support-copy">Create your merchant profile, publish live deals, and put your business in front of shoppers looking to save.</p>
        </div>
        <Link href="/businesses/login?mode=signup" className="queen-button secondary-button">Join the Kingdom <span className="button-arrow">→</span></Link>
      </section>

      <section className="benefits-section home-trust-section">
        <div className="section-heading">
          <div className="section-kicker">BUILT FOR THE REAL WORLD</div>
          <h2>Savings With Guardrails</h2>
          <p>Coupon Queen's live marketplace is designed around current offers, expiration dates, authenticated claims, and secure merchant redemption.</p>
        </div>
        <div className="home-trust-grid">
          <div className="home-trust-item"><strong>✓ Live offers</strong><span>Only active eligible deals belong in the Deal Vault.</span></div>
          <div className="home-trust-item"><strong>✓ Expiration-aware</strong><span>Expired offers are not meant to be redeemed.</span></div>
          <div className="home-trust-item"><strong>✓ Secure codes</strong><span>Redemption codes are generated server-side.</span></div>
          <div className="home-trust-item"><strong>✓ Merchant-focused</strong><span>Businesses can manage offers and redemption activity.</span></div>
        </div>
      </section>

      <footer className="site-footer">
        <Link href="/" className="footer-brand" aria-label="Coupon Queen home"><span>♕</span>COUPON QUEEN</Link>
        <div className="footer-tagline">The Crown Jewel of Savings</div>
        <div className="footer-sparkles">✦ ✧ ✦</div>
      </footer>

      <style jsx>{`
        .home-growth-section { background: linear-gradient(180deg, #fffaf4, #ffffff); }
        .compact-home-card { min-height: 285px; }
        .home-merchant-banner { margin-top: 0; margin-bottom: 75px; }
        .banner-support-copy { max-width: 620px; margin: 10px 0 0; color: rgba(255,255,255,.7); line-height: 1.7; }
        .home-trust-section { padding-top: 80px; }
        .home-trust-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .home-trust-item { padding: 22px; border: 1px solid var(--queen-border); border-radius: 20px; background: #fff; box-shadow: 0 12px 30px rgba(53,32,24,.06); }
        .home-trust-item strong { display: block; color: var(--queen-espresso); font-size: 14px; font-weight: 900; }
        .home-trust-item span { display: block; margin-top: 8px; color: var(--queen-muted); font-size: 13px; line-height: 1.6; }
        @media (max-width: 900px) { .home-trust-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 620px) { .home-trust-grid { grid-template-columns: 1fr; } .home-merchant-banner { margin-bottom: 50px; } .banner-support-copy { font-size: 13px; } }
      `}</style>
    </main>
  );
}
