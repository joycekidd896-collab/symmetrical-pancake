import type { Metadata } from "next";
import "./globals.css";
import "./queen-polish.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://couponqueen.online"),
  title: "Coupon Queen | The Crown Jewel of Savings",
  description: "Discover local deals, coupons, and savings with Coupon Queen — The Crown Jewel of Savings.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Coupon Queen | The Crown Jewel of Savings",
    description: "Discover local deals, coupons, and savings with Coupon Queen.",
    url: "https://couponqueen.online",
    siteName: "Coupon Queen",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Coupon Queen | The Crown Jewel of Savings",
    description: "Discover local deals, coupons, and savings with Coupon Queen.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
