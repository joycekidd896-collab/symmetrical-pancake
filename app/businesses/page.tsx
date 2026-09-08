import Link from "next/link";

const benefits = [
  {
    icon: "👑",
    title: "Put Your Business in the Spotlight",
    text: "Give local shoppers another reason to discover your business with special offers.",
  },
  {
    icon: "💎",
    title: "Make Your Offers Shine",
    text: "Present your promotions in a polished, easy-to-discover deal experience.",
  },
  {
    icon: "🎟️",
    title: "Reach Deal-Loving Customers",
    text: "Build a place where customers can come looking for savings and new favorites.",
  },
];

const steps = [
  "Create your business profile",
  "Add your special offers",
  "Let customers discover your deals",
];

export default function BusinessesPage() {
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

      <section className="hero-section">
        <div className="hero-diamond diamond-one" aria-hidden="true">
          ◆
        </div>
        <div className="hero-diamond diamond-two" aria-hidden="true">
          ✦
        </div>
        <div className="hero-sparkle sparkle-one" aria-hidden="true">
          ✧
        </div>
        <div className="hero-sparkle sparkle-two" aria-hidden="true">
          ✦
        </div>

        <div className="hero-content">
          <div className="royal-badge">
            <span>♛</span>
            <span>THE BUSINESS KINGDOM</span>
            <span>♛</span>
          </div>

          <h1>
            Give Your Business
            <span> the Crown</span>
          </h1>

          <p className="hero-description">
            Coupon Queen is building a beautiful destination where customers
            can discover businesses, offers, and savings worth talking about.
          </p>

          <div className="hero-actions">
            <Link href="/coupons" className="queen-button primary-button">
              <span>🎟️</span>
              Explore Coupons
              <span className="button-arrow">→</span>
            </Link>

            <a href="#how-it-works" className="queen-button secondary-button">
              How It Works
              <span className="button-arrow">↓</span>
            </a>
          </div>

          <div className="savings-pointer">
            <span className="pointer-arrow">↘</span>
            <span>Built for local businesses. Designed for discovery.</span>
          </div>
        </div>

        <div className="royal-card-preview">
          <div className="card-crown">♛</div>
          <div className="card-label">BUSINESS SPOTLIGHT</div>
          <div className="card-diamond">◇</div>
          <div className="card-title">Your Business Here</div>
          <div className="card-copy">
            A future home for your offers and customer discovery.
          </div>
          <div className="coupon-ribbon">JOIN THE KINGDOM</div>
        </div>
      </section>

      <section className="benefits-section">
        <div className="section-heading">
          <div className="section-kicker">✦ WHY JOIN COUPON QUEEN? ✦</div>
          <h2>Make Your Business Part of the Collection</h2>
          <p>
            A polished foundation for the future of local deals and merchant
            discovery.
          </p>
        </div>

        <div className="benefit-grid">
          {benefits.map((benefit, index) => (
            <article
              key={benefit.title}
              className={`benefit-card ${
                index === 1 ? "featured-card" : ""
              }`}
            >
              <div className="card-icon">{benefit.icon}</div>
              <div className="card-number">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="benefits-section" id="how-it-works">
        <div className="section-heading">
          <div className="section-kicker">♢ THE ROYAL ROADMAP ♢</div>
          <h2>Simple in Three Steps</h2>
          <p>
            The merchant experience will grow here as Coupon Queen evolves.
          </p>
        </div>

        <div className="benefit-grid">
          {steps.map((step, index) => (
            <article key={step} className="benefit-card">
              <div className="card-icon gold-icon">
                {index === 0 ? "👑" : index === 1 ? "🎟️" : "💎"}
              </div>
              <div className="card-number">
                STEP {index + 1}
              </div>
              <h3>{step}</h3>
              <p>
                This is part of the planned Coupon Queen merchant experience.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="royal-banner">
        <div className="banner-diamond" aria-hidden="true">
          ◆
        </div>

        <div>
          <div className="banner-kicker">THE NEXT CHAPTER</div>
          <h2>Your business could be the next deal worth crowning.</h2>
        </div>

        <Link href="/coupons" className="queen-button secondary-button">
          See the Deal Vault <span className="button-arrow">→</span>
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
