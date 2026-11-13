begin;

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table private.admin_allowlist (
  email text primary key,
  created_at timestamptz not null default now(),
  constraint admin_allowlist_email_lowercase check (email = lower(email))
);

revoke all on private.admin_allowlist from public, anon, authenticated;

insert into private.admin_allowlist (email)
values
  ('chilltech2k26@gmail.com'),
  ('lamidiabdulhameedolawale@gmail.com'),
  ('lamidiabdulhameedolawale21@gmail.com')
on conflict (email) do nothing;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_not_blank check (length(btrim(name)) between 2 and 80),
  constraint categories_slug_format check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  contact_name text not null default '',
  role text not null default 'brand_owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_valid check (role in ('brand_owner', 'admin')),
  constraint profiles_contact_name_length check (length(contact_name) <= 120)
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  slug text not null unique,
  brand_type text not null default 'small',
  category_slug text not null default 'other-businesses' references public.categories(slug) on update cascade,
  country text not null default 'Nigeria',
  city text not null default '',
  whatsapp text not null default '',
  phone text not null default '',
  website text not null default '',
  address text not null default '',
  delivery_info text not null default '',
  response_speed text not null default '',
  short_description text not null default '',
  full_description text not null default '',
  logo_url text not null default '',
  cover_url text not null default '',
  registration_number text not null default '',
  verification_status text not null default 'unverified',
  status text not null default 'active',
  socials jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brands_name_not_blank check (length(btrim(name)) between 2 and 120),
  constraint brands_slug_format check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint brands_brand_type_valid check (brand_type in ('small', 'corporate')),
  constraint brands_verification_status_valid check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  constraint brands_status_valid check (status in ('active', 'suspended', 'archived')),
  constraint brands_description_lengths check (length(short_description) <= 280 and length(full_description) <= 5000)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  title text not null,
  description text not null default '',
  price numeric(12, 2) not null default 0,
  currency text not null default 'USD',
  availability text not null default 'in_stock',
  lead_time text not null default '',
  label text not null default '',
  specifications jsonb not null default '{}'::jsonb,
  image_url text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_title_not_blank check (length(btrim(title)) between 2 and 160),
  constraint products_description_length check (length(description) <= 5000),
  constraint products_price_nonnegative check (price >= 0),
  constraint products_currency_usd check (currency = 'USD'),
  constraint products_availability_valid check (availability in ('in_stock', 'out_of_stock', 'preorder', 'service'))
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  content text not null,
  image_url text not null default '',
  link_url text not null default '',
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_content_not_blank check (length(btrim(content)) between 1 and 5000),
  constraint posts_status_valid check (status in ('published', 'draft', 'hidden'))
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_brand_id uuid references public.brands(id) on delete set null,
  content text not null,
  moderation_status text not null default 'approved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comments_content_not_blank check (length(btrim(content)) between 1 and 1500),
  constraint comments_moderation_status_valid check (moderation_status in ('approved', 'pending', 'hidden'))
);

create table public.follows (
  brand_id uuid not null references public.brands(id) on delete cascade,
  follower_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (brand_id, follower_id)
);

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  type text not null,
  message text not null,
  link text not null default '',
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint notifications_type_valid check (type in ('follow', 'like', 'comment', 'verification', 'moderation', 'system')),
  constraint notifications_message_length check (length(message) between 1 and 500)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  details text not null default '',
  status text not null default 'pending',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint reports_target_type_valid check (target_type in ('brand', 'post', 'comment')),
  constraint reports_reason_valid check (reason in ('spam', 'impersonation', 'inappropriate', 'harassment', 'copyright', 'other')),
  constraint reports_status_valid check (status in ('pending', 'resolved', 'dismissed')),
  constraint reports_details_length check (length(details) <= 3000)
);

