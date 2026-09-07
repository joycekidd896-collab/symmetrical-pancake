export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Local Deals • Coupons • Savings
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Joyce&apos;s Elite Coupons
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-600">
              Discover local deals, save money, and find great offers from
              businesses in your community.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-700"
              >
                Browse Coupons
              </button>

              <button
                type="button"
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                For Local Businesses
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Local Deals
            </h2>
            <p className="mt-3 text-gray-600">
              Find savings and special offers from businesses near you.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Easy Savings
            </h2>
            <p className="mt-3 text-gray-600">
              Browse coupons and discover ways to save on everyday purchases.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Local Businesses
            </h2>
            <p className="mt-3 text-gray-600">
              A place for local merchants to share deals with their community.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
