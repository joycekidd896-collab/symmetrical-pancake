import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merchant Sign In | Coupon Queen",
  description: "Private merchant sign-in for Coupon Queen.",
  robots: { index: false, follow: false },
};

export default function MerchantLoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
