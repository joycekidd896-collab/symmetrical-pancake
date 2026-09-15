import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merchant Activation | Coupon Queen",
  robots: { index: false, follow: false },
};

export default function MerchantWelcomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
