begin;

create table public.support_inquiries (
  id bigint generated always as identity primary key,
  submitted_by uuid references auth.users(id) on delete set null,
  inquiry_type text not null default 'general',
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new',
  admin_note text not null default '',
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint support_inquiries_type_valid check (
    inquiry_type in ('general', 'account', 'verification', 'technical', 'partnership', 'report')
  ),
  constraint support_inquiries_status_valid check (
    status in ('new', 'in_progress', 'resolved', 'closed')
  ),
  constraint support_inquiries_name_length check (
    char_length(btrim(name)) between 1 and 120
  ),
  constraint support_inquiries_email_length check (
    char_length(btrim(email)) between 3 and 320 and position('@' in email) > 1
  ),
  constraint support_inquiries_subject_length check (
    char_length(btrim(subject)) between 3 and 180
  ),
  constraint support_inquiries_message_length check (
    char_length(btrim(message)) between 10 and 5000
  ),
  constraint support_inquiries_admin_note_length check (
    char_length(admin_note) <= 5000
  )
);

comment on table public.support_inquiries is
  'Private support inbox populated by the public BRANDSCOPE contact form and managed by administrators.';

create index support_inquiries_submitted_by_idx
on public.support_inquiries (submitted_by)
where submitted_by is not null;

create index support_inquiries_assigned_to_idx
on public.support_inquiries (assigned_to)
where assigned_to is not null;

create index support_inquiries_open_created_idx
on public.support_inquiries (created_at desc)
where status in ('new', 'in_progress');

create index support_inquiries_status_created_idx
on public.support_inquiries (status, created_at desc);

create trigger support_inquiries_set_updated_at
before update on public.support_inquiries
for each row execute function private.set_updated_at();

alter table public.support_inquiries enable row level security;

revoke all on table public.support_inquiries from anon, authenticated;
revoke all on sequence public.support_inquiries_id_seq from anon, authenticated;

grant insert (
  submitted_by,
  inquiry_type,
  name,
  email,
  subject,
  message
)
on table public.support_inquiries
to anon, authenticated;

grant usage on sequence public.support_inquiries_id_seq to anon, authenticated;

grant select on table public.support_inquiries to authenticated;

grant update (
  status,
  admin_note,
  assigned_to,
  resolved_at
)
on table public.support_inquiries
to authenticated;

create policy "anyone submits support inquiries"
on public.support_inquiries for insert
to anon, authenticated
with check (
  status = 'new'
  and admin_note = ''
  and assigned_to is null
  and resolved_at is null
  and (
    submitted_by is null
    or submitted_by = (select auth.uid())
  )
);

create policy "admins read support inquiries"
on public.support_inquiries for select
to authenticated
using ((select private.is_admin()));

create policy "admins update support inquiries"
on public.support_inquiries for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

commit;
