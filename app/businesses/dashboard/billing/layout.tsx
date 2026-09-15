import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merchant Billing | Coupon Queen",
  description: "Private merchant membership billing for Coupon Queen.",
  robots: { index: false, follow: false },
};

export default function MerchantBillingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
