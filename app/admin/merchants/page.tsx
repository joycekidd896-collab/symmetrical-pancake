"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const api = (table: string) => `${URL}/rest/v1/${table}`;

type Merchant = {
  id: string;
  business_name: string;
  city: string | null;
  state: string | null;
  description: string | null;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
};

type Profile = { id: string; role: string };
type Subscription = { merchant_id: string; status: string; merchant_plans?: { name: string } | { name: string }[] | null };

export default function AdminMerchantReviewPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "inactive">("pending");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      if (!URL || !KEY) throw new Error("Admin services are not configured.");
      const token = localStorage.getItem("cq_access_token");
      if (!token) return;
      const headers = { apikey: KEY, Authorization: `Bearer ${token}` };
      const auth = await fetch(`${URL}/auth/v1/user`, { headers, cache: "no-store" });
      if (!auth.ok) return;
      const user = await auth.json();
      const profileRes = await fetch(`${api("profiles")}?id=eq.${encodeURIComponent(user.id)}&select=id,role&limit=1`, { headers, cache: "no-store" });
      if (!profileRes.ok) throw new Error("Administrator profile could not be verified.");
      const profiles: Profile[] = await profileRes.json();
      if (profiles[0]?.role !== "admin") return;
      setAuthorized(true);

      const [merchantRes, subscriptionRes] = await Promise.all([
        fetch(`${api("merchants")}?select=id,business_name,city,state,description,is_approved,is_active,created_at&order=created_at.desc`, { headers, cache: "no-store" }),
        fetch(`${api("subscriptions")}?status=in.(active,trialing,past_due,incomplete)&select=merchant_id,status,merchant_plans(name)&order=created_at.desc`, { headers, cache: "no-store" }),
      ]);
      if (!merchantRes.ok) throw new Error("Merchant accounts could not be loaded.");
      setMerchants(await merchantRes.json());
      if (subscriptionRes.ok) setSubscriptions(await subscriptionRes.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Merchant review could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return merchants.filter((merchant) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "pending" && !merchant.is_approved) ||
        (filter === "approved" && merchant.is_approved && merchant.is_active) ||
        (filter === "inactive" && !merchant.is_active);
      if (!matchesFilter) return false;
      if (!q) return true;
      return [merchant.business_name, merchant.city, merchant.state, merchant.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [merchants, search, filter]);

  const subscriptionFor = (merchantId: string) => {
    const row = subscriptions.find((item) => item.merchant_id === merchantId && ["active", "trialing"].includes(item.status))
      || subscriptions.find((item) => item.merchant_id === merchantId);
    if (!row) return null;
    const plan = Array.isArray(row.merchant_plans) ? row.merchant_plans[0] : row.merchant_plans;
    return { status: row.status, plan: plan?.name || "Merchant Membership" };
  };

  const runRpc = async (name: string, merchantId: string, active?: boolean) => {
    setBusy(merchantId);
    setNotice("");
    setError("");
    try {
      if (!URL || !KEY) throw new Error("Admin services are not configured.");
      const token = localStorage.getItem("cq_access_token");
      if (!token) throw new Error("Administrator session expired.");
      const args = name === "admin_set_merchant_active"
        ? { p_merchant_id: merchantId, p_active: active }
        : { p_merchant_id: merchantId };
      const response = await fetch(`${URL}/rest/v1/rpc/${name}`, {
        method: "POST",
        headers: { apikey: KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || body?.hint || body?.details || "Administrator action failed.");
      setNotice(name === "admin_approve_merchant" ? "Merchant approved. Public eligibility is now available once the account and offers satisfy the live rules." : name === "admin_reject_merchant" ? "Merchant rejected." : active ? "Merchant activated." : "Merchant deactivated.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Administrator action failed.");
    } finally {
      setBusy("");
    }
  };

  if (loading) return <main className="queen-page"><section className="state"><div className="spinner" /><p>Opening merchant review…</p></section><style jsx>{styles}</style></main>;

  if (!authorized) return <main className="queen-page"><section className="state"><div className="section-kicker">♛ ROYAL ADMINISTRATION</div><h1>Administrator Access Required</h1><p>This workspace is restricted to approved Coupon Queen administrators.</p><Link href="/account/login?next=/admin/merchants" className="primary">Administrator Sign In →</Link></section><style jsx>{styles}</style></main>;

  const pendingCount = merchants.filter((merchant) => !merchant.is_approved).length;
  const paidCount = merchants.filter((merchant) => { const sub = subscriptionFor(merchant.id); return sub && ["active", "trialing"].includes(sub.status); }).length;

  return <main className="queen-page">
    <header className="site-header">
      <Link href="/admin" className="brand-wrap"><div className="brand-crown">♕</div><div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">The Crown Jewel of Savings</div></div></Link>
      <nav><Link href="/admin">Command Center</Link><Link href="/businesses">Merchant Directory</Link></nav>
    </header>

    <section className="shell">
      <div className="head"><div><div className="section-kicker">♕ MERCHANT REVIEW</div><h1>Business Accounts</h1><p>Search the merchant pipeline, verify payment state, and approve businesses without wading through unrelated accounts.</p></div><Link href="/admin" className="back">← Command Center</Link></div>
      {notice && <div className="notice">✓ {notice}</div>}
      {error && <div className="error">✕ {error}</div>}

      <div className="summary"><div><span>PENDING</span><strong>{pendingCount}</strong></div><div><span>PAID ACCESS</span><strong>{paidCount}</strong></div><div><span>SHOWING</span><strong>{filtered.length}</strong></div></div>

      <section className="panel">
        <div className="toolbar">
          <input aria-label="Search merchants" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search business, city, state, or description…" />
          <div className="filters">{([["pending","Pending"],["all","All"],["approved","Approved"],["inactive","Inactive"]] as const).map(([value, label]) => <button key={value} type="button" className={filter === value ? "filter active" : "filter"} onClick={() => setFilter(value)}>{label}</button>)}</div>
        </div>
        <div className="rows">
          {filtered.length ? filtered.map((merchant) => {
            const billing = subscriptionFor(merchant.id);
            const paid = billing && ["active", "trialing"].includes(billing.status);
            return <article className="merchant" key={merchant.id}>
              <div className="identity"><strong>{merchant.business_name}</strong><span>{merchant.city || ""}{merchant.state ? `, ${merchant.state}` : ""} · Joined {new Date(merchant.created_at).toLocaleDateString()}</span>{merchant.description && <p>{merchant.description}</p>}</div>
              <div className="signals"><span className={`badge ${merchant.is_approved ? (merchant.is_active ? "approved" : "inactive") : "pending"}`}>{merchant.is_approved ? (merchant.is_active ? "APPROVED" : "INACTIVE") : "PENDING"}</span><span className={`billing ${paid ? "paid" : ""}`}>{billing ? `${billing.plan} · ${billing.status.toUpperCase()}` : "No confirmed billing"}</span></div>
              <div className="actions">{!merchant.is_approved && <><button disabled={busy === merchant.id} className="action primary-action" onClick={() => runRpc("admin_approve_merchant", merchant.id)}>Approve</button><button disabled={busy === merchant.id} className="action" onClick={() => runRpc("admin_reject_merchant", merchant.id)}>Reject</button></>}{merchant.is_approved && <button disabled={busy === merchant.id} className="action" onClick={() => runRpc("admin_set_merchant_active", merchant.id, !merchant.is_active)}>{merchant.is_active ? "Deactivate" : "Activate"}</button>}</div>
            </article>;
          }) : <div className="empty">No merchant accounts match this search.</div>}
        </div>
      </section>
    </section>

    <style jsx>{styles}</style>
  </main>;
}

const styles = `
.shell{max-width:1120px;margin:0 auto;padding:44px 24px 90px}.head{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:22px}.head h1{margin:8px 0;color:var(--queen-espresso);font-size:clamp(38px,6vw,58px);line-height:1}.head p{max-width:720px;color:var(--queen-muted);line-height:1.7}.back{color:var(--queen-turquoise-dark);font-weight:900;text-decoration:none;white-space:nowrap}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:18px}.summary>div,.panel{border:1px solid var(--queen-border);background:#fff;border-radius:22px;box-shadow:0 14px 40px rgba(53,32,24,.06)}.summary>div{padding:18px}.summary span{display:block;font-size:9px;letter-spacing:.12em;font-weight:950;color:var(--queen-muted)}.summary strong{display:block;margin-top:7px;font-size:32px;color:var(--queen-espresso)}.panel{padding:20px}.toolbar{display:flex;justify-content:space-between;gap:14px;align-items:center;margin-bottom:16px}.toolbar input{flex:1;min-width:0;padding:13px 14px;border:1px solid var(--queen-border);border-radius:12px;font:inherit;color:var(--queen-espresso)}.filters{display:flex;gap:7px;flex-wrap:wrap}.filter{padding:8px 11px;border:1px solid var(--queen-border);border-radius:999px;background:#fff;color:var(--queen-muted);font-size:10px;font-weight:900;cursor:pointer}.filter.active{background:var(--queen-espresso);border-color:var(--queen-espresso);color:#fff}.rows{border-top:1px solid var(--queen-border)}.merchant{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(180px,auto) auto;gap:18px;align-items:center;padding:18px 0;border-bottom:1px solid var(--queen-border)}.identity strong{display:block;color:var(--queen-espresso);font-size:16px}.identity span{display:block;margin-top:4px;color:var(--queen-muted);font-size:11px}.identity p{margin:8px 0 0;color:var(--queen-muted);font-size:12px;line-height:1.5}.signals{display:grid;gap:7px;justify-items:start}.badge{padding:6px 9px;border-radius:999px;font-size:9px;font-weight:950}.badge.approved{background:rgba(32,199,201,.11);color:var(--queen-turquoise-dark)}.badge.pending{background:rgba(214,173,69,.14);color:#8b6c1c}.badge.inactive{background:rgba(53,32,24,.08);color:var(--queen-muted)}.billing{font-size:10px;font-weight:800;color:var(--queen-muted)}.billing.paid{color:var(--queen-turquoise-dark)}.actions{display:flex;gap:7px;justify-content:flex-end;flex-wrap:wrap}.action{padding:9px 12px;border:1px solid var(--queen-border);border-radius:10px;background:#fff;color:var(--queen-espresso);font-size:11px;font-weight:900;cursor:pointer}.primary-action{background:var(--queen-espresso);color:#fff;border-color:var(--queen-espresso)}.action:disabled{opacity:.55;cursor:not-allowed}.notice,.error{padding:13px 16px;margin-bottom:16px;border-radius:13px;font-weight:850}.notice{background:rgba(32,199,201,.08);color:var(--queen-turquoise-dark)}.error{background:#fff1f1;color:#9b2c2c}.empty{padding:50px;text-align:center;color:var(--queen-muted)}.state{max-width:680px;margin:0 auto;padding:120px 24px;text-align:center}.state h1{color:var(--queen-espresso);font-size:clamp(35px,6vw,58px)}.state p{color:var(--queen-muted);line-height:1.7}.primary{display:inline-block;padding:13px 20px;border-radius:12px;background:var(--queen-espresso);color:#fff;text-decoration:none;font-weight:900}.spinner{width:40px;height:40px;margin:0 auto 20px;border:4px solid var(--queen-border);border-top-color:var(--queen-turquoise-dark);border-radius:50%;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:800px){.head{align-items:flex-start;flex-direction:column}.toolbar{align-items:stretch;flex-direction:column}.summary{grid-template-columns:1fr}.merchant{grid-template-columns:1fr}.actions{justify-content:flex-start}}
`;