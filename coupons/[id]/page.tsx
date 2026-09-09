"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCoupon } from "../../lib/coupons";

export default function CouponDetailPage() {
  const params = useParams<{ id: string }>();
  const coupon = getCoupon(params.id);
  const [redeemed, setRedeemed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (coupon && window.localStorage.getItem(`coupon-queen-redeemed-${coupon.id}`) === "true") setRedeemed(true);
  }, [coupon]);

  if (!coupon) return <main className="queen-page"><section className="coupon-not-found"><div className="card-icon gold-icon">👑</div><h1>That deal has left the kingdom</h1><p>We could not find this coupon. Browse the Deal Vault for the latest offers.</p><Link href="/coupons" className="queen-button primary-button">Back to Deal Vault</Link></section></main>;

  const redemptionCode = `QUEEN-${coupon.id.replace("queen-", "")}-SAVE`;
  const handleRedeem = () => { window.localStorage.setItem(`coupon-queen-redeemed-${coupon.id}`, "true"); setRedeemed(true); };
  const handleCopy = async () => { try { await navigator.clipboard.writeText(redemptionCode); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); } };

  return (
    <main className="queen-page">
      <header className="site-header"><Link href="/" className="brand-wrap" aria-label="Coupon Queen home"><div className="brand-crown">♕</div><div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">The Crown Jewel of Savings</div></div></Link><nav aria-label="Main navigation"><Link href="/coupons">Coupons</Link><Link href="/businesses">Businesses</Link></nav><div className="header-sparkle" aria-hidden="true">✦</div></header>
      <section className="coupon-detail-section">
        <Link href="/coupons" className="back-link">← Back to Deal Vault</Link>
        <div className="coupon-detail-layout">
          <article className="coupon-hero-card"><div className="coupon-hero-top"><span className="detail-category">{coupon.category}</span><span className="detail-location">📍 {coupon.location}</span></div><div className="detail-crown">♕</div><div className="detail-discount">{coupon.discount}</div><h1>{coupon.title}</h1><p className="detail-business">{coupon.business}</p><p className="detail-description">{coupon.description}</p><div className="detail-divider"/><div className="detail-expiry">♛ {coupon.expires}</div></article>
          <aside className="redemption-card"><div className="section-kicker">✦ REDEEM YOUR SAVINGS ✦</div>{!redeemed ? <><h2>Unlock this royal deal</h2><p>When you are ready to use this offer, reveal your redemption code and present it to the merchant at checkout.</p><button type="button" className="queen-button primary-button redeem-button" onClick={handleRedeem}>Redeem This Deal <span className="button-arrow">→</span></button><p className="redemption-note">Only tap redeem when you are ready to present the offer.</p></> : <div className="redeemed-state"><div className="redeemed-check">✓</div><div className="section-kicker">DEAL UNLOCKED</div><h2>Your royal code</h2><div className="redemption-code" aria-label="Your coupon redemption code">{redemptionCode}</div><button type="button" className="copy-code" onClick={handleCopy}>{copied ? "Copied! ✓" : "Copy Code"}</button><p>Show this code to the merchant to request your savings.</p></div>}</aside>
        </div>
        <section className="terms-card"><div className="section-kicker">♢ THE FINE PRINT</div><h2>Deal Terms</h2><ul>{coupon.terms.map((term) => <li key={term}>◆ {term}</li>)}</ul><p className="terms-warning">Sample offers are being used while the Coupon Queen marketplace is being built. Final merchant terms should be confirmed before launch.</p></section>
      </section>
      <footer className="site-footer"><Link href="/" className="footer-brand"><span>♕</span>COUPON QUEEN</Link><div className="footer-tagline">The Crown Jewel of Savings</div><div className="footer-sparkles">✦ ✧ ✦</div></footer>
      <style jsx>{`
        .coupon-detail-section{max-width:1120px;margin:0 auto;padding:35px 28px 90px}.back-link{display:inline-flex;margin-bottom:25px;color:var(--queen-turquoise-dark);font-weight:800;font-size:13px}.coupon-detail-layout{display:grid;grid-template-columns:1.15fr .85fr;gap:24px}.coupon-hero-card{position:relative;overflow:hidden;padding:42px;border:1px solid rgba(214,173,69,.48);border-radius:30px;background:radial-gradient(circle at 85% 15%,rgba(32,199,201,.18),transparent 28%),linear-gradient(145deg,#3f251c,#24140f);color:white;box-shadow:0 28px 65px rgba(53,32,24,.22)}.coupon-hero-top{display:flex;justify-content:space-between;gap:15px;font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.detail-category{color:var(--queen-turquoise)}.detail-location{color:rgba(255,255,255,.7)}.detail-crown{margin-top:48px;color:var(--queen-gold-light);font-size:55px}.detail-discount{margin-top:5px;color:var(--queen-gold-light);font-size:clamp(45px,7vw,75px);font-weight:950;line-height:1;letter-spacing:-.06em}.coupon-hero-card h1{margin:20px 0 8px;font-size:clamp(30px,4vw,48px);line-height:1.03}.detail-business{margin:0;color:var(--queen-turquoise);font-weight:900}.detail-description{max-width:600px;margin-top:22px;color:rgba(255,255,255,.72);line-height:1.75}.detail-divider{height:1px;margin:30px 0 20px;background:rgba(255,255,255,.15)}.detail-expiry{color:rgba(255,255,255,.78);font-size:12px;font-weight:800}.redemption-card{padding:38px;border:1px solid var(--queen-border);border-radius:30px;background:white;box-shadow:0 18px 50px rgba(53,32,24,.1)}.redemption-card h2{margin:13px 0 12px;color:var(--queen-espresso);font-size:32px}.redemption-card>p{color:var(--queen-muted);line-height:1.7;font-size:14px}.redeem-button{width:100%;margin-top:22px}.redemption-note{text-align:center;font-size:11px!important}.redeemed-state{text-align:center}.redeemed-check{display:grid;place-items:center;width:58px;height:58px;margin:0 auto 18px;border-radius:50%;background:rgba(32,199,201,.12);color:var(--queen-turquoise-dark);font-size:30px;font-weight:900}.redemption-code{padding:17px 12px;border:1px dashed var(--queen-gold);border-radius:14px;background:var(--queen-cream);color:var(--queen-espresso);font-size:20px;font-weight:950;letter-spacing:.12em}.copy-code{margin-top:12px;padding:10px 18px;border:1px solid var(--queen-border);border-radius:12px;background:white;color:var(--queen-espresso);font-weight:800}.redeemed-state p{color:var(--queen-muted);font-size:13px;line-height:1.6}.terms-card{margin-top:25px;padding:32px;border:1px solid var(--queen-border);border-radius:24px;background:rgba(255,255,255,.78)}.terms-card h2{margin:9px 0 15px;color:var(--queen-espresso);font-size:25px}.terms-card ul{display:grid;gap:10px;margin:0;padding:0;list-style:none;color:var(--queen-muted);font-size:13px}.terms-warning{margin:20px 0 0;padding-top:17px;border-top:1px solid var(--queen-border);color:var(--queen-muted);font-size:11px;line-height:1.6}.coupon-not-found{max-width:650px;margin:60px auto;padding:50px 30px;text-align:center;border:1px solid var(--queen-border);border-radius:28px;background:white}.coupon-not-found h1{color:var(--queen-espresso);font-size:clamp(30px,5vw,48px)}.coupon-not-found p{color:var(--queen-muted);line-height:1.7}.coupon-not-found .queen-button{margin-top:18px}@media(max-width:850px){.coupon-detail-section{padding:25px 20px 70px}.coupon-detail-layout{grid-template-columns:1fr}.coupon-hero-card,.redemption-card{padding:30px}}@media(max-width:560px){.coupon-hero-top{flex-direction:column}.detail-crown{margin-top:30px}.redemption-card{padding:25px}.redemption-code{font-size:16px}}
      `}</style>
    </main>
  );
}
