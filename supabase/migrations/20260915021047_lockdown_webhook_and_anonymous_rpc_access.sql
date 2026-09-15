-- Coupon Queen security hardening: deny anonymous RPC execution and lock webhook event storage.

revoke all on table public.stripe_webhook_events from anon, authenticated;

revoke execute on function public.has_active_merchant_subscription(uuid) from anon;
revoke execute on function public.admin_approve_merchant(uuid) from anon;
revoke execute on function public.admin_reject_merchant(uuid) from anon;
revoke execute on function public.admin_set_merchant_active(uuid, boolean) from anon;
revoke execute on function public.is_admin() from anon;
revoke execute on function public.is_merchant_member(uuid) from anon;
revoke execute on function public.redeem_coupon(uuid, uuid) from anon;

drop policy if exists "stripe_webhook_events_service_role_only" on public.stripe_webhook_events;
create policy "stripe_webhook_events_service_role_only"
on public.stripe_webhook_events
as restrictive
for all
to service_role
using (true)
with check (true);
