begin;

alter table public.brands
add column contact_email text not null default '';

comment on column public.brands.contact_email is
  'Optional public-facing business email supplied by the brand owner.';

alter table public.brands
add constraint brands_contact_email_valid
check (
  contact_email = ''
  or (
    char_length(contact_email) <= 320
    and position('@' in contact_email) > 1
  )
) not valid;

alter table public.brands
validate constraint brands_contact_email_valid;

grant insert (contact_email)
on table public.brands
to authenticated;

grant update (contact_email)
on table public.brands
to authenticated;

commit;
