import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Merchant Dashboard | Coupon Queen",
  description: "Private Coupon Queen merchant tools for managing your business, offers, redemptions, and billing.",
  robots: { index: false, follow: false },
};

export default function MerchantDashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="merchant-quickbar" aria-label="Merchant tools">
        <div className="merchant-quickbar-inner">
          <Link href="/businesses/dashboard" className="quick-brand">♕ Merchant Hub</Link>
          <nav className="quick-links" aria-label="Merchant navigation">
            <Link href="/businesses/dashboard/getting-started">Getting Started</Link>
            <Link href="/businesses/dashboard/profile">Public Profile</Link>
            <Link href="/businesses/dashboard/notifications">Notifications</Link>
            <Link href="/businesses/dashboard/billing">Billing</Link>
          </nav>
        </div>
      </div>
      {children}
      <style>{`
        .merchant-quickbar{position:relative;z-index:20;border-bottom:1px solid var(--queen-border,#eadfd7);background:rgba(255,255,255,.96);backdrop-filter:blur(10px)}
        .merchant-quickbar-inner{max-width:1180px;margin:0 auto;padding:9px 28px;display:flex;align-items:center;justify-content:space-between;gap:16px}
        .quick-brand{color:var(--queen-espresso,#352018);font-size:12px;font-weight:950;text-decoration:none;letter-spacing:.02em;white-space:nowrap}
        .quick-links{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}
        .quick-links a{padding:7px 10px;border-radius:999px;color:var(--queen-muted,#746860);font-size:11px;font-weight:850;text-decoration:none}
        .quick-links a:hover{background:var(--queen-cream,#fff7ed);color:var(--queen-espresso,#352018)}
        @media(max-width:640px){.merchant-quickbar-inner{padding:8px 14px;align-items:flex-start;flex-direction:column;gap:5px}.quick-links{justify-content:flex-start}.quick-links a{padding:6px 8px}}
      `}</style>
    </>
  );
}