create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  submitted_by uuid not null references auth.users(id) on delete cascade,
  legal_entity_name text not null,
  registration_number text not null,
  director_name text not null default '',
  id_type text not null default 'cac_cert',
  id_number text not null default '',
  website_domain text not null default '',
  registered_address text not null default '',
  document_path text not null default '',
  status text not null default 'pending',
  review_notes text not null default '',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint verification_requests_status_valid check (status in ('pending', 'approved', 'rejected')),
  constraint verification_requests_id_type_valid check (id_type in ('nin', 'passport', 'cac_cert', 'drivers_license', 'tax_id'))
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text not null default '',
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index categories_active_sort_idx on public.categories (is_active, sort_order);
create index brands_status_created_idx on public.brands (status, created_at desc);
create index brands_category_status_idx on public.brands (category_slug, status);
create index brands_country_city_idx on public.brands (country, city);
create index products_brand_created_idx on public.products (brand_id, created_at desc);
create index posts_brand_created_idx on public.posts (brand_id, created_at desc);
create index posts_published_created_idx on public.posts (created_at desc) where status = 'published';
create index comments_post_created_idx on public.comments (post_id, created_at);
create index comments_author_id_idx on public.comments (author_id);
create index comments_author_brand_id_idx on public.comments (author_brand_id) where author_brand_id is not null;
create index follows_follower_id_idx on public.follows (follower_id);
create index post_likes_user_id_idx on public.post_likes (user_id);
create index notifications_recipient_read_created_idx on public.notifications (recipient_id, is_read, created_at desc);
create index reports_reporter_id_idx on public.reports (reporter_id);
create index reports_pending_created_idx on public.reports (created_at) where status = 'pending';
create index reports_reviewed_by_idx on public.reports (reviewed_by) where reviewed_by is not null;
create index verification_requests_brand_created_idx on public.verification_requests (brand_id, created_at desc);
create index verification_requests_submitted_by_idx on public.verification_requests (submitted_by);
create index verification_requests_pending_created_idx on public.verification_requests (created_at) where status = 'pending';
create index verification_requests_reviewed_by_idx on public.verification_requests (reviewed_by) where reviewed_by is not null;
create index audit_logs_actor_created_idx on public.audit_logs (actor_id, created_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function private.set_updated_at() from public, anon, authenticated;

create trigger categories_set_updated_at before update on public.categories
for each row execute function private.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger brands_set_updated_at before update on public.brands
for each row execute function private.set_updated_at();
create trigger products_set_updated_at before update on public.products
for each row execute function private.set_updated_at();
create trigger posts_set_updated_at before update on public.posts
for each row execute function private.set_updated_at();
create trigger comments_set_updated_at before update on public.comments
for each row execute function private.set_updated_at();
create trigger verification_requests_set_updated_at before update on public.verification_requests
for each row execute function private.set_updated_at();

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke execute on function private.is_admin() from public, anon, authenticated;
grant execute on function private.is_admin() to authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_category text;
  safe_category text;
  safe_slug text;
  safe_brand_type text;
begin
  insert into public.profiles (id, contact_name, role)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'contact_name', ''), 120),
    case
      when exists (
        select 1 from private.admin_allowlist
        where email = lower(coalesce(new.email, ''))
      ) then 'admin'
      else 'brand_owner'
    end
  );

  if nullif(btrim(new.raw_user_meta_data ->> 'brand_name'), '') is not null then
    requested_category := coalesce(nullif(new.raw_user_meta_data ->> 'category_slug', ''), 'other-businesses');
    select slug into safe_category
    from public.categories
    where slug = requested_category and is_active = true;
    safe_category := coalesce(safe_category, 'other-businesses');

    safe_slug := regexp_replace(lower(coalesce(new.raw_user_meta_data ->> 'brand_slug', '')), '[^a-z0-9]+', '-', 'g');
    safe_slug := trim(both '-' from safe_slug);
    if safe_slug = '' then
      safe_slug := 'brand-' || substr(replace(new.id::text, '-', ''), 1, 12);
    end if;

    safe_brand_type := case
      when new.raw_user_meta_data ->> 'brand_type' in ('corporate', 'enterprise') then 'corporate'
      else 'small'
    end;

    insert into public.brands (
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
      short_description,
      registration_number,
      verification_status
    )
    values (
      new.id,
      left(btrim(new.raw_user_meta_data ->> 'brand_name'), 120),
      safe_slug,
      safe_brand_type,
      safe_category,
      left(coalesce(nullif(new.raw_user_meta_data ->> 'country', ''), 'Nigeria'), 120),
      left(coalesce(new.raw_user_meta_data ->> 'city', ''), 120),
      left(coalesce(new.raw_user_meta_data ->> 'whatsapp', ''), 80),
      left(coalesce(new.raw_user_meta_data ->> 'phone', ''), 80),
      left(coalesce(new.raw_user_meta_data ->> 'website', ''), 500),
      left(coalesce(new.raw_user_meta_data ->> 'short_description', ''), 280),
      left(coalesce(new.raw_user_meta_data ->> 'registration_number', ''), 120),
      case
        when safe_brand_type = 'corporate'
          and nullif(btrim(new.raw_user_meta_data ->> 'registration_number'), '') is not null
          then 'pending'
        else 'unverified'
      end
    );
  end if;

  return new;
