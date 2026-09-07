# Supabase integration notes

This frontend expects the existing project schema to provide these tables/fields:

- `coupons`
- `merchants`
- `coupon_saves`

The app calls the existing RPC:

`redeem_coupon(p_redemption_token, p_merchant_id)`

Keep authorization in Supabase RLS/database policies rather than trusting client-side role information.