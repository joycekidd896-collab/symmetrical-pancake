"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const api = (table: string) => `${URL}/rest/v1/${table}`;

type Notification = { id: string; title: string; message: string; type: string; is_read: boolean; created_at: string };

export default function MerchantNotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");

  useEffect(() => {
    (async () => {
      try {
        if (!URL || !KEY) throw new Error("Merchant notifications are not configured.");
        const token = localStorage.getItem("cq_access_token");
        if (!token) { window.location.replace("/businesses/login?next=/businesses/dashboard/notifications"); return; }
        const headers = { apikey: KEY, Authorization: `Bearer ${token}` };
        const auth = await fetch(`${URL}/auth/v1/user`, { headers, cache: "no-store" });
        if (!auth.ok) { window.location.replace("/businesses/login?next=/businesses/dashboard/notifications"); return; }
        const user = await auth.json();
        const response = await fetch(`${api("notifications")}?user_id=eq.${encodeURIComponent(user.id)}&select=id,title,message,type,is_read,created_at&order=created_at.desc&limit=50`, { headers, cache: "no-store" });
        if (!response.ok) throw new Error("Could not load your merchant notifications.");
        setItems(await response.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load notifications.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const markRead = async (id: string) => {
    try {
      const token = localStorage.getItem("cq_access_token");
      if (!token || !URL || !KEY) return;
      setSaving(id);
      const response = await fetch(`${api("notifications")}?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { apikey: KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ is_read: true }) });
      if (!response.ok) throw new Error("Could not mark notification as read.");
      setItems((current) => current.map((item) => item.id === id ? { ...item, is_read: true } : item));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update notification.");
    } finally {
      setSaving("");
    }
  };

  const unread = items.filter((item) => !item.is_read).length;

  return <main className="queen-page">
    <header className="site-header">
      <Link href="/businesses/dashboard" className="brand-wrap"><div className="brand-crown">♕</div><div><div className="brand-name">COUPON QUEEN</div><div className="brand-tagline">The Crown Jewel of Savings</div></div></Link>
      <nav><Link href="/businesses/dashboard">Dashboard</Link><Link href="/businesses/dashboard/billing">Billing</Link><Link href="/businesses/dashboard/redemptions">Redemptions</Link></nav>
    </header>
    <section className="shell">
      <div className="head"><div><div className="section-kicker">♛ BUSINESS KINGDOM</div><h1>Royal Notifications</h1><p>Important account, approval, billing, and marketplace updates for your merchant account.</p></div><Link href="/businesses/dashboard" className="back">← Merchant Dashboard</Link></div>
      {error && <div className="error">✕ {error}</div>}
      <div className="summary"><strong>{unread}</strong><span>Unread updates</span></div>
      {loading ? <div className="empty">Loading your notifications…</div> : items.length ? <div className="rows">{items.map((item) => <article className={`notice ${item.is_read ? "read" : "unread"}`} key={item.id}><div className="icon">{item.type === "billing" ? "💳" : item.type === "approval" ? "👑" : item.type === "redemption" ? "🎟️" : "✦"}</div><div className="copy"><div className="top"><strong>{item.title}</strong><time>{new Date(item.created_at).toLocaleString()}</time></div><p>{item.message}</p>{!item.is_read && <button disabled={saving === item.id} onClick={() => markRead(item.id)}>{saving === item.id ? "Saving…" : "Mark as read"}</button>}</div></article>)}</div> : <div className="empty panel">You’re all caught up. New merchant updates will appear here.</div>}
    </section>
    <style jsx>{styles}</style>
  </main>;
}

const styles = `
.shell{max-width:900px;margin:0 auto;padding:45px 24px 90px}.head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:22px}.head h1{margin:8px 0;color:var(--queen-espresso);font-size:clamp(38px,6vw,58px);line-height:1}.head p{color:var(--queen-muted);line-height:1.7;max-width:650px}.back{color:var(--queen-turquoise-dark);font-weight:900;text-decoration:none;white-space:nowrap}.summary{display:inline-flex;align-items:baseline;gap:9px;padding:12px 15px;margin-bottom:18px;border-radius:999px;background:var(--queen-cream);color:var(--queen-espresso)}.summary strong{font-size:20px}.summary span{font-size:11px;font-weight:850}.rows{display:grid;gap:12px}.notice{display:grid;grid-template-columns:45px 1fr;gap:13px;padding:17px;border:1px solid var(--queen-border);border-radius:18px;background:#fff;box-shadow:0 12px 32px rgba(53,32,24,.05)}.notice.unread{border-color:rgba(32,199,201,.35);background:rgba(32,199,201,.04)}.notice.read{opacity:.86}.icon{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:var(--queen-cream);font-size:20px}.top{display:flex;justify-content:space-between;gap:14px;align-items:start}.top strong{color:var(--queen-espresso)}time{color:var(--queen-muted);font-size:10px;white-space:nowrap}.copy p{margin:7px 0;color:var(--queen-muted);line-height:1.6;font-size:13px}.copy button{padding:7px 10px;border:1px solid var(--queen-border);border-radius:9px;background:#fff;color:var(--queen-espresso);font-size:10px;font-weight:900;cursor:pointer}.copy button:disabled{opacity:.55}.empty{padding:45px;text-align:center;color:var(--queen-muted)}.panel{border:1px solid var(--queen-border);border-radius:20px;background:#fff}.error{margin-bottom:16px;padding:13px 15px;border-radius:13px;background:#fff1f1;color:#9b2c2c;font-weight:850}@media(max-width:650px){.head{align-items:flex-start;flex-direction:column}.top{flex-direction:column;gap:4px}.notice{grid-template-columns:1fr}.icon{margin-bottom:2px}}
`;
