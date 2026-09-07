import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coupon Queen | The Crown Jewel of Savings",
  description:
    "Discover local deals, coupons, and savings with Coupon Queen — The Crown Jewel of Savings."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}