export default function HomePage() {
  return (
    <main className="queen-page">
      <header className="site-header">
        <div className="brand-wrap">
          <div className="brand-crown">♕</div>
          <div>
            <div className="brand-name">COUPON QUEEN</div>
            <div className="brand-tagline">The Crown Jewel of Savings</div>
          </div>
        </div>

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
            <span>YOUR SAVINGS ROYALTY</span>
            <span>♛</span>
          </div>

          <h1>
            Find Deals Worth
            <span> Crowning</span>
          </h1>

          <p className="hero-description">
            Discover beautiful savings, local deals, and money-saving coupons
            all in one royal destination.
          </p>

          <div className="hero-actions">
            <button type="button" className="queen-button primary-button">
              <span>🎟️</span>
              Browse Coupons
              <span className="button-arrow">→</span>
            </button>

            <button type="button" className="queen-button secondary-button">
              For Local Businesses
              <span className="button-arrow">→</span>
            </button>
          </div>

          <div className="savings-pointer">
            <span className="pointer-arrow">↘</span>
            <span>Fresh deals. Real savings. Every day.</span>
          </div>
        </div>

        <div className="royal-card-preview">
          <div className="card-crown">♛</div>
          <div className="card-label">FEATURED SAVINGS</div>
          <div className="card-diamond">◇</div>
          <div className="card-title">Your Next Great Deal</div>
          <div className="card-copy">
            Save more. Shop smarter.
          </div>
          <div className="coupon-ribbon">COUPON</div>
        </div>
      </section>

      <section className="benefits-section">
        <div className="section-heading">
          <div className="section-kicker">THE QUEEN'S COLLECTION</div>
          <h2>Everything You Need to Save in Style</h2>
          <p>
            Your favorite deals, local savings, and business offers —
            beautifully brought together.
          </p>
        </div>

        <div className="benefit-grid">
          <article className="benefit-card">
            <div className="card-icon turquoise-icon">💎</div>
            <div className="card-number">01</div>
            <h3>Local Deals</h3>
            <p>
              Discover valuable offers from businesses right in your
              community.
            </p>
            <div className="card-link">
              Explore deals <span>→</span>
            </div>
          </article>

          <article className="benefit-card featured-card">
            <div className="card-icon gold-icon">🎟️</div>
            <div className="card-number">02</div>
            <h3>Easy Savings</h3>
            <p>
              Find coupons and special offers without the hassle of hunting
              everywhere.
            </p>
            <div className="card-link">
              Start saving <span>→</span>
            </div>
          </article>

          <article className="benefit-card">
            <div className="card-icon espresso-icon">👑</div>
            <div className="card-number">03</div>
            <h3>Local Businesses</h3>
            <p>
              Help great local businesses reach customers with offers worth
              sharing.
            </p>
            <div className="card-link">
              Join the kingdom <span>→</span>
            </div>
          </article>
        </div>
      </section>

      <section className="royal-banner">
        <div className="banner-diamond" aria-hidden="true">
          ◆
        </div>

        <div>
          <div className="banner-kicker">YOUR SAVINGS. YOUR KINGDOM.</div>
          <h2>Every Great Deal Deserves a Crown.</h2>
        </div>

        <div className="banner-crown" aria-hidden="true">
          ♕
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-brand">
          <span>♕</span>
          COUPON QUEEN
        </div>
        <div className="footer-tagline">The Crown Jewel of Savings</div>
        <div className="footer-sparkles">✦ ✧ ✦</div>
      </footer>
    </main>
  );
}