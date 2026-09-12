"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function CustomerLoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function getSafeDestination() {
    const next = new URLSearchParams(window.location.search).get("next") || "";
    return next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Coupon Queen account services are not configured yet.");
      const endpoint = mode === "login" ? "/auth/v1/token?grant_type=password" : "/auth/v1/signup";
      const payload = mode === "login" ? { email, password } : { email, password, data: { full_name: name } };
      const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
        method: "POST", headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.msg || data?.message || data?.error_description || "We could not complete that request.");
      const destination = getSafeDestination();
      if (mode === "signup") {
        if (data?.access_token) {
          localStorage.setItem("cq_access_token", data.access_token);
          if (data.refresh_token) localStorage.setItem("cq_refresh_token", data.refresh_token);
          window.location.href = destination;
        } else {
          setMessage("Your account was created. Check your email if confirmation is required, then sign in.");
          setMode("login");
        }
      } else {
        localStorage.setItem("cq_access_token", data.access_token);
        if (data.refresh_token) localStorage.setItem("cq_refresh_token", data.refresh_token);
        window.location.href = destination;
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  return <main className="queen-page"><header className="site-header"><Link href="/" className="brand-wrap"><div className="brand-crown">♕</div><div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">The Crown Jewel of Savings</div></div></Link><nav><Link href="/coupons">Coupons</Link><Link href="/businesses">Businesses</Link></nav></header><section style={{maxWidth:520,margin:"0 auto",padding:"60px 22px 100px"}}><div className="account-card"><div className="section-kicker">♕ THE QUEEN'S CLUB ♕</div><h1>{mode === "login" ? "Welcome Back" : "Join the Deal Vault"}</h1><p className="account-intro">{mode === "login" ? "Sign in to save deals, claim offers, and keep your savings history in one place." : "Create your free Coupon Queen account and start building your personal savings vault."}</p><form onSubmit={submit} style={{display:"grid",gap:14}}>{mode === "signup" && <input className="account-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" required />}{<input className="account-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" autoComplete="email" required />}<input className="account-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} required /><button className="queen-button primary-button" disabled={busy}>{busy ? "Opening Your Vault…" : mode === "login" ? "Sign In →" : "Create My Account →"}</button></form>{error&&<p className="account-error">{error}</p>}{message&&<p className="account-message">{message}</p>}<button className="account-switch" onClick={()=>{setMode(mode === "login" ? "signup" : "login");setError("");setMessage("")}}>{mode === "login" ? "New to Coupon Queen? Create an account" : "Already have an account? Sign in"}</button></div></section><style jsx>{`.account-card{padding:42px;border:1px solid var(--queen-border);border-radius:30px;background:rgba(255,255,255,.94);box-shadow:0 25px 70px rgba(53,32,24,.12)}.account-card h1{margin:10px 0;color:var(--queen-espresso);font-size:clamp(34px,7vw,50px);line-height:1}.account-intro{color:var(--queen-muted);line-height:1.7;margin:0 0 25px}.account-input{width:100%;box-sizing:border-box;padding:14px 16px;border:1px solid var(--queen-border);border-radius:13px;background:#fff;color:var(--queen-espresso);font:inherit;outline:none}.account-input:focus{border-color:var(--queen-turquoise-dark);box-shadow:0 0 0 3px rgba(32,199,201,.12)}.account-error{margin:14px 0 0;color:#9b2c2c;font-weight:800;font-size:13px}.account-message{margin:14px 0 0;color:var(--queen-turquoise-dark);font-weight:800;font-size:13px}.account-switch{display:block;margin:18px auto 0;border:0;background:none;color:var(--queen-turquoise-dark);font-weight:850;cursor:pointer}`}</style></main>;
}
