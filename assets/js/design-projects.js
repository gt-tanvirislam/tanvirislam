/* Tanvir.Studio | Graphic design projects, Pinterest grid + Behance style project page
   NEW FILE: add it as assets/js/design-projects.js */
(function () {
  'use strict';
  var doc = document;
  var cfg = window.TS_CONFIG || {};
  var grid = doc.querySelector('[data-work-grid]');
  if (!grid || !cfg.SUPABASE_URL || /YOUR_/.test(cfg.SUPABASE_URL + cfg.SUPABASE_ANON_KEY) || window.__dpLoaded) return;
  window.__dpLoaded = true;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var I = {
    pen: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.6 7.6"/><circle cx="11" cy="11" r="2"/>',
    img: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', close: '<path d="M18 6L6 18M6 6l12 12"/>', back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    wa: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/>'
  };
  function ic(n) { return '<svg class="dp-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + I[n] + '</svg>'; }

  /* ---------- styles ---------- */
  var css = [
    '.work-cols.dp-pin{columns:4;column-gap:16px}.work-cols.dp-pin .tile{margin-bottom:16px;border-radius:14px}',
    '@media(max-width:1060px){.work-cols.dp-pin{columns:3}}@media(max-width:640px){.work-cols.dp-pin{columns:2;column-gap:10px}.work-cols.dp-pin .tile{margin-bottom:10px}}@media(max-width:380px){.work-cols.dp-pin{columns:1}}',
    '.dp-tile .dp-count{position:absolute;top:14px;right:14px;z-index:3;display:inline-flex;align-items:center;gap:6px;background:rgba(8,19,56,.78);color:#fff;border-radius:999px;padding:5px 11px;font-weight:700;font-size:.78rem}',
    '.dp-ic{width:1.1em;height:1.1em;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;flex:none}',
    '.dp-overlay{position:fixed;inset:0;z-index:950;background:#e9edf6;overflow-y:auto;display:none;-webkit-overflow-scrolling:touch}',
    '.dp-overlay.open{display:block;animation:dpIn .45s cubic-bezier(.22,1,.36,1)}@keyframes dpIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}',
    '.dp-bar{position:sticky;top:0;z-index:5;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px clamp(14px,3vw,32px);background:rgba(255,255,255,.94);box-shadow:0 1px 0 #e4eaf8;font-family:"Plus Jakarta Sans",system-ui,sans-serif}',
    '.dp-bar button{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:12px;background:#f3f7ff;color:#0c1a45;font:inherit;font-weight:700;border:0;cursor:pointer}.dp-bar button:hover{background:#2252ff;color:#fff}',
    '.dp-wrap{max-width:1180px;margin:0 auto;padding:18px clamp(12px,3vw,28px) 80px;font-family:"Plus Jakarta Sans",system-ui,sans-serif;color:#0c1a45}',
    '.dp-head{background:#fff;border-radius:22px;padding:clamp(22px,4vw,44px);box-shadow:0 0 0 1px #e4eaf8;margin-bottom:16px}',
    '.dp-cat{display:inline-flex;align-items:center;gap:8px;background:#e3ecff;color:#1739c9;border-radius:999px;padding:6px 14px;font-weight:800;font-size:.82rem}',
    '.dp-head h2{font-family:Sora,"Plus Jakarta Sans",sans-serif;font-size:clamp(1.8rem,4.2vw,3rem);letter-spacing:-.035em;line-height:1.1;margin:16px 0 10px;color:#0c1a45}',
    '.dp-desc{color:#5a6690;font-size:1.05rem;line-height:1.75;max-width:70ch;white-space:pre-line}',
    '.dp-meta{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.dp-meta span{background:#f3f7ff;border-radius:10px;padding:6px 12px;font-weight:700;font-size:.85rem;color:#2c3a66}',
    '.dp-blocks{display:grid;gap:14px}.dp-img{margin:0}.dp-img img{display:block;width:100%;height:auto;border-radius:12px;background:#dfe6f5}',
    '.dp-img figcaption{font-size:.88rem;color:#5a6690;padding:8px 4px 0;text-align:center}',
    '.dp-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media(max-width:640px){.dp-row{grid-template-columns:1fr}}',
    '.dp-text{background:#fff;border-radius:18px;padding:clamp(20px,4vw,40px);box-shadow:0 0 0 1px #e4eaf8}.dp-text div{max-width:760px;margin:0 auto;font-size:1.06rem;line-height:1.85;color:#2c3a66}.dp-text p+p{margin-top:14px}',
    '.dp-h{font-family:Sora,"Plus Jakarta Sans",sans-serif;font-size:clamp(1.3rem,2.6vw,1.9rem);letter-spacing:-.03em;text-align:center;padding:18px 8px 4px;margin:0}',
    '.dp-foot{background:#fff;border-radius:22px;padding:clamp(22px,4vw,40px);box-shadow:0 0 0 1px #e4eaf8;margin-top:16px}',
    '.dp-foot h3{font-family:Sora,"Plus Jakarta Sans",sans-serif;font-size:1.5rem;letter-spacing:-.03em;margin:0 0 6px}.dp-foot p{color:#5a6690;margin:0 0 18px}',
    '.dp-cta{display:flex;flex-wrap:wrap;gap:10px}.dp-cta a{display:inline-flex;align-items:center;gap:8px;padding:13px 22px;border-radius:14px;background:#2252ff;color:#fff;font-weight:700;text-decoration:none}.dp-cta a.wa{background:#25d366}.dp-cta a:hover{filter:brightness(.92)}',
    '.dp-more{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:26px}@media(max-width:640px){.dp-more{grid-template-columns:1fr 1fr}}',
    '.dp-more button{border:0;padding:0;background:none;text-align:left;cursor:pointer;font:inherit;color:inherit}.dp-more img,.dp-more .ph{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:14px;background:#dfe6f5}.dp-more b{display:block;margin-top:8px;font-size:.95rem}',
    '.dp-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:990;background:#081338;color:#fff;border-radius:12px;padding:11px 18px;font-weight:700;font-family:system-ui,sans-serif}'
  ].join('\n');
  var st = doc.createElement('style'); st.textContent = css; doc.head.appendChild(st);

  /* ---------- data ---------- */
  var M = window.TSMedia;
  function thumbOf(u) { var m = M && u ? M.parse(u) : null; return (m && (m.thumb || m.src)) || u || ''; }
  function fullOf(u) { var m = M && u ? M.parse(u) : null; return (m && m.src) || u || ''; }
  function norm(p) {
    var blocks = p.blocks;
    if (typeof blocks === 'string') { try { blocks = JSON.parse(blocks); } catch (e) { blocks = []; } }
    blocks = Array.isArray(blocks) ? blocks : [];
    var firstImg = blocks.filter(function (b) { return b.type === 'image' && b.url; })[0];
    return { id: p.id, slug: p.slug, title: p.title, description: p.description || '', client: p.client || '', year: p.year || '', tags: (p.tags || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean),
      cover: p.cover_url || (firstImg && firstImg.url) || '', coverAlt: p.cover_alt || p.title, blocks: blocks, count: blocks.filter(function (b) { return b.type === 'image' && b.url; }).length };
  }

  var url = cfg.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/design_projects?select=*&published=eq.true&order=sort_order.asc,created_at.desc';
  fetch(url, { headers: { apikey: cfg.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + cfg.SUPABASE_ANON_KEY } })
    .then(function (r) { if (!r.ok) throw new Error('design'); return r.json(); })
    .then(function (rows) { if (rows.length) waitForGrid(function () { mount(rows.map(norm)); }); })
    .catch(function () { /* the portfolio keeps working without this */ });

  function waitForGrid(cb) {
    var tries = 0;
    (function poll() { if (grid.querySelector('.tile, .empty-note') || tries++ > 80) cb(); else setTimeout(poll, 120); })();
  }

  /* ---------- grid ---------- */
  var tiles = [], projects = [];
  function mount(list) {
    projects = list;
    Array.prototype.forEach.call(grid.querySelectorAll('.tile[data-cat="design"]'), function (t) { t.style.display = 'none'; });
    var empty = grid.querySelector('.empty-note'); if (empty) empty.style.display = 'none';
    var frag = doc.createDocumentFragment();
    list.forEach(function (p, i) {
      var fig = doc.createElement('figure');
      fig.className = 'tile dp-tile'; fig.setAttribute('data-cat', 'design'); fig.tabIndex = 0; fig.setAttribute('role', 'button'); fig.setAttribute('aria-label', 'Open project: ' + p.title);
      fig.innerHTML = '<div class="tile-media auto' + (p.cover ? '' : ' noimg') + '">' + (p.cover ? '<img src="' + esc(thumbOf(p.cover)) + '" alt="' + esc(p.coverAlt) + '" loading="lazy" decoding="async">' : '') + '</div><div class="tile-shade"></div>' +
        '<span class="tile-badge">' + ic('pen') + 'Graphic Design</span>' + (p.count ? '<span class="dp-count">' + ic('img') + p.count + '</span>' : '') +
        '<figcaption class="tile-info"><div><h3>' + esc(p.title) + '</h3><p>' + (p.client ? esc(p.client) : 'View project') + '</p></div><span class="go">' + ic('arrow') + '</span></figcaption>';
      var img = fig.querySelector('img'); if (img) img.addEventListener('error', function () { fig.querySelector('.tile-media').classList.add('noimg'); });
      fig._p = p; tiles.push(fig); frag.appendChild(fig);
    });
    grid.appendChild(frag);
    /* capture phase + stopPropagation so the normal portfolio viewer does not also try to open */
    grid.addEventListener('click', function (e) { var t = e.target.closest('.dp-tile'); if (t) { e.stopPropagation(); open(t._p, true); } }, true);
    grid.addEventListener('keydown', function (e) { if (e.key !== 'Enter' && e.key !== ' ') return; var t = e.target.closest('.dp-tile'); if (t) { e.preventDefault(); e.stopPropagation(); open(t._p, true); } }, true);
    window.addEventListener('hashchange', function () {
      var hm = /^#design-(.+)$/.exec(location.hash); if (!hm) return;
      var hit2 = projects.filter(function (p) { return p.slug === decodeURIComponent(hm[1]); })[0];
      if (hit2 && (!ov || !ov.classList.contains('open') || ov.getAttribute('aria-label') !== hit2.title)) open(hit2, false);
    });
    doc.addEventListener('click', function (e) { if (e.target.closest('.filter')) setTimeout(applyFilter, 0); });
    applyFilter();
    var m = /^#design-(.+)$/.exec(location.hash);
    if (m) { var hit = projects.filter(function (p) { return p.slug === decodeURIComponent(m[1]); })[0]; if (hit) open(hit, false); }
  }
  function applyFilter() {
    var a = doc.querySelector('.filter.active'), f = a ? a.getAttribute('data-filter') : 'all', show = (f === 'all' || f === 'design');
    tiles.forEach(function (t) { t.classList.toggle('hide', !show); });
    grid.classList.toggle('dp-pin', f === 'design');
  }

  /* ---------- Behance style project page ---------- */
  var ov = null, lastFocus = null;
  function waLink() { return doc.documentElement.getAttribute('data-wa') || ''; }
  function blocksHtml(blocks) {
    var out = '', i = 0;
    while (i < blocks.length) {
      var b = blocks[i];
      if (b.type === 'image' && b.url) {
        if (b.size === 'half' && blocks[i + 1] && blocks[i + 1].type === 'image' && blocks[i + 1].size === 'half' && blocks[i + 1].url) {
          out += '<div class="dp-row">' + imgHtml(b) + imgHtml(blocks[i + 1]) + '</div>'; i += 2; continue;
        }
        out += imgHtml(b);
      } else if (b.type === 'text' && b.text) {
        out += '<div class="dp-text"><div>' + String(b.text).split(/\n{2,}/).map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; }).join('') + '</div></div>';
      } else if (b.type === 'heading' && b.text) {
        out += '<h3 class="dp-h">' + esc(b.text) + '</h3>';
      }
      i++;
    }
    return out;
  }
  function imgHtml(b) { return '<figure class="dp-img"><img src="' + esc(fullOf(b.url)) + '" alt="' + esc(b.alt || '') + '" loading="lazy" decoding="async">' + (b.caption ? '<figcaption>' + esc(b.caption) + '</figcaption>' : '') + '</figure>'; }

  function open(p, push) {
    if (!ov) {
      ov = doc.createElement('div'); ov.className = 'dp-overlay'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); doc.body.appendChild(ov);
      doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('open')) close(true); });
      window.addEventListener('popstate', function () { if (ov.classList.contains('open') && !/^#design-/.test(location.hash)) close(false); });
    }
    lastFocus = doc.activeElement;
    var more = projects.filter(function (x) { return x !== p; }).slice(0, 3);
    ov.setAttribute('aria-label', p.title);
    ov.innerHTML = '<div class="dp-bar"><button type="button" data-dp-close>' + ic('back') + ' Back to portfolio</button><div style="display:flex;gap:8px"><button type="button" data-dp-share>' + ic('link') + ' Copy link</button><button type="button" data-dp-close aria-label="Close project">' + ic('close') + '</button></div></div>' +
      '<div class="dp-wrap"><header class="dp-head"><span class="dp-cat">' + ic('pen') + ' Graphic Design</span><h2>' + esc(p.title) + '</h2>' + (p.description ? '<p class="dp-desc">' + esc(p.description) + '</p>' : '') +
      ((p.client || p.year || p.tags.length) ? '<div class="dp-meta">' + (p.client ? '<span>Client: ' + esc(p.client) + '</span>' : '') + (p.year ? '<span>' + esc(p.year) + '</span>' : '') + p.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' : '') + '</header>' +
      '<div class="dp-blocks">' + blocksHtml(p.blocks) + '</div>' +
      '<footer class="dp-foot"><h3>Like this work?</h3><p>Tell us about your project and we will reply within one business day.</p><div class="dp-cta"><a href="/contact">Contact ' + ic('arrow') + '</a>' + (waLink() ? '<a class="wa" href="' + esc(waLink()) + '" target="_blank" rel="noopener">' + ic('wa') + ' WhatsApp</a>' : '') + '</div>' +
      (more.length ? '<div class="dp-more">' + more.map(function (m, i) { return '<button type="button" data-dp-more="' + projects.indexOf(m) + '">' + (m.cover ? '<img src="' + esc(thumbOf(m.cover)) + '" alt="' + esc(m.coverAlt) + '" loading="lazy">' : '<div class="ph"></div>') + '<b>' + esc(m.title) + '</b></button>'; }).join('') + '</div>' : '') + '</footer></div>';
    ov.onclick = function (e) {
      if (e.target.closest('[data-dp-close]')) return close(true);
      var mo = e.target.closest('[data-dp-more]'); if (mo) { var np = projects[+mo.getAttribute('data-dp-more')]; if (np) { history.replaceState({ dp: np.slug }, '', '#design-' + encodeURIComponent(np.slug)); open(np, false); ov.scrollTop = 0; } return; }
      if (e.target.closest('[data-dp-share]')) {
        var link = location.href.split('#')[0] + '#design-' + encodeURIComponent(p.slug);
        function done() { var t = doc.createElement('div'); t.className = 'dp-toast'; t.textContent = 'Link copied'; doc.body.appendChild(t); setTimeout(function () { t.remove(); }, 1800); }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(done, done); else done();
      }
    };
    ov.classList.add('open'); ov.scrollTop = 0; doc.body.style.overflow = 'hidden';
    if (push) history.pushState({ dp: p.slug }, '', '#design-' + encodeURIComponent(p.slug));
    var c = ov.querySelector('[data-dp-close]'); if (c) c.focus({ preventScroll: true });
  }
  function close(popHistory) {
    if (!ov) return;
    ov.classList.remove('open'); ov.innerHTML = ''; doc.body.style.overflow = '';
    if (popHistory && /^#design-/.test(location.hash)) { if (history.state && history.state.dp) history.back(); else history.replaceState(null, '', location.pathname + location.search); }
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
})();
