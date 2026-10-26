/* Tanvir.Studio | CMS loader: applies dashboard content to every page */
(function () {
  'use strict';
  var cfg = window.TS_CONFIG || {};
  var doc = document, root = doc.documentElement;
  var PAGE = root.getAttribute('data-page') || '';
  var configured = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) && !/YOUR_/i.test(cfg.SUPABASE_URL + cfg.SUPABASE_ANON_KEY);
  var finish;
  window.TSReady = new Promise(function (r) { finish = r; });
  var safety = setTimeout(function () { finish(); }, 2600);

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ic(n, c) { return '<svg class="ic ' + (c || '') + '" aria-hidden="true" focusable="false"><use href="#i-' + n + '"/></svg>'; }
  function hdr(extra) {
    var h = { apikey: cfg.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + cfg.SUPABASE_ANON_KEY };
    for (var k in (extra || {})) h[k] = extra[k];
    return h;
  }
  function rest(path) {
    return fetch(cfg.SUPABASE_URL + '/rest/v1/' + path, { headers: hdr() }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }
  function insert(table, row) {
    return fetch(cfg.SUPABASE_URL + '/rest/v1/' + table, {
      method: 'POST', headers: hdr({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }), body: JSON.stringify(row)
    }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return true; });
  }
  window.TSApi = { configured: configured, rest: rest, insert: insert };

  /* ---------- canonical / social URLs follow the real domain ---------- */
  (function fixOrigin() {
    if (!/^https?:$/.test(location.protocol)) return;
    var can = doc.querySelector('link[rel="canonical"]');
    if (!can) return;
    var old = (can.getAttribute('href').match(/^https?:\/\/[^/]+/) || [''])[0];
    var origin = location.origin;
    if (!old || old === origin) return;
    doc.querySelectorAll('link[rel="canonical"],link[rel="alternate"][hreflang],meta[property="og:url"],meta[property="og:image"],meta[name="twitter:image"]').forEach(function (el) {
      var a = el.hasAttribute('href') ? 'href' : 'content';
      el.setAttribute(a, el.getAttribute(a).split(old).join(origin));
    });
    doc.querySelectorAll('script[type="application/ld+json"]').forEach(function (s) { s.textContent = s.textContent.split(old).join(origin); });
  })();

  /* ---------- helpers ---------- */
  function setText(el, v) {
    if (el.hasAttribute('data-count')) {
      var m = String(v).trim().match(/^(\d+)(.*)$/);
      if (m) { el.setAttribute('data-count', m[1]); el.setAttribute('data-suffix', m[2]); }
    }
    var nodes = Array.prototype.filter.call(el.childNodes, function (n) { return n.nodeType === 3 && n.nodeValue.trim(); });
    if (!nodes.length) { el.appendChild(doc.createTextNode(v)); return; }
    var n0 = nodes[0];
    var lead = /^\s/.test(n0.nodeValue) ? ' ' : '', trail = /\s$/.test(n0.nodeValue) ? ' ' : '';
    n0.nodeValue = lead + v + trail;
    for (var i = 1; i < nodes.length; i++) nodes[i].nodeValue = '';
  }
  function setMeta(sel, attr, v) { var el = doc.querySelector(sel); if (el) el.setAttribute(attr, v); }
  function waLink(num, msg) { return 'https://wa.me/' + String(num).replace(/\D/g, '') + (msg ? '?text=' + encodeURIComponent(msg) : ''); }
  function fmtDate(d) { try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { return ''; } }
  var SERVICE_NAMES = { video: 'Video Editing', motion: 'Motion Graphics', design: 'Graphic Design' };

  /* ---------- apply text overrides, SEO and settings ---------- */
  function applyContent(map) {
    doc.querySelectorAll('[data-cms]').forEach(function (el) {
      var v = map[el.getAttribute('data-cms')];
      if (typeof v !== 'string') return;
      if (el.hasAttribute('data-cms-attr')) el.setAttribute(el.getAttribute('data-cms-attr'), v);
      else setText(el, v);
    });
    var t = map['seo.' + PAGE + '.title'], d = map['seo.' + PAGE + '.description'];
    if (t) { doc.title = t; setMeta('meta[property="og:title"]', 'content', t); setMeta('meta[name="twitter:title"]', 'content', t); }
    if (d) { setMeta('meta[name="description"]', 'content', d); setMeta('meta[property="og:description"]', 'content', d); setMeta('meta[name="twitter:description"]', 'content', d); }
  }

  function applySettings(map) {
    var S = {};
    Object.keys(map).forEach(function (k) { if (k.indexOf('settings.') === 0) S[k.slice(9)] = map[k]; });
    var loc = S.location;
    doc.querySelectorAll('[data-s]').forEach(function (el) {
      var key = el.getAttribute('data-s'), v = S[key], textMode = el.hasAttribute('data-s-text');
      if (key === 'map') { var q = S.map_embed || (loc ? 'https://www.google.com/maps?q=' + encodeURIComponent(loc) + '&z=14&output=embed' : ''); if (q) el.setAttribute('src', q); return; }
      if (key === 'maplink') { if (loc) el.setAttribute('href', 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(loc)); return; }
      if (v === undefined) return;
      if (v === '' && /^(facebook|instagram|linkedin|youtube)$/.test(key)) { el.style.display = 'none'; return; }
      if (key === 'email') { if (el.tagName === 'A') el.setAttribute('href', 'mailto:' + v); }
      else if (key === 'whatsapp') {
        if (el.tagName === 'A') { var m = (el.getAttribute('href') || '').match(/[?&]text=([^&]*)/); el.setAttribute('href', waLink(v, m ? decodeURIComponent(m[1]) : '')); }
      } else if (key === 'phone') { if (el.tagName === 'A') el.setAttribute('href', 'tel:' + String(v).replace(/\s/g, '')); }
      else if (/^(facebook|instagram|linkedin|youtube)$/.test(key)) { el.setAttribute('href', v); }
      if (textMode) setText(el, v);
    });
    if (S.whatsapp) root.setAttribute('data-wa', waLink(S.whatsapp, 'Hello Tanvir.Studio, I would like to discuss a project.'));
    return S;
  }

  /* ---------- FAQs ---------- */
  function renderFaqs(rows) {
    var boxes = doc.querySelectorAll('[data-faq]');
    var first = true;
    boxes.forEach(function (box) {
      var key = box.getAttribute('data-faq');
      var list = rows.filter(function (r) { return (r.show_on || []).indexOf(key) > -1; });
      if (!list.length) return;
      box.innerHTML = list.map(function (r) {
        return '<div class="faq-item"><button class="faq-q" type="button" aria-expanded="false"><span>' + esc(r.question) + '</span><span class="pm">' + ic('plus') + '</span></button><div class="faq-a"><div><p>' + esc(r.answer) + '</p></div></div></div>';
      }).join('');
      if (first) {
        first = false;
        var ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: list.map(function (r) { return { '@type': 'Question', name: r.question, acceptedAnswer: { '@type': 'Answer', text: r.answer } }; }) };
        var node = Array.prototype.filter.call(doc.querySelectorAll('script[type="application/ld+json"]'), function (s) { return s.textContent.indexOf('"FAQPage"') > -1; })[0];
        if (node) node.textContent = JSON.stringify(ld);
      }
    });
  }

  /* ---------- Pricing ---------- */
  function renderPlans(rows) {
    var wa = root.getAttribute('data-wa') || '';
    var num = (wa.match(/wa\.me\/(\d+)/) || [])[1] || '';
    doc.querySelectorAll('[data-plans]').forEach(function (box) {
      var svc = box.getAttribute('data-plans');
      var list = rows.filter(function (r) { return r.service === svc; });
      if (!list.length) return;
      box.innerHTML = list.map(function (p) {
        var msg = 'Hello Tanvir.Studio, I am interested in the ' + SERVICE_NAMES[svc] + ' ' + p.name + ' package.';
        var feats = (p.features || []).map(function (f) { return '<li>' + ic('check') + '<span>' + esc(f) + '</span></li>'; }).join('');
        return '<article class="plan' + (p.is_popular ? ' hot' : '') + '">' +
          (p.is_popular ? '<span class="badge">' + ic('star') + ' Most chosen</span>' : '') +
          '<h3>' + esc(p.name) + '</h3><p>' + esc(p.description) + '</p>' +
          '<div class="price">$' + Number(p.price).toLocaleString('en-US') + '<small>' + esc(p.unit) + '</small></div>' +
          '<ul>' + feats + '</ul><a class="btn" href="' + esc(num ? waLink(num, msg) : 'contact.html') + '" target="_blank" rel="noopener">Choose ' + esc(p.name) + ' ' + ic('arrow') + '</a></article>';
      }).join('');
    });
  }

  /* ---------- Blog list ---------- */
  var ART = [
    '<rect width="100" height="100" fill="#2252ff"/><circle cx="68" cy="34" r="22" fill="#6a4bff"/><circle cx="68" cy="34" r="9" fill="#22c7ff"/><rect x="10" y="64" width="52" height="8" rx="4" fill="#fff"/><rect x="10" y="78" width="34" height="8" rx="4" fill="#081338"/>',
    '<rect width="100" height="100" fill="#e3ecff"/><circle cx="32" cy="68" r="34" fill="#2252ff"/><circle cx="72" cy="28" r="16" fill="none" stroke="#6a4bff" stroke-width="6"/>',
    '<rect width="100" height="100" fill="#081338"/><polygon points="20,80 50,20 80,80" fill="#2252ff"/><circle cx="74" cy="26" r="9" fill="#22c7ff"/><rect x="14" y="86" width="72" height="3" fill="#fff"/>',
    '<rect width="100" height="100" fill="#f3f7ff"/><rect x="10" y="10" width="46" height="46" rx="10" fill="#2252ff"/><rect x="44" y="44" width="46" height="46" rx="10" fill="#6a4bff"/><circle cx="30" cy="76" r="12" fill="#22c7ff"/>'
  ];
  function thumb(p, i) {
    if (p.cover_url) return '<img src="' + esc(p.cover_url) + '" alt="' + esc(p.cover_alt || p.title) + '" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">';
    return '<svg class="art" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + ART[i % ART.length] + '</svg>';
  }
  function renderBlog(rows) {
    var box = doc.querySelector('[data-blog-list]');
    if (!box) return;
    if (!rows.length) { box.innerHTML = '<div class="empty-note"><h3>No articles yet</h3><p>New articles will appear here soon.</p></div>'; return; }
    var meta = function (p) { return '<div class="post-meta"><span>' + ic('calendar') + fmtDate(p.published_at) + '</span>' + (p.read_time ? '<span>' + ic('clock') + esc(p.read_time) + '</span>' : '') + '</div>'; };
    var f = rows[0];
    var html = '<a class="post-feature" href="blog/' + encodeURIComponent(f.slug) + '" data-reveal="up"><div class="thumb" style="position:relative">' + thumb(f, 0) + '</div><div class="body"><span class="cat">' + esc(f.category) + '</span><h2 style="font-size:clamp(1.6rem,2.8vw,2.3rem)">' + esc(f.title) + '</h2><p>' + esc(f.excerpt) + '</p>' + meta(f) + '<span class="read">Read the article ' + ic('arrow') + '</span></div></a>';
    if (rows.length > 1) {
      html += '<div class="post-grid">' + rows.slice(1).map(function (p, i) {
        return '<a class="post-card" href="blog/' + encodeURIComponent(p.slug) + '" data-reveal="up" data-delay="' + ((i % 3) * 120) + '"><div class="thumb">' + thumb(p, i + 1) + '</div><span class="cat">' + esc(p.category) + '</span><h3>' + esc(p.title) + '</h3><p>' + esc(p.excerpt) + '</p>' + meta(p) + '<span class="read">Read more ' + ic('arrow') + '</span></a>';
      }).join('') + '</div>';
    }
    box.innerHTML = html;
  }


  /* ---------- About page: skills, education, experience, achievements ---------- */
  function renderAbout(rows) {
    var by = { skill: [], education: [], experience: [], achievement: [] };
    rows.forEach(function (r) { if (by[r.kind]) by[r.kind].push(r); });
    var skills = doc.querySelector('[data-about="skill"]');
    if (skills && by.skill.length) {
      skills.innerHTML = by.skill.map(function (r) {
        return '<div class="skill-card"><div class="skill-top"><b>' + esc(r.title) + '</b><span>' + Number(r.level) + '%</span></div><div class="skill-bar"><i style="--v:' + Number(r.level) + '%"></i></div>' + (r.description ? '<p>' + esc(r.description) + '</p>' : '') + '</div>';
      }).join('');
    }
    function tl(kind) {
      var box = doc.querySelector('[data-about="' + kind + '"]'), col = doc.querySelector('[data-about-col="' + kind + '"]');
      if (!box) return 0;
      box.innerHTML = by[kind].map(function (r) {
        return '<div class="tl-item">' + (r.period ? '<span class="tl-period">' + esc(r.period) + '</span>' : '') + '<h3>' + esc(r.title) + '</h3>' + (r.subtitle ? '<div class="tl-sub">' + esc(r.subtitle) + '</div>' : '') + (r.description ? '<p>' + esc(r.description) + '</p>' : '') + '</div>';
      }).join('');
      if (col) col.hidden = !by[kind].length;
      return by[kind].length;
    }
    var n = tl('education') + tl('experience');
    var js = doc.querySelector('[data-about-section="journey"]'); if (js) js.hidden = !n;
    var ach = doc.querySelector('[data-about="achievement"]'), as = doc.querySelector('[data-about-section="achievement"]');
    if (ach) {
      ach.innerHTML = by.achievement.map(function (r) {
        return '<div class="achv"><i>' + ic('award') + '</i><div><h3>' + esc(r.title) + '</h3>' + ((r.subtitle || r.period) ? '<div class="tl-sub">' + esc([r.subtitle, r.period].filter(Boolean).join(' | ')) + '</div>' : '') + (r.description ? '<p>' + esc(r.description) + '</p>' : '') + '</div></div>';
      }).join('');
      if (as) as.hidden = !by.achievement.length;
    }
  }

  /* ---------- boot ---------- */
  if (!configured) { clearTimeout(safety); finish(); return; }

  var need = { about: !!doc.querySelector('[data-about]'), gallery: !!doc.querySelector('[data-gallery]'), faq: !!doc.querySelector('[data-faq]'), plans: !!doc.querySelector('[data-plans]'), work: !!doc.querySelector('[data-work-grid],[data-work-feature]'), blog: !!doc.querySelector('[data-blog-list]') };
  var ok = function (p, fallback) { return p.catch(function () { return fallback; }); };
  var now = encodeURIComponent(new Date().toISOString());
  Promise.all([
    ok(rest('site_content?select=key,value'), []),
    need.faq ? ok(rest('faqs?select=*&published=eq.true&order=sort_order.asc'), null) : null,
    need.plans ? ok(rest('pricing_plans?select=*&published=eq.true&order=sort_order.asc'), null) : null,
    need.work ? ok(rest('portfolio_items?select=*&published=eq.true&order=sort_order.asc,created_at.desc'), null) : null,
    need.blog ? ok(rest('blog_posts?select=slug,title,excerpt,category,cover_url,cover_alt,read_time,published_at&published=eq.true&published_at=lte.' + now + '&order=published_at.desc'), null) : null,
    need.about ? ok(rest('about_items?select=*&published=eq.true&order=sort_order.asc'), null) : null,
    need.gallery ? ok(rest('gallery_items?select=*&published=eq.true&order=sort_order.asc,created_at.desc'), null) : null
  ]).then(function (res) {
    var map = {};
    (res[0] || []).forEach(function (r) { map[r.key] = r.value; });
    applyContent(map);
    var S = applySettings(map);
    if (res[1]) renderFaqs(res[1]);
    if (res[2]) renderPlans(res[2]);
    if (res[4]) renderBlog(res[4]);
    if (res[5]) renderAbout(res[5]);
    var base = window.SITE_DATA || {};
    var data = { aboutVideo: S.about_video || '', gallery: res[6] || [], heroVideo: S.hero_video !== undefined ? S.hero_video : base.heroVideo, aboutPhoto: S.about_photo !== undefined ? S.about_photo : base.aboutPhoto, portfolio: base.portfolio };
    if (res[3]) data.portfolio = res[3].map(function (r) { return { title: r.title, category: r.category, url: r.url, thumb: r.thumb, aspect: r.aspect, description: r.description, featured: r.featured }; });
    window.SITE_DATA = data;
  }).catch(function () {}).then(function () { clearTimeout(safety); finish(); });
})();
