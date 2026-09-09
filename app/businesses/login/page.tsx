"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function MerchantLoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [plan, setPlan] = useState<"starter" | "growth" | "">("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "signup") setMode("signup");
    const selected = params.get("plan");
    if (selected === "starter" || selected === "growth") {
      setPlan(selected);
      localStorage.setItem("cq_selected_plan", selected);
    } else {
      const saved = localStorage.getItem("cq_selected_plan");
      if (saved === "starter" || saved === "growth") setPlan(saved);
    }
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase is not configured for this site yet.");
      const endpoint = mode === "signup" ? "/auth/v1/signup" : "/auth/v1/token?grant_type=password";
      const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error_description || data.msg || data.message || "Authentication failed.");

      if (mode === "signup" && !data.access_token) {
        if (plan) localStorage.setItem("cq_selected_plan", plan);
        setMessage("Account created! Check your email if confirmation is required, then sign in to continue.");
        setMode("login");
        return;
      }

      if (!data.access_token) throw new Error("Sign-in succeeded without an access token. Please sign in again.");
      localStorage.setItem("cq_access_token", data.access_token);
      localStorage.setItem("cq_refresh_token", data.refresh_token || "");
      window.location.href = "/businesses/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setSaving(false);
    }
  };

  return <main className="queen-page"><header className="site-header"><Link href="/" className="brand-wrap" aria-label="Coupon Queen home"><div className="brand-crown">♕</div><div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">The Crown Jewel of Savings</div></div></Link><nav aria-label="Main navigation"><Link href="/coupons">Coupons</Link><Link href="/businesses">Businesses</Link></nav></header><section className="auth-shell"><div className="section-kicker">♛ THE BUSINESS KINGDOM</div><h1>{mode === "login" ? "Merchant Sign In" : "Join the Kingdom"}</h1><p>{plan ? `Your ${plan === "growth" ? "Royal Growth" : "Royal Starter"} plan is saved. Create or sign in to your merchant account first; billing is handled only after your business profile is ready.` : mode === "login" ? "Sign in to manage your private business offers and redemption activity." : "Create your merchant account and claim your business kingdom."}</p>{plan&&<div className="plan-badge">♛ {plan === "growth" ? "Royal Growth · $59/month" : "Royal Starter · $29/month"}</div>}{message&&<div className="success">✓ {message}</div>}{error&&<div className="error" role="alert">✕ {error}</div>}<form onSubmit={submit} className="auth-card"><label>Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@business.com" autoComplete="email" /></label><label>Password<input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete={mode === "login" ? "current-password" : "new-password"}/></label><button disabled={saving} className="queen-button primary-button" type="submit">{saving ? "Opening Kingdom..." : mode === "login" ? "Sign In →" : "Create Merchant Account →"}</button></form><button className="switch" type="button" onClick={()=>{setMode(mode === "login" ? "signup" : "login");setError("");setMessage("")}}>{mode === "login" ? "New merchant? Create an account" : "Already have an account? Sign in"}</button><Link href="/businesses/pricing" className="back">← View Merchant Plans</Link><Link href="/businesses" className="back">← Business Hub</Link></section><footer className="site-footer"><Link href="/" className="footer-brand"><span>♕</span>COUPON QUEEN</Link><div className="footer-tagline">The Crown Jewel of Savings</div></footer><style jsx>{`.auth-shell{max-width:620px;margin:0 auto;padding:70px 28px 110px;text-align:center}.auth-shell h1{margin:8px 0;color:var(--queen-espresso);font-size:clamp(38px,6vw,58px);line-height:1}.auth-shell>p{margin:14px auto 25px;max-width:520px;color:var(--queen-muted);line-height:1.7}.plan-badge{display:inline-block;margin:0 0 18px;padding:9px 13px;border-radius:999px;background:rgba(218,174,67,.14);color:var(--queen-espresso);font-size:11px;font-weight:950}.auth-card{display:grid;gap:18px;text-align:left;padding:30px;border:1px solid var(--queen-border);border-radius:24px;background:white;box-shadow:0 16px 45px rgba(53,32,24,.08)}.auth-card label{display:grid;gap:7px;color:var(--queen-espresso);font-size:12px;font-weight:850}.auth-card input{padding:14px;border:1px solid var(--queen-border);border-radius:12px;font:inherit;color:var(--queen-espresso)}.primary-button{padding:14px 20px;border:0;border-radius:12px;cursor:pointer;font-weight:900}.primary-button:disabled{opacity:.6}.switch{margin:18px 0 10px;border:0;background:none;color:var(--queen-turquoise-dark);font-weight:900;cursor:pointer}.back{display:block;color:var(--queen-muted);font-weight:800;margin-top:8px}.success,.error{margin-bottom:18px;padding:14px;border-radius:14px;font-weight:800}.success{background:rgba(32,199,201,.08);color:var(--queen-turquoise-dark)}.error{background:rgba(180,50,50,.06);color:#9b2c2c}@media(max-width:560px){.auth-shell{padding:45px 18px 80px}.auth-card{padding:22px}}`}</style></main>;
}
