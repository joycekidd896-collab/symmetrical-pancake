import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./queen-polish.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://couponqueen.online"),
  title: {
    default: "Coupon Queen | The Crown Jewel of Savings",
    template: "%s | Coupon Queen",
  },
  description: "Find live coupons, local offers, and money-saving deals from participating businesses across the country. Coupon Queen is the Crown Jewel of Savings.",
  applicationName: "Coupon Queen",
  keywords: ["coupons", "deals", "discounts", "local deals", "savings", "merchant marketplace", "Coupon Queen"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Coupon Queen | The Crown Jewel of Savings",
    description: "Find live coupons, local offers, and money-saving deals from participating businesses across the country.",
    url: "https://couponqueen.online",
    siteName: "Coupon Queen",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Coupon Queen | The Crown Jewel of Savings",
    description: "Find live coupons, local offers, and money-saving deals from participating businesses across the country.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