end;
$$;

revoke execute on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.notify_on_follow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient uuid;
  actor_name text;
  brand_slug text;
begin
  select owner_id, slug into recipient, brand_slug
  from public.brands where id = new.brand_id;

  if recipient is null or recipient = new.follower_id then
    return new;
  end if;

  select name into actor_name from public.brands where owner_id = new.follower_id;
  insert into public.notifications (recipient_id, actor_id, type, message, link)
  values (
    recipient,
    new.follower_id,
    'follow',
    coalesce(actor_name, 'A brand') || ' started following your brand.',
    '/brand/' || coalesce(brand_slug, '')
  );
  return new;
end;
$$;

create or replace function private.notify_on_like()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient uuid;
  actor_name text;
begin
  select b.owner_id into recipient
  from public.posts p
  join public.brands b on b.id = p.brand_id
  where p.id = new.post_id;

  if recipient is null or recipient = new.user_id then
    return new;
  end if;

  select name into actor_name from public.brands where owner_id = new.user_id;
  insert into public.notifications (recipient_id, actor_id, type, message, link)
  values (
    recipient,
    new.user_id,
    'like',
    coalesce(actor_name, 'A brand') || ' liked your post.',
    '/post/' || new.post_id::text
  );
  return new;
end;
$$;

create or replace function private.notify_on_comment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient uuid;
  actor_name text;
begin
  select b.owner_id into recipient
  from public.posts p
  join public.brands b on b.id = p.brand_id
  where p.id = new.post_id;

  if recipient is null or recipient = new.author_id then
    return new;
  end if;

  select name into actor_name from public.brands where owner_id = new.author_id;
  insert into public.notifications (recipient_id, actor_id, type, message, link)
  values (
    recipient,
    new.author_id,
    'comment',
    coalesce(actor_name, 'A brand') || ' commented on your post.',
    '/post/' || new.post_id::text
  );
  return new;
end;
$$;

revoke execute on function private.notify_on_follow() from public, anon, authenticated;
revoke execute on function private.notify_on_like() from public, anon, authenticated;
revoke execute on function private.notify_on_comment() from public, anon, authenticated;

create trigger follows_notify_after_insert after insert on public.follows
for each row execute function private.notify_on_follow();
create trigger post_likes_notify_after_insert after insert on public.post_likes
for each row execute function private.notify_on_like();
create trigger comments_notify_after_insert after insert on public.comments
for each row execute function private.notify_on_comment();

alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.post_likes enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.verification_requests enable row level security;
alter table public.audit_logs enable row level security;

create policy "categories are public"
on public.categories for select
to anon, authenticated
using (is_active = true);

create policy "admins read inactive categories"
on public.categories for select
to authenticated
using ((select private.is_admin()));

create policy "admins manage categories"
on public.categories for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "users read own profile"
on public.profiles for select
to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));

create policy "users update own profile"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "public reads active brands"
on public.brands for select
to anon
using (status = 'active');

create policy "authenticated reads active or owned brands"
on public.brands for select
to authenticated
using (status = 'active' or owner_id = (select auth.uid()) or (select private.is_admin()));

create policy "users create own brand"
on public.brands for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and status = 'active'
  and verification_status in ('unverified', 'pending')
);

create policy "users update own brand"
on public.brands for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy "public reads products from active brands"
on public.products for select
to anon
using (exists (
  select 1 from public.brands b
  where b.id = products.brand_id and b.status = 'active'
));

create policy "authenticated reads products"
on public.products for select
to authenticated
using (exists (
  select 1 from public.brands b
  where b.id = products.brand_id
    and (b.status = 'active' or b.owner_id = (select auth.uid()) or (select private.is_admin()))
));

create policy "brand owners create products"
on public.products for insert
to authenticated
with check (exists (
  select 1 from public.brands b
  where b.id = products.brand_id and b.owner_id = (select auth.uid())
));

create policy "brand owners update products"
on public.products for update
to authenticated
using (exists (
  select 1 from public.brands b
  where b.id = products.brand_id and b.owner_id = (select auth.uid())
))
with check (exists (
  select 1 from public.brands b
  where b.id = products.brand_id and b.owner_id = (select auth.uid())
));

