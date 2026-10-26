-- =====================================================================
-- Tanvir.Studio CMS | Supabase schema (run this FIRST in the SQL Editor)
-- Safe to run more than once.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Admin allow list. Only these emails can change anything.
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  email text primary key
);
insert into public.admins (email) values ('tanvirislam.studio@gmail.com') on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Editable page text and site settings (key / value overrides)
-- ---------------------------------------------------------------------
create table if not exists public.site_content (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Portfolio
-- ---------------------------------------------------------------------
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('video', 'motion', 'design')),
  url text not null,
  thumb text not null default '',
  aspect text not null default '',
  description text not null default '',
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Blog
-- ---------------------------------------------------------------------
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  category text not null default 'General',
  cover_url text not null default '',
  cover_alt text not null default '',
  content text not null default '',
  read_time text not null default '',
  seo_title text not null default '',
  seo_description text not null default '',
  published boolean not null default false,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.blog_posts add column if not exists cover_alt text not null default '';

drop trigger if exists blog_posts_touch on public.blog_posts;
create trigger blog_posts_touch before update on public.blog_posts
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- FAQs and pricing
-- ---------------------------------------------------------------------
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  show_on text[] not null default array['home', 'services', 'pricing', 'contact'],
  sort_order integer not null default 0,
  published boolean not null default true
);

create table if not exists public.pricing_plans (
  id uuid primary key default gen_random_uuid(),
  service text not null check (service in ('video', 'motion', 'design')),
  name text not null,
  price numeric not null default 0,
  unit text not null default 'per project',
  description text not null default '',
  features text[] not null default '{}',
  is_popular boolean not null default false,
  sort_order integer not null default 0,
  published boolean not null default true
);

-- ---------------------------------------------------------------------
-- About page: skills, education, experience and achievements
-- ---------------------------------------------------------------------
create table if not exists public.about_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('skill', 'education', 'experience', 'achievement')),
  title text not null,
  subtitle text not null default '',
  period text not null default '',
  description text not null default '',
  level integer not null default 80 check (level between 0 and 100),
  sort_order integer not null default 0,
  published boolean not null default true
);

-- ---------------------------------------------------------------------
-- About page gallery (tour and achievement photos)
-- ---------------------------------------------------------------------
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text not null default '',
  category text not null default 'tour' check (category in ('tour', 'achievement')),
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Contact messages (inbox)
-- ---------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  email text not null check (char_length(email) between 3 and 320 and email like '%@%'),
  company text not null default '' check (char_length(company) <= 200),
  service text not null default '' check (char_length(service) <= 100),
  budget text not null default '' check (char_length(budget) <= 100),
  timeline text not null default '' check (char_length(timeline) <= 100),
  message text not null check (char_length(message) between 1 and 5000),
  status text not null default 'new' check (status in ('new', 'read', 'in_progress', 'completed', 'archived')),
  notes text not null default '' check (char_length(notes) <= 5000),
  created_at timestamptz not null default now()
);
create index if not exists messages_created_idx on public.messages (created_at desc);

-- ---------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.site_content enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.blog_posts enable row level security;
alter table public.faqs enable row level security;
alter table public.pricing_plans enable row level security;
alter table public.messages enable row level security;
alter table public.about_items enable row level security;
alter table public.gallery_items enable row level security;

-- admins: a signed in admin can see their own row (used by the dashboard login check)
drop policy if exists admins_self_read on public.admins;
create policy admins_self_read on public.admins for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- site_content: everyone reads, admin writes
drop policy if exists site_content_read on public.site_content;
create policy site_content_read on public.site_content for select to anon, authenticated using (true);
drop policy if exists site_content_admin on public.site_content;
create policy site_content_admin on public.site_content for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- portfolio_items
drop policy if exists portfolio_read on public.portfolio_items;
create policy portfolio_read on public.portfolio_items for select to anon, authenticated
  using (published or public.is_admin());
drop policy if exists portfolio_admin on public.portfolio_items;
create policy portfolio_admin on public.portfolio_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- blog_posts
drop policy if exists blog_read on public.blog_posts;
create policy blog_read on public.blog_posts for select to anon, authenticated
  using ((published and published_at <= now()) or public.is_admin());
drop policy if exists blog_admin on public.blog_posts;
create policy blog_admin on public.blog_posts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- faqs
drop policy if exists faqs_read on public.faqs;
create policy faqs_read on public.faqs for select to anon, authenticated
  using (published or public.is_admin());
drop policy if exists faqs_admin on public.faqs;
create policy faqs_admin on public.faqs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- pricing_plans
drop policy if exists plans_read on public.pricing_plans;
create policy plans_read on public.pricing_plans for select to anon, authenticated
  using (published or public.is_admin());
drop policy if exists plans_admin on public.pricing_plans;
create policy plans_admin on public.pricing_plans for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- about_items
drop policy if exists about_read on public.about_items;
create policy about_read on public.about_items for select to anon, authenticated
  using (published or public.is_admin());
drop policy if exists about_admin on public.about_items;
create policy about_admin on public.about_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- gallery_items
drop policy if exists gallery_read on public.gallery_items;
create policy gallery_read on public.gallery_items for select to anon, authenticated
  using (published or public.is_admin());
drop policy if exists gallery_admin on public.gallery_items;
create policy gallery_admin on public.gallery_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- messages: anyone can send one, only admin can read or manage
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert to anon, authenticated
  with check (status = 'new' and notes = '');
drop policy if exists messages_admin_read on public.messages;
create policy messages_admin_read on public.messages for select to authenticated using (public.is_admin());
drop policy if exists messages_admin_update on public.messages;
create policy messages_admin_update on public.messages for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists messages_admin_delete on public.messages;
create policy messages_admin_delete on public.messages for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
-- Storage: public "media" bucket for images, only admin can upload or delete
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4'])
on conflict (id) do update set public = true;

drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'media');
drop policy if exists media_admin_insert on storage.objects;
create policy media_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
drop policy if exists media_admin_update on storage.objects;
create policy media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
drop policy if exists media_admin_delete on storage.objects;
create policy media_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
