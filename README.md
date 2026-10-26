# Tanvir.Studio website + admin dashboard

Static website (HTML, CSS, JavaScript) powered by **Supabase** (database, login, image storage),
hosted free on **Vercel** from a **GitHub** repository. No build step is needed on Vercel.

What you can control from the dashboard (`/admin/`):
- **About page**: skills (with levels), education, experience and achievements, plus your intro video link in Settings
- **Gallery**: upload tour and achievement photos (many at once) for the bottom of the About page
- **Page content**: every heading, paragraph, button and link text on every page, plus the Google title and description of each page
- **Blog**: write with a visual editor, add as many images as you like (each with a description for SEO), upload a cover image, publish, schedule, edit or delete articles. A live SEO checklist shows what to improve before you publish
- **Portfolio**: add, edit, reorder, hide or delete projects (YouTube, Google Drive, Cloudinary, Vimeo or uploaded images)
- **Pricing** packages and **FAQs** (choose which pages show each question)
- **Messages** from the contact form (status, notes, reply, delete)
- **Settings**: email, WhatsApp, phone, address and map, Facebook / Instagram / LinkedIn / YouTube links, home page video, About photo
- **Media**: upload images and copy their links

---------------------------------------------------------------------

## Step 1: Create the Supabase project (free)
1. Go to supabase.com, sign in, click **New project**. Choose a strong database password and a region close to you.
2. Open **SQL Editor** > **New query**. Paste all of `supabase/01_schema.sql` and press **Run**.
3. Open a new query, paste all of `supabase/02_seed.sql` and press **Run** (adds demo portfolio, pricing, FAQs and 4 blog posts).
4. Open **Authentication** > **Users** > **Add user** > **Create new user**.
   Email: `tanvirislam.studio@gmail.com`, choose a strong password, tick **Auto Confirm User**.
5. Open **Authentication** > **Sign In / Providers** (or Settings) and turn **OFF** "Allow new users to sign up".
   (Even if left on, only the email in the `admins` table can change anything.)
6. Open **Project Settings** > **API**. Copy the **Project URL** and the **anon public** key.
7. Open `assets/js/config.js` and paste both values. Never use the `service_role` key anywhere.

To allow another person to use the dashboard: create their user in step 4, then in **Table Editor** > `admins` add their email.

## Step 2: Put the project on GitHub
1. Create a new repository on github.com (private is fine).
2. Click **uploading an existing file** and drag the whole project folder contents in
   (keep the folders `admin`, `api`, `assets`, `lib`, `build`, `supabase`; `vercel.json` and the `.html` files must be in the top level). Commit.

## Step 3: Deploy on Vercel (free)
1. Go to vercel.com > **Add New** > **Project** > import your GitHub repository.
2. Framework Preset: **Other**. Leave Build Command and Output Directory empty. Click **Deploy**.
3. Your site is live. The dashboard is at `https://YOUR-SITE.vercel.app/admin/`.
4. Every time you change a file on GitHub, Vercel redeploys automatically.
   Content you change in the dashboard is live immediately without any redeploy.

## Step 4: Contact form emails
Messages from the contact form are saved in the dashboard (Messages) **and** emailed to `tanvirislam.studio@gmail.com` through FormSubmit.
One time only: after the site is live, send one test message from the contact page, then open the activation email
from FormSubmit in Gmail and click the confirm button. All later messages arrive in your inbox.

## Step 5: Your own domain (optional)
Vercel project > **Settings** > **Domains** > add your domain and follow the DNS steps.
Canonical links, sitemap and robots.txt adapt to the domain automatically.
Optionally open `build/build.py`, set `SITE_URL`, and run `python3 -m pip install beautifulsoup4 && python3 build/build.py` to bake the domain into the HTML files.

---------------------------------------------------------------------

## Home page typing headline
Dashboard > Page content > Home > "Words that type out in the headline". Separate phrases with the | symbol.
The first words ("We make") are a normal text field in the same list.

## Already created the database earlier?
If you ran an older `01_schema.sql`, run the new `01_schema.sql` again. It is safe to repeat and only adds the new parts
(About page items, Gallery, blog cover description). You do not need to run `02_seed.sql` again.

## How content works
- Text on the pages ships with defaults inside the HTML. Dashboard edits are stored in Supabase and applied on top, so the site still works if Supabase is unreachable.
- Blog articles are rendered on the server at `/blog/your-slug` (good for Google and social sharing). `/sitemap.xml` and `/robots.txt` are generated automatically and include every published article.
- If you add new pages or new text blocks in the HTML later, run `python3 build/build.py` again so the dashboard can list the new text.

## Good to know
- Supabase free projects pause after about 7 days without any activity. Visiting your site or the dashboard once a week keeps it awake. If it pauses, click **Restore** in the Supabase dashboard.
- Google Drive videos must be shared as "Anyone with the link" or visitors will see a permission error.
- Free Vercel and Supabase plans have usage limits that are very generous for a studio website.
- The sample portfolio links (YouTube open movies and Cloudinary demo images), prices and statistics are demos. Replace them in the dashboard.
