-- Coupon Queen production Supabase baseline.
-- This migration mirrors the existing production schema and is intentionally
-- idempotent so the live database can be adopted without destructive resets.

create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  category text,
  description text,
  created_at timestamptz not null default now(),
  owner_id uuid
);

create table if not exists public.business_offers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  discount text not null,
  title text not null,
  description text,
  category text,
  location text,
  expires text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.merchant_plans (
  id text primary key,
  name text not null,
  monthly_price_cents integer not null check (monthly_price_cents >= 0),
  description text not null,
  features jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.merchant_subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_id uuid not null,
  plan_id text not null references public.merchant_plans(id),
  status text not null default 'trialing' check (status = any (array['trialing','active','past_due','canceled','incomplete'])),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id)
);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id text not null,
  redemption_code text not null,
  redeemed_at timestamptz not null default now(),
  status text not null default 'redeemed',
  created_at timestamptz not null default now(),
  used_at timestamptz,
  verified_at timestamptz,
  verified_by uuid,
  customer_key text,
  redeemed_expires_at timestamptz
);

insert into public.merchant_plans (id,name,monthly_price_cents,description,features,active)
values
 ('starter','Royal Starter',2900,'A simple launch plan for local businesses.', '["Up to 5 active offers","Business profile","Customer redemption codes","Basic redemption analytics"]'::jsonb,true),
 ('growth','Royal Growth',5900,'More visibility and deeper performance tools.', '["Up to 20 active offers","Everything in Royal Starter","Advanced analytics","Featured-deal eligibility","Priority promotion tools"]'::jsonb,true)
on conflict (id) do update set
 name=excluded.name,
 monthly_price_cents=excluded.monthly_price_cents,
 description=excluded.description,
 features=excluded.features,
 active=excluded.active;

create index if not exists business_offers_business_id_idx on public.business_offers(business_id);
create index if not exists businesses_owner_id_idx on public.businesses(owner_id);
create index if not exists coupon_redemptions_coupon_id_idx on public.coupon_redemptions(coupon_id);
create index if not exists coupon_redemptions_customer_key_idx on public.coupon_redemptions(customer_key);
create index if not exists coupon_redemptions_status_idx on public.coupon_redemptions(status);
create index if not exists merchant_subscriptions_plan_id_idx on public.merchant_subscriptions(plan_id);
create index if not exists merchant_subscriptions_owner_idx on public.merchant_subscriptions(owner_id);
create index if not exists merchant_subscriptions_status_idx on public.merchant_subscriptions(status);

alter table public.businesses enable row level security;
alter table public.business_offers enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.merchant_plans enable row level security;
alter table public.merchant_subscriptions enable row level security;

create or replace function public.get_my_merchant_offer_limit()
returns table(plan_id text, plan_name text, monthly_price_cents integer, max_active_offers integer, active_offer_count bigint, can_create_offer boolean)
language sql security definer set search_path = public, pg_temp as $$
  select p.id,
    case when s.id is null then p.name || ' Trial' else p.name end,
    case when s.id is null then 0 else p.monthly_price_cents end,
    case when p.id='starter' then 5 when p.id='growth' then 20 else 0 end,
    count(o.id)::bigint,
    count(o.id) < case when p.id='starter' then 5 when p.id='growth' then 20 else 0 end
  from public.merchant_plans p
  left join public.merchant_subscriptions s on s.plan_id=p.id and s.owner_id=auth.uid() and s.status in ('trialing','active')
  left join public.businesses b on b.owner_id=auth.uid()
  left join public.business_offers o on o.business_id=b.id and o.active=true and (o.expires_at is null or o.expires_at>now())
  where p.active=true and (s.id is not null or (p.id='starter' and not exists (select 1 from public.merchant_subscriptions sx where sx.owner_id=auth.uid())))
  group by p.id,p.name,p.monthly_price_cents,s.id
  order by case when p.id='starter' then 0 else 1 end
  limit 1;
$$;

create or replace function public.can_create_merchant_offer()
returns boolean language sql security definer set search_path = public, pg_temp as $$
  select exists(select 1 from public.get_my_merchant_offer_limit() where can_create_offer=true);
$$;

-- Existing policies are retained by the live production database. These names
-- make the baseline reproducible on a fresh database.
drop policy if exists "authenticated users can create their business" on public.businesses;
create policy "authenticated users can create their business" on public.businesses for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "owners can update their business" on public.businesses;
create policy "owners can update their business" on public.businesses for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "public can view businesses" on public.businesses;
create policy "public can view businesses" on public.businesses for select to anon,authenticated using (true);

drop policy if exists "authenticated users can create their offers" on public.business_offers;
create policy "authenticated users can create their offers" on public.business_offers for insert to authenticated with check (auth.uid() is not null and exists (select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
drop policy if exists "owners can update their offers" on public.business_offers;
create policy "owners can update their offers" on public.business_offers for update to authenticated using (exists (select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid())) with check (exists (select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
drop policy if exists "public can view active offers or owner offers" on public.business_offers;
create policy "public can view active offers or owner offers" on public.business_offers for select to anon,authenticated using (active=true or exists (select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));

drop policy if exists "public can view active merchant plans" on public.merchant_plans;
create policy "public can view active merchant plans" on public.merchant_plans for select to anon,authenticated using (active=true);

drop policy if exists "owners can insert their merchant subscription" on public.merchant_subscriptions;
create policy "owners can insert their merchant subscription" on public.merchant_subscriptions for insert to authenticated with check (auth.uid()=owner_id and exists (select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
drop policy if exists "owners can update their merchant subscription" on public.merchant_subscriptions;
create policy "owners can update their merchant subscription" on public.merchant_subscriptions for update to authenticated using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
drop policy if exists "owners can view their merchant subscription" on public.merchant_subscriptions;
create policy "owners can view their merchant subscription" on public.merchant_subscriptions for select to authenticated using (auth.uid()=owner_id);

drop policy if exists "owners can view their offer redemptions" on public.coupon_redemptions;
create policy "owners can view their offer redemptions" on public.coupon_redemptions for select to authenticated using (coupon_id like 'live-%' and exists (select 1 from public.business_offers o join public.businesses b on b.id=o.business_id where ('live-'||o.id::text)=coupon_id and b.owner_id=auth.uid()));
drop policy if exists "owners can verify their offer redemptions" on public.coupon_redemptions;
create policy "owners can verify their offer redemptions" on public.coupon_redemptions for update to authenticated using (coupon_id like 'live-%' and exists (select 1 from public.business_offers o join public.businesses b on b.id=o.business_id where ('live-'||o.id::text)=coupon_id and b.owner_id=auth.uid())) with check (coupon_id like 'live-%' and exists (select 1 from public.business_offers o join public.businesses b on b.id=o.business_id where ('live-'||o.id::text)=coupon_id and b.owner_id=auth.uid()));

revoke execute on function public.get_my_merchant_offer_limit() from public;
grant execute on function public.get_my_merchant_offer_limit() to authenticated;
revoke execute on function public.can_create_merchant_offer() from public;
grant execute on function public.can_create_merchant_offer() to authenticated;