create policy "brand owners delete products"
on public.products for delete
to authenticated
using (exists (
  select 1 from public.brands b
  where b.id = products.brand_id and (b.owner_id = (select auth.uid()) or (select private.is_admin()))
));

create policy "public reads published posts"
on public.posts for select
to anon
using (status = 'published');

create policy "authenticated reads posts"
on public.posts for select
to authenticated
using (
  status = 'published'
  or exists (
    select 1 from public.brands b
    where b.id = posts.brand_id and b.owner_id = (select auth.uid())
  )
  or (select private.is_admin())
);

create policy "brand owners create posts"
on public.posts for insert
to authenticated
with check (exists (
  select 1 from public.brands b
  where b.id = posts.brand_id and b.owner_id = (select auth.uid())
));

create policy "brand owners update posts"
on public.posts for update
to authenticated
using (
  exists (
    select 1 from public.brands b
    where b.id = posts.brand_id and b.owner_id = (select auth.uid())
  ) or (select private.is_admin())
)
with check (
  exists (
    select 1 from public.brands b
    where b.id = posts.brand_id and b.owner_id = (select auth.uid())
  ) or (select private.is_admin())
);

create policy "brand owners delete posts"
on public.posts for delete
to authenticated
using (
  exists (
    select 1 from public.brands b
    where b.id = posts.brand_id and b.owner_id = (select auth.uid())
  ) or (select private.is_admin())
);

create policy "public reads approved comments"
on public.comments for select
to anon
using (moderation_status = 'approved');

create policy "authenticated reads comments"
on public.comments for select
to authenticated
using (moderation_status = 'approved' or author_id = (select auth.uid()) or (select private.is_admin()));

create policy "users create own comments"
on public.comments for insert
to authenticated
with check (
  author_id = (select auth.uid())
  and moderation_status = 'approved'
  and (
    author_brand_id is null
    or exists (
      select 1 from public.brands b
      where b.id = comments.author_brand_id and b.owner_id = (select auth.uid())
    )
  )
);

create policy "users delete own comments"
on public.comments for delete
to authenticated
using (author_id = (select auth.uid()) or (select private.is_admin()));

create policy "follows are public"
on public.follows for select
to anon, authenticated
using (true);

create policy "users follow as themselves"
on public.follows for insert
to authenticated
with check (follower_id = (select auth.uid()));

create policy "users remove own follows"
on public.follows for delete
to authenticated
using (follower_id = (select auth.uid()));

create policy "post likes are public"
on public.post_likes for select
to anon, authenticated
using (true);

create policy "users like as themselves"
on public.post_likes for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "users remove own likes"
on public.post_likes for delete
to authenticated
using (user_id = (select auth.uid()));

create policy "users read own notifications"
on public.notifications for select
to authenticated
using (recipient_id = (select auth.uid()));

create policy "users update own notifications"
on public.notifications for update
to authenticated
using (recipient_id = (select auth.uid()))
with check (recipient_id = (select auth.uid()));

create policy "users submit reports"
on public.reports for insert
to authenticated
with check (reporter_id = (select auth.uid()) and status = 'pending');

create policy "users read own reports"
on public.reports for select
to authenticated
using (reporter_id = (select auth.uid()) or (select private.is_admin()));

create policy "admins update reports"
on public.reports for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "owners read verification requests"
on public.verification_requests for select
to authenticated
using (submitted_by = (select auth.uid()) or (select private.is_admin()));

create policy "owners submit verification requests"
on public.verification_requests for insert
to authenticated
with check (
  submitted_by = (select auth.uid())
  and status = 'pending'
  and exists (
    select 1 from public.brands b
    where b.id = verification_requests.brand_id and b.owner_id = (select auth.uid())
  )
);

create policy "owners update pending verification requests"
on public.verification_requests for update
to authenticated
using (
  submitted_by = (select auth.uid())
  and status = 'pending'
)
with check (
  submitted_by = (select auth.uid())
  and status = 'pending'
);

