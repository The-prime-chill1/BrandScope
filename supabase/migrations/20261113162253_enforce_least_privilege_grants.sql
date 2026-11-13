begin;

-- Supabase projects can auto-grant broad table privileges in exposed schemas.
-- RLS still filters rows, but column-sensitive fields such as profiles.role and
-- brands.verification_status also require explicit least-privilege grants.
revoke all on table
  public.categories,
  public.profiles,
  public.brands,
  public.products,
  public.posts,
  public.comments,
  public.follows,
  public.post_likes,
  public.notifications,
  public.reports,
  public.verification_requests,
  public.audit_logs
from anon, authenticated;

grant usage on schema public to anon, authenticated;

grant select on table
  public.categories,
  public.brands,
  public.products,
  public.posts,
  public.comments,
  public.follows,
  public.post_likes
to anon;

grant select on table
  public.categories,
  public.profiles,
  public.brands,
  public.products,
  public.posts,
  public.comments,
  public.follows,
  public.post_likes,
  public.notifications,
  public.reports,
  public.verification_requests,
  public.audit_logs
to authenticated;

grant insert, update, delete on table public.categories to authenticated;

grant update (contact_name)
on table public.profiles
to authenticated;

grant insert (
  owner_id,
  name,
  slug,
  brand_type,
  category_slug,
  country,
  city,
  whatsapp,
  phone,
  website,
  address,
  delivery_info,
  response_speed,
  short_description,
  full_description,
  logo_url,
  cover_url,
  registration_number,
  socials
)
on table public.brands
to authenticated;

grant update (
  name,
  slug,
  brand_type,
  category_slug,
  country,
  city,
  whatsapp,
  phone,
  website,
  address,
  delivery_info,
  response_speed,
  short_description,
  full_description,
  logo_url,
  cover_url,
  registration_number,
  socials
)
on table public.brands
to authenticated;

grant insert, update, delete on table public.products, public.posts to authenticated;
grant insert, delete on table public.comments, public.follows, public.post_likes to authenticated;

grant update (is_read)
on table public.notifications
to authenticated;

grant insert (reporter_id, target_type, target_id, reason, details, status)
on table public.reports
to authenticated;

grant insert (
  brand_id,
  submitted_by,
  legal_entity_name,
  registration_number,
  director_name,
  id_type,
  id_number,
  website_domain,
  registered_address,
  document_path,
  status
)
on table public.verification_requests
to authenticated;

grant update (
  brand_id,
  submitted_by,
  legal_entity_name,
  registration_number,
  director_name,
  id_type,
  id_number,
  website_domain,
  registered_address,
  document_path,
  status
)
on table public.verification_requests
to authenticated;

-- New public-schema objects must be opted into the Data API deliberately.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

commit;
