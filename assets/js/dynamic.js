/* ============================================================
   PORTFOLIO FRONTEND — dynamic.js
   Handles: dynamic projects, blogs, testimonials, contact form
   Loaded on public pages AFTER supabase.js
   ============================================================ */

'use strict';

/* ════════════════════════════════════════════════════════════
   IMAGE LAZY LOADING
   ════════════════════════════════════════════════════════════ */
function initLazyImages() {
  const imgs = document.querySelectorAll('img.lazy');
  if (!imgs.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      if (img.dataset.src) { img.src = img.dataset.src; }
      img.addEventListener('load',  () => img.classList.add('loaded'));
      img.addEventListener('error', () => img.classList.add('loaded'));
      obs.unobserve(img);
    });
  }, { rootMargin: '200px' });
  imgs.forEach(img => obs.observe(img));
}

/* ════════════════════════════════════════════════════════════
   APPLY SETTINGS TO EVERY PAGE
   ════════════════════════════════════════════════════════════ */
async function applyPageSettings() {
  try {
    await applyHeroSettings(); // defined in supabase.js
  } catch (_) { /* fail silently — site still works statically */ }
}

/* ════════════════════════════════════════════════════════════
   FEATURED PROJECTS (index.html)
   ════════════════════════════════════════════════════════════ */
async function loadFeaturedProjects() {
  const container = document.getElementById('featured-projects-grid');
  if (!container) return;

  // Show skeletons
  container.innerHTML = Array(3).fill(`
    <div class="skeleton-card">
      <div class="skeleton skeleton-thumb"></div>
      <div style="padding:1.3rem">
        <div class="skeleton skeleton-line" style="width:40%;margin-bottom:.6rem"></div>
        <div class="skeleton skeleton-line" style="width:90%;margin-bottom:.4rem"></div>
        <div class="skeleton skeleton-line" style="width:70%"></div>
      </div>
    </div>
  `).join('');

  const projects = await getProjects({ featured: true, limit: 6 });

  if (!projects.length) {
    // Fall back to static placeholders — container already has static HTML as fallback
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">📁</div><p>No featured projects yet.</p></div>`;
    return;
  }

  container.innerHTML = projects.map(p => buildProjectCard(p)).join('');
  initLazyImages();

  // Attach click handlers for modal
  container.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => openProjectModal(card.dataset.id));
  });
}

/* ════════════════════════════════════════════════════════════
   FULL PORTFOLIO (portfolio.html)
   ════════════════════════════════════════════════════════════ */
async function loadPortfolioPage() {
  const container  = document.getElementById('portfolio-dynamic-grid');
  const searchEl   = document.getElementById('portfolio-search-input');
  const countEl    = document.getElementById('portfolio-count');
  if (!container) return;

  let allProjects = [];
  let activeFilter = 'all';
  let searchQuery  = '';

  // Initial skeleton
  showPortfolioSkeletons(container, 9);

  // Load all published projects
  allProjects = await getProjects();

  function render() {
    let filtered = allProjects;

    if (activeFilter !== 'all') {
      filtered = filtered.filter(p => p.category === activeFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    if (countEl) countEl.textContent = `${filtered.length} project${filtered.length !== 1 ? 's' : ''}`;

    if (!filtered.length) {
      container.innerHTML = `<div class="no-results"><div class="no-results-icon">🔍</div><p>No projects match your search.</p></div>`;
      return;
    }

    container.innerHTML = filtered.map(p => buildProjectCard(p)).join('');
    initLazyImages();

    // Animate cards in
    container.querySelectorAll('.project-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = `opacity .4s ease ${i * 0.06}s, transform .4s ease ${i * 0.06}s`;
      requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
      card.addEventListener('click', () => openProjectModal(card.dataset.id, allProjects));
    });
  }

  // Filter buttons
  document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      render();
    });
  });

  // Search
  if (searchEl) {
    let debounce;
    searchEl.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => { searchQuery = searchEl.value.trim(); render(); }, 280);
    });
  }

  render();
}

function showPortfolioSkeletons(container, n) {
  container.innerHTML = Array(n).fill(`
    <div class="skeleton-card">
      <div class="skeleton skeleton-thumb"></div>
      <div style="padding:1.3rem">
        <div class="skeleton skeleton-line" style="width:35%;margin-bottom:.6rem"></div>
        <div class="skeleton skeleton-line" style="margin-bottom:.5rem"></div>
        <div class="skeleton skeleton-line" style="width:80%"></div>
      </div>
    </div>
  `).join('');
}

