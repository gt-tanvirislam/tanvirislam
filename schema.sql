-- ============================================================
-- TANVIR ISLAM PORTFOLIO — SUPABASE DATABASE SCHEMA
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- ── EXTENSIONS ──
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: projects
-- ============================================================
create table if not exists projects (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  slug          text unique not null,
  description   text,
  category      text not null check (category in ('video-editing','motion-graphics','graphic-design','web-design')),
  thumbnail_url text,
  video_url     text,        -- YouTube embed URL or Google Drive embed
  live_url      text,
  tags          text[],
  featured      boolean default false,
  published     boolean default true,
  sort_order    integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── INDEX ──
create index if not exists projects_category_idx on projects(category);
create index if not exists projects_featured_idx on projects(featured);
create index if not exists projects_published_idx on projects(published);

-- ── TRIGGER: auto-update updated_at ──
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

-- ============================================================
-- TABLE: blog_posts
-- ============================================================
create table if not exists blog_posts (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  slug            text unique not null,
  excerpt         text,
  content         text,       -- HTML content
  featured_image  text,       -- Cloudinary URL
  category        text default 'general',
  tags            text[],
  seo_title       text,
  seo_description text,
  published       boolean default false,
  featured        boolean default false,
  views           integer default 0,
  read_time       integer default 5,  -- minutes
  published_at    timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists blog_slug_idx      on blog_posts(slug);
create index if not exists blog_published_idx on blog_posts(published);
create index if not exists blog_category_idx  on blog_posts(category);

create trigger blog_updated_at
  before update on blog_posts
  for each row execute function update_updated_at();

-- ============================================================
-- TABLE: testimonials
-- ============================================================
create table if not exists testimonials (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  role        text,
  company     text,
  country     text,
  avatar_url  text,
  rating      integer default 5 check (rating between 1 and 5),
  content     text not null,
  service     text,   -- which service they used
  featured    boolean default false,
  approved    boolean default true,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

create index if not exists testimonials_featured_idx on testimonials(featured);

-- ============================================================
-- TABLE: messages (contact form submissions)
-- ============================================================
create table if not exists messages (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null,
  phone       text,
  service     text,
  budget      text,
  message     text not null,
  status      text default 'unread' check (status in ('unread','read','replied','archived')),
  ip_address  text,
  created_at  timestamptz default now()
);

create index if not exists messages_status_idx on messages(status);
create index if not exists messages_created_idx on messages(created_at desc);

-- ============================================================
-- TABLE: settings (homepage & SEO controls)
-- ============================================================
create table if not exists settings (
  id          uuid primary key default uuid_generate_v4(),
  key         text unique not null,
  value       text,
  type        text default 'text'  -- text | json | boolean | number
);

-- ── Default settings ──
insert into settings (key, value, type) values
  ('hero_title',          'Tanvir Islam',                           'text'),
  ('hero_subtitle',       'Video Editor & Graphic Designer',        'text'),
  ('hero_description',    'Crafting cinematic stories and striking visuals that captivate audiences. Based in Dhaka, Bangladesh.', 'text'),
  ('hero_cta_primary',    'Hire Me',                                'text'),
  ('hero_cta_secondary',  'View Portfolio',                         'text'),
  ('email',               '2023.tanvirislam@gmail.com',             'text'),
  ('whatsapp',            '+8801785837362',                          'text'),
  ('location',            'Dhaka, Bangladesh',                       'text'),
  ('seo_title',           'Tanvir Islam | Video Editor & Graphic Designer', 'text'),
  ('seo_description',     'Professional Video Editor and Graphic Designer from Dhaka, Bangladesh. Expert in YouTube videos, reels, branding, and motion graphics.', 'text'),
  ('og_image',            '',                                        'text'),
  ('fb_url',              '#',                                       'text'),
  ('instagram_url',       '#',                                       'text'),
  ('linkedin_url',        '#',                                       'text'),
  ('youtube_url',         '#',                                       'text'),
  ('years_experience',    '5',                                       'number'),
  ('projects_done',       '150',                                     'number'),
  ('happy_clients',       '80',                                      'number')
on conflict (key) do nothing;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- PROJECTS: public can read published, admin can do everything
alter table projects enable row level security;

create policy "Public read published projects"
  on projects for select
  using (published = true);

create policy "Admin full access to projects"
  on projects for all
  using (auth.jwt() ->> 'email' = '2023.tanvirislam@gmail.com');

-- BLOG POSTS: public can read published
alter table blog_posts enable row level security;

create policy "Public read published blogs"
  on blog_posts for select
  using (published = true);

create policy "Admin full access to blogs"
  on blog_posts for all
  using (auth.jwt() ->> 'email' = '2023.tanvirislam@gmail.com');

-- TESTIMONIALS: public can read approved
alter table testimonials enable row level security;

create policy "Public read approved testimonials"
  on testimonials for select
  using (approved = true);

create policy "Admin full access to testimonials"
  on testimonials for all
  using (auth.jwt() ->> 'email' = '2023.tanvirislam@gmail.com');

-- MESSAGES: public can insert, only admin can read
alter table messages enable row level security;

create policy "Anyone can submit message"
  on messages for insert
  with check (true);

create policy "Admin can read messages"
  on messages for select
  using (auth.jwt() ->> 'email' = '2023.tanvirislam@gmail.com');

create policy "Admin can update messages"
  on messages for update
  using (auth.jwt() ->> 'email' = '2023.tanvirislam@gmail.com');

-- SETTINGS: public can read, admin can write
alter table settings enable row level security;

create policy "Public read settings"
  on settings for select
  using (true);

create policy "Admin can update settings"
  on settings for update
  using (auth.jwt() ->> 'email' = '2023.tanvirislam@gmail.com');

-- ============================================================
-- SAMPLE DATA — Projects
-- ============================================================
insert into projects (title, slug, description, category, thumbnail_url, video_url, tags, featured, published) values
(
  'Cinematic YouTube Channel Intro',
  'cinematic-youtube-intro',
  'A high-energy 10-second animated intro for a tech YouTube channel with 200K subscribers. Features particle effects, logo reveal, and cinematic colour grading.',
  'video-editing',
  'https://res.cloudinary.com/demo/image/upload/v1/portfolio/project1.jpg',
  '',
  array['YouTube', 'Cinematic', 'Color Grade'],
  true, true
),
(
  'Tech Startup Brand Identity',
  'tech-startup-brand',
  'Complete brand identity for a Dhaka-based SaaS startup — logo, colour palette, typography, business card, and social media kit.',
  'graphic-design',
  'https://res.cloudinary.com/demo/image/upload/v1/portfolio/project2.jpg',
  '',
  array['Branding', 'Logo', 'Identity'],
  true, true
),
(
  'Fashion Product Reel',
  'fashion-product-reel',
  'A 30-second beat-synced Instagram Reel for a fashion brand. Shot on iPhone, edited with dynamic transitions and colour grading.',
  'video-editing',
  'https://res.cloudinary.com/demo/image/upload/v1/portfolio/project3.jpg',
  '',
  array['Reels', 'Fashion', 'Social Media'],
  true, true
),
(
  'App Explainer Motion Video',
  'app-explainer-motion',
  '90-second 2D animated explainer video for a productivity app. Includes character animation, kinetic typography, and professional voiceover.',
  'motion-graphics',
  'https://res.cloudinary.com/demo/image/upload/v1/portfolio/project4.jpg',
  '',
  array['2D Animation', 'Explainer', 'After Effects'],
  true, true
),
(
  'Creative Agency Portfolio Site',
  'creative-agency-portfolio',
  'A premium portfolio website for a creative agency with smooth GSAP animations, dark theme, and a custom CMS.',
  'web-design',
  'https://res.cloudinary.com/demo/image/upload/v1/portfolio/project5.jpg',
  '',
  array['Web Design', 'GSAP', 'Dark Theme'],
  false, true
),
(
  'Restaurant Menu & Brand Kit',
  'restaurant-brand-kit',
  'Full brand kit for a Bangladeshi fusion restaurant — menu design, business cards, social media templates, and signage.',
  'graphic-design',
  'https://res.cloudinary.com/demo/image/upload/v1/portfolio/project6.jpg',
  '',
  array['Print', 'Branding', 'Menu Design'],
  false, true
)
on conflict (slug) do nothing;

-- ============================================================
-- SAMPLE DATA — Testimonials
-- ============================================================
insert into testimonials (name, role, company, country, rating, content, service, featured) values
('Ryan Carter',   'YouTuber',         'Self',            'USA',         5, 'Tanvir delivered an exceptional YouTube intro that perfectly captured my channel''s vibe. The quality was way beyond my expectations. Highly recommend!',             'video-editing',  true),
('Sakib Ahmed',   'Business Owner',   'TechDhaka BD',    'Bangladesh',  5, 'Amazing logo design and brand kit! Tanvir understood my brand vision immediately and executed it flawlessly. Will definitely work together again.',                  'graphic-design', true),
('Priya Kapoor',  'Brand Manager',    'StyleCo',         'India',       5, 'Professional, creative, and always delivers on time. My product ad videos got incredible engagement on Instagram. Tanvir is my go-to editor!',                        'video-editing',  true),
('Emma Thompson', 'Brand Consultant', 'BrandLab UK',     'UK',          5, 'He redesigned my entire brand from scratch and it all feels incredibly cohesive and premium. My clients noticed the difference immediately.',                          'graphic-design', true),
('Kenji Matsuda', 'E-commerce Owner', 'JapanShop',       'Japan',       5, 'Our product launch video got over 50K views in the first week! His understanding of pacing and music is impressive.',                                                  'video-editing',  true),
('Sofia Oliveira','Food YouTuber',    'Self',            'Brazil',      5, 'Tanvir has been editing all my videos for 6 months. Consistent quality, always on time, understands my style perfectly.',                                               'video-editing',  true),
('Nasrin Islam',  'Content Creator',  'Self',            'Bangladesh',  5, 'Subscriber count বেড়ে গেছে অনেক! দ্রুত deliver, চমৎকার quality। ধন্যবাদ Tanvir bhai!',                                                                                   'video-editing',  false),
('David Johnson', 'Podcast Host',     'TechTalks',       'Australia',   5, 'The logo animation Tanvir created for my podcast is stunning. My audience noticed the upgrade immediately.',                                                             'motion-graphics',false),
('Lucas Martinez','Travel Blogger',   'Self',            'Spain',       5, 'Working with Tanvir was a seamless experience despite the time zone difference. The travel video he edited was simply breathtaking.',                                   'video-editing',  false),
('Amira Wilson',  'Marketing Dir.',   'GrowthCo',        'Canada',      5, 'Engagement went up 65% within the first month. Professional quality at a very fair price.',                                                                              'graphic-design', false)
on conflict do nothing;

-- ============================================================
-- BLOG SAMPLE DATA
-- ============================================================
insert into blog_posts (title, slug, excerpt, category, tags, published, featured, read_time, published_at) values
(
  '10 Color Grading Secrets That Make Your Videos Look Cinematic',
  '10-color-grading-secrets',
  'Most people think cinematic color comes from expensive cameras. The truth? It''s 90% in the grade. Here are the exact techniques I use on every client video.',
  'video-editing',
  array['Color Grading', 'DaVinci Resolve', 'Cinematic', 'Tutorial'],
  true, true, 8,
  now() - interval '10 days'
),
(
  'How I Edit a YouTube Video in Under 4 Hours (Full Workflow)',
  'youtube-editing-workflow',
  'From raw footage to final export — my exact editing process step by step, including the keyboard shortcuts and plugins that save the most time.',
  'video-editing',
  array['YouTube', 'Workflow', 'Premiere Pro'],
  true, false, 6,
  now() - interval '25 days'
),
(
  '5 Logo Design Mistakes That Kill Your Brand',
  '5-logo-design-mistakes',
  'After designing 200+ logos, I''ve seen the same mistakes over and over. Here''s how to avoid them and create a logo that builds trust.',
  'graphic-design',
  array['Logo Design', 'Branding', 'Mistakes'],
  true, false, 5,
  now() - interval '40 days'
),
(
  'How I Landed My First International Client From Dhaka',
  'first-international-client',
  'My honest story of going from zero to working with clients in the USA and UK — the platforms I used, the mistakes I made, and what actually worked.',
  'freelancing',
  array['Freelancing', 'Client', 'Bangladesh'],
  true, false, 7,
  now() - interval '55 days'
)
on conflict (slug) do nothing;

-- ============================================================
-- DONE
-- ============================================================
-- Run this file once in Supabase SQL Editor.
-- Then set your SUPABASE_URL and SUPABASE_ANON_KEY in config.js
