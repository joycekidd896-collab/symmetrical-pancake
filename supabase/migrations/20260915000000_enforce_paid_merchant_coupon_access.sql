-- Coupon Queen production hardening: coupon creation/editing requires a live merchant subscription.

create or replace function public.has_active_merchant_subscription(p_merchant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.subscriptions s
    where s.merchant_id = p_merchant_id
      and s.user_id = auth.uid()
      and s.subscription_type = 'merchant'
      and s.status in ('active'::subscription_status, 'trialing'::subscription_status)
  );
$$;

revoke execute on function public.has_active_merchant_subscription(uuid) from public;
grant execute on function public.has_active_merchant_subscription(uuid) to authenticated;

drop policy if exists "coupons_merchant_insert" on public.coupons;
create policy "coupons_merchant_insert"
on public.coupons
for insert to authenticated
with check (
  (select is_admin())
  or (
    (select is_merchant_member(coupons.merchant_id))
    and (select has_active_merchant_subscription(coupons.merchant_id))
  )
);

drop policy if exists "coupons_merchant_update" on public.coupons;
create policy "coupons_merchant_update"
on public.coupons
for update to authenticated
using (
  (select is_admin())
  or (
    (select is_merchant_member(coupons.merchant_id))
    and (select has_active_merchant_subscription(coupons.merchant_id))
  )
)
with check (
  (select is_admin())
  or (
    (select is_merchant_member(coupons.merchant_id))
    and (select has_active_merchant_subscription(coupons.merchant_id))
  )
);
