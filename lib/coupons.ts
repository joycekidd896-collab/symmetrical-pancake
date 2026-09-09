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
