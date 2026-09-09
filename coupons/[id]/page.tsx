"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { getCoupon } from "../../lib/coupons";

export default function CouponDetailPage() {
  const params = useParams<{ id: string }>();
  const coupon = getCoupon(params.id);
  const [redeemed, setRedeemed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!coupon) {
    return (
      <main className="queen-page">
        <header className="site-header">
          <Link href="/" className="brand-wrap" aria-label="Coupon Queen home">
            <div className="brand-crown">♕</div>
            <div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">The Crown Jewel of Savings</div></div>
          </Link>
        </header>
        <section className="coupon-detail-section">
          <div className="coupon-not-found">
            <div className="card-icon gold-icon">👑</div>
            <h1>That deal has left the kingdom</h1>
            <p>We could not find this coupon. Browse the Deal Vault for the latest offers.</p>
            <Link href="/coupons" className="queen-button primary-button">Back to Deal Vault</Link>
          </div>
        </section>
      </main>
    );
  }

  const redemptionCode = `QUEEN-${coupon.id.replace("queen-", "")}-SAVE`;

  function handleRedeem() {
    setRedeemed(true);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(redemptionCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="queen-page">
      <header className="site-header">
        <Link href="/" className="brand-wrap" aria-label="Coupon Queen home">
          <div className="brand-crown">♕</div>
          <div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">The Crown Jewel of Savings</div></div>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/coupons">Coupons</Link>
          <Link href="/businesses">Businesses</Link>
        </nav>
        <div className="header-sparkle" aria-hidden="true">✦</div>
      </header>

      <section className="coupon-detail-section">
        <Link href="/coupons" className="back-link">← Back to Deal Vault</Link>

        <div className="coupon-detail-layout">
          <article className="coupon-hero-card">
            <div className="coupon-hero-top">
              <span className="detail-category">{coupon.category}</span>
              <span className="detail-location">📍 {coupon.location}</span>
            </div>
            <div className="detail-crown">♕</div>
            <div className="detail-discount">{coupon.discount}</div>
            <h1>{coupon.title}</h1>
            <p className="detail-business">{coupon.business}</p>
            <p className="detail-description">{coupon.description}</p>
            <div className="detail-divider" />
            <div className="detail-expiry">♛ {coupon.expires}</div>
          </article>

          <aside className="redemption-card">
            <div className="section-kicker">✦ REDEEM YOUR SAVINGS ✦</div>
            {!redeemed ? (
              <>
                <h2>Unlock this royal deal</h2>
                <p>Tap below when you are ready to use this offer. Your redemption code will appear on screen.</p>
                <button type="button" className="queen-button primary-button redeem-button" onClick={handleRedeem}>
                  Redeem This Deal <span className="button-arrow">→</span>
                </button>
                <p className="redemption-note">Only redeem when you are ready to present the offer.</p>
              </>
            ) : (
              <div className="redeemed-state">
                <div className="redeemed-check">✓</div>
                <div className="section-kicker">DEAL UNLOCKED</div>
                <h2>Your royal code</h2>
                <div className="redemption-code">{redemptionCode}</div>
                <button type="button" className="copy-code" onClick={handleCopy}>{copied ? "Copied! ✓" : "Copy Code"}</button>
                <p>Show this code to the merchant to request your savings.</p>
              </div>
            )}
          </aside>
        </div>

        <section className="terms-card">
          <div className="section-kicker">♢ THE FINE PRINT</div>
          <h2>Deal Terms</h2>
          <ul>
            {coupon.terms.map((term) => <li key={term}>◆ {term}</li>)}
          </ul>
          <p className="terms-warning">Coupon Queen displays sample offers while the marketplace is being built. Final merchant terms should be confirmed before launch.</p>
        </section>
      </section>

      <footer className="site-footer">
        <Link href="/" className="footer-brand"><span>♕</span>COUPON QUEEN</Link>
        <div className="footer-tagline">The Crown Jewel of Savings</div>
        <div className="footer-sparkles">✦ ✧ ✦</div>
      </footer>
    </main>
  );
}
