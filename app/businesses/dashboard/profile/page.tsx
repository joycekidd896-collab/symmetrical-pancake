"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type Merchant = {
  id: string;
  business_name: string | null;
  city: string | null;
  state: string | null;
  description: string | null;
  phone: string | null;
  website: string | null;
  address_line1: string | null;
  postal_code: string | null;
  is_approved: boolean;
  is_active: boolean;
};

export default function MerchantProfileSettingsPage() {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("cq_access_token");
        if (!token) {
          window.location.replace("/businesses/login?next=/businesses/dashboard/profile");
          return;
        }
        if (!URL || !KEY) throw new Error("Merchant profile services are not configured.");
        const headers = { apikey: KEY, Authorization: `Bearer ${token}` };
        const auth = await fetch(`${URL}/auth/v1/user`, { headers, cache: "no-store" });
        if (!auth.ok) {
          window.location.replace("/businesses/login?next=/businesses/dashboard/profile");
          return;
        }
        const user = await auth.json();
        const response = await fetch(
          `${URL}/rest/v1/merchants?owner_user_id=eq.${encodeURIComponent(user.id)}&select=id,business_name,city,state,description,phone,website,address_line1,postal_code,is_approved,is_active&limit=1`,
          { headers, cache: "no-store" },
        );
        if (!response.ok) throw new Error("Could not load your merchant profile.");
        const row = (await response.json())[0] as Merchant | undefined;
        if (!row) throw new Error("Create your merchant profile before editing public details.");
        setMerchant(row);
        setName(row.business_name || "");
        setDescription(row.description || "");
        setPhone(row.phone || "");
        setWebsite(row.website || "");
        setAddress(row.address_line1 || "");
        setPostalCode(row.postal_code || "");
        setCity(row.city || "");
        setState(row.state || "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load your merchant profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const completeness = [name, description, phone, website, address, postalCode, city, state].filter((value) => value.trim()).length;

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const token = localStorage.getItem("cq_access_token");
      if (!token) throw new Error("Your merchant session has expired. Please sign in again.");
      if (!URL || !KEY || !merchant) throw new Error("Merchant profile services are not configured.");
      if (!name.trim()) throw new Error("Business name is required.");
      const response = await fetch(`${URL}/rest/v1/merchants?id=eq.${encodeURIComponent(merchant.id)}`, {
        method: "PATCH",
        headers: { apikey: KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          business_name: name.trim(),
          description: description.trim() || null,
          phone: phone.trim() || null,
          website: website.trim() || null,
          address_line1: address.trim() || null,
          postal_code: postalCode.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
        }),
      });
      if (!response.ok) throw new Error("Could not save your merchant profile. Please check the details and try again.");
      setMessage("Your public business profile details have been saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="queen-page">
      <header className="site-header">
        <Link href="/businesses/dashboard" className="brand-wrap" aria-label="Merchant dashboard">
          <div className="brand-crown">♕</div>
          <div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">Merchant Kingdom</div></div>
        </Link>
        <nav aria-label="Merchant navigation">
          <Link href="/businesses/dashboard">Dashboard</Link>
          <Link href="/businesses/dashboard/getting-started">Getting Started</Link>
          <Link href="/businesses/dashboard/notifications">Notifications</Link>
        </nav>
      </header>

      <section className="shell">
        <div className="kicker">♛ PUBLIC BUSINESS PROFILE</div>
        <h1>Complete Your Storefront</h1>
        <p className="intro">Give shoppers the information they need to recognize, contact, and visit your business.</p>

        {loading ? <div className="card">Loading your storefront details…</div> : (
          <>
            <div className="progress-card"><strong>{completeness}/8 profile details filled</strong><span>Approved merchants can use these details on their public business page.</span><div className="progress"><i style={{ width: `${(completeness / 8) * 100}%` }} /></div></div>
            {error && <div className="error" role="alert">✕ {error}</div>}
            {message && <div className="success" role="status">✓ {message}</div>}
            <form className="card form" onSubmit={save}>
              <label>Business name<input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="organization" /></label>
              <label>Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Tell shoppers what your business does and what makes it special." /></label>
              <div className="two">
                <label>Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" placeholder="(555) 555-5555" /></label>
                <label>Website<input value={website} onChange={(e) => setWebsite(e.target.value)} type="url" autoComplete="url" placeholder="https://yourbusiness.com" /></label>
              </div>
              <label>Street address<input value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" /></label>
              <div className="three">
                <label>City<input value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" /></label>
                <label>State<input value={state} onChange={(e) => setState(e.target.value)} autoComplete="address-level1" /></label>
                <label>ZIP code<input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} autoComplete="postal-code" inputMode="numeric" /></label>
              </div>
              <div className="status"><strong>Account:</strong> {merchant?.is_active ? "Active" : "Inactive"} · <strong>Approval:</strong> {merchant?.is_approved ? "Approved" : "Pending review"}</div>
              <button className="primary" disabled={saving} type="submit">{saving ? "Saving Storefront…" : "Save Public Profile →"}</button>
            </form>
          </>
        )}

        <div className="actions"><Link href="/businesses/dashboard" className="secondary">← Merchant Dashboard</Link><Link href="/businesses/dashboard/getting-started" className="secondary">Getting Started →</Link></div>
      </section>

      <style jsx>{`
        .shell{max-width:780px;margin:0 auto;padding:55px 24px 100px}.kicker{color:var(--queen-turquoise-dark);font-size:10px;font-weight:950;letter-spacing:.14em}.shell h1{margin:9px 0 12px;color:var(--queen-espresso);font-size:clamp(42px,7vw,68px);line-height:.98}.intro{max-width:680px;color:var(--queen-muted);line-height:1.7}.card{padding:28px;border:1px solid var(--queen-border);border-radius:24px;background:#fff;box-shadow:0 16px 45px rgba(53,32,24,.07);margin-top:20px}.form{display:grid;gap:16px}.form label{display:grid;gap:7px;color:var(--queen-espresso);font-size:12px;font-weight:850}.form input,.form textarea{box-sizing:border-box;width:100%;padding:13px 14px;border:1px solid var(--queen-border);border-radius:12px;background:#fff;color:var(--queen-espresso);font:inherit}.two,.three{display:grid;gap:14px}.two{grid-template-columns:1fr 1fr}.three{grid-template-columns:2fr 1fr 1fr}.progress-card{display:grid;gap:7px;padding:18px 20px;border-radius:18px;background:var(--queen-cream);margin-top:24px}.progress-card strong{color:var(--queen-espresso);font-size:14px}.progress-card span{color:var(--queen-muted);font-size:12px}.progress{height:9px;background:#fff;border-radius:999px;overflow:hidden;border:1px solid var(--queen-border)}.progress i{display:block;height:100%;background:var(--queen-turquoise);border-radius:999px}.status{padding:12px 14px;border-radius:13px;background:#faf8f2;color:var(--queen-muted);font-size:12px}.primary{padding:14px 20px;border:0;border-radius:12px;background:var(--queen-espresso);color:#fff;font-weight:900;cursor:pointer}.primary:disabled{opacity:.6;cursor:not-allowed}.error,.success{padding:14px 16px;border-radius:14px;margin-top:18px;font-weight:800}.error{background:#fff1f1;color:#9b2c2c}.success{background:#effcfb;color:var(--queen-turquoise-dark)}.actions{display:flex;gap:18px;flex-wrap:wrap;margin-top:20px}.secondary{color:var(--queen-turquoise-dark);font-weight:900;text-decoration:none}@media(max-width:700px){.two,.three{grid-template-columns:1fr}.shell{padding:35px 18px 70px}}
      `}</style>
    </main>
  );
}
