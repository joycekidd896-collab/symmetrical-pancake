import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | Coupon Queen",
  description: "Manage your saved Coupon Queen deals and redemption history.",
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
