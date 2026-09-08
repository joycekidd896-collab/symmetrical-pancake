import Link from "next/link";

type Coupon = {
  id: string;
  discount: string;
  title: string;
  business: string;
  category: string;
  location: string;
  description: string;
  expires: string;
  featured?: boolean;
};

const coupons: Coupon[] = [
  {
    id: "queen-01",
    discount: "20% OFF",
    title: "Sample Savings Offer",
    business: "Local Boutique",
    category: "Shopping",
    location: "Local",
    description: "A beautiful starter offer for the Coupon Queen Deal Vault.",
    expires: "Sample offer",
    featured: true,
  },
  {
    id: "queen-02",
    discount: "$10 OFF",
    title: "Sample Dining Deal",
    business: "Local Restaurant",
    category: "Dining",
    location: "Local",
    description: "Show how a restaurant special can look inside your deal collection.",
    expires: "Sample offer",
  },
  {
    id: "queen-03",
    discount: "15% OFF",
    title: "Sample Beauty Savings",
    business: "Local Beauty Shop",
    category: "Beauty",
    location: "Local",
    description: "A polished example of a beauty offer ready for future merchants.",
    expires: "Sample offer",
  },
  {
    id: "queen-04",
    discount: "25% OFF",
    title: "Sample Online Deal",
    business: "Online Store",
    category: "Online",
    location: "Online",
    description: "A sample nationwide-style online offer for the future Deal Vault.",
    expires: "Sample offer",
  },
];

const categories = ["All Deals", "Dining", "Shopping", "Beauty", "Online"];

export default function CouponsPage() {
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
        </nav>

        <div className="header-sparkle" aria-hidden="true">
          ✦
        </div>
      </header>

      <section className="benefits-section">
        <div className="section-heading">
          <div className="section-kicker">♛ THE DEAL VAULT ♛</div>
          <h1>Coupons Worth Crowning</h1>
          <p>
            Discover savings, explore offers, and find your next favorite
            deal.
          </p>
        </div>

        <div className="benefit-grid">
          {categories.map((category, index) => (
            <div
              key={category}
              className={`benefit-card ${
                index === 0 ? "featured-card" : ""
              }`}
            >
              <div className="card-icon">
                {index === 0 ? "💎" : index === 1 ? "🍽️" : index === 2 ? "🛍️" : index === 3 ? "✨" : "🌎"}
              </div>
              <h2>{category}</h2>
              <p>
                {category === "All Deals"
                  ? "Browse the full royal collection."
                  : `Explore ${category.toLowerCase()} savings.`}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="benefits-section">
        <div className="section-heading">
          <div className="section-kicker">✦ FEATURED SAVINGS ✦</div>
          <h2>Today's Royal Collection</h2>
          <p>
            Sample offers below show the future Coupon Queen experience.
          </p>
        </div>

        <div className="benefit-grid">
          {coupons.map((coupon) => (
            <article
              key={coupon.id}
              className={`benefit-card ${
                coupon.featured ? "featured-card" : ""
              }`}
            >
              <div className="card-icon gold-icon">🎟️</div>

              <div className="card-number">{coupon.discount}</div>

              <h3>{coupon.title}</h3>

              <p>
                <strong>{coupon.business}</strong>
                <br />
                {coupon.description}
              </p>

              <div className="coupon-meta">
                <span>♢ {coupon.category}</span>
                <span>📍 {coupon.location}</span>
              </div>

              <div className="coupon-expiry">
                {coupon.expires}
              </div>

              <Link href="/businesses" className="card-link">
                View Deal <span>→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="royal-banner">
        <div className="banner-diamond" aria-hidden="true">
          ◆
        </div>

        <div>
          <div className="banner-kicker">FOR LOCAL BUSINESSES</div>
          <h2>Have a deal worthy of the crown?</h2>
        </div>

        <Link href="/businesses" className="queen-button secondary-button">
          Join the Kingdom <span className="button-arrow">→</span>
        </Link>
      </section>

      <footer className="site-footer">
        <Link href="/" className="footer-brand">
          <span>♕</span>
          COUPON QUEEN
        </Link>
        <div className="footer-tagline">The Crown Jewel of Savings</div>
        <div className="footer-sparkles">✦ ✧ ✦</div>
      </footer>
    </main>
  );
    }
