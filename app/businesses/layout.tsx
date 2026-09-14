import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Kingdom | Coupon Queen",
  description: "Join Coupon Queen as a merchant, publish offers, reach shoppers, and manage redemptions from your Business Kingdom.",
  alternates: { canonical: "/businesses" },
  openGraph: {
    title: "Business Kingdom | Coupon Queen",
    description: "Join Coupon Queen as a merchant and turn offers into customer visits.",
    url: "https://couponqueen.online/businesses",
    siteName: "Coupon Queen",
    type: "website",
  },
};

export default function BusinessesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
