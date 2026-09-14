import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deal Details | Coupon Queen",
  description: "View the details, terms, and redemption options for a Coupon Queen deal.",
  robots: { index: false, follow: true },
};

export default function CouponDetailLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
