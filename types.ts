export type Merchant = {
  id: string;
  business_name: string;
  is_approved?: boolean | null;
  is_active?: boolean | null;
  owner_user_id?: string | null;
};

export type Coupon = {
  id: string;
  title: string;
  description?: string | null;
  expires_at?: string | null;
  starts_at?: string | null;
  status?: string | null;
  merchant_id?: string | null;
  total_redemptions?: number | null;
  merchants?: { id: string; business_name: string } | null;
};