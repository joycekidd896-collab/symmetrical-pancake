import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Merchant Password | Coupon Queen",
  description: "Private merchant password recovery for Coupon Queen.",
  robots: { index: false, follow: false },
};

export default function MerchantForgotPasswordLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
