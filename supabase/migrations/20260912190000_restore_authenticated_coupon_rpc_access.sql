grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_merchant_member(uuid) to authenticated;
grant execute on function public.redeem_coupon(uuid,uuid) to authenticated;
