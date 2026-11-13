begin;

-- The project-level RLS event trigger runs automatically as its owner. It must
-- not also be callable through the Data API by browser roles.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated, service_role;

-- Keep one SELECT policy per role/action and separate category mutations so
-- the policy planner does not evaluate overlapping permissive policies.
drop policy if exists "categories are public" on public.categories;
drop policy if exists "admins read inactive categories" on public.categories;
drop policy if exists "admins manage categories" on public.categories;

create policy "anonymous reads active categories"
on public.categories for select
to anon
using (is_active = true);

create policy "authenticated reads available categories"
on public.categories for select
to authenticated
using (is_active = true or (select private.is_admin()));

create policy "admins create categories"
on public.categories for insert
to authenticated
with check ((select private.is_admin()));

create policy "admins update categories"
on public.categories for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "admins delete categories"
on public.categories for delete
to authenticated
using ((select private.is_admin()));

-- A pending request may be edited only by the account that submitted it and
-- only while it still points at a brand owned by that account. Admins retain
-- moderation access without a second overlapping UPDATE policy.
drop policy if exists "owners update pending verification requests" on public.verification_requests;
drop policy if exists "admins update verification requests" on public.verification_requests;

create policy "owners or admins update verification requests"
on public.verification_requests for update
to authenticated
using (
  (select private.is_admin())
  or (
    submitted_by = (select auth.uid())
    and status = 'pending'
    and exists (
      select 1
      from public.brands b
      where b.id = verification_requests.brand_id
        and b.owner_id = (select auth.uid())
    )
  )
)
with check (
  (select private.is_admin())
  or (
    submitted_by = (select auth.uid())
    and status = 'pending'
    and exists (
      select 1
      from public.brands b
      where b.id = verification_requests.brand_id
        and b.owner_id = (select auth.uid())
    )
  )
);

-- Keep privileged mutations in the unexposed private schema. Public RPCs are
-- security-invoker wrappers, while the private functions repeat the admin
-- identity check before performing any RLS-bypassing operation.
create or replace function private.admin_set_brand_verification(target_brand_id uuid, new_status text)
returns public.brands
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.brands;
begin
  if (select auth.uid()) is null or not (select private.is_admin()) then
    raise exception 'administrator access required';
  end if;
  if new_status not in ('unverified', 'pending', 'verified', 'rejected') then
    raise exception 'invalid verification status';
  end if;

  update public.brands
  set verification_status = new_status
  where id = target_brand_id
  returning * into result;

  if result.id is null then
    raise exception 'brand not found';
  end if;

  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
  values ((select auth.uid()), 'SET_BRAND_VERIFICATION', 'brand', target_brand_id, jsonb_build_object('status', new_status));

  return result;
end;
$$;

create or replace function private.admin_set_brand_status(target_brand_id uuid, new_status text)
returns public.brands
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.brands;
begin
  if (select auth.uid()) is null or not (select private.is_admin()) then
    raise exception 'administrator access required';
  end if;
  if new_status not in ('active', 'suspended', 'archived') then
    raise exception 'invalid brand status';
  end if;

  update public.brands
  set status = new_status
  where id = target_brand_id
  returning * into result;

  if result.id is null then
    raise exception 'brand not found';
  end if;

  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
  values ((select auth.uid()), 'SET_BRAND_STATUS', 'brand', target_brand_id, jsonb_build_object('status', new_status));

  return result;
end;
$$;

create or replace function private.admin_resolve_report(target_report_id uuid, new_status text)
returns public.reports
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.reports;
begin
  if (select auth.uid()) is null or not (select private.is_admin()) then
    raise exception 'administrator access required';
  end if;
  if new_status not in ('resolved', 'dismissed') then
    raise exception 'invalid report status';
  end if;

  update public.reports
  set status = new_status,
      reviewed_by = (select auth.uid()),
      reviewed_at = now()
  where id = target_report_id
  returning * into result;

  if result.id is null then
    raise exception 'report not found';
  end if;

  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
  values ((select auth.uid()), 'RESOLVE_REPORT', 'report', target_report_id, jsonb_build_object('status', new_status));

  return result;
end;
$$;

revoke execute on function private.admin_set_brand_verification(uuid, text) from public, anon, authenticated, service_role;
revoke execute on function private.admin_set_brand_status(uuid, text) from public, anon, authenticated, service_role;
revoke execute on function private.admin_resolve_report(uuid, text) from public, anon, authenticated, service_role;
grant execute on function private.admin_set_brand_verification(uuid, text) to authenticated;
grant execute on function private.admin_set_brand_status(uuid, text) to authenticated;
grant execute on function private.admin_resolve_report(uuid, text) to authenticated;

create or replace function public.admin_set_brand_verification(target_brand_id uuid, new_status text)
returns public.brands
language sql
security invoker
set search_path = ''
as $$
  select * from private.admin_set_brand_verification($1, $2);
$$;

create or replace function public.admin_set_brand_status(target_brand_id uuid, new_status text)
returns public.brands
language sql
security invoker
set search_path = ''
as $$
  select * from private.admin_set_brand_status($1, $2);
$$;

create or replace function public.admin_resolve_report(target_report_id uuid, new_status text)
returns public.reports
language sql
security invoker
set search_path = ''
as $$
  select * from private.admin_resolve_report($1, $2);
$$;

revoke execute on function public.admin_set_brand_verification(uuid, text) from public, anon, service_role;
revoke execute on function public.admin_set_brand_status(uuid, text) from public, anon, service_role;
revoke execute on function public.admin_resolve_report(uuid, text) from public, anon, service_role;
grant execute on function public.admin_set_brand_verification(uuid, text) to authenticated;
grant execute on function public.admin_set_brand_status(uuid, text) to authenticated;
grant execute on function public.admin_resolve_report(uuid, text) to authenticated;

-- Index the remaining foreign-key lookup used when Auth users are removed.
create index if not exists notifications_actor_id_idx
on public.notifications (actor_id)
where actor_id is not null;

commit;
