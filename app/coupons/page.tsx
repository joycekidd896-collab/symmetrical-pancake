"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { coupons } from "../../lib/coupons";

const categories = ["All Deals", "Dining", "Shopping", "Beauty", "Online"];

export default function CouponsPage() {
  const [activeCategory, setActiveCategory] = useState("All Deals");
  const [query, setQuery] = useState("");
  const filteredCoupons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return coupons.filter((coupon) => {
      const matchesCategory = activeCategory === "All Deals" || coupon.category === activeCategory;
      const matchesQuery = !normalizedQuery || `${coupon.title} ${coupon.business} ${coupon.category} ${coupon.location}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <main className="queen-page">
      <header className="site-header"><Link href="/" className="brand-wrap" aria-label="Coupon Queen home"><div className="brand-crown">♕</div><div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">The Crown Jewel of Savings</div></div></Link><nav aria-label="Main navigation"><Link href="/coupons" aria-current="page">Coupons</Link><Link href="/businesses">Businesses</Link></nav><div className="header-sparkle">✦</div></header>
      <section className="benefits-section"><div className="section-heading"><div className="section-kicker">♛ THE DEAL VAULT ♛</div><h1>Coupons Worth Crowning</h1><p>Search the royal collection, choose a category, and discover your next favorite deal.</p></div>
        <div className="coupon-toolbar"><label className="coupon-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search deals, businesses, or categories..." aria-label="Search coupons" /></label><div className="coupon-filters" role="tablist">{categories.map((category) => <button key={category} type="button" role="tab" aria-selected={activeCategory === category} className={`filter-pill ${activeCategory === category ? "active" : ""}`} onClick={() => setActiveCategory(category)}>{category}</button>)}</div></div>
        <div className="coupon-results-bar"><span><strong>{filteredCoupons.length}</strong> royal {filteredCoupons.length === 1 ? "deal" : "deals"} found</span>{(query || activeCategory !== "All Deals") && <button type="button" className="clear-filters" onClick={() => { setQuery(""); setActiveCategory("All Deals"); }}>Clear filters ×</button>}</div>
        <div className="benefit-grid">{filteredCoupons.map((coupon) => <article key={coupon.id} className={`benefit-card ${coupon.featured ? "featured-card" : ""}`}><div className="card-icon gold-icon">🎟️</div><div className="card-number">{coupon.discount}</div><div className="coupon-category">{coupon.category}</div><h3>{coupon.title}</h3><p><strong>{coupon.business}</strong><br />{coupon.description}</p><div className="coupon-meta"><span>♢ {coupon.category}</span><span>📍 {coupon.location}</span></div><div className="coupon-expiry">♛ {coupon.expires}</div><Link href={`/coupons/${coupon.id}`} className="card-link">View Deal <span>→</span></Link></article>)}</div>
        {filteredCoupons.length === 0 && <div className="empty-coupon-state"><div className="card-icon gold-icon">👑</div><h2>No deals found</h2><p>Try another search or return to the full royal collection.</p><button type="button" className="queen-button primary-button" onClick={() => { setQuery(""); setActiveCategory("All Deals"); }}>Show All Deals</button></div>}
      </section>
      <section className="royal-banner"><div className="banner-diamond">◆</div><div><div className="banner-kicker">FOR LOCAL BUSINESSES</div><h2>Have a deal worthy of the crown?</h2></div><Link href="/businesses" className="queen-button secondary-button">Join the Kingdom <span className="button-arrow">→</span></Link></section>
      <footer className="site-footer"><Link href="/" className="footer-brand"><span>♕</span>COUPON QUEEN</Link><div className="footer-tagline">The Crown Jewel of Savings</div><div className="footer-sparkles">✦ ✧ ✦</div></footer>
    </main>
  );
}
