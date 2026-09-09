export type Coupon = {
  id: string;
  discount: string;
  title: string;
  business: string;
  category: string;
  location: string;
  description: string;
  expires: string;
  featured?: boolean;
  terms: string[];
};

export const coupons: Coupon[] = [
  {
    id: "queen-01",
    discount: "20% OFF",
    title: "Boutique Style Savings",
    business: "Local Boutique",
    category: "Shopping",
    location: "Local",
    description: "Save on your next favorite find with this featured royal offer.",
    expires: "Featured offer",
    featured: true,
    terms: ["One redemption per customer.", "Valid on eligible purchases.", "Cannot be combined with other offers."],
  },
  {
    id: "queen-02",
    discount: "$10 OFF",
    title: "Dinner for Less",
    business: "Local Restaurant",
    category: "Dining",
    location: "Local",
    description: "Enjoy a delicious night out while keeping more money in your crown purse.",
    expires: "Featured offer",
    terms: ["One redemption per customer.", "Valid on qualifying orders.", "Offer subject to merchant availability."],
  },
  {
    id: "queen-03",
    discount: "15% OFF",
    title: "Beauty Royalty Savings",
    business: "Local Beauty Shop",
    category: "Beauty",
    location: "Local",
    description: "Treat yourself to a little extra sparkle without paying full price.",
    expires: "Featured offer",
    terms: ["One redemption per customer.", "Valid on eligible services or products.", "Cannot be combined with other offers."],
  },
  {
    id: "queen-04",
    discount: "25% OFF",
    title: "Online Shopping Deal",
    business: "Online Store",
    category: "Online",
    location: "Online",
    description: "A nationwide-style online offer ready for the future Deal Vault.",
    expires: "Featured offer",
    terms: ["One redemption per customer.", "Valid online only.", "Merchant terms may apply."],
  },
];

export function getCoupon(id: string) {
  return coupons.find((coupon) => coupon.id === id);
}
