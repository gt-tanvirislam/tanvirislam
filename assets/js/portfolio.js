/* Builds the portfolio grids, the project viewer and the hero video from site-data.js */
(function () {
  'use strict';
  function boot() {
  var D = window.SITE_DATA || {};
  var M = window.TSMedia;
  var doc = document;
  var CATS = { video: ['Video Editing', 'film'], motion: ['Motion Graphics', 'layers'], design: ['Graphic Design', 'pen'] };
  function waUrl() { return doc.documentElement.getAttribute('data-wa') || '#'; }

  function ic(n, c) { return '<svg class="ic ' + (c || '') + '" aria-hidden="true" focusable="false"><use href="#i-' + n + '"/></svg>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function css(a) { return a ? (a + '').replace(':', ' / ') : ''; }

  function prepare(list) {
    return (list || []).map(function (it) {
      var m = M.parse(it.url);
      if (!m) return null;
      var thumb = it.thumb ? (M.parse(it.thumb) || {}).thumb || it.thumb : m.thumb;
      var asp = it.aspect || m.aspect;
      return { title: it.title || 'Untitled project', category: CATS[it.category] ? it.category : 'video', description: it.description || '',
               media: m, thumb: thumb, aspect: asp, ratio: M.ratio(asp), featured: !!it.featured };
    }).filter(Boolean);
  }
  var items = prepare(D.portfolio);

  /* ----- media markup shared by hero and viewer ----- */
  function mediaHTML(m, autoplay, title) {
    if (m.kind === 'youtube') return '<iframe src="' + m.embed + (autoplay ? '&autoplay=1' : '') + '" title="' + esc(title) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>';
    if (m.kind === 'vimeo') return '<iframe src="' + m.embed + (autoplay ? '?autoplay=1' : '') + '" title="' + esc(title) + '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
    if (m.kind === 'drive') return '<iframe src="' + m.embed + '" title="' + esc(title) + '" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>';
    if (m.kind === 'video') return '<video src="' + esc(m.src) + '" controls ' + (autoplay ? 'autoplay ' : '') + 'playsinline preload="metadata"></video>';
    return '<img src="' + esc(m.src) + '" alt="' + esc(title) + '">';
  }

  /* ----- tiles ----- */
  function tileEl(it) {
    var cat = CATS[it.category];
    var fig = doc.createElement('figure');
    fig.className = 'tile';
    fig.setAttribute('data-cat', it.category);
    fig.setAttribute('data-reveal', 'rise');
    fig.tabIndex = 0;
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', 'View project: ' + it.title);
    var style = it.ratio ? ' style="aspect-ratio:' + css(it.aspect) + '"' : '';
    fig.innerHTML =
      '<div class="tile-media' + (it.ratio ? '' : ' auto') + (it.thumb ? '' : ' noimg') + '"' + style + '>' +
      (it.thumb ? '<img src="' + esc(it.thumb) + '" alt="' + esc(it.title) + '" loading="lazy" decoding="async">' : '') +
      '</div><div class="tile-shade"></div>' +
      (it.media.video ? '<div class="tile-play" aria-hidden="true"><span>' + ic('play', 'ic-fill') + '</span></div>' : '') +
      '<span class="tile-badge">' + ic(cat[1]) + cat[0] + '</span>' +
      '<figcaption class="tile-info"><div><h3>' + esc(it.title) + '</h3><p>' + (it.media.video ? 'Watch project' : 'View project') + '</p></div><span class="go">' + ic('arrow') + '</span></figcaption>';
    var img = fig.querySelector('img');
    if (img) img.addEventListener('error', function () { fig.querySelector('.tile-media').classList.add('noimg'); });
    fig._item = it;
    return fig;
  }

  /* ----- viewer ----- */
  var viewer, list = [], idx = 0, lastFocus = null;
  function buildViewer() {
    viewer = doc.createElement('div');
    viewer.className = 'viewer';
    viewer.setAttribute('role', 'dialog');
    viewer.setAttribute('aria-modal', 'true');
    viewer.setAttribute('aria-label', 'Project viewer');
    viewer.innerHTML =
      '<button class="v-btn v-close" type="button" aria-label="Close viewer">' + ic('close') + '</button>' +
      '<button class="v-btn v-prev" type="button" aria-label="Previous project">' + ic('arrow') + '</button>' +
      '<button class="v-btn v-next" type="button" aria-label="Next project">' + ic('arrow') + '</button>' +
      '<div class="viewer-box"><div class="viewer-media"></div><div class="viewer-cap"><div><span class="cat"></span><h3></h3><p></p></div>' +
      '<div class="viewer-actions"><a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="' + esc(waUrl()) + '">' + ic('whatsapp', 'ic-fill') + ' WhatsApp</a>' +
      '<a class="btn btn-sm" href="contact.html">Contact ' + ic('arrow') + '</a></div></div></div>';
    doc.body.appendChild(viewer);
    viewer.addEventListener('click', function (e) { if (e.target === viewer) close(); });
    viewer.querySelector('.v-close').addEventListener('click', close);
    viewer.querySelector('.v-prev').addEventListener('click', function () { show(idx - 1); });
    viewer.querySelector('.v-next').addEventListener('click', function () { show(idx + 1); });
    doc.addEventListener('keydown', function (e) {
      if (!viewer.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'ArrowLeft') show(idx - 1);
    });
  }
  function show(i) {
    if (!list.length) return;
    idx = (i + list.length) % list.length;
    var it = list[idx], m = it.media, box = viewer.querySelector('.viewer-media');
    var r = it.ratio || (m.kind === 'image' ? 1.5 : 1.7778);
    box.style.setProperty('--ar', r);
    box.innerHTML = mediaHTML(m, true, it.title);
    if (m.kind === 'image' && !it.ratio) {
      var im = box.querySelector('img');
      im.addEventListener('load', function () { if (im.naturalWidth && im.naturalHeight) box.style.setProperty('--ar', im.naturalWidth / im.naturalHeight); });
    }
    viewer.querySelector('.cat').textContent = it.label || CATS[it.category][0];
    viewer.querySelector('.viewer-actions').style.display = it.noCta ? 'none' : '';
    viewer.querySelector('h3').textContent = it.title;
    var p = viewer.querySelector('p'); p.textContent = it.description; p.style.display = it.description ? '' : 'none';
    var multi = list.length > 1;
    viewer.querySelector('.v-prev').style.display = multi ? '' : 'none';
    viewer.querySelector('.v-next').style.display = multi ? '' : 'none';
  }
  function open(it, group) {
    if (!viewer) buildViewer();
    list = group; idx = Math.max(0, group.indexOf(it));
    lastFocus = doc.activeElement;
    show(idx);
    viewer.classList.add('open');
    doc.body.style.overflow = 'hidden';
    viewer.querySelector('.v-close').focus();
  }
  function close() {
    if (!viewer) return;
    viewer.classList.remove('open');
    viewer.querySelector('.viewer-media').innerHTML = '';
    doc.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function wire(container) {
    function target(e) { var t = e.target.closest('.tile'); return t && container.contains(t) ? t : null; }
    function group() { return Array.prototype.slice.call(container.querySelectorAll('.tile:not(.hide)')).map(function (t) { return t._item; }); }
    container.addEventListener('click', function (e) { var t = target(e); if (t) open(t._item, group()); });
    container.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var t = target(e); if (t) { e.preventDefault(); open(t._item, group()); }
    });
  }

  function fill(container, arr) {
    if (!arr.length) {
      container.innerHTML = '<div class="empty-note"><h3>Projects will appear here</h3><p>Add your first project link in assets/js/site-data.js.</p></div>';
      return;
    }
    var frag = doc.createDocumentFragment();
    arr.forEach(function (it, i) { var t = tileEl(it); t.setAttribute('data-delay', (i % 3) * 110); frag.appendChild(t); });
    container.innerHTML = '';
    container.appendChild(frag);
    wire(container);
  }

  var grid = doc.querySelector('[data-work-grid]');
  if (grid) fill(grid, items);
  var feat = doc.querySelector('[data-work-feature]');
  if (feat) {
    var fl = items.filter(function (i) { return i.featured; });
    fill(feat, (fl.length ? fl : items).slice(0, 6));
  }

  /* ----- lite video players (hero and About page) ----- */
  function lite(box, link, soonText) {
    var hm = M.parse(link);
    var label = box.getAttribute('data-title') || 'Video';
    if (!hm) {
      box.classList.add('soon');
      box.innerHTML = '<div><span class="play-orb" style="width:72px;height:72px">' + ic('play', 'ic-fill') + '</span><strong>' + esc(soonText) + '</strong></div>';
      return;
    }
    box.innerHTML = '<button class="player-btn" type="button" aria-label="Play video: ' + esc(label) + '">' +
      (hm.thumb ? '<img src="' + esc(hm.thumb) + '" alt="' + esc(label) + '" loading="eager" fetchpriority="high" width="480" height="360">' : '') +
      '<span class="play-orb">' + ic('play', 'ic-fill') + '</span><span class="player-cap">' + esc(label) + '</span></button>';
    var img = box.querySelector('img');
    if (img) img.addEventListener('error', function () { box.classList.add('noimg'); img.style.display = 'none'; });
    box.querySelector('.player-btn').addEventListener('click', function () { box.innerHTML = mediaHTML(hm, true, label); });
  }
  var hv = doc.querySelector('[data-hero-video]');
  if (hv) lite(hv, D.heroVideo, 'Showreel coming soon');
  var av = doc.querySelector('[data-about-video]');
  if (av) lite(av, D.aboutVideo, 'Intro video coming soon');

  /* ----- gallery (About page) ----- */
  var gal = doc.querySelector('[data-gallery]');
  if (gal) {
    var gsec = doc.querySelector('[data-gallery-section]');
    var gitems = (D.gallery || []).map(function (g) {
      var m = M.parse(g.image_url); if (!m) return null;
      return { title: g.caption || 'Photo', description: '', label: g.category === 'achievement' ? 'Achievement' : 'Tour', category: g.category, noCta: true,
               media: { kind: 'image', src: m.src || g.image_url, video: false }, thumb: m.thumb || g.image_url, aspect: 'auto', ratio: null };
    }).filter(Boolean);
    if (gsec) gsec.hidden = !gitems.length;
    var gf = doc.createDocumentFragment();
    gitems.forEach(function (it, i) {
      var fig = doc.createElement('figure');
      fig.className = 'tile'; fig.setAttribute('data-gcat', it.category); fig.setAttribute('data-reveal', 'rise'); fig.setAttribute('data-delay', (i % 4) * 90);
      fig.tabIndex = 0; fig.setAttribute('role', 'button'); fig.setAttribute('aria-label', 'View photo: ' + it.title);
      fig.innerHTML = '<div class="tile-media auto"><img src="' + esc(it.thumb) + '" alt="' + esc(it.title) + '" loading="lazy" decoding="async"></div>' + (it.title !== 'Photo' ? '<div class="tile-cap">' + esc(it.title) + '</div>' : '');
      fig._item = it; gf.appendChild(fig);
    });
    gal.appendChild(gf);
    wire(gal);
    $gf = doc.querySelectorAll('[data-gfilter]');
    Array.prototype.forEach.call($gf, function (btn) {
      btn.addEventListener('click', function () {
        Array.prototype.forEach.call($gf, function (b) { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true');
        var c = btn.getAttribute('data-gfilter');
        Array.prototype.forEach.call(gal.querySelectorAll('.tile'), function (t) { t.classList.toggle('hide', !(c === 'all' || t.getAttribute('data-gcat') === c)); });
      });
    });
  }
  var $gf;

  /* ----- about photo ----- */
  var ap = doc.querySelector('[data-about-photo]');
  if (ap && D.aboutPhoto) {
    var pm = M.parse(D.aboutPhoto);
    if (pm) { var pi = doc.createElement('img'); pi.src = pm.src || pm.thumb; pi.alt = 'Tanvir.Studio'; pi.loading = 'lazy'; ap.appendChild(pi); }
  }
  }
  (window.TSReady || Promise.resolve()).then(boot);
})();
