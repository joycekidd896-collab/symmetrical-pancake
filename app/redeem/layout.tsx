import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coupon Redemption | Coupon Queen",
  robots: { index: false, follow: false },
};

export default function RedemptionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
