"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Coupon Queen account services are not configured yet.");
      if (!email.trim()) throw new Error("Enter your email address first.");

      const redirectTo = new URL("/account/reset-password", window.location.origin).toString();
      const response = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), gotrue_meta_security: {}, options: { redirectTo } }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error_description || data?.msg || data?.message || "We could not send the password reset email.");
      setMessage("Password reset instructions have been requested. Check your inbox and spam folder.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not send the password reset email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="queen-page">
      <header className="site-header">
        <Link href="/" className="brand-wrap" aria-label="Coupon Queen home">
          <div className="brand-crown">♕</div>
          <div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">The Crown Jewel of Savings</div></div>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/coupons">Coupons</Link><Link href="/businesses">Businesses</Link><Link href="/account/login">Sign In</Link>
        </nav>
      </header>

      <section className="auth-shell">
        <div className="section-kicker">♕ THE QUEEN'S CLUB</div>
        <h1>Reset Your Password</h1>
        <p>Enter the email connected to your Coupon Queen account and we’ll send you a secure reset link.</p>
        {error && <div className="error" role="alert">✕ {error}</div>}
        {message && <div className="success">✓ {message}</div>}
        <form onSubmit={submit} className="auth-card">
          <label>Email address<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
          <button className="queen-button primary-button" disabled={busy} type="submit">{busy ? "Sending Reset Link…" : "Send Reset Link →"}</button>
        </form>
        <Link href="/account/login" className="back">← Back to Sign In</Link>
      </section>

      <style jsx>{`.auth-shell{max-width:620px;margin:0 auto;padding:70px 22px 110px;text-align:center}.auth-shell h1{margin:9px 0;color:var(--queen-espresso);font-size:clamp(38px,6vw,58px);line-height:1}.auth-shell>p{max-width:520px;margin:14px auto 25px;color:var(--queen-muted);line-height:1.7}.auth-card{display:grid;gap:18px;text-align:left;padding:30px;border:1px solid var(--queen-border);border-radius:24px;background:#fff;box-shadow:0 16px 45px rgba(53,32,24,.08)}.auth-card label{display:grid;gap:7px;color:var(--queen-espresso);font-size:12px;font-weight:850}.auth-card input{padding:14px;border:1px solid var(--queen-border);border-radius:12px;color:var(--queen-espresso);font:inherit}.success,.error{margin-bottom:18px;padding:14px;border-radius:14px;font-weight:800}.success{background:rgba(32,199,201,.08);color:var(--queen-turquoise-dark)}.error{background:rgba(180,50,50,.06);color:#9b2c2c}.back{display:block;margin-top:18px;color:var(--queen-muted);font-weight:800}`}</style>
    </main>
  );
}
