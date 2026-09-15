import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merchant Setup | Coupon Queen",
  description: "Private merchant onboarding for Coupon Queen.",
  robots: { index: false, follow: false },
};

export default function MerchantOnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
