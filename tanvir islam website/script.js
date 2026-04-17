/* ============================================
   TANVIR ISLAM PORTFOLIO - MAIN SCRIPT
   ============================================ */

// ── LOADING SCREEN ──
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loading-screen');
    if (loader) loader.classList.add('hidden');
  }, 1800);
});

// ── NAVBAR SCROLL ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }
  // Back to top
  const btt = document.getElementById('back-to-top');
  if (btt) btt.classList.toggle('visible', window.scrollY > 400);
});

// ── HAMBURGER MENU ──
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('mobile-open');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('mobile-open');
    });
  });
}

// ── ACTIVE NAV LINK ──
// Auto-sets .active on the current page's nav link
(function () {
  const raw = window.location.pathname.split('/').pop() || 'index.html';
  const currentPage = raw.split('#')[0] || 'index.html';

  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = (link.getAttribute('href') || '').split('#')[0];
    const isHome = currentPage === '' || currentPage === 'index.html';

    if (href === currentPage || (isHome && href === 'index.html')) {
      // Don't add active if it's already there (e.g. contact.html sets it in HTML)
      if (!link.classList.contains('active')) {
        link.classList.add('active');
      }
    }
  });
})();

// ── BACK TO TOP ──
const bttBtn = document.getElementById('back-to-top');
if (bttBtn) {
  bttBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── TYPING ANIMATION ──
function initTyping() {
  const el = document.querySelector('.typing-text');
  if (!el) return;
  const texts = ['Video Editor', 'Graphic Designer', 'Motion Designer', 'Content Creator'];
  let idx = 0, charIdx = 0, deleting = false;
  function type() {
    const current = texts[idx];
    if (!deleting) {
      el.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(type, 1800);
        return;
      }
    } else {
      el.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        idx = (idx + 1) % texts.length;
      }
    }
    setTimeout(type, deleting ? 60 : 90);
  }
  type();
}

// ── SCROLL REVEAL ──
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Animate skill fills
        entry.target.querySelectorAll('.skill-fill, .progress-fill').forEach(fill => {
          const width = fill.dataset.width;
          if (width) fill.style.width = width;
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .workflow-step').forEach(el => {
    observer.observe(el);
  });

  // Also observe parent containers for skill bars
  document.querySelectorAll('.skills-grid, .progress-list').forEach(el => {
    observer.observe(el);
  });
}

// ── SKILL BARS ANIMATION ──
function initSkillBars() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-fill').forEach(fill => {
          fill.style.width = fill.dataset.width || '0%';
        });
        entry.target.querySelectorAll('.progress-fill').forEach(fill => {
          fill.style.width = fill.dataset.width || '0%';
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.skills-grid, .progress-list, .skill-card, .progress-item').forEach(el => {
    observer.observe(el);
  });
}

// ── FAQ ACCORDION ──
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

// ── PRICING TABS ──
function initPricingTabs() {
  document.querySelectorAll('.pricing-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.pricing-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.pricing-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById(tab.dataset.panel);
      if (panel) panel.classList.add('active');
    });
  });
}

// ── PORTFOLIO FILTER ──
function initPortfolioFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.portfolio-full-item');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      items.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = '';
          item.style.animation = 'fadeIn 0.4s ease';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

// ── GRAPHIC LIGHTBOX ──
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  document.querySelectorAll('.portfolio-full-item[data-lightbox]').forEach(item => {
    item.addEventListener('click', () => {
      // Prefer explicit data attributes; fall back to DOM text
      const title = item.dataset.lbTitle || item.querySelector('h4')?.textContent || '';
      const desc  = item.dataset.lbDesc  || item.querySelector('span')?.textContent || '';
      // Pull emoji from the thumb (first text node character)
      const thumbEl = item.querySelector('.portfolio-thumb');
      const icon  = thumbEl ? thumbEl.textContent.trim().charAt(0) : '🎨';

      const iconEl  = lightbox.querySelector('.lightbox-icon');
      const titleEl = lightbox.querySelector('.lightbox-title');
      const descEl  = lightbox.querySelector('.lightbox-desc');

      if (iconEl)  iconEl.textContent  = icon;
      if (titleEl) titleEl.textContent = title;
      if (descEl)  descEl.textContent  = desc;

      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  lightbox.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

// ── CONTACT FORM ──
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('✅ Message sent! I\'ll get back to you soon.');
    form.reset();
  });
}

// ── TOAST NOTIFICATION ──
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ── SMOOTH PAGE TRANSITIONS ──
document.querySelectorAll('a[href]').forEach(link => {
  const href = link.getAttribute('href');
  if (href && !href.startsWith('#') && !href.startsWith('mailto') && !href.startsWith('tel') && !href.startsWith('http') && !href.startsWith('javascript')) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.3s ease';
      setTimeout(() => { window.location.href = href; }, 300);
    });
  }
});

