"use client";

import { useEffect } from "react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep the production error boundary intentionally quiet; details stay out of the public UI.
  }, []);

  return (
    <main className="queen-page min-h-screen flex items-center justify-center px-6">
      <section className="max-w-2xl w-full text-center py-20">
        <div className="royal-badge mx-auto mb-6 inline-flex">
          <span>♛</span>
          <span>ROYAL RECOVERY</span>
          <span>♛</span>
        </div>
        <div className="text-6xl mb-6" aria-hidden="true">♢</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">A quick royal reset is needed.</h1>
        <p className="mt-5 text-lg opacity-75">
          Something unexpected happened. Your account and saved deals are not displayed here while we recover the page.
        </p>
        <button type="button" onClick={() => reset()} className="queen-button primary-button mt-9">
          Try Again <span>↻</span>
        </button>
      </section>
    </main>
  );
}
