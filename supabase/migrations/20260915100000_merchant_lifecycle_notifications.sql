create or replace function public.notify_merchant_lifecycle()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if old.is_approved is distinct from new.is_approved then
      insert into public.notifications (user_id, title, message, type, is_read)
      values (
        new.owner_user_id,
        case when new.is_approved then 'Your business has been approved' else 'Your business approval status changed' end,
        case when new.is_approved
          then 'Your Coupon Queen merchant profile is approved. Your eligible live offers can now appear in the Deal Vault when they meet the public visibility rules.'
          else 'Your merchant profile is no longer approved for public marketplace visibility. Please review your account or contact Coupon Queen support.'
        end,
        'approval', false
      );
    end if;

    if old.is_active is distinct from new.is_active then
      insert into public.notifications (user_id, title, message, type, is_read)
      values (
        new.owner_user_id,
        case when new.is_active then 'Your merchant account is active again' else 'Your merchant account was deactivated' end,
        case when new.is_active
          then 'Your Coupon Queen merchant account is active. You can continue managing eligible offers.'
          else 'Your merchant account is currently inactive. Public visibility and merchant activity may be restricted until it is reactivated.'
        end,
        'account', false
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists merchants_lifecycle_notifications on public.merchants;
create trigger merchants_lifecycle_notifications
after update of is_approved, is_active on public.merchants
for each row
execute function public.notify_merchant_lifecycle();
