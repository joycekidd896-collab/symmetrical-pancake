"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { type Coupon } from "../../lib/coupons";
import LiveOffers from "./LiveOffers";

const categories = ["All Deals", "Dining", "Shopping", "Beauty", "Services", "Online", "Other"];

export default function CouponsPage() {
  const [activeCategory, setActiveCategory] = useState("All Deals");
  const [query, setQuery] = useState("");
  const [liveOffers, setLiveOffers] = useState<Coupon[]>([]);
  const [sort, setSort] = useState("featured");
  const onLiveOffers = useCallback((offers: Coupon[]) => setLiveOffers(offers), []);

  const filteredCoupons = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = liveOffers.filter((c) =>
      (activeCategory === "All Deals" || c.category === activeCategory) &&
      (!q || `${c.title} ${c.business} ${c.category} ${c.location} ${c.description}`.toLowerCase().includes(q))
    );
    return [...filtered].sort((a, b) =>
      sort === "business" ? a.business.localeCompare(b.business) :
      sort === "discount" ? Number.parseFloat(b.discount.replace(/[^0-9.]/g, "")) - Number.parseFloat(a.discount.replace(/[^0-9.]/g, "")) :
      Number(b.featured) - Number(a.featured)
    );
  }, [activeCategory, query, liveOffers, sort]);

  const clearFilters = () => { setQuery(""); setActiveCategory("All Deals"); };

  return (
    <main className="queen-page">
      <LiveOffers onLoad={onLiveOffers} />
      <header className="site-header">
        <Link href="/" className="brand-wrap" aria-label="Coupon Queen home"><div className="brand-crown">♕</div><div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">The Crown Jewel of Savings</div></div></Link>
        <nav aria-label="Main navigation"><Link href="/coupons" aria-current="page">Coupons</Link><Link href="/businesses">Businesses</Link></nav>
        <div className="header-sparkle" aria-hidden="true">✦</div>
      </header>
      <section className="benefits-section">
        <div className="section-heading"><div className="section-kicker">♛ THE DEAL VAULT ♛</div><h1>Live Deals. Real Savings.</h1><p>Every offer shown here comes from the live Coupon Queen marketplace. No placeholder deals are displayed.</p></div>
        <div className="marketplace-strip"><span>● LIVE MARKETPLACE</span><span>✓ Merchant-managed offers</span><span>✓ Clear business &amp; location</span><span>✓ Secure redemption</span></div>
        <div className="coupon-toolbar">
          <label className="coupon-search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search live deals, businesses, categories..." aria-label="Search live coupons" /></label>
          <div className="coupon-filters" role="tablist">{categories.map((category) => <button key={category} type="button" role="tab" aria-selected={activeCategory === category} className={`filter-pill ${activeCategory === category ? "active" : ""}`} onClick={() => setActiveCategory(category)}>{category}</button>)}</div>
        </div>
        <div className="coupon-results-bar"><span><strong>{filteredCoupons.length}</strong> {filteredCoupons.length === 1 ? "live deal" : "live deals"} available</span><label className="sort-control">Sort <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort live deals"><option value="featured">Featured</option><option value="business">Business name</option><option value="discount">Discount</option></select></label>{(query || activeCategory !== "All Deals") && <button type="button" className="clear-filters" onClick={clearFilters}>Clear filters ×</button>}</div>
        {filteredCoupons.length > 0 ? <div className="benefit-grid">{filteredCoupons.map((coupon) => <article key={coupon.id} className={`benefit-card ${coupon.featured ? "featured-card" : ""}`}>
          <div className="card-icon gold-icon">🎟️</div><div className="card-number">{coupon.discount}</div><div className="coupon-category">{coupon.category}</div><h3>{coupon.title}</h3>
          <div className="business-name">♛ <Link href={coupon.business_id ? `/businesses/${coupon.business_id}` : "/businesses"}>{coupon.business}</Link></div>
          <p>{coupon.description}</p><div className="coupon-meta"><span>♢ {coupon.category}</span><span>📍 {coupon.location}</span></div><div className="location-note">Available at <strong>{coupon.business}</strong> · {coupon.location}</div><div className="coupon-expiry">♛ {coupon.expires}</div><Link href={`/coupons/${coupon.id}`} className="card-link">View Deal <span>→</span></Link>
        </article>)}</div> : <div className="empty-coupon-state"><div className="card-icon gold-icon">👑</div><div className="section-kicker">THE VAULT IS READY</div><h2>No live deals yet</h2><p>Coupon Queen is connected to the live merchant marketplace, but there are currently no active offers. When a merchant publishes an eligible offer, it will appear here automatically.</p>{(query || activeCategory !== "All Deals") && <button type="button" className="queen-button primary-button" onClick={clearFilters}>Show All Live Deals</button>}<Link href="/businesses/login?mode=signup" className="queen-button secondary-button">Become a Merchant →</Link></div>}
      </section>
      <section className="royal-banner"><div className="banner-diamond">◆</div><div><div className="banner-kicker">FOR LOCAL BUSINESSES</div><h2>Have a deal worth crowning?</h2></div><Link href="/businesses/login?mode=signup" className="queen-button secondary-button">Join the Kingdom <span className="button-arrow">→</span></Link></section>
      <footer className="site-footer"><Link href="/" className="footer-brand"><span>♕</span>COUPON QUEEN</Link><div className="footer-tagline">The Crown Jewel of Savings</div><div className="footer-sparkles">✦ ✧ ✦</div></footer>
      <style jsx>{`.marketplace-strip{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:0 auto 28px}.marketplace-strip span{padding:8px 12px;border:1px solid var(--queen-border);border-radius:999px;background:white;color:var(--queen-muted);font-size:12px;font-weight:800}.marketplace-strip span:first-child{color:var(--queen-turquoise-dark);border-color:rgba(32,199,201,.35)}.sort-control{display:flex;align-items:center;gap:8px;color:var(--queen-muted);font-size:12px;font-weight:800}.sort-control select{padding:8px 10px;border:1px solid var(--queen-border);border-radius:10px;background:white;color:var(--queen-espresso);font:inherit}.business-name{margin:4px 0 10px;color:var(--queen-espresso);font-weight:900;font-size:14px}.business-name a{color:var(--queen-turquoise-dark);text-decoration:none}.business-name a:hover{text-decoration:underline}.location-note{margin-top:10px;padding:9px 11px;border:1px solid var(--queen-border);border-radius:10px;background:rgba(32,199,201,.06);color:var(--queen-muted);font-size:12px;line-height:1.45}.empty-coupon-state{max-width:720px;margin:24px auto 0;padding:42px 28px;text-align:center;border:1px solid var(--queen-border);border-radius:28px;background:rgba(255,255,255,.86);box-shadow:0 18px 50px rgba(53,32,24,.08)}.empty-coupon-state h2{color:var(--queen-espresso);font-size:clamp(30px,5vw,44px);margin:10px 0}.empty-coupon-state p{max-width:600px;margin:0 auto 22px;color:var(--queen-muted);line-height:1.7}.empty-coupon-state .queen-button{margin:6px}.card-link{display:inline-flex;align-items:center;gap:8px;margin-top:16px;font-weight:900;color:var(--queen-turquoise-dark);text-decoration:none}.card-link:hover{text-decoration:underline}@media(max-width:620px){.marketplace-strip{justify-content:flex-start}.coupon-results-bar{gap:12px;align-items:flex-start;flex-wrap:wrap}.empty-coupon-state{padding:32px 20px}}`}</style>
    </main>
  );
}