/* ════════════════════════════════════════════════════════════
   PROJECT CARD BUILDER
   ════════════════════════════════════════════════════════════ */
function buildProjectCard(p) {
  const thumb = p.thumbnail_url
    ? `<img class="project-card-thumb lazy" data-src="${escHtml(p.thumbnail_url)}" alt="${escHtml(p.title)}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">`
    : `<div class="project-card-thumb-placeholder">${categoryEmoji(p.category)}</div>`;

  const tags = (p.tags || []).slice(0, 3).map(t =>
    `<span class="project-tag">${escHtml(t)}</span>`
  ).join('');

  return `
    <div class="project-card" data-id="${p.id}" role="button" tabindex="0" aria-label="View ${escHtml(p.title)}">
      <div class="project-card-thumb-wrap">
        ${thumb}
        <div class="project-card-overlay">
          <span style="font-size:.8rem;font-weight:600;display:flex;align-items:center;gap:.4rem">
            ${p.video_url ? '<i class="fas fa-play-circle"></i> Watch Preview' : '<i class="fas fa-eye"></i> View Project'}
          </span>
        </div>
        ${p.featured ? '<div class="featured-star"><i class="fas fa-star"></i> Featured</div>' : ''}
      </div>
      <div class="project-card-body">
        <div class="project-card-category">${categoryLabel(p.category)}</div>
        <div class="project-card-title">${escHtml(p.title)}</div>
        <div class="project-card-desc">${escHtml((p.description || '').substring(0,100))}${(p.description||'').length > 100 ? '…' : ''}</div>
        ${tags ? `<div class="project-card-tags">${tags}</div>` : ''}
      </div>
    </div>
  `;
}

/* ════════════════════════════════════════════════════════════
   PROJECT MODAL (video preview)
   ════════════════════════════════════════════════════════════ */
let _projectCache = [];

