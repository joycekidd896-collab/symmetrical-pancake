import Link from "next/link";

export default function NotFound() {
  return (
    <main className="queen-page min-h-screen flex items-center justify-center px-6">
      <section className="max-w-2xl w-full text-center py-20">
        <div className="royal-badge mx-auto mb-6 inline-flex">
          <span>♛</span>
          <span>ROYAL DETOUR</span>
          <span>♛</span>
        </div>
        <div className="text-7xl mb-6" aria-hidden="true">◇</div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">That deal has left the kingdom.</h1>
        <p className="mt-5 text-lg opacity-75">
          The page you requested could not be found. Let&apos;s get you back to the Crown Jewel of Savings.
        </p>
        <div className="mt-9 flex flex-wrap gap-4 justify-center">
          <Link href="/" className="queen-button primary-button">Return Home <span>→</span></Link>
          <Link href="/coupons" className="queen-button secondary-button">Browse Coupons <span>→</span></Link>
        </div>
      </section>
    </main>
  );
}
