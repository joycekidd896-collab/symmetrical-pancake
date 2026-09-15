import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose a New Merchant Password | Coupon Queen",
  description: "Private merchant password reset for Coupon Queen.",
  robots: { index: false, follow: false },
};

export default function MerchantResetPasswordLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
