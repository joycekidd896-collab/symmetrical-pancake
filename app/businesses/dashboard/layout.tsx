import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merchant Dashboard | Coupon Queen",
  description: "Private Coupon Queen merchant tools for managing your business, offers, redemptions, and billing.",
  robots: { index: false, follow: false },
};

export default function MerchantDashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
