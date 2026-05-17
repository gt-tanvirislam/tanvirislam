/* ============================================================
   SUPABASE CONFIG & DATABASE HELPERS
   assets/js/supabase.js
   
   SETUP:
   1. Create a project at supabase.com
   2. Go to Settings → API
   3. Copy your Project URL and anon key below
   4. Run schema.sql in Supabase SQL Editor
   ============================================================ */

// ── CONFIG — replace with your actual values ──
const SUPABASE_URL  = 'https://brggmsmvhtyjbofwqdsz.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZ2dtc212aHR5amJvZndxZHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NDgzNTIsImV4cCI6MjA5NDMyNDM1Mn0._vcoHc06WvrpXLeLwUEcDmgtJ2vc4IOvRhRuY0ykl4Y';

// ── INIT CLIENT ──
// Uses the Supabase CDN client (loaded via script tag in HTML)
let _supabase = null;

function getSupabase() {
  if (!_supabase) {
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return _supabase;
}

/* ============================================================
   AUTH HELPERS
   ============================================================ */

/**
 * Sign in with email + password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user, error}>}
 */
async function authSignIn(email, password) {
  const db = getSupabase();
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  return { user: data?.user, error };
}

/**
 * Sign out current user
 */
async function authSignOut() {
  const db = getSupabase();
  await db.auth.signOut();
  window.location.href = '../dashboard/login.html';
}

/**
 * Get current session user
 * @returns {Promise<object|null>}
 */
async function getAuthUser() {
  const db = getSupabase();
  const { data: { user } } = await db.auth.getUser();
  return user;
}

/**
 * Guard: redirect to login if not admin
 * Call at top of every dashboard page
 */
async function requireAdmin() {
  const user = await getAuthUser();
  const ADMIN_EMAIL = '2023.tanvirislam@gmail.com';
  if (!user || user.email !== ADMIN_EMAIL) {
    window.location.href = 'login.html';
  }
  return user;
}

/* ============================================================
   SETTINGS HELPERS
   ============================================================ */

/** Load all site settings as a key→value object */
async function getSettings() {
  const db = getSupabase();
  const { data, error } = await db.from('settings').select('key,value');
  if (error) { console.error('getSettings:', error); return {}; }
  return data.reduce((acc, row) => { acc[row.key] = row.value; return acc; }, {});
}

/** Update a single setting */
async function updateSetting(key, value) {
  const db = getSupabase();
  const { error } = await db.from('settings').update({ value }).eq('key', key);
  return { error };
}

/** Apply hero settings to homepage DOM */
async function applyHeroSettings() {
  const settings = await getSettings();
  const set = (sel, val) => { const el = document.querySelector(sel); if (el && val) el.textContent = val; };
  const setAttr = (sel, attr, val) => { const el = document.querySelector(sel); if (el && val) el.setAttribute(attr, val); };

  // Hero text
  const nameLine = document.querySelector('.hero-title .name-line');
  if (nameLine && settings.hero_title) nameLine.textContent = settings.hero_title;

  const heroDesc = document.querySelector('.hero-desc');
  if (heroDesc && settings.hero_description) heroDesc.textContent = settings.hero_description;

  // SEO
  if (settings.seo_title)       document.title = settings.seo_title;
  if (settings.seo_description) setAttr('meta[name="description"]', 'content', settings.seo_description);

  // Social links
  const socialMap = {
    '.footer-social a:nth-child(1)': settings.fb_url,
    '.footer-social a:nth-child(2)': settings.instagram_url,
    '.footer-social a:nth-child(3)': settings.linkedin_url,
    '.footer-social a:nth-child(4)': settings.youtube_url,
  };
  Object.entries(socialMap).forEach(([sel, url]) => {
    if (url && url !== '#') setAttr(sel, 'href', url);
  });
}

/* ============================================================
   PROJECTS HELPERS
   ============================================================ */

/**
 * Fetch published projects
 * @param {object} opts - { category, featured, limit, search }
 */
async function getProjects(opts = {}) {
  const db = getSupabase();
  let q = db.from('projects').select('*').eq('published', true).order('sort_order').order('created_at', { ascending: false });

  if (opts.category && opts.category !== 'all') q = q.eq('category', opts.category);
  if (opts.featured)                             q = q.eq('featured', true);
  if (opts.limit)                                q = q.limit(opts.limit);
  if (opts.search) {
    q = q.or(`title.ilike.%${opts.search}%,description.ilike.%${opts.search}%`);
  }

  const { data, error } = await q;
  if (error) { console.error('getProjects:', error); return []; }
  return data;
}

/** Get a single project by slug */
async function getProject(slug) {
  const db = getSupabase();
  const { data, error } = await db.from('projects').select('*').eq('slug', slug).single();
  if (error) { console.error('getProject:', error); return null; }
  return data;
}

/** Admin: get ALL projects (including unpublished) */
async function adminGetProjects() {
  const db = getSupabase();
  const { data, error } = await db.from('projects').select('*').order('created_at', { ascending: false });
  if (error) { console.error('adminGetProjects:', error); return []; }
  return data;
}

/** Admin: upsert project */
async function adminSaveProject(project) {
  const db = getSupabase();
  const { data, error } = await db.from('projects').upsert(project, { onConflict: 'id' }).select().single();
  return { data, error };
}

/** Admin: delete project */
async function adminDeleteProject(id) {
  const db = getSupabase();
  const { error } = await db.from('projects').delete().eq('id', id);
  return { error };
}

/* ============================================================
   BLOG HELPERS
   ============================================================ */

/**
 * Fetch published blog posts
 * @param {object} opts - { category, featured, limit, search, exclude }
 */
async function getPosts(opts = {}) {
  const db = getSupabase();
  let q = db.from('blog_posts').select('*').eq('published', true).order('published_at', { ascending: false });

  if (opts.category && opts.category !== 'all') q = q.eq('category', opts.category);
  if (opts.featured)  q = q.eq('featured', true);
  if (opts.limit)     q = q.limit(opts.limit);
  if (opts.exclude)   q = q.neq('id', opts.exclude);
  if (opts.search) {
    q = q.or(`title.ilike.%${opts.search}%,excerpt.ilike.%${opts.search}%`);
  }

  const { data, error } = await q;
  if (error) { console.error('getPosts:', error); return []; }
  return data;
}

/** Get single post by slug + increment views */
async function getPost(slug) {
  const db = getSupabase();
  const { data, error } = await db.from('blog_posts').select('*').eq('slug', slug).eq('published', true).single();
  if (error) { console.error('getPost:', error); return null; }

  // Increment views (fire and forget)
  db.from('blog_posts').update({ views: (data.views || 0) + 1 }).eq('id', data.id);
  return data;
}

/** Admin: get ALL posts */
async function adminGetPosts() {
  const db = getSupabase();
  const { data, error } = await db.from('blog_posts').select('*').order('created_at', { ascending: false });
  if (error) { console.error('adminGetPosts:', error); return []; }
  return data;
}

/** Admin: upsert post */
async function adminSavePost(post) {
  const db = getSupabase();
  const { data, error } = await db.from('blog_posts').upsert(post, { onConflict: 'id' }).select().single();
  return { data, error };
}

/** Admin: delete post */
async function adminDeletePost(id) {
  const db = getSupabase();
  const { error } = await db.from('blog_posts').delete().eq('id', id);
  return { error };
}

/* ============================================================
   TESTIMONIALS HELPERS
   ============================================================ */

async function getTestimonials(opts = {}) {
  const db = getSupabase();
  let q = db.from('testimonials').select('*').eq('approved', true).order('sort_order').order('created_at', { ascending: false });

  if (opts.featured) q = q.eq('featured', true);
  if (opts.limit)    q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) { console.error('getTestimonials:', error); return []; }
  return data;
}