async function openProjectModal(id, cache) {
  if (cache) _projectCache = cache;

  let project = _projectCache.find(p => p.id === id);
  if (!project) project = await getProject(id);
  if (!project) return;

  let modal = document.getElementById('project-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.id = 'project-modal';
    modal.innerHTML = `
      <div class="project-modal-inner">
        <div class="project-modal-header">
          <div>
            <div class="project-modal-category" id="pm-category"></div>
            <div class="project-modal-title" id="pm-title"></div>
          </div>
          <button class="project-modal-close" id="pm-close" aria-label="Close"><i class="fas fa-times"></i></button>
        </div>
        <div id="pm-video-container"></div>
        <div class="project-modal-body">
          <p class="project-modal-desc" id="pm-desc"></p>
          <div id="pm-tags" style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:1rem"></div>
          <div style="margin-top:1.5rem;display:flex;gap:.8rem;flex-wrap:wrap" id="pm-actions"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('pm-close').addEventListener('click', closeProjectModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeProjectModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProjectModal(); });
  }

  document.getElementById('pm-category').textContent = categoryLabel(project.category);
  document.getElementById('pm-title').textContent    = project.title;
  document.getElementById('pm-desc').textContent     = project.description || '';

  // Video or placeholder
  const vc = document.getElementById('pm-video-container');
  if (project.video_url) {
    vc.innerHTML = `<div class="project-video-wrap"><iframe src="${escHtml(project.video_url)}" allow="autoplay;encrypted-media;fullscreen" allowfullscreen></iframe></div>`;
  } else if (project.thumbnail_url) {
    vc.innerHTML = `<img src="${escHtml(project.thumbnail_url)}" style="width:100%;display:block;max-height:380px;object-fit:cover" alt="${escHtml(project.title)}">`;
  } else {
    vc.innerHTML = `<div style="height:220px;display:flex;align-items:center;justify-content:center;font-size:5rem;background:linear-gradient(135deg,var(--bg-card),var(--blue-deep))">${categoryEmoji(project.category)}</div>`;
  }

  // Tags
  document.getElementById('pm-tags').innerHTML = (project.tags || []).map(t =>
    `<span class="project-tag">${escHtml(t)}</span>`
  ).join('');

  // Actions
  const actions = document.getElementById('pm-actions');
  actions.innerHTML = `<a href="contact.html" class="btn-primary" style="display:inline-flex;align-items:center;gap:.5rem;padding:.7rem 1.5rem;background:linear-gradient(135deg,var(--blue-bright),var(--blue-glow));color:white;border-radius:var(--radius);font-weight:600;font-size:.88rem;text-decoration:none"><i class="fas fa-paper-plane"></i> Order Similar</a>`;
  if (project.live_url) {
    actions.innerHTML += `<a href="${escHtml(project.live_url)}" target="_blank" rel="noopener" class="btn-secondary" style="display:inline-flex;align-items:center;gap:.5rem;padding:.7rem 1.5rem;border:1px solid var(--border-bright);color:var(--text-primary);border-radius:var(--radius);font-weight:600;font-size:.88rem;text-decoration:none"><i class="fas fa-external-link-alt"></i> Live Link</a>`;
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  // Stop video
  const vc = document.getElementById('pm-video-container');
  if (vc) vc.innerHTML = '';
}

/* ════════════════════════════════════════════════════════════
   DYNAMIC TESTIMONIALS (index + testimonials page)
   ════════════════════════════════════════════════════════════ */
async function loadDynamicTestimonials(containerId, opts = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = Array(3).fill(`
    <div class="skeleton-card" style="padding:1.5rem">
      <div class="skeleton skeleton-line" style="width:30%;margin-bottom:1rem"></div>
      <div class="skeleton skeleton-line" style="margin-bottom:.5rem"></div>
      <div class="skeleton skeleton-line" style="width:80%;margin-bottom:1.5rem"></div>
      <div class="skeleton skeleton-line" style="width:50%"></div>
    </div>
  `).join('');

  const testimonials = await getTestimonials(opts);

  if (!testimonials.length) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">⭐</div><p>No testimonials yet.</p></div>`;
    return;
  }

  container.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-stars">${'★'.repeat(t.rating || 5)}</div>
      <p class="testimonial-text">"${escHtml(t.content)}"</p>
      <div class="testimonial-author">
        <div class="author-avatar">${t.name.charAt(0).toUpperCase()}</div>
        <div>
          <div class="author-name">${escHtml(t.name)}</div>
          <div class="author-role">${escHtml([t.role, t.country].filter(Boolean).join(', ') || '')}</div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ════════════════════════════════════════════════════════════
   DYNAMIC BLOG LIST (blog.html)
   ════════════════════════════════════════════════════════════ */
async function loadBlogPage() {
  const grid     = document.getElementById('blog-dynamic-grid');
  const featured = document.getElementById('blog-featured-dynamic');
  if (!grid) return;

  // Skeletons
  grid.innerHTML = Array(6).fill(`
    <div class="skeleton-card">
      <div class="skeleton" style="height:195px;border-radius:0"></div>
      <div style="padding:1.5rem">
        <div class="skeleton skeleton-line" style="width:30%;margin-bottom:.7rem"></div>
        <div class="skeleton skeleton-line" style="margin-bottom:.5rem"></div>
        <div class="skeleton skeleton-line" style="width:85%"></div>
      </div>
    </div>
  `).join('');

  const [posts, featuredPost] = await Promise.all([
    getPosts(),
    getPosts({ featured: true, limit: 1 }),
  ]);

  // Featured post
  if (featured && featuredPost.length) {
    const fp = featuredPost[0];
    featured.innerHTML = `
      <a href="post.html?slug=${fp.slug}" class="blog-featured" style="text-decoration:none;color:inherit">
        <div class="blog-featured-thumb" style="background:linear-gradient(135deg,#0a1428,#1a0a40)">
          ${fp.featured_image
            ? `<img src="${escHtml(fp.featured_image)}" style="width:100%;height:100%;object-fit:cover" alt="${escHtml(fp.title)}">`
            : getCategoryEmoji(fp.category)
          }
        </div>
        <div class="blog-featured-body">
          <div class="blog-featured-tag"><i class="fas fa-newspaper"></i> ${categoryLabel(fp.category)}</div>
          <h2>${escHtml(fp.title)}</h2>
          <p>${escHtml(fp.excerpt || '')}</p>
          <div class="blog-featured-meta">
            <span><i class="fas fa-calendar-alt"></i> ${formatDate(fp.published_at)}</span>
            <span><i class="fas fa-clock"></i> ${fp.read_time || 5} min read</span>
            ${fp.views ? `<span><i class="fas fa-eye"></i> ${fp.views.toLocaleString()} views</span>` : ''}
          </div>
          <span class="read-more-link">Read Article <i class="fas fa-arrow-right"></i></span>
        </div>
      </a>
    `;
    featured.style.display = '';
  }

  let activeCategory = 'all';

  function renderPosts(postList) {
    if (!postList.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📝</div><p>No posts in this category.</p></div>`;
      return;
    }
    grid.innerHTML = postList.map(p => `
      <a href="post.html?slug=${p.slug}" class="dyn-blog-card">
        ${p.featured_image
          ? `<img class="dyn-blog-thumb lazy" data-src="${escHtml(p.featured_image)}" alt="${escHtml(p.title)}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">`
          : `<div class="dyn-blog-thumb-placeholder" style="background:${getBlogGradient(p.category)}">${getCategoryEmoji(p.category)}</div>`
        }
        <div class="dyn-blog-body">
          <span class="dyn-blog-cat">${categoryLabel(p.category)}</span>
          <div class="dyn-blog-title">${escHtml(p.title)}</div>
          <div class="dyn-blog-excerpt">${escHtml((p.excerpt||'').substring(0,120))}${(p.excerpt||'').length > 120 ? '…' : ''}</div>
          <div class="dyn-blog-meta">
            <span><i class="fas fa-calendar-alt" style="margin-right:.3rem"></i>${formatDate(p.published_at)}</span>
            <span class="dyn-read-more">Read More <i class="fas fa-arrow-right"></i></span>
          </div>
        </div>
      </a>
    `).join('');
    initLazyImages();
  }

  renderPosts(posts);

  // Category filter
  document.querySelectorAll('.blog-filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.blog-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.filter;
      const filtered = activeCategory === 'all' ? posts : posts.filter(p => p.category === activeCategory);
      renderPosts(filtered);
    });
  });
}

function getBlogGradient(cat) {
  const map = {
    'video-editing':   'linear-gradient(135deg,#0a1428,#0d2045)',
    'graphic-design':  'linear-gradient(135deg,#1a0828,#280a40)',
    'motion-graphics': 'linear-gradient(135deg,#0a2814,#0a3820)',
    'freelancing':     'linear-gradient(135deg,#281408,#402008)',
    'web-design':      'linear-gradient(135deg,#0a1040,#0a1860)',
  };
  return map[cat] || 'linear-gradient(135deg,var(--bg-card),var(--blue-deep))';
}

function getCategoryEmoji(cat) {
  return categoryEmoji ? categoryEmoji(cat) : '📝';
}

/* ════════════════════════════════════════════════════════════
   SINGLE BLOG POST (post.html)
   ════════════════════════════════════════════════════════════ */
async function loadSinglePost() {
  const params = new URLSearchParams(window.location.search);
  const slug   = params.get('slug');
  if (!slug) return;

  const post = await getPost(slug);
  if (!post) {
    document.getElementById('post-content')?.insertAdjacentHTML('afterbegin',
      `<div class="empty-state"><div class="empty-icon">📭</div><p>Post not found.</p></div>`
    );
    return;
  }

  // Update page title & meta
  if (post.seo_title)       document.title = post.seo_title;
  else if (post.title)      document.title = `${post.title} | Tanvir Islam`;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && post.seo_description) metaDesc.setAttribute('content', post.seo_description);

  // Populate header
  setIfExists('post-dyn-title',    post.title);
  setIfExists('post-dyn-category', categoryLabel(post.category));
  setIfExists('post-dyn-date',     formatDate(post.published_at));
  setIfExists('post-dyn-read',     `${post.read_time || 5} min read`);
  setIfExists('post-dyn-views',    `${(post.views || 0).toLocaleString()} views`);

  // Hero image
  const heroImg = document.getElementById('post-dyn-hero');
  if (heroImg && post.featured_image) { heroImg.src = post.featured_image; heroImg.style.display = 'block'; }

  // Article body (sanitised via textContent injection for plain text, or innerHTML for trusted HTML)
  const bodyEl = document.getElementById('post-dyn-body');
  if (bodyEl && post.content) {
    // Content is admin-entered HTML — trusted source
    bodyEl.innerHTML = post.content;
  }

  // Tags
  const tagsEl = document.getElementById('post-dyn-tags');
  if (tagsEl && post.tags?.length) {
    tagsEl.innerHTML = post.tags.map(t => `<a href="blog.html" class="post-tag">${escHtml(t)}</a>`).join('');
  }

  // Related posts
  const relatedEl = document.getElementById('post-related-grid');
  if (relatedEl) {
    const related = await getPosts({ category: post.category, limit: 3, exclude: post.id });
    if (related.length) {
      relatedEl.innerHTML = related.map(p => `
        <a href="post.html?slug=${p.slug}" class="dyn-blog-card">
          <div class="dyn-blog-thumb-placeholder" style="height:140px;background:${getBlogGradient(p.category)};font-size:2.5rem">${getCategoryEmoji(p.category)}</div>
          <div class="dyn-blog-body">
            <span class="dyn-blog-cat">${categoryLabel(p.category)}</span>
            <div class="dyn-blog-title" style="font-size:.95rem">${escHtml(p.title)}</div>
            <div class="dyn-blog-meta" style="margin-top:auto;padding-top:.8rem;border-top:1px solid var(--border)">
              <span>${formatDate(p.published_at)}</span>
              <span class="dyn-read-more">Read <i class="fas fa-arrow-right"></i></span>
            </div>
          </div>
        </a>
      `).join('');
    } else {
      document.getElementById('post-related-section')?.style.setProperty('display','none');
    }
  }
}

function setIfExists(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null) el.textContent = value;
}

/* ════════════════════════════════════════════════════════════
   DYNAMIC CONTACT FORM
   ════════════════════════════════════════════════════════════ */
function initDynamicContactForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('contact-success');
  const overlay = document.getElementById('form-sending-overlay');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Show sending overlay
    if (overlay) overlay.classList.add('show');

    const btn = form.querySelector('[type=submit]');
    if (btn) { btn.disabled = true; }

    const payload = {
      name:    form.querySelector('#name')?.value?.trim()    || '',
      email:   form.querySelector('#email')?.value?.trim()   || '',
      phone:   form.querySelector('#phone')?.value?.trim()   || '',
      service: form.querySelector('#service')?.value         || '',
      budget:  form.querySelector('#budget')?.value          || '',
      message: form.querySelector('#message')?.value?.trim() || '',
      status:  'unread',
    };

    if (!payload.name || !payload.email || !payload.message) {
      if (overlay) overlay.classList.remove('show');
      if (btn) btn.disabled = false;
      showSiteToast('⚠️ Please fill in all required fields.', 'error');
      return;
    }

    const { error } = await submitMessage(payload);

    if (overlay) overlay.classList.remove('show');
    if (btn) btn.disabled = false;

    if (error) {
      showSiteToast('❌ Failed to send. Please email me directly.', 'error');
      console.error('Contact form error:', error);
      return;
    }

    // Show success
    form.style.display = 'none';
    if (success) success.classList.add('show');
    else showSiteToast('✅ Message sent! I\'ll reply within 24 hours.', 'success');
  });
}

/* ════════════════════════════════════════════════════════════
   SITE TOAST
   ════════════════════════════════════════════════════════════ */
function showSiteToast(msg, type = 'success') {
  let toast = document.getElementById('site-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'site-toast';
    toast.className = 'site-toast';
    document.body.appendChild(toast);
  }
  toast.className = `site-toast ${type === 'error' ? 'error' : ''}`;
  toast.innerHTML = `${type === 'error' ? '❌' : '✅'} ${msg}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

/* ════════════════════════════════════════════════════════════
   HTML ESCAPE UTILITY
   ════════════════════════════════════════════════════════════ */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

/* ════════════════════════════════════════════════════════════
   AUTO-INIT BASED ON PAGE
   ════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  // Apply global settings to every page
  applyPageSettings();

  // Page-specific loaders
  if (page === 'index.html' || page === '') {
    await loadFeaturedProjects();
    await loadDynamicTestimonials('testimonials-dynamic-container', { featured: true, limit: 3 });
  }

  if (page === 'portfolio.html') {
    await loadPortfolioPage();
  }

  if (page === 'blog.html') {
    await loadBlogPage();
  }

  if (page === 'post.html') {
    await loadSinglePost();
  }

  if (page === 'testimonials.html') {
    await loadDynamicTestimonials('testimonials-dynamic-container', { limit: 20 });
  }

  if (page === 'contact.html') {
    initDynamicContactForm();
  }

  // Lazy images on any page
  initLazyImages();
});
