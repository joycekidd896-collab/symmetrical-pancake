export type Coupon = {
  id: string;
  business_id?: string;
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
