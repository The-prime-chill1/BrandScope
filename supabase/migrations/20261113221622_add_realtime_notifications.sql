begin;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;

create or replace function private.notify_admins_on_verification_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (recipient_id, actor_id, type, message, link)
  select
    profile.id,
    new.submitted_by,
    'verification',
    left(new.legal_entity_name || ' submitted a verification badge request.', 500),
    '/admin/brands'
  from public.profiles as profile
  where profile.role = 'admin'
    and profile.id <> new.submitted_by;
  return new;
end;
$$;

create or replace function private.notify_admins_on_support_inquiry()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (recipient_id, actor_id, type, message, link)
  select
    profile.id,
    new.submitted_by,
    'system',
    left('New support inquiry: ' || new.subject, 500),
    '/admin/inquiries'
  from public.profiles as profile
  where profile.role = 'admin';
  return new;
end;
$$;

create or replace function private.notify_verification_decision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status = 'pending' and new.status in ('approved', 'rejected') then
    insert into public.notifications (recipient_id, actor_id, type, message, link)
    values (
      new.submitted_by,
      new.reviewed_by,
      'verification',
      case
        when new.status = 'approved' then 'Your brand verification request was approved.'
        else 'Your brand verification request was reviewed and not approved.'
      end,
      '/dashboard/verification'
    );
  end if;
  return new;
end;
$$;

revoke execute on function private.notify_admins_on_verification_request() from public, anon, authenticated, service_role;
revoke execute on function private.notify_admins_on_support_inquiry() from public, anon, authenticated, service_role;
revoke execute on function private.notify_verification_decision() from public, anon, authenticated, service_role;

create trigger verification_requests_notify_admins
after insert on public.verification_requests
for each row execute function private.notify_admins_on_verification_request();

create trigger support_inquiries_notify_admins
after insert on public.support_inquiries
for each row execute function private.notify_admins_on_support_inquiry();

create trigger verification_requests_notify_owner
after update of status on public.verification_requests
for each row execute function private.notify_verification_decision();

commit;
