grant execute on function public.admin_approve_merchant(uuid) to authenticated;
grant execute on function public.admin_reject_merchant(uuid) to authenticated;
grant execute on function public.admin_set_merchant_active(uuid,boolean) to authenticated;
