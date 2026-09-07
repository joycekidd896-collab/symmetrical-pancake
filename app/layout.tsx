import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Joyce's Elite Coupons",
  description: "Local coupons and savings from Joyce's Elite Coupons."
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