// Fade in on load
document.body.style.opacity = '0';
window.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  });
});

// ── COUNTER ANIMATION ──
function initCounters() {
  document.querySelectorAll('.count-num').forEach(el => {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          let count = 0;
          const step = Math.ceil(target / 60);
          const interval = setInterval(() => {
            count = Math.min(count + step, target);
            el.textContent = count + suffix;
            if (count >= target) clearInterval(interval);
          }, 25);
          observer.unobserve(el);
        }
      });
    });
    observer.observe(el);
  });
}

// ── VIDEO MODAL (Portfolio — click thumbnail → modal → autoplay) ──
function initVideoModal() {
  const modal = document.getElementById('video-modal');
  if (!modal) return;

  const player     = modal.querySelector('.video-modal-player');
  const titleEl    = modal.querySelector('.video-modal-title');
  const metaEl     = modal.querySelector('.video-modal-meta');
  const tagsEl     = modal.querySelector('.video-modal-tags');
  const closeBtn   = modal.querySelector('.video-modal-close');

  // Open modal when a video item is clicked
  document.querySelectorAll('.portfolio-video-item').forEach(item => {
    item.addEventListener('click', () => {
      const title    = item.dataset.title    || 'Project Preview';
      const category = item.dataset.category || 'Video';
      const tags     = (item.dataset.tags    || '').split(',').filter(Boolean);
      const src      = item.dataset.src      || '';   // real video src if any
      const youtube  = item.dataset.youtube  || '';   // YouTube video ID if any

      // Update header
      if (titleEl) titleEl.textContent = title;
      if (metaEl)  metaEl.textContent  = category;

      // Build tags
      if (tagsEl) {
        tagsEl.innerHTML = tags.map(t =>
          `<span class="video-modal-tag">${t.trim()}</span>`
        ).join('');
      }

      // Build player content
      if (youtube) {
        // Embed YouTube with autoplay
        player.innerHTML = `<iframe
          src="https://www.youtube.com/embed/${youtube}?autoplay=1&rel=0&modestbranding=1"
          allow="autoplay; encrypted-media; fullscreen"
          allowfullscreen>
        </iframe>`;
      } else if (src) {
        // Native video autoplay
        player.innerHTML = `<video src="${src}" autoplay controls playsinline></video>`;
      } else {
        // Placeholder when no real source
        player.innerHTML = `
          <div class="video-modal-placeholder">
            <div class="play-icon">▶</div>
            <p>${title}</p>
            <p style="font-size:0.75rem;opacity:0.6">Preview not available — contact for demo</p>
          </div>`;
      }

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close modal — stop video to kill audio
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    // Wipe player to stop any playing video/audio
    if (player) player.innerHTML = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

// ── BLOG CATEGORY FILTER ──
function initBlogFilter() {
  const btns  = document.querySelectorAll('.blog-filter-btn');
  const cards = document.querySelectorAll('.blog-card[data-category]');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        if (show) {
          card.style.display = '';
          requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = ''; });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => { card.style.display = 'none'; }, 300);
        }
      });
    });
  });
}

// ── NEWSLETTER FORM ──
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    showToast('🎉 Subscribed! You\'ll hear from me soon.');
    form.reset();
  });
}

// ── INIT ALL ──
document.addEventListener('DOMContentLoaded', () => {
  initTyping();
  initScrollReveal();
  initSkillBars();
  initFAQ();
  initPricingTabs();
  initPortfolioFilter();
  initVideoModal();
  initLightbox();
  initContactForm();
  initCounters();
  initBlogFilter();
  initNewsletter();
});