create policy "admins update verification requests"
on public.verification_requests for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "admins read audit logs"
on public.audit_logs for select
to authenticated
using ((select private.is_admin()));

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.brands, public.products, public.posts, public.comments, public.follows, public.post_likes to anon;
grant select on public.categories, public.profiles, public.brands, public.products, public.posts, public.comments, public.follows, public.post_likes, public.notifications, public.reports, public.verification_requests, public.audit_logs to authenticated;
grant insert, update, delete on public.categories to authenticated;
grant update (contact_name) on public.profiles to authenticated;
grant insert on public.brands to authenticated;
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
) on public.brands to authenticated;
grant insert, update, delete on public.products, public.posts to authenticated;
grant insert, delete on public.comments, public.follows, public.post_likes to authenticated;
grant update (is_read) on public.notifications to authenticated;
grant insert, update on public.reports, public.verification_requests to authenticated;

create or replace function public.admin_set_brand_verification(target_brand_id uuid, new_status text)
returns public.brands
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.brands;
begin
  if not (select private.is_admin()) then
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

create or replace function public.admin_set_brand_status(target_brand_id uuid, new_status text)
returns public.brands
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.brands;
begin
  if not (select private.is_admin()) then
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

create or replace function public.admin_resolve_report(target_report_id uuid, new_status text)
returns public.reports
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.reports;
begin
  if not (select private.is_admin()) then
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

revoke execute on function public.admin_set_brand_verification(uuid, text) from public, anon, authenticated;
revoke execute on function public.admin_set_brand_status(uuid, text) from public, anon, authenticated;
revoke execute on function public.admin_resolve_report(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_set_brand_verification(uuid, text) to authenticated;
grant execute on function public.admin_set_brand_status(uuid, text) to authenticated;
grant execute on function public.admin_resolve_report(uuid, text) to authenticated;

insert into public.categories (name, slug, description, sort_order)
values
  ('Technology', 'technology', 'Software, hardware, digital products, and technology services.', 10),
  ('Fashion & Apparel', 'fashion-and-apparel', 'Clothing, footwear, accessories, textiles, and fashion labels.', 20),
  ('Food & Beverage', 'food-and-beverage', 'Food producers, restaurants, packaged goods, and beverage brands.', 30),
  ('Beauty & Personal Care', 'beauty-and-personal-care', 'Skincare, cosmetics, grooming, wellness, and personal care.', 40),
  ('Real Estate', 'real-estate', 'Property development, brokerage, facilities, and built-environment services.', 50),
  ('Finance & Professional Services', 'finance-and-professional-services', 'Financial, legal, consulting, accounting, and business services.', 60),
  ('Health & Wellness', 'health-and-wellness', 'Healthcare, fitness, wellness, medical, and pharmaceutical brands.', 70),
  ('Education & Training', 'education-and-training', 'Schools, learning platforms, training providers, and education products.', 80),
  ('Media & Entertainment', 'media-and-entertainment', 'Publishing, film, music, events, creators, and entertainment businesses.', 90),
  ('Travel & Hospitality', 'travel-and-hospitality', 'Hotels, tourism, travel services, experiences, and hospitality brands.', 100),
  ('Retail & E-commerce', 'retail-and-ecommerce', 'Retailers, online stores, marketplaces, and consumer commerce brands.', 110),
  ('Logistics & Transportation', 'logistics-and-transportation', 'Delivery, freight, mobility, warehousing, and transport services.', 120),
  ('Other Businesses', 'other-businesses', 'Commercial brands and services that do not fit another category.', 999)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    sort_order = excluded.sort_order,
    is_active = true;

insert into public.profiles (id, contact_name, role)
select
  users.id,
  left(coalesce(users.raw_user_meta_data ->> 'contact_name', ''), 120),
  'admin'
from auth.users as users
join private.admin_allowlist as allowed
  on allowed.email = lower(coalesce(users.email, ''))
on conflict (id) do update
set role = 'admin';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('brand-media', 'brand-media', true, 5242880, array['image/webp', 'image/jpeg', 'image/png']),
  ('verification-documents', 'verification-documents', false, 8388608, array['image/webp', 'image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "public reads brand media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'brand-media');

create policy "users upload own brand media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'brand-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "users update own brand media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'brand-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'brand-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "users delete own brand media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'brand-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "users upload own verification documents"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'verification-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "users read own verification documents"
on storage.objects for select
to authenticated
using (
  bucket_id = 'verification-documents'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or (select private.is_admin())
  )
);

create policy "users update own verification documents"
on storage.objects for update
to authenticated
using (
  bucket_id = 'verification-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'verification-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "users delete own verification documents"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'verification-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

commit;
