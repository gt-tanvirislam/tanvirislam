# Tanvir Islam Portfolio — Setup Guide

## Tech Stack
- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Media:** Cloudinary (images) + YouTube Unlisted (videos)
- **Hosting:** Vercel

---

## Step 1 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Name it `tanvir-portfolio`, choose a strong password
3. Wait for project to initialize (~2 min)
4. Go to **SQL Editor** → paste entire contents of `schema.sql` → **Run**
5. Go to **Settings → API** → copy:
   - `Project URL` → looks like `https://abcxyz.supabase.co`
   - `anon / public` key → long JWT string

---

## Step 2 — Configure Supabase Credentials

Open `assets/js/supabase.js` and replace lines 12–13:

```js
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_PUBLIC_KEY';
```

Replace with your actual values from Step 1.

---

## Step 3 — Create Admin User in Supabase

1. In Supabase → **Authentication → Users → Add User**
2. Email: `2023.tanvirislam@gmail.com`
3. Set a strong password
4. Click **Create User**

> The dashboard login will only work with this exact email.

---

## Step 4 — Cloudinary Setup (Image Hosting)

1. Sign up free at [cloudinary.com](https://cloudinary.com)
2. Go to **Dashboard** → copy your **Cloud name**
3. To upload images: **Media Library → Upload**
4. After upload, click image → **Copy URL**
5. Paste URLs into:
   - Dashboard → Portfolio → Thumbnail URL field
   - Dashboard → Blog Posts → Featured Image URL field

---

## Step 5 — Deploy to Vercel

### Option A: Vercel CLI
```bash
npm i -g vercel
cd tanvir-portfolio
vercel --prod
```

### Option B: Vercel Dashboard
1. Push project to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. Framework: **Other** (static site)
5. Click **Deploy**

---

## Step 6 — Update sitemap.xml

Replace `tanvirislam.vercel.app` in `sitemap.xml` with your actual domain.

---

## Dashboard Access

- URL: `https://yourdomain.com/dashboard/login.html`
- Email: `2023.tanvirislam@gmail.com`
- Password: set in Step 3

### Dashboard Sections:
| Section | What you can do |
|---------|----------------|
| Overview | See stats, recent messages & projects |
| Portfolio | Add / edit / delete projects |
| Add Project | Form with title, category, thumbnail, video URL |
| Blog Posts | Manage all blog posts |
| New Post | Write post with HTML content |
| Messages | Read contact form submissions |
| Testimonials | Add / edit / delete reviews |
| Homepage | Edit hero text, stats, social links |
| SEO | Edit meta title, description, OG image |

---

## Adding Portfolio Projects

1. Login → **Add Project**
2. Fill in: Title, Category, Description
3. Paste Cloudinary URL into Thumbnail field
4. For videos: paste YouTube embed URL (`https://www.youtube.com/embed/VIDEO_ID`)
5. Toggle **Featured** to show on homepage
6. Toggle **Published** to make it live
7. Click **Save Project**

---

## Adding Blog Posts

1. Login → **New Post**
2. Write content as HTML in the Content field
3. Toggle **Publish** to make it live
4. Toggle **Featured** to show as the featured post on the blog page

---

## File Structure

```
tanvir-portfolio/
├── index.html              # Homepage
├── about.html              # About page
├── services.html           # Services + FAQ
├── portfolio.html          # Dynamic portfolio with filter
├── pricing.html            # Pricing plans
├── testimonials.html       # Client reviews
├── blog.html               # Blog listing
├── post.html               # Single blog post (dynamic via ?slug=)
├── contact.html            # Contact form → saves to Supabase
├── faq.html                # Redirects to services.html#faq
├── style.css               # Global styles (Space Grotesk + Plus Jakarta Sans)
├── script.js               # Core animations (typing, scroll reveal, FAQ, etc.)
├── schema.sql              # Complete Supabase database schema — run once
├── vercel.json             # Vercel deployment config
├── robots.txt              # SEO crawler rules
├── sitemap.xml             # SEO sitemap — update domain
├── assets/
│   └── js/
│       ├── supabase.js     # ← ADD YOUR KEYS HERE — Supabase client + all DB helpers
│       └── dynamic.js      # Frontend dynamic loader (projects, blog, testimonials, contact)
└── dashboard/
    ├── login.html          # Admin login page
    ├── index.html          # Admin dashboard (all sections)
    ├── dashboard.css       # Dashboard styles
    └── dashboard.js        # Dashboard logic (CRUD for all entities)
```

---

## Fallback Behaviour

If Supabase is not configured or unreachable, the site gracefully falls back:
- Portfolio page shows "No projects found" state
- Blog page shows "No posts found" state  
- Contact form shows an error toast directing users to email directly
- All static content (nav, footer, pricing, services) continues to work normally

---

## Environment Notes

- **No server required** — 100% static frontend
- **No build step** — just HTML/CSS/JS
- **Free tier** — Supabase free tier is generous enough for a portfolio
- **Supabase anon key is safe** to expose — RLS policies protect all sensitive data
