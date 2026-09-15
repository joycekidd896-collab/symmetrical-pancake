"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const api = (table: string) => `${URL}/rest/v1/${table}`;

type Plan = { name: string };
type Subscription = { status: string; current_period_end: string | null; merchant_plans?: Plan | Plan[] | null };

export default function MerchantWelcomePage() {
  const [status, setStatus] = useState<"checking" | "confirmed" | "waiting" | "error">("checking");
  const [plan, setPlan] = useState("Merchant Membership");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!URL || !KEY) throw new Error("Merchant services are not configured.");
        const token = localStorage.getItem("cq_access_token");
        if (!token) {
          window.location.replace("/businesses/login?next=/businesses/dashboard/welcome");
          return;
        }
        const headers = { apikey: KEY, Authorization: `Bearer ${token}` };
        const userRes = await fetch(`${URL}/auth/v1/user`, { headers, cache: "no-store" });
        if (!userRes.ok) throw new Error("Your merchant session has expired. Please sign in again.");
        const user = await userRes.json();
        const merchantRes = await fetch(`${api("merchants")}?owner_user_id=eq.${encodeURIComponent(user.id)}&select=id,business_name&limit=1`, { headers, cache: "no-store" });
        if (!merchantRes.ok) throw new Error("Could not load your merchant account.");
        const merchants = await merchantRes.json();
        const merchant = merchants[0];
        if (!merchant) throw new Error("Complete merchant setup before activating membership.");

        let live: Subscription | null = null;
        for (let attempt = 0; attempt < 10 && !cancelled && !live; attempt += 1) {
          if (attempt > 0) await new Promise((resolve) => setTimeout(resolve, 1500));
          const subRes = await fetch(`${api("subscriptions")}?merchant_id=eq.${encodeURIComponent(merchant.id)}&status=in.(trialing,active)&select=status,current_period_end,merchant_plans(name)&order=created_at.desc&limit=1`, { headers, cache: "no-store" });
          if (!subRes.ok) continue;
          const rows = await subRes.json() as Subscription[];
          live = rows[0] || null;
        }

        if (cancelled) return;
        if (live) {
          const selected = Array.isArray(live.merchant_plans) ? live.merchant_plans[0] : live.merchant_plans;
          setPlan(selected?.name || "Merchant Membership");
          setStatus("confirmed");
        } else {
          setStatus("waiting");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not confirm your membership.");
          setStatus("error");
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="queen-page">
      <section className="welcome-shell">
        <div className="crown">♕</div>
        <div className="section-kicker">✦ WELCOME TO THE BUSINESS KINGDOM ✦</div>
        {status === "confirmed" ? <>
          <h1>Your Membership Is Active.</h1>
          <p className="lead">Your <strong>{plan}</strong> membership is confirmed. Your Coupon Queen merchant account is ready for its first royal offer.</p>
          <div className="steps">
            <div><span>✓</span><strong>Membership active</strong><small>Your secure Stripe billing is connected.</small></div>
            <div><span>2</span><strong>Create your first coupon</strong><small>Publish an offer customers can claim.</small></div>
            <div><span>3</span><strong>Grow your redemption history</strong><small>Customers present their claims and your team verifies them.</small></div>
          </div>
          <div className="actions"><Link href="/businesses/dashboard/create" className="queen-button primary">Create First Coupon →</Link><Link href="/businesses/dashboard" className="secondary">Open Merchant Kingdom</Link></div>
        </> : status === "waiting" ? <>
          <h1>Payment Received — Finishing Setup.</h1>
          <p className="lead">Stripe sent you back successfully. Coupon Queen is waiting for the secure subscription confirmation to finish syncing.</p>
          <div className="waiting"><strong>Almost there.</strong><span>Refresh the page in a moment if this screen remains open.</span></div>
          <div className="actions"><Link href="/businesses/dashboard" className="queen-button primary">Open Merchant Dashboard →</Link><Link href="/businesses/pricing" className="secondary">View Plans</Link></div>
        </> : status === "error" ? <>
          <h1>We Need One More Step.</h1>
          <p className="lead">{error}</p>
          <div className="actions"><Link href="/businesses/dashboard" className="queen-button primary">Open Merchant Dashboard →</Link><Link href="/businesses/login" className="secondary">Merchant Sign In</Link></div>
        </> : <>
          <h1>Confirming Your Membership…</h1>
          <p className="lead">We’re securely checking the subscription confirmation from Stripe.</p>
          <div className="spinner" aria-label="Checking membership" />
        </>}
      </section>
      <style jsx>{`
        .welcome-shell{max-width:760px;margin:0 auto;padding:85px 24px 110px;text-align:center}.crown{color:var(--queen-gold);font-size:72px;line-height:1}.welcome-shell h1{margin:14px 0;color:var(--queen-espresso);font-size:clamp(42px,7vw,68px);line-height:.98}.lead{max-width:650px;margin:18px auto 30px;color:var(--queen-muted);font-size:16px;line-height:1.8}.steps{display:grid;gap:12px;text-align:left;margin:28px auto;max-width:610px}.steps>div{display:grid;grid-template-columns:42px 1fr;column-gap:12px;padding:16px;border:1px solid var(--queen-border);border-radius:16px;background:white}.steps span{grid-row:span 2;display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:var(--queen-cream);color:var(--queen-espresso);font-weight:950}.steps strong{color:var(--queen-espresso)}.steps small{margin-top:3px;color:var(--queen-muted);line-height:1.5}.actions{display:flex;justify-content:center;align-items:center;gap:16px;flex-wrap:wrap;margin-top:25px}.queen-button{display:inline-block;border:0;border-radius:12px;text-decoration:none;font-weight:900;cursor:pointer}.primary{padding:14px 20px;background:var(--queen-espresso);color:white}.secondary{color:var(--queen-turquoise-dark);font-weight:900;text-decoration:none}.waiting{margin:28px auto;padding:20px;border:1px solid rgba(218,174,67,.35);border-radius:18px;background:var(--queen-cream);display:grid;gap:6px;color:var(--queen-espresso)}.waiting span{color:var(--queen-muted);font-size:13px}.spinner{width:44px;height:44px;margin:35px auto;border:4px solid var(--queen-border);border-top-color:var(--queen-turquoise-dark);border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </main>
  );
}
