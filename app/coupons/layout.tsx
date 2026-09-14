import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Coupons & Deals | Coupon Queen",
  description: "Browse live Coupon Queen deals from participating local businesses and discover savings near you.",
  alternates: { canonical: "/coupons" },
  openGraph: {
    title: "Live Coupons & Deals | Coupon Queen",
    description: "Browse live Coupon Queen deals from participating local businesses.",
    url: "https://couponqueen.online/coupons",
    siteName: "Coupon Queen",
    type: "website",
  },
};

export default function CouponsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
