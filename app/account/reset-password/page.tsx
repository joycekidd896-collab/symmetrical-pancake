"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hash.get("access_token");
    const hashError = hash.get("error_description");
    if (hashError) setError(hashError.replace(/\+/g, " "));
    if (accessToken) {
      setToken(accessToken);
      setReady(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      setError("This password reset link is missing or expired. Request a new one.");
    }
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Coupon Queen account services are not configured yet.");
      if (!ready || !token) throw new Error("Your reset link is not ready. Request a new password reset email.");
      if (password.length < 6) throw new Error("Your new password must be at least 6 characters.");
      if (password !== confirm) throw new Error("The passwords do not match.");

      const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: "PUT",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.msg || data?.message || data?.error_description || "We could not update your password.");
      localStorage.setItem("cq_access_token", token);
      setMessage("Your password has been updated. You can now sign in with your new password.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not update your password.");
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
        <h1>Choose a New Password</h1>
        <p>Set a new password for your Coupon Queen account.</p>
        {error && <div className="error" role="alert">✕ {error}</div>}
        {message && <div className="success">✓ {message}</div>}
        <form onSubmit={submit} className="auth-card">
          <label>New password<input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></label>
          <label>Confirm new password<input required minLength={6} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" /></label>
          <button className="queen-button primary-button" disabled={busy || !ready} type="submit">{busy ? "Updating Password…" : "Update Password →"}</button>
        </form>
        <Link href="/account/login" className="back">← Back to Sign In</Link>
      </section>

      <style jsx>{`.auth-shell{max-width:620px;margin:0 auto;padding:70px 22px 110px;text-align:center}.auth-shell h1{margin:9px 0;color:var(--queen-espresso);font-size:clamp(38px,6vw,58px);line-height:1}.auth-shell>p{margin:14px auto 25px;color:var(--queen-muted);line-height:1.7}.auth-card{display:grid;gap:18px;text-align:left;padding:30px;border:1px solid var(--queen-border);border-radius:24px;background:#fff;box-shadow:0 16px 45px rgba(53,32,24,.08)}.auth-card label{display:grid;gap:7px;color:var(--queen-espresso);font-size:12px;font-weight:850}.auth-card input{padding:14px;border:1px solid var(--queen-border);border-radius:12px;color:var(--queen-espresso);font:inherit}.success,.error{margin-bottom:18px;padding:14px;border-radius:14px;font-weight:800}.success{background:rgba(32,199,201,.08);color:var(--queen-turquoise-dark)}.error{background:rgba(180,50,50,.06);color:#9b2c2c}.back{display:block;margin-top:18px;color:var(--queen-muted);font-weight:800}`}</style>
    </main>
  );
}
