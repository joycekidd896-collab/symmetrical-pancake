import Link from "next/link";

const benefits = [
  { icon: "👑", title: "Own Your Business Presence", text: "Create a merchant profile and give local shoppers a clear place to discover your brand and offers." },
  { icon: "💎", title: "Publish Deals in Minutes", text: "Create, edit, pause, and reactivate promotions from your private Business Kingdom dashboard." },
  { icon: "🎟️", title: "Turn Interest Into Visits", text: "Customers discover your live offers in the Deal Vault and receive a unique redemption code." },
];

const steps = [
  ["👑", "Create your account", "Sign up for the Business Kingdom and connect your merchant profile."],
  ["🎟️", "Publish an offer", "Choose your discount, category, location, expiration, and customer-facing description."],
  ["💎", "Verify at checkout", "Customers present their code and your team verifies it from the Redemption Vault."],
];

export default function BusinessesPage() {
  return (
    <main className="queen-page">
      <header className="site-header"><Link href="/" className="brand-wrap" aria-label="Coupon Queen home"><div className="brand-crown">♕</div><div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">The Crown Jewel of Savings</div></div></Link><nav aria-label="Main navigation"><Link href="/coupons">Coupons</Link><Link href="/businesses" aria-current="page">Businesses</Link></nav><div className="header-sparkle">✦</div></header>

      <section className="hero-section">
        <div className="hero-diamond diamond-one" aria-hidden="true">◆</div><div className="hero-diamond diamond-two" aria-hidden="true">✦</div><div className="hero-sparkle sparkle-one" aria-hidden="true">✧</div><div className="hero-sparkle sparkle-two" aria-hidden="true">✦</div>
        <div className="hero-content"><div className="royal-badge"><span>♛</span><span>THE BUSINESS KINGDOM</span><span>♛</span></div><h1>Put Your Business <span>in the Spotlight</span></h1><p className="hero-description">Reach customers who are actively looking for savings. Publish live offers, manage your promotions, and verify customer redemptions from one royal home.</p><div className="hero-actions"><Link href="/businesses/login" className="queen-button primary-button"><span>👑</span> Merchant Login <span className="button-arrow">→</span></Link><Link href="/businesses/login?mode=signup" className="queen-button secondary-button">Join the Kingdom <span className="button-arrow">→</span></Link></div><div className="savings-pointer"><span className="pointer-arrow">↘</span><span>Your live offers appear in the customer Deal Vault.</span></div></div>
        <div className="royal-card-preview"><div className="card-crown">♛</div><div className="card-label">BUSINESS SPOTLIGHT</div><div className="card-diamond">◇</div><div className="card-title">Your Business Here</div><div className="card-copy">Create an offer, attract local shoppers, and turn a deal into a visit.</div><div className="coupon-ribbon">JOIN THE KINGDOM</div></div>
      </section>

      <section className="benefits-section"><div className="section-heading"><div className="section-kicker">✦ WHY JOIN COUPON QUEEN? ✦</div><h2>A Marketplace Built for Both Sides</h2><p>Customers get simple savings. Merchants get practical tools to control their offers.</p></div><div className="benefit-grid">{benefits.map((benefit,index)=><article key={benefit.title} className={`benefit-card ${index===1?"featured-card":""}`}><div className="card-icon">{benefit.icon}</div><div className="card-number">{String(index+1).padStart(2,"0")}</div><h3>{benefit.title}</h3><p>{benefit.text}</p></article>)}</div></section>

      <section className="benefits-section" id="how-it-works"><div className="section-heading"><div className="section-kicker">♢ THE MERCHANT JOURNEY ♢</div><h2>From Sign-Up to Verified Savings</h2><p>A simple workflow designed around real customer and merchant actions.</p></div><div className="benefit-grid">{steps.map(([icon,title,text],index)=><article key={title} className="benefit-card"><div className="card-icon gold-icon">{icon}</div><div className="card-number">STEP {index+1}</div><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="royal-banner"><div className="banner-diamond">◆</div><div><div className="banner-kicker">READY TO GET STARTED?</div><h2>Claim your place in the Business Kingdom.</h2></div><Link href="/businesses/login?mode=signup" className="queen-button secondary-button">Create Merchant Account <span className="button-arrow">→</span></Link></section>
      <footer className="site-footer"><Link href="/" className="footer-brand"><span>♕</span>COUPON QUEEN</Link><div className="footer-tagline">The Crown Jewel of Savings</div><div className="footer-sparkles">✦ ✧ ✦</div></footer>
    </main>
  );
}
