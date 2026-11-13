begin;

create or replace function private.mark_brand_verification_pending()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'pending' then
    update public.brands
    set verification_status = 'pending'
    where id = new.brand_id
      and verification_status <> 'verified';
  end if;
  return new;
end;
$$;

revoke execute on function private.mark_brand_verification_pending()
from public, anon, authenticated, service_role;

create trigger verification_requests_mark_brand_pending
after insert or update of status on public.verification_requests
for each row execute function private.mark_brand_verification_pending();

update public.brands as brand
set verification_status = 'pending'
where brand.verification_status <> 'verified'
  and exists (
    select 1
    from public.verification_requests as request
    where request.brand_id = brand.id
      and request.status = 'pending'
  );

create or replace function private.admin_review_verification_request(
  target_request_id uuid,
  decision text,
  notes text default ''
)
returns public.verification_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.verification_requests;
  reviewer_id uuid := (select auth.uid());
begin
  if reviewer_id is null or not (select private.is_admin()) then
    raise exception 'administrator access required';
  end if;

  if decision not in ('approved', 'rejected') then
    raise exception 'decision must be approved or rejected';
  end if;

  update public.verification_requests
  set status = decision,
      review_notes = left(coalesce(notes, ''), 5000),
      reviewed_by = reviewer_id,
      reviewed_at = now()
  where id = target_request_id
    and status = 'pending'
  returning * into result;

  if result.id is null then
    raise exception 'pending verification request not found';
  end if;

  update public.brands
  set verification_status = case when decision = 'approved' then 'verified' else 'rejected' end
  where id = result.brand_id;

  insert into public.audit_logs (actor_id, action, target_type, target_id, metadata)
  values (
    reviewer_id,
    'REVIEW_VERIFICATION_REQUEST',
    'verification_request',
    target_request_id,
    jsonb_build_object('decision', decision, 'brand_id', result.brand_id)
  );

  return result;
end;
$$;

revoke execute on function private.admin_review_verification_request(uuid, text, text)
from public, anon, authenticated, service_role;

grant execute on function private.admin_review_verification_request(uuid, text, text)
to authenticated;

create or replace function public.admin_review_verification_request(
  target_request_id uuid,
  decision text,
  notes text default ''
)
returns public.verification_requests
language sql
security invoker
set search_path = ''
as $$
  select * from private.admin_review_verification_request($1, $2, $3);
$$;

revoke execute on function public.admin_review_verification_request(uuid, text, text)
from public, anon, service_role;

grant execute on function public.admin_review_verification_request(uuid, text, text)
to authenticated;

commit;