async function adminGetTestimonials() {
  const db = getSupabase();
  const { data, error } = await db.from('testimonials').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return data;
}

async function adminSaveTestimonial(t) {
  const db = getSupabase();
  const { data, error } = await db.from('testimonials').upsert(t, { onConflict: 'id' }).select().single();
  return { data, error };
}

async function adminDeleteTestimonial(id) {
  const db = getSupabase();
  const { error } = await db.from('testimonials').delete().eq('id', id);
  return { error };
}

/* ============================================================
   MESSAGES HELPERS
   ============================================================ */

/** Submit contact form message */
async function submitMessage(form) {
  const db = getSupabase();
  const { data, error } = await db.from('messages').insert([form]).select().single();
  return { data, error };
}

/** Admin: get all messages */
async function adminGetMessages(status = null) {
  const db = getSupabase();
  let q = db.from('messages').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return [];
  return data;
}

/** Admin: update message status */
async function adminUpdateMessageStatus(id, status) {
  const db = getSupabase();
  const { error } = await db.from('messages').update({ status }).eq('id', id);
  return { error };
}

/* ============================================================
   UTILITY HELPERS
   ============================================================ */

/** Generate URL-safe slug from title */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/** Format date nicely */
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

/** Category label map */
const CATEGORY_LABELS = {
  'video-editing':   'Video Editing',
  'motion-graphics': 'Motion Graphics',
  'graphic-design':  'Graphic Design',
  'web-design':      'Web Design',
  'general':         'General',
  'freelancing':     'Freelancing',
};

function categoryLabel(cat) {
  return CATEGORY_LABELS[cat] || cat;
}

/** Category emoji map */
const CATEGORY_EMOJI = {
  'video-editing':   '🎬',
  'motion-graphics': '✨',
  'graphic-design':  '🎨',
  'web-design':      '🌐',
};

function categoryEmoji(cat) {
  return CATEGORY_EMOJI[cat] || '📁';
}

/** Skeleton loader HTML */
function skeletonCard() {
  return `<div class="skeleton-card">
    <div class="skeleton skeleton-thumb"></div>
    <div style="padding:1.2rem">
      <div class="skeleton skeleton-line" style="width:60%;margin-bottom:.6rem"></div>
      <div class="skeleton skeleton-line" style="width:90%;margin-bottom:.4rem"></div>
      <div class="skeleton skeleton-line" style="width:75%"></div>
    </div>
  </div>`;
}

/** Show n skeleton cards in a container */
function showSkeletons(container, n = 6) {
  if (!container) return;
  container.innerHTML = Array(n).fill(skeletonCard()).join('');
}

/** Empty state HTML */
function emptyState(msg = 'No items found') {
  return `<div class="empty-state">
    <div class="empty-icon">🔍</div>
    <p>${msg}</p>
  </div>`;
}
