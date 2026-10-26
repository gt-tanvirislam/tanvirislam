/* Tanvir.Studio | Admin dashboard (vanilla JS + Supabase) */
(function () {
  'use strict';

  var cfg = window.TS_CONFIG || {};
  var app = document.getElementById('app');
  var sb = null, session = null, main = null, shell = null;
  var currentView = 'dashboard';

  /* ---------------- helpers ---------------- */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function slugify(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80); }
  function fmt(d) { try { return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } }
  function toLocalInput(d) { var x = new Date(d || Date.now()); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 16); }

  var P = {
    layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
    pen: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.6 7.6"/><circle cx="11" cy="11" r="2"/>',
    dollar: '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    film: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 12h18M3 16h4M17 8h4M17 16h4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>', up: '<path d="M18 15l-6-6-6 6"/>', down: '<path d="M6 9l6 6 6-6"/>',
    ext: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>', check: '<polyline points="20 6 9 17 4 12"/>', menu: '<path d="M3 7h18M3 12h18M3 17h18"/>', key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3"/>'
  };
  function ico(n) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + (P[n] || '') + '</svg>'; }

  function toast(msg, type) {
    var t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.textContent = msg;
    $('#toasts').appendChild(t);
    setTimeout(function () { t.remove(); }, type === 'err' ? 6000 : 3200);
  }
  async function run(p, okMsg) {
    var r = await p;
    if (r && r.error) { toast(r.error.message || 'Something went wrong', 'err'); throw r.error; }
    if (okMsg) toast(okMsg, 'ok');
    return r;
  }

  function openModal(title, html, opts) {
    opts = opts || {};
    var ov = document.createElement('div');
    ov.className = 'overlay';
    ov.innerHTML = '<div class="modal ' + (opts.wide ? 'wide' : '') + '" role="dialog" aria-modal="true"><h2>' + esc(title) + '</h2>' + html + '</div>';
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
    function close() { ov.remove(); document.body.style.overflow = ''; }
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });
    var onKey = function (e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } };
    document.addEventListener('keydown', onKey);
    var first = $('input, textarea, select', ov); if (first) first.focus();
    return { el: ov.firstChild, close: close };
  }

  /* ---------------- generic form fields ---------------- */
  function fieldHtml(f, val) {
    var id = 'f_' + f.name, v = val === undefined || val === null ? '' : val, h = '';
    h += '<div class="fld"' + (f.hidden ? ' style="display:none"' : '') + '><label class="f" for="' + id + '">' + esc(f.label) + (f.required ? ' *' : '') + '</label>';
    if (f.type === 'textarea') h += '<textarea id="' + id + '" name="' + f.name + '" rows="' + (f.rows || 4) + '">' + esc(v) + '</textarea>';
    else if (f.type === 'lines') h += '<textarea id="' + id + '" name="' + f.name + '" rows="' + (f.rows || 6) + '">' + esc((v || []).join('\n')) + '</textarea>';
    else if (f.type === 'select') h += '<select id="' + id + '" name="' + f.name + '">' + f.options.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(v) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>';
    else if (f.type === 'checkbox') h = '<div class="fld"><label class="tick"><input type="checkbox" id="' + id + '" name="' + f.name + '"' + (v ? ' checked' : '') + '> ' + esc(f.label) + '</label>';
    else if (f.type === 'checks') h += '<div class="checks">' + f.options.map(function (o) { return '<label><input type="checkbox" name="' + f.name + '" value="' + esc(o[0]) + '"' + ((v || []).indexOf(o[0]) > -1 ? ' checked' : '') + '> ' + esc(o[1]) + '</label>'; }).join('') + '</div>';
    else {
      var input = '<input id="' + id + '" name="' + f.name + '" type="' + (f.type || 'text') + '" value="' + esc(v) + '"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + (f.step ? ' step="' + f.step + '"' : '') + '>';
      h += f.upload ? '<div class="inline">' + input + '<button type="button" class="btn ghost sm" data-upload="' + f.name + '">' + ico('upload') + ' Upload</button></div>' : input;
    }
    if (f.preview) h += '<div class="mini-preview" data-preview="' + f.name + '"></div>';
    if (f.hint) h += '<div class="hint">' + esc(f.hint) + '</div>';
    return h + '</div>';
  }
  function readFields(root, fields) {
    var out = {};
    fields.forEach(function (f) {
      var els = $$('[name="' + f.name + '"]', root);
      if (!els.length) return;
      if (f.type === 'checkbox') out[f.name] = els[0].checked;
      else if (f.type === 'checks') out[f.name] = els.filter(function (e) { return e.checked; }).map(function (e) { return e.value; });
      else if (f.type === 'lines') out[f.name] = els[0].value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
      else if (f.type === 'number') out[f.name] = els[0].value === '' ? 0 : Number(els[0].value);
      else out[f.name] = els[0].value.trim();
    });
    return out;
  }
  function wireUploads(root) {
    $$('[data-upload]', root).forEach(function (b) {
      b.addEventListener('click', async function () {
        var url = await pickAndUpload();
        if (url) { var inp = $('[name="' + b.getAttribute('data-upload') + '"]', root); inp.value = url; inp.dispatchEvent(new Event('input', { bubbles: true })); }
      });
    });
    $$('[data-preview]', root).forEach(function (box) {
      var inp = $('[name="' + box.getAttribute('data-preview') + '"]', root);
      function upd() {
        var m = window.TSMedia && inp.value ? TSMedia.parse(inp.value) : null;
        if (!m) { box.innerHTML = ''; return; }
        var kind = { youtube: 'YouTube video', vimeo: 'Vimeo video', drive: 'Google Drive file', video: 'Video file', image: 'Image' }[m.kind];
        box.innerHTML = (m.thumb ? '<img alt="" src="' + esc(m.thumb) + '" onerror="this.style.display=\'none\'">' : '') + '<span>Detected: ' + kind + '</span>';
      }
      inp.addEventListener('input', upd); upd();
    });
  }

  function pickAndUpload() {
    return new Promise(function (resolve) {
      var inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*,video/mp4';
      inp.onchange = async function () {
        var f = inp.files[0]; if (!f) return resolve('');
        try { resolve(await uploadFile(f)); } catch (e) { resolve(''); }
      };
      inp.click();
    });
  }
  async function uploadFile(file) {
    var name = Date.now() + '-' + file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
    var path = 'uploads/' + name;
    toast('Uploading ' + file.name + '...');
    await run(sb.storage.from('media').upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type }));
    var url = sb.storage.from('media').getPublicUrl(path).data.publicUrl;
    toast('Upload complete', 'ok');
    return url;
  }

  function pageHead(title, sub, actions) {
    return '<div class="top"><div><h1>' + esc(title) + '</h1>' + (sub ? '<div class="sub">' + esc(sub) + '</div>' : '') + '</div><div class="quick">' + (actions || '') + '</div></div>';
  }

  /* ---------------- auth + shell ---------------- */
  function renderLogin(msg) {
    app.innerHTML = '<div class="login"><form class="login-card" id="login"><span class="brand"><i>' + ico('film') + '</i> Tanvir.Studio</span><h1>Dashboard login</h1><p>Sign in to manage your website.</p>' +
      (msg ? '<div class="toast err" style="margin-bottom:16px">' + esc(msg) + '</div>' : '') +
      '<div class="fld"><label class="f" for="em">Email</label><input id="em" type="email" autocomplete="username" required></div>' +
      '<div class="fld"><label class="f" for="pw">Password</label><input id="pw" type="password" autocomplete="current-password" required></div>' +
      '<button class="btn" style="width:100%" type="submit">Sign in</button></form></div>';
    $('#login').addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = $('button', this); btn.disabled = true;
      var r = await sb.auth.signInWithPassword({ email: $('#em').value.trim(), password: $('#pw').value });
      if (r.error) {
        btn.disabled = false;
        var msg = r.error.message || 'Login failed';
        if (/fetch|network|load failed/i.test(msg)) {
          var looksOk = /^https:\/\/[a-z0-9-]+\.supabase\.(co|in)\/?$/i.test(cfg.SUPABASE_URL);
          msg = 'Could not reach Supabase at ' + cfg.SUPABASE_URL + '. ' + (looksOk ? 'The address looks right, so check that the project is active (not paused), try another network, and turn off ad blockers.' : 'This address does not look right. It should be like https://abcdefghij.supabase.co (Project Settings > API > Project URL).');
        }
        return renderLogin(msg);
      }
      boot();
    });
  }

  function renderSetup() {
    app.innerHTML = '<div class="login"><div class="login-card"><span class="brand"><i>' + ico('settings') + '</i> Setup needed</span><h1>Connect Supabase</h1><p>Open <b>assets/js/config.js</b>, paste your Supabase <b>Project URL</b> and <b>anon public key</b>, then reload this page.</p></div></div>';
  }

  var NAV = [['dashboard', 'Dashboard', 'layout'], ['messages', 'Messages', 'mail'], ['portfolio', 'Portfolio', 'image'], ['blog', 'Blog', 'pen'], ['pricing', 'Pricing', 'dollar'],
    ['faqs', 'FAQs', 'chat'], ['pages', 'Page content', 'layers'], ['about', 'About page', 'users'], ['gallery', 'Gallery', 'image'], ['media', 'Media', 'film'], ['settings', 'Settings', 'settings']];

  async function renderShell() {
    var nc = 0;
    try { var r = await sb.from('messages').select('id', { count: 'exact', head: true }).eq('status', 'new'); nc = r.count || 0; } catch (e) { /* ignore */ }
    app.innerHTML = '<div class="shell" id="shell"><button class="menu-toggle" id="mt" aria-label="Menu">' + ico('menu') + '</button><aside class="side"><span class="brand"><i>' + ico('film') + '</i> Tanvir.Studio</span><nav>' +
      NAV.map(function (n) { return '<button data-view="' + n[0] + '">' + ico(n[2]) + n[1] + (n[0] === 'messages' && nc ? '<span class="badge" id="nb">' + nc + '</span>' : '') + '</button>'; }).join('') +
      '</nav><div class="foot"><span>' + esc(session.user.email) + '</span><a href="../" target="_blank" rel="noopener">' + ico('ext') + ' View website</a><button id="chpw">' + ico('key') + ' Change password</button><button id="logout">' + ico('out') + ' Log out</button></div></aside><main class="main" id="main"></main></div>';
    shell = $('#shell'); main = $('#main');
    $('#mt').onclick = function () { shell.classList.toggle('open'); };
    $$('.side nav button').forEach(function (b) { b.onclick = function () { shell.classList.remove('open'); go(b.getAttribute('data-view')); }; });
    $('#logout').onclick = async function () { await sb.auth.signOut(); session = null; renderLogin(); };
    $('#chpw').onclick = changePassword;
    go(currentView);
  }

  function changePassword() {
    var m = openModal('Change password', '<form id="pwf"><div class="fld"><label class="f" for="np">New password (min 8 characters)</label><input id="np" type="password" minlength="8" autocomplete="new-password" required></div><div class="actions"><button class="btn ghost" type="button" data-x>Cancel</button><button class="btn" type="submit">Update password</button></div></form>');
    $('[data-x]', m.el).onclick = m.close;
    $('#pwf', m.el).onsubmit = async function (e) {
      e.preventDefault();
      var r = await sb.auth.updateUser({ password: $('#np', m.el).value });
      if (r.error) return toast(r.error.message, 'err');
      toast('Password updated', 'ok'); m.close();
    };
  }

  function go(v) {
    currentView = v;
    $$('.side nav button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-view') === v); });
    window.scrollTo(0, 0);
    var views = { dashboard: vDashboard, messages: vMessages, portfolio: vPortfolio, blog: vBlog, pricing: vPricing, faqs: vFaqs, pages: vPages, about: vAbout, gallery: vGallery, media: vMedia, settings: vSettings };
    main.innerHTML = '<div class="empty">Loading...</div>';
    (views[v] || vDashboard)().catch(function (e) { main.innerHTML = '<div class="card"><h2>Something went wrong</h2><p class="muted">' + esc(e && e.message || e) + '</p></div>'; });
  }

  /* ---------------- dashboard ---------------- */
  async function count(table, mod) {
    var q = sb.from(table).select('id', { count: 'exact', head: true });
    if (mod) q = mod(q);
    var r = await q; return r.count || 0;
  }
  async function vDashboard() {
    var res = await Promise.all([count('messages', function (q) { return q.eq('status', 'new'); }), count('messages'), count('portfolio_items'),
      count('blog_posts', function (q) { return q.eq('published', true); }), count('blog_posts', function (q) { return q.eq('published', false); }), count('faqs')]);
    var recent = (await run(sb.from('messages').select('*').order('created_at', { ascending: false }).limit(5))).data || [];
    main.innerHTML = pageHead('Dashboard', 'Welcome back. Here is what is happening on your website.', '<a class="btn ghost" href="../" target="_blank" rel="noopener">' + ico('ext') + ' View website</a>') +
      '<div class="stats"><div class="stat hot"><b>' + res[0] + '</b><span>New messages</span></div><div class="stat"><b>' + res[1] + '</b><span>Total messages</span></div><div class="stat"><b>' + res[2] + '</b><span>Portfolio items</span></div><div class="stat"><b>' + res[3] + '</b><span>Published posts</span></div><div class="stat"><b>' + res[4] + '</b><span>Draft posts</span></div><div class="stat"><b>' + res[5] + '</b><span>FAQs</span></div></div>' +
      '<div class="card"><h2>Quick actions</h2><div class="quick"><button class="btn" data-go="blog" data-new="1">' + ico('plus') + ' New blog post</button><button class="btn ghost" data-go="portfolio" data-new="1">' + ico('plus') + ' Add portfolio item</button><button class="btn ghost" data-go="pages">' + ico('layers') + ' Edit page text</button><button class="btn ghost" data-go="settings">' + ico('settings') + ' Contact and social settings</button></div></div>' +
      '<div class="card"><h2>Latest messages</h2>' + (recent.length ? '<div class="tbl-wrap"><table class="tbl"><tbody>' + recent.map(function (m) { return '<tr class="click" data-msg="' + m.id + '"><td><b>' + esc(m.name) + '</b><div class="muted">' + esc(m.email) + '</div></td><td>' + esc(m.service || '-') + '</td><td>' + fmt(m.created_at) + '</td><td><span class="pill ' + m.status + '">' + m.status.replace('_', ' ') + '</span></td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="empty">No messages yet.</div>') + '</div>';
    $$('[data-go]', main).forEach(function (b) { b.onclick = function () { pendingNew = !!b.getAttribute('data-new'); go(b.getAttribute('data-go')); }; });
    $$('[data-msg]', main).forEach(function (r) { r.onclick = function () { go('messages'); }; });
  }
  var pendingNew = false;

  /* ---------------- messages ---------------- */
  var STATUSES = [['new', 'New'], ['read', 'Read'], ['in_progress', 'In progress'], ['completed', 'Completed'], ['archived', 'Archived']];
  async function vMessages() {
    var filter = 'all', rows = [];
    main.innerHTML = pageHead('Messages', 'Enquiries sent from your contact form.') + '<div class="card"><div class="filters"><select id="mf"><option value="all">All messages</option>' + STATUSES.map(function (s) { return '<option value="' + s[0] + '">' + s[1] + '</option>'; }).join('') + '</select></div><div id="ml"></div></div>';
    async function load() {
      var q = sb.from('messages').select('*').order('created_at', { ascending: false }).limit(300);
      if (filter !== 'all') q = q.eq('status', filter);
      rows = (await run(q)).data || []; draw();
    }
    function draw() {
      $('#ml').innerHTML = rows.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>From</th><th>Service</th><th>Budget</th><th>Received</th><th>Status</th></tr></thead><tbody>' + rows.map(function (m) {
        return '<tr class="click" data-id="' + m.id + '"><td><b>' + esc(m.name) + '</b><div class="muted">' + esc(m.email) + '</div></td><td>' + esc(m.service || '-') + '</td><td>' + esc(m.budget || '-') + '</td><td>' + fmt(m.created_at) + '</td><td><span class="pill ' + m.status + '">' + m.status.replace('_', ' ') + '</span></td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="empty">No messages found.</div>';
      $$('tr[data-id]', main).forEach(function (r) { r.onclick = function () { open(rows.filter(function (m) { return m.id === r.getAttribute('data-id'); })[0]); }; });
    }
    function open(m) {
      if (m.status === 'new') { sb.from('messages').update({ status: 'read' }).eq('id', m.id).then(function () { m.status = 'read'; draw(); refreshBadge(); }); }
      var body = '<div class="row2"><div class="detail"><b>Name</b><div>' + esc(m.name) + '</div></div><div class="detail"><b>Email</b><div><a href="mailto:' + esc(m.email) + '">' + esc(m.email) + '</a></div></div></div>' +
        '<div class="row3"><div class="detail"><b>Service</b><div>' + esc(m.service || '-') + '</div></div><div class="detail"><b>Budget</b><div>' + esc(m.budget || '-') + '</div></div><div class="detail"><b>Timeline</b><div>' + esc(m.timeline || '-') + '</div></div></div>' +
        '<div class="detail"><b>Company</b><div>' + esc(m.company || '-') + '</div></div><div class="detail"><b>Received</b><div>' + fmt(m.created_at) + '</div></div><div class="detail"><b>Message</b><div>' + esc(m.message) + '</div></div>' +
        '<div class="fld"><label class="f" for="ms">Status</label><select id="ms">' + STATUSES.map(function (s) { return '<option value="' + s[0] + '"' + (s[0] === (m.status === 'new' ? 'read' : m.status) ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('') + '</select></div>' +
        '<div class="fld"><label class="f" for="mn">Private notes</label><textarea id="mn" rows="3">' + esc(m.notes) + '</textarea></div>' +
        '<div class="actions"><button class="btn danger" data-del>' + ico('trash') + ' Delete</button><a class="btn ghost" href="mailto:' + esc(m.email) + '?subject=' + encodeURIComponent('Re: your project enquiry') + '">' + ico('mail') + ' Reply by email</a><button class="btn" data-save>Save</button></div>';
      var md = openModal('Message from ' + m.name, body, { wide: true });
      $('[data-save]', md.el).onclick = async function () {
        await run(sb.from('messages').update({ status: $('#ms', md.el).value, notes: $('#mn', md.el).value }).eq('id', m.id), 'Saved');
        md.close(); load(); refreshBadge();
      };
      $('[data-del]', md.el).onclick = async function () {
        if (!confirm('Delete this message permanently?')) return;
        await run(sb.from('messages').delete().eq('id', m.id), 'Message deleted'); md.close(); load(); refreshBadge();
      };
    }
    $('#mf').onchange = function () { filter = this.value; load(); };
    await load();
  }
  async function refreshBadge() {
    var n = await count('messages', function (q) { return q.eq('status', 'new'); });
    var b = $('#nb'), btn = $('.side nav button[data-view="messages"]');
    if (b) b.remove();
    if (n && btn) { var s = document.createElement('span'); s.className = 'badge'; s.id = 'nb'; s.textContent = n; btn.appendChild(s); }
  }

  /* ---------------- generic CRUD list ---------------- */
  async function crud(c) {
    var rows = [];
    main.innerHTML = pageHead(c.title, c.sub, (c.bulk ? '<button class="btn ghost" id="bulk">' + ico('upload') + ' ' + c.bulk.label + '</button>' : '') + '<button class="btn" id="addnew">' + ico('plus') + ' ' + c.newLabel + '</button>') + '<div class="card"><div id="list"></div></div>';
    async function load() {
      var q = sb.from(c.table).select('*');
      c.order.forEach(function (o) { q = q.order(o[0], { ascending: o[1] }); });
      rows = (await run(q)).data || []; draw();
    }
    function draw() {
      if (!rows.length) { $('#list').innerHTML = '<div class="empty">Nothing here yet. Click "' + esc(c.newLabel) + '" to add the first item.</div>'; return; }
      $('#list').innerHTML = '<div class="tbl-wrap"><table class="tbl"><thead><tr>' + c.columns.map(function (k) { return '<th>' + k.label + '</th>'; }).join('') + '<th></th></tr></thead><tbody>' +
        rows.map(function (r, i) {
          return '<tr data-id="' + r.id + '">' + c.columns.map(function (k) { return '<td>' + k.render(r) + '</td>'; }).join('') +
            '<td><div class="acts">' + (c.reorder ? '<button class="icon-btn" data-up="' + i + '" title="Move up">' + ico('up') + '</button><button class="icon-btn" data-down="' + i + '" title="Move down">' + ico('down') + '</button>' : '') +
            '<button class="icon-btn" data-edit="' + r.id + '" title="Edit">' + ico('edit') + '</button><button class="icon-btn danger" data-del="' + r.id + '" title="Delete">' + ico('trash') + '</button></div></td></tr>'; }).join('') + '</tbody></table></div>';
      $$('[data-edit]', main).forEach(function (b) { b.onclick = function () { form(rows.filter(function (r) { return r.id === b.getAttribute('data-edit'); })[0]); }; });
      $$('[data-del]', main).forEach(function (b) { b.onclick = async function () {
        if (!confirm('Delete this item permanently?')) return;
        await run(sb.from(c.table).delete().eq('id', b.getAttribute('data-del')), 'Deleted'); load(); }; });
      $$('[data-up]', main).forEach(function (b) { b.onclick = function () { move(+b.getAttribute('data-up'), -1); }; });
      $$('[data-down]', main).forEach(function (b) { b.onclick = function () { move(+b.getAttribute('data-down'), 1); }; });
    }
    async function move(i, d) {
      var j = i + d; if (j < 0 || j >= rows.length) return;
      var a = rows[i], b = rows[j];
      var order = rows.map(function (r, idx) { return { id: r.id, so: idx }; });
      order[i].so = j; order[j].so = i;
      await Promise.all(order.map(function (o) { return sb.from(c.table).update({ sort_order: o.so }).eq('id', o.id); }));
      load();
    }
    function form(row) {
      var isNew = !row; var vals = row || c.defaults;
      var m = openModal((isNew ? 'Add ' : 'Edit ') + c.single, '<form id="cf">' + c.fields.map(function (f) { return fieldHtml(f, vals[f.name]); }).join('') +
        '<div class="actions"><button type="button" class="btn ghost" data-x>Cancel</button><button class="btn" type="submit">Save</button></div></form>', { wide: true });
      wireUploads(m.el);
      $('[data-x]', m.el).onclick = m.close;
      $('#cf', m.el).onsubmit = async function (e) {
        e.preventDefault();
        var v = readFields(m.el, c.fields);
        for (var k = 0; k < c.fields.length; k++) { var f = c.fields[k]; if (f.required && !String(v[f.name] || '').trim()) { toast(f.label + ' is required', 'err'); return; } }
        if (isNew && c.reorder && v.sort_order === 0) v.sort_order = rows.length;
        if (isNew) await run(sb.from(c.table).insert(v), 'Added'); else await run(sb.from(c.table).update(v).eq('id', row.id), 'Saved');
        m.close(); load();
      };
    }
    $('#addnew').onclick = function () { form(null); };
    if (c.bulk) $('#bulk').onclick = function () { c.bulk.run(load, rows); };
    await load();
    if (pendingNew) { pendingNew = false; form(null); }
  }

  var CAT_OPTS = [['video', 'Video Editing'], ['motion', 'Motion Graphics'], ['design', 'Graphic Design']];
  var CAT_NAME = { video: 'Video Editing', motion: 'Motion Graphics', design: 'Graphic Design' };

  function vPortfolio() {
    return crud({
      title: 'Portfolio', sub: 'Add YouTube, Google Drive or Cloudinary links. Visitors can click any item to watch or view it.', table: 'portfolio_items', single: 'portfolio item', newLabel: 'Add portfolio item',
      order: [['sort_order', true], ['created_at', false]], reorder: true,
      defaults: { category: 'video', published: true, featured: false, sort_order: 0, aspect: '' },
      columns: [
        { label: 'Preview', render: function (r) { var m = window.TSMedia ? TSMedia.parse(r.url) : null; var t = r.thumb || (m && m.thumb); return t ? '<img class="thumb" alt="" loading="lazy" src="' + esc(t) + '" onerror="this.style.visibility=\'hidden\'">' : '<div class="thumb"></div>'; } },
        { label: 'Title', render: function (r) { return '<b>' + esc(r.title) + '</b><div class="muted">' + esc(CAT_NAME[r.category]) + '</div>'; } },
        { label: 'Status', render: function (r) { return (r.published ? '<span class="pill live">Live</span>' : '<span class="pill draft">Hidden</span>') + (r.featured ? ' <span class="pill">Home page</span>' : ''); } }
      ],
      fields: [
        { name: 'title', label: 'Title', required: true },
        { name: 'category', label: 'Category', type: 'select', options: CAT_OPTS },
        { name: 'url', label: 'Link (YouTube, Google Drive, Cloudinary, Vimeo or direct file)', required: true, upload: true, preview: true, hint: 'Google Drive files must be shared as "Anyone with the link". Uploading an image here stores it in your Supabase media bucket.' },
        { name: 'thumb', label: 'Cover image link (optional)', upload: true, hint: 'Leave empty to use the automatic YouTube / Cloudinary cover.' },
        { name: 'aspect', label: 'Shape', type: 'select', options: [['', 'Automatic'], ['16:9', 'Landscape 16:9'], ['9:16', 'Vertical 9:16'], ['1:1', 'Square 1:1'], ['4:5', 'Portrait 4:5'], ['auto', 'Natural image size']] },
        { name: 'description', label: 'Short description (optional)', type: 'textarea', rows: 3 },
        { name: 'featured', label: 'Show on the home page (first 6 featured items)', type: 'checkbox' },
        { name: 'published', label: 'Visible on the website', type: 'checkbox' },
        { name: 'sort_order', label: 'Order number (lower shows first)', type: 'number' }
      ]
    });
  }

  function vPricing() {
    return crud({
      title: 'Pricing', sub: 'Packages shown on the Pricing page.', table: 'pricing_plans', single: 'plan', newLabel: 'Add plan',
      order: [['service', true], ['sort_order', true]], reorder: false,
      defaults: { service: 'video', price: 0, unit: 'per project', features: [], is_popular: false, published: true, sort_order: 0 },
      columns: [
        { label: 'Service', render: function (r) { return esc(CAT_NAME[r.service]); } },
        { label: 'Plan', render: function (r) { return '<b>' + esc(r.name) + '</b>' + (r.is_popular ? ' <span class="pill">Most chosen</span>' : ''); } },
        { label: 'Price', render: function (r) { return '$' + Number(r.price).toLocaleString('en-US') + ' <span class="muted">' + esc(r.unit) + '</span>'; } },
        { label: 'Order', render: function (r) { return r.sort_order; } },
        { label: 'Status', render: function (r) { return r.published ? '<span class="pill live">Live</span>' : '<span class="pill draft">Hidden</span>'; } }
      ],
      fields: [
        { name: 'service', label: 'Service', type: 'select', options: CAT_OPTS },
        { name: 'name', label: 'Plan name', required: true },
        { name: 'price', label: 'Price (USD)', type: 'number', step: 'any' },
        { name: 'unit', label: 'Price label', placeholder: 'per video' },
        { name: 'description', label: 'Short description', type: 'textarea', rows: 2 },
        { name: 'features', label: 'Features (one per line)', type: 'lines', rows: 8 },
        { name: 'is_popular', label: 'Highlight as "Most chosen"', type: 'checkbox' },
        { name: 'published', label: 'Visible on the website', type: 'checkbox' },
        { name: 'sort_order', label: 'Order within the service (lower shows first)', type: 'number' }
      ]
    });
  }

  function vFaqs() {
    return crud({
      title: 'FAQs', sub: 'Choose which pages each question appears on.', table: 'faqs', single: 'FAQ', newLabel: 'Add FAQ',
      order: [['sort_order', true]], reorder: true,
      defaults: { show_on: ['home', 'services', 'pricing', 'contact'], published: true, sort_order: 0 },
      columns: [
        { label: 'Question', render: function (r) { return '<b>' + esc(r.question) + '</b>'; } },
        { label: 'Shown on', render: function (r) { return esc((r.show_on || []).join(', ')); } },
        { label: 'Status', render: function (r) { return r.published ? '<span class="pill live">Live</span>' : '<span class="pill draft">Hidden</span>'; } }
      ],
      fields: [
        { name: 'question', label: 'Question', required: true },
        { name: 'answer', label: 'Answer', type: 'textarea', rows: 5, required: true },
        { name: 'show_on', label: 'Show on these pages', type: 'checks', options: [['home', 'Home'], ['services', 'Services'], ['pricing', 'Pricing'], ['contact', 'Contact']] },
        { name: 'published', label: 'Visible on the website', type: 'checkbox' },
        { name: 'sort_order', label: 'Order number', type: 'number' }
      ]
    });
  }

  /* ---------------- blog ---------------- */
  var ALLOWED = { P: 1, H2: 1, H3: 1, H4: 1, UL: 1, OL: 1, LI: 1, A: 1, STRONG: 1, B: 1, EM: 1, I: 1, U: 1, BLOCKQUOTE: 1, IMG: 1, BR: 1, HR: 1, FIGURE: 1, FIGCAPTION: 1, CODE: 1, PRE: 1 };
  function sanitize(html) {
    var doc = new DOMParser().parseFromString('<div id="r">' + html + '</div>', 'text/html');
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) return;
        if (n.nodeType !== 1) { n.remove(); return; }
        var tag = n.tagName;
        if (/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|FORM|LINK|META)$/.test(tag)) { n.remove(); return; }
        walk(n);
        if (tag === 'DIV' || tag === 'SECTION' || tag === 'ARTICLE') {
          var p = doc.createElement('p'); while (n.firstChild) p.appendChild(n.firstChild); n.replaceWith(p); return;
        }
        if (!ALLOWED[tag]) { while (n.firstChild) n.parentNode.insertBefore(n.firstChild, n); n.remove(); return; }
        Array.prototype.slice.call(n.attributes).forEach(function (a) {
          var keep = (tag === 'A' && (a.name === 'href' || a.name === 'target' || a.name === 'rel')) || (tag === 'IMG' && (a.name === 'src' || a.name === 'alt' || a.name === 'width' || a.name === 'height'));
          if (!keep) n.removeAttribute(a.name);
        });
        if (tag === 'A') { var h = n.getAttribute('href') || ''; if (/^\s*javascript:/i.test(h)) n.setAttribute('href', '#'); if (n.getAttribute('target') === '_blank') n.setAttribute('rel', 'noopener'); }
        if (tag === 'IMG' && /^\s*javascript:/i.test(n.getAttribute('src') || '')) n.remove();
      });
    })(doc.getElementById('r'));
    return doc.getElementById('r').innerHTML.replace(/<p>(\s|&nbsp;|<br>)*<\/p>/g, '').trim();
  }

  async function vBlog() {
    var rows = (await run(sb.from('blog_posts').select('id,slug,title,category,published,published_at,updated_at,cover_url').order('published_at', { ascending: false }))).data || [];
    main.innerHTML = pageHead('Blog', 'Write, edit, publish or delete articles.', '<button class="btn" id="np">' + ico('plus') + ' New post</button>') +
      '<div class="card">' + (rows.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Title</th><th>Category</th><th>Date</th><th>Status</th><th></th></tr></thead><tbody>' + rows.map(function (r) {
        var live = r.published && new Date(r.published_at) <= new Date();
        return '<tr><td><b>' + esc(r.title) + '</b><div class="muted">/blog/' + esc(r.slug) + '</div></td><td>' + esc(r.category) + '</td><td>' + fmt(r.published_at) + '</td><td>' + (live ? '<span class="pill live">Published</span>' : r.published ? '<span class="pill">Scheduled</span>' : '<span class="pill draft">Draft</span>') +
          '</td><td><div class="acts">' + (live ? '<a class="icon-btn" target="_blank" rel="noopener" href="../blog/' + encodeURIComponent(r.slug) + '" title="View">' + ico('ext') + '</a>' : '') + '<button class="icon-btn" data-edit="' + r.id + '" title="Edit">' + ico('edit') + '</button><button class="icon-btn danger" data-del="' + r.id + '" title="Delete">' + ico('trash') + '</button></div></td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="empty">No posts yet. Click "New post" to write your first article.</div>') + '</div>';
    $('#np').onclick = function () { blogEditor(null); };
    $$('[data-edit]', main).forEach(function (b) { b.onclick = async function () {
      var r = await run(sb.from('blog_posts').select('*').eq('id', b.getAttribute('data-edit')).single()); blogEditor(r.data); }; });
    $$('[data-del]', main).forEach(function (b) { b.onclick = async function () {
      if (!confirm('Delete this post permanently?')) return;
      await run(sb.from('blog_posts').delete().eq('id', b.getAttribute('data-del')), 'Post deleted'); vBlog(); }; });
    if (pendingNew) { pendingNew = false; blogEditor(null); }
  }

  function blogEditor(post) {
    var isNew = !post; post = post || { published: false, published_at: new Date().toISOString(), category: 'General', content: '' };
    var slugTouched = !isNew;
    main.innerHTML = pageHead(isNew ? 'New post' : 'Edit post', '', '<button class="btn ghost" id="back">Back to posts</button>') +
      '<form id="pf"><div class="card"><div class="fld"><label class="f" for="t">Title *</label><input id="t" type="text" value="' + esc(post.title) + '" required></div>' +
      '<div class="row2"><div class="fld"><label class="f" for="s">URL slug *</label><input id="s" type="text" value="' + esc(post.slug) + '" required><div class="hint">Article address: /blog/<span id="sp">' + esc(post.slug || 'your-slug') + '</span></div></div>' +
      '<div class="fld"><label class="f" for="c">Category</label><input id="c" list="cats" type="text" value="' + esc(post.category) + '"><datalist id="cats"><option>Video Editing</option><option>Motion Graphics</option><option>Graphic Design</option><option>Business</option><option>General</option></datalist></div></div>' +
      '<div class="fld"><label class="f" for="e">Short summary (shown on the blog page and in search results)</label><textarea id="e" rows="3">' + esc(post.excerpt) + '</textarea></div>' +
      '<div class="fld"><label class="f" for="cv">Cover image link</label><div class="inline"><input id="cv" type="url" value="' + esc(post.cover_url) + '" placeholder="https://..."><button type="button" class="btn ghost sm" id="cvu">' + ico('upload') + ' Upload</button></div><div class="mini-preview" id="cvp"></div></div>' +
      '<div class="fld"><label class="f" for="cva">Cover image description (alt text, important for SEO)</label><input id="cva" type="text" value="' + esc(post.cover_alt) + '" placeholder="Describe the cover image in a few words"></div></div>' +
      '<div class="card"><h2>Article content</h2><div class="rte-bar" id="bar">' +
      [['p', 'Paragraph'], ['h2', 'Heading'], ['h3', 'Subheading'], ['b', 'Bold'], ['i', 'Italic'], ['ul', 'Bullets'], ['ol', 'Numbers'], ['q', 'Quote'], ['a', 'Link'], ['img', 'Image'], ['clr', 'Clear format'], ['src', 'HTML']].map(function (b) { return '<button type="button" data-c="' + b[0] + '">' + b[1] + '</button>'; }).join('') +
      '</div><div class="rte" id="rte" contenteditable="true"></div><textarea class="html-src" id="src" style="display:none"></textarea></div>' +
      '<div class="card"><h2>Search engine (optional)</h2><div class="fld"><label class="f" for="st">SEO title</label><input id="st" type="text" value="' + esc(post.seo_title) + '"></div><div class="fld"><label class="f" for="sd">SEO description</label><textarea id="sd" rows="2">' + esc(post.seo_description) + '</textarea></div>' +
      '<div class="row2"><div class="fld"><label class="f" for="rt">Reading time (optional, e.g. 5 min read)</label><input id="rt" type="text" value="' + esc(post.read_time) + '"></div><div class="fld"><label class="f" for="pd">Publish date</label><input id="pd" type="datetime-local" value="' + toLocalInput(post.published_at) + '"></div></div>' +
      '<label class="tick"><input type="checkbox" id="pb"' + (post.published ? ' checked' : '') + '> Published (visible on the website)</label></div>' +
      '<div class="card"><h2>SEO check</h2><div id="seolist" class="seolist"></div></div>' +
      '<div class="save-bar"><button class="btn" type="submit">' + (isNew ? 'Save post' : 'Save changes') + '</button><button class="btn ghost" type="button" id="back2">Cancel</button></div></form>';

    var rte = $('#rte'), src = $('#src'), srcMode = false;
    rte.innerHTML = post.content || '<p></p>';
    $('#back').onclick = $('#back2').onclick = function () { vBlog(); };
    $('#t').addEventListener('input', function () { if (!slugTouched) { $('#s').value = slugify(this.value); $('#sp').textContent = $('#s').value || 'your-slug'; } });
    $('#s').addEventListener('input', function () { slugTouched = true; this.value = slugify(this.value); $('#sp').textContent = this.value || 'your-slug'; });
    function cvPrev() { var v = $('#cv').value.trim(); $('#cvp').innerHTML = v ? '<img alt="" src="' + esc(v) + '" onerror="this.style.display=\'none\'">' : ''; }
    $('#cv').addEventListener('input', cvPrev); cvPrev();
    $('#cvu').onclick = async function () { var u = await pickAndUpload(); if (u) { $('#cv').value = u; cvPrev(); } };

    function cmd(c, v) { rte.focus(); document.execCommand(c, false, v || null); }
    $('#bar').addEventListener('click', async function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var c = b.getAttribute('data-c');
      if (c === 'src') {
        srcMode = !srcMode; b.classList.toggle('on', srcMode);
        if (srcMode) { src.value = sanitize(rte.innerHTML); rte.style.display = 'none'; src.style.display = ''; }
        else { rte.innerHTML = sanitize(src.value) || '<p></p>'; src.style.display = 'none'; rte.style.display = ''; }
        return;
      }
      if (srcMode) return;
      if (c === 'p') cmd('formatBlock', '<p>'); else if (c === 'h2') cmd('formatBlock', '<h2>'); else if (c === 'h3') cmd('formatBlock', '<h3>');
      else if (c === 'b') cmd('bold'); else if (c === 'i') cmd('italic'); else if (c === 'ul') cmd('insertUnorderedList'); else if (c === 'ol') cmd('insertOrderedList');
      else if (c === 'q') cmd('formatBlock', '<blockquote>'); else if (c === 'clr') { cmd('removeFormat'); cmd('formatBlock', '<p>'); }
      else if (c === 'a') { var u = prompt('Link address (https://...)'); if (u) cmd('createLink', u); }
      else if (c === 'img') { imageDialog(); }
    });
    var savedRange = null;
    function saveRange() { var sel = window.getSelection(); if (sel.rangeCount && rte.contains(sel.anchorNode)) savedRange = sel.getRangeAt(0).cloneRange(); }
    ['keyup', 'mouseup', 'blur'].forEach(function (ev) { rte.addEventListener(ev, saveRange); });
    $('#bar').addEventListener('mousedown', function (e) { if (e.target.closest('button')) e.preventDefault(); });
    rte.addEventListener('dblclick', function (e) {
      if (e.target.tagName !== 'IMG') return;
      var v = prompt('Describe this image (alt text for SEO and accessibility):', e.target.getAttribute('alt') || '');
      if (v !== null) { e.target.setAttribute('alt', v); seoCheck(); }
    });
    function imageDialog() {
      var items = [];
      var m = openModal('Add images', '<p class="muted" style="margin-bottom:14px">Add one or more images. Describe each one in a few words. It helps visitors who cannot see the image, and it helps Google understand your article.</p>' +
        '<div class="actions" style="justify-content:flex-start;margin:0 0 14px"><button type="button" class="btn ghost sm" id="im_up">' + ico('upload') + ' Upload photos</button><button type="button" class="btn ghost sm" id="im_link">' + ico('plus') + ' Add image link</button></div>' +
        '<div id="im_list"><div class="empty">No images added yet.</div></div><div class="actions"><button type="button" class="btn ghost" data-x>Cancel</button><button type="button" class="btn" id="im_ins">Insert into article</button></div>', { wide: true });
      function draw() {
        $('#im_list', m.el).innerHTML = items.length ? items.map(function (it, i) {
          return '<div class="img-row" data-i="' + i + '"><img alt="" src="' + esc(it.url) + '"><div><label class="f">Description (alt text) *</label><input class="alt" type="text" value="' + esc(it.alt) + '" placeholder="e.g. Editor color grading a wedding film">' +
            '<label class="f" style="margin-top:8px">Caption (optional)</label><input class="cap" type="text" value="' + esc(it.caption) + '"><button type="button" class="btn danger sm" data-rm="' + i + '" style="margin-top:10px">Remove</button></div></div>'; }).join('') : '<div class="empty">No images added yet.</div>';
        $$('[data-rm]', m.el).forEach(function (b) { b.onclick = function () { sync(); items.splice(+b.getAttribute('data-rm'), 1); draw(); }; });
      }
      function sync() { $$('.img-row', m.el).forEach(function (r) { var it = items[+r.getAttribute('data-i')]; if (it) { it.alt = $('.alt', r).value; it.caption = $('.cap', r).value; } }); }
      $('[data-x]', m.el).onclick = m.close;
      $('#im_up', m.el).onclick = function () {
        var inp = document.createElement('input'); inp.type = 'file'; inp.multiple = true; inp.accept = 'image/*';
        inp.onchange = async function () { sync(); for (var i = 0; i < inp.files.length; i++) { try { items.push({ url: await uploadFile(inp.files[i]), alt: '', caption: '' }); } catch (e) { /* toast shown */ } } draw(); };
        inp.click();
      };
      $('#im_link', m.el).onclick = function () { var u = prompt('Image link (https://...)'); if (u && u.trim()) { sync(); items.push({ url: u.trim(), alt: '', caption: '' }); draw(); } };
      $('#im_ins', m.el).onclick = function () {
        sync();
        if (!items.length) return toast('Add at least one image first', 'err');
        if (items.some(function (it) { return !it.alt.trim(); }) && !confirm('Some images have no description. Google prefers a description for every image. Insert anyway?')) return;
        var html = items.map(function (it) { return '<figure><img src="' + esc(it.url) + '" alt="' + esc(it.alt.trim()) + '">' + (it.caption.trim() ? '<figcaption>' + esc(it.caption.trim()) + '</figcaption>' : '') + '</figure>'; }).join('');
        m.close();
        if (srcMode) { src.value += '\n' + html; return; }
        rte.focus();
        if (savedRange) { var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(savedRange); document.execCommand('insertHTML', false, html); }
        else rte.insertAdjacentHTML('beforeend', html);
        seoCheck();
      };
      draw();
    }

    function seoCheck() {
      if (!$('#t') || !$('#seolist')) return;
      var tmp = new DOMParser().parseFromString('<div id="r">' + (srcMode ? src.value : rte.innerHTML) + '</div>', 'text/html').getElementById('r');
      var words = (tmp.textContent || '').trim().split(/\s+/).filter(Boolean).length;
      var imgs = $$('img', tmp), noAlt = imgs.filter(function (i) { return !(i.getAttribute('alt') || '').trim(); }).length;
      var heads = $$('h2,h3', tmp).length;
      var links = $$('a', tmp).filter(function (a) { var h = a.getAttribute('href') || ''; return h.charAt(0) === '/' || (h && !/^https?:|^mailto:|^#/.test(h)); }).length;
      var t = $('#t').value.trim(), d = ($('#sd').value.trim() || $('#e').value.trim()), slug = $('#s').value, out = [];
      function add(level, text) { out.push('<div class="seo-item ' + level + '"><span></span>' + esc(text) + '</div>'); }
      if (!t) add('bad', 'Add a title.'); else if (t.length < 25) add('warn', 'Title is short (' + t.length + ' characters). Aim for 30 to 60.'); else if (t.length > 62) add('warn', 'Title is long (' + t.length + ' characters). Google may cut it off after about 60.'); else add('good', 'Title length is good (' + t.length + ' characters).');
      if (!d) add('bad', 'Add a summary or SEO description. It appears under your title in Google.'); else if (d.length < 110 || d.length > 160) add('warn', 'Description is ' + d.length + ' characters. Aim for 110 to 160.'); else add('good', 'Description length is good (' + d.length + ' characters).');
      if (!slug) add('bad', 'Add a URL slug.'); else if (slug.split('-').length > 7) add('warn', 'Slug is long. Short slugs with the main keywords work best.'); else add('good', 'URL slug looks good.');
      if (words < 300) add('bad', 'Only ' + words + ' words. Aim for 600 or more.'); else if (words < 600) add('warn', words + ' words. Longer, useful articles (600+) usually rank better.'); else add('good', words + ' words. Good length.');
      if (heads < 2) add('warn', 'Add at least two subheadings (Heading or Subheading buttons) to structure the article.'); else add('good', heads + ' subheadings. Easy to scan.');
      if (!imgs.length) add('warn', 'Add at least one image inside the article.'); else if (noAlt) add('bad', noAlt + ' image(s) have no description. Double-click an image to add one.'); else add('good', imgs.length + ' image(s), all with descriptions.');
      if (!$('#cv').value.trim()) add('warn', 'Add a cover image.'); else if (!$('#cva').value.trim()) add('warn', 'Add a description for the cover image.'); else add('good', 'Cover image and description set.');
      if (!links) add('warn', 'Link to one of your own pages, for example /services or /contact.'); else add('good', links + ' internal link(s).');
      $('#seolist').innerHTML = out.join('');
    }
    var seoTimer; function seoSoon() { clearTimeout(seoTimer); seoTimer = setTimeout(seoCheck, 250); }
    ['#t', '#s', '#e', '#sd', '#cv', '#cva'].forEach(function (sel) { $(sel).addEventListener('input', seoSoon); });
    rte.addEventListener('input', seoSoon); src.addEventListener('input', seoSoon);
    $('#bar').addEventListener('click', seoSoon);
    seoCheck();

    rte.addEventListener('paste', function (e) {
      var cd = e.clipboardData; if (!cd) return;
      e.preventDefault();
      var html = cd.getData('text/html'), text = cd.getData('text/plain');
      if (html) document.execCommand('insertHTML', false, sanitize(html));
      else document.execCommand('insertHTML', false, text.split(/\n{2,}/).map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; }).join(''));
    });

    $('#pf').onsubmit = async function (e) {
      e.preventDefault();
      var content = sanitize(srcMode ? src.value : rte.innerHTML);
      var slug = slugify($('#s').value);
      if (!slug) { toast('Please enter a URL slug', 'err'); return; }
      var row = { title: $('#t').value.trim(), slug: slug, category: $('#c').value.trim() || 'General', excerpt: $('#e').value.trim(), cover_url: $('#cv').value.trim(), cover_alt: $('#cva').value.trim(), content: content,
        read_time: $('#rt').value.trim(), seo_title: $('#st').value.trim(), seo_description: $('#sd').value.trim(), published: $('#pb').checked, published_at: new Date($('#pd').value || Date.now()).toISOString() };
      var btn = $('button[type=submit]', this); btn.disabled = true;
      try {
        if (isNew) await run(sb.from('blog_posts').insert(row), 'Post saved'); else await run(sb.from('blog_posts').update(row).eq('id', post.id), 'Changes saved');
        vBlog();
      } catch (err) { btn.disabled = false; }
    };
  }

  /* ---------------- page content ---------------- */
  var pageSel = 'home';
  async function vPages() {
    var M = (window.TS_MANIFEST || {}).pages || {};
    var overrides = {};
    ((await run(sb.from('site_content').select('key,value'))).data || []).forEach(function (r) { overrides[r.key] = r.value; });
    var keys = Object.keys(M);
    main.innerHTML = pageHead('Page content', 'Edit any text on any page. Changes go live on the website instantly.') +
      '<div class="card"><div class="filters"><select id="ps">' + keys.map(function (k) { return '<option value="' + k + '"' + (k === pageSel ? ' selected' : '') + '>' + esc(M[k].label) + '</option>'; }).join('') + '</select><input type="text" id="q" placeholder="Search text on this page..."></div><div id="pf"></div></div>';
    function draw() {
      var pg = M[pageSel]; if (!pg) return;
      var html = '', seo = pg.seo, sec = null;
      if (seo) {
        html += '<div class="sec-title" style="border:0;margin-top:0">Search engine title and description</div>' +
          cmsField('seo.' + pageSel + '.title', 'Browser tab and Google title', seo.title, false) + cmsField('seo.' + pageSel + '.description', 'Google description', seo.description, true);
      }
      pg.fields.forEach(function (f) {
        if (f.section !== sec) { sec = f.section; html += '<div class="sec-title">' + esc(sec || 'Page') + '</div>'; }
        html += cmsField(f.key, f.label || (f.tag === 'a' || f.tag === 'button' ? 'Button / link' : f.tag.toUpperCase().replace(/^H(\d)$/, 'Heading $1').replace(/^P$/, 'Paragraph').replace(/^SPAN$|^DIV$|^LI$|^B$|^STRONG$|^EM$|^SMALL$|^LABEL$|^BLOCKQUOTE$/, 'Text')), f.text, f.multiline, f.hint);
      });
      $('#pf').innerHTML = html + '<div class="save-bar"><button class="btn" id="sv">Save changes</button><span class="muted" id="cnt"></span></div>';
      $('#sv').onclick = save; wire(); filter();
    }
    function cmsField(key, label, def, multi, hint) {
      var edited = Object.prototype.hasOwnProperty.call(overrides, key), val = edited ? overrides[key] : def;
      return '<div class="cms-field' + (edited ? ' edited' : '') + '" data-key="' + esc(key) + '" data-search="' + esc((def + ' ' + val).toLowerCase()) + '"><div class="meta"><b>' + esc(label) + (edited ? ' (edited)' : '') + '</b>' + (edited ? '<button type="button" class="btn ghost sm" data-reset="' + esc(key) + '">Reset to original</button>' : '') + '</div>' +
        (multi ? '<textarea data-def="' + esc(def) + '">' + esc(val) + '</textarea>' : '<input type="text" data-def="' + esc(def) + '" value="' + esc(val) + '">') + (hint ? '<div class="hint" style="margin-top:6px">' + esc(hint) + '</div>' : '') + '</div>';
    }
    function wire() {
      $$('[data-reset]', main).forEach(function (b) { b.onclick = async function () {
        var k = b.getAttribute('data-reset');
        await run(sb.from('site_content').delete().eq('key', k), 'Reset to original'); delete overrides[k]; draw(); }; });
    }
    function filter() {
      var q = ($('#q').value || '').toLowerCase(), n = 0;
      $$('.cms-field', main).forEach(function (f) { var show = !q || f.getAttribute('data-search').indexOf(q) > -1; f.style.display = show ? '' : 'none'; if (show) n++; });
      $('#cnt').textContent = n + ' text blocks';
    }
    async function save() {
      var upserts = [], deletes = [];
      $$('.cms-field', main).forEach(function (f) {
        var key = f.getAttribute('data-key'), inp = $('input,textarea', f), val = inp.value, def = inp.getAttribute('data-def');
        var has = Object.prototype.hasOwnProperty.call(overrides, key);
        if (val === def) { if (has) deletes.push(key); }
        else if (!has || overrides[key] !== val) upserts.push({ key: key, value: val });
      });
      if (!upserts.length && !deletes.length) return toast('No changes to save');
      var btn = $('#sv'); btn.disabled = true;
      try {
        if (upserts.length) await run(sb.from('site_content').upsert(upserts, { onConflict: 'key' }));
        if (deletes.length) await run(sb.from('site_content').delete().in('key', deletes));
        upserts.forEach(function (u) { overrides[u.key] = u.value; }); deletes.forEach(function (k) { delete overrides[k]; });
        toast('Saved. Your website is updated.', 'ok'); draw();
      } finally { btn.disabled = false; }
    }
    $('#ps').onchange = function () { pageSel = this.value; draw(); };
    $('#q').oninput = filter;
    draw();
  }

  /* ---------------- settings ---------------- */
  var SETTINGS = [
    { sec: 'Contact details', items: [
      ['email', 'Email address', 'tanvirislam.studio@gmail.com', 'Shown on the website. Contact form emails are sent to the address set in the form service.'],
      ['whatsapp', 'WhatsApp number (with country code)', '+8801627210499', 'Visitors click it to chat with you on WhatsApp.'],
      ['phone', 'Phone number', '+8801785837362', ''],
      ['location', 'Studio address', 'Mirpur 12, Dhaka, Bangladesh', 'Also used for the Google Map on the contact page.'],
      ['map_embed', 'Custom Google Map embed link (optional)', '', 'Google Maps > Share > Embed a map > copy only the src="..." link.']] },
    { sec: 'Social media (clear a field to hide that icon)', items: [
      ['facebook', 'Facebook', 'https://facebook.com/tanvirislam23', ''], ['instagram', 'Instagram', 'https://instagram.com/tanvir.studio', ''],
      ['linkedin', 'LinkedIn', 'https://linkedin.com/in/tanvirislam62', ''], ['youtube', 'YouTube', 'https://youtube.com/@tanvirislamofficial', '']] },
    { sec: 'Media', items: [
      ['hero_video', 'Home page video (YouTube link)', 'https://www.youtube.com/watch?v=HOfdboHvshg', 'The video shown beside the home page headline.'],
      ['about_video', 'About page video (YouTube or Google Drive link)', '', 'Your own introduction video, shown on the About page.'],
      ['about_photo', 'About page photo (image link)', '', 'Paste a Cloudinary link or upload one in the Media section.']] }
  ];
  async function vSettings() {
    var vals = {};
    ((await run(sb.from('site_content').select('key,value').like('key', 'settings.%'))).data || []).forEach(function (r) { vals[r.key.slice(9)] = r.value; });
    main.innerHTML = pageHead('Settings', 'Contact details, social links and key media.') + '<form id="sf">' + SETTINGS.map(function (g) {
      return '<div class="card"><h2>' + esc(g.sec) + '</h2>' + g.items.map(function (it) {
        var v = Object.prototype.hasOwnProperty.call(vals, it[0]) ? vals[it[0]] : it[2];
        return '<div class="fld"><label class="f" for="s_' + it[0] + '">' + esc(it[1]) + '</label><input id="s_' + it[0] + '" name="' + it[0] + '" type="text" value="' + esc(v) + '" data-def="' + esc(it[2]) + '">' + (it[3] ? '<div class="hint">' + esc(it[3]) + '</div>' : '') + '</div>'; }).join('') + '</div>'; }).join('') +
      '<div class="save-bar"><button class="btn" type="submit">Save settings</button></div></form>';
    $('#sf').onsubmit = async function (e) {
      e.preventDefault();
      var up = [];
      $$('input[name]', this).forEach(function (i) {
        var k = i.name, has = Object.prototype.hasOwnProperty.call(vals, k), v = i.value.trim();
        if (has ? vals[k] !== v : v !== i.getAttribute('data-def')) up.push({ key: 'settings.' + k, value: v });
      });
      if (!up.length) return toast('No changes to save');
      await run(sb.from('site_content').upsert(up, { onConflict: 'key' }), 'Settings saved');
      up.forEach(function (u) { vals[u.key.slice(9)] = u.value; });
    };
  }

  /* ---------------- media ---------------- */
  async function vMedia() {
    main.innerHTML = pageHead('Media', 'Upload images and copy their links to use anywhere on the website.') +
      '<div class="drop"><p style="margin-bottom:12px"><b>Upload images</b> (JPG, PNG, WebP, GIF, SVG up to 10 MB)</p><button class="btn" id="up">' + ico('upload') + ' Choose files</button></div><div id="mg" class="media-grid"></div>';
    async function load() {
      var r = await run(sb.storage.from('media').list('uploads', { limit: 300, sortBy: { column: 'created_at', order: 'desc' } }));
      var files = (r.data || []).filter(function (f) { return f.name && f.name !== '.emptyFolderPlaceholder'; });
      $('#mg').innerHTML = files.length ? files.map(function (f) {
        var url = sb.storage.from('media').getPublicUrl('uploads/' + f.name).data.publicUrl;
        return '<div class="media-item"><img loading="lazy" alt="" src="' + esc(url) + '"><div><span title="' + esc(f.name) + '">' + esc(f.name) + '</span><span><button class="icon-btn" data-copy="' + esc(url) + '" title="Copy link">' + ico('copy') + '</button> <button class="icon-btn danger" data-rm="' + esc(f.name) + '" title="Delete">' + ico('trash') + '</button></span></div></div>'; }).join('') : '<div class="empty" style="grid-column:1/-1">No uploads yet.</div>';
      $$('[data-copy]', main).forEach(function (b) { b.onclick = function () { navigator.clipboard.writeText(b.getAttribute('data-copy')).then(function () { toast('Link copied', 'ok'); }); }; });
      $$('[data-rm]', main).forEach(function (b) { b.onclick = async function () {
        if (!confirm('Delete this file? Pages using it will show a broken image.')) return;
        await run(sb.storage.from('media').remove(['uploads/' + b.getAttribute('data-rm')]), 'File deleted'); load(); }; });
    }
    $('#up').onclick = function () {
      var inp = document.createElement('input'); inp.type = 'file'; inp.multiple = true; inp.accept = 'image/*,video/mp4';
      inp.onchange = async function () { for (var i = 0; i < inp.files.length; i++) { try { await uploadFile(inp.files[i]); } catch (e) { /* toast shown */ } } load(); };
      inp.click();
    };
    await load();
  }

  /* ---------------- about page items and gallery ---------------- */
  var KIND_NAME = { skill: 'Skill', education: 'Education', experience: 'Experience', achievement: 'Achievement' };
  function vAbout() {
    return crud({
      title: 'About page', sub: 'Skills, education, experience and achievements shown on the About page. Empty sections stay hidden.', table: 'about_items', single: 'item', newLabel: 'Add item',
      order: [['kind', true], ['sort_order', true]], reorder: false,
      defaults: { kind: 'skill', level: 80, published: true, sort_order: 0 },
      columns: [
        { label: 'Type', render: function (r) { return '<span class="pill">' + esc(KIND_NAME[r.kind]) + '</span>'; } },
        { label: 'Title', render: function (r) { return '<b>' + esc(r.title) + '</b><div class="muted">' + esc([r.subtitle, r.period].filter(Boolean).join(' | ') || (r.kind === 'skill' ? r.level + '%' : '')) + '</div>'; } },
        { label: 'Order', render: function (r) { return r.sort_order; } },
        { label: 'Status', render: function (r) { return r.published ? '<span class="pill live">Live</span>' : '<span class="pill draft">Hidden</span>'; } }
      ],
      fields: [
        { name: 'kind', label: 'What is this?', type: 'select', options: [['skill', 'Skill'], ['education', 'Education'], ['experience', 'Experience'], ['achievement', 'Achievement or award']] },
        { name: 'title', label: 'Title (skill name, degree, job title or award)', required: true },
        { name: 'subtitle', label: 'School, company or organization (not used for skills)' },
        { name: 'period', label: 'Years, for example 2019 to 2023 (not used for skills)' },
        { name: 'description', label: 'Short description (optional)', type: 'textarea', rows: 3 },
        { name: 'level', label: 'Skill level, 0 to 100 (only used for skills)', type: 'number' },
        { name: 'sort_order', label: 'Order number (lower shows first)', type: 'number' },
        { name: 'published', label: 'Visible on the website', type: 'checkbox' }
      ]
    });
  }

  function vGallery() {
    return crud({
      title: 'Gallery', sub: 'Photos from your tours and achievements, shown at the bottom of the About page.', table: 'gallery_items', single: 'photo', newLabel: 'Add one photo',
      order: [['sort_order', true], ['created_at', false]], reorder: true,
      defaults: { category: 'tour', published: true, sort_order: 0, caption: '' },
      bulk: {
        label: 'Upload several photos',
        run: function (load, rows) {
          var m = openModal('Upload several photos', '<div class="fld"><label class="f" for="gc">These photos are from</label><select id="gc"><option value="tour">A tour</option><option value="achievement">An achievement</option></select></div><p class="muted" style="margin-bottom:16px">Pick as many images as you like. You can add captions afterwards.</p><div class="actions"><button type="button" class="btn ghost" data-x>Cancel</button><button type="button" class="btn" id="gp">' + ico('upload') + ' Choose photos</button></div>');
          $('[data-x]', m.el).onclick = m.close;
          $('#gp', m.el).onclick = function () {
            var inp = document.createElement('input'); inp.type = 'file'; inp.multiple = true; inp.accept = 'image/*';
            inp.onchange = async function () {
              var cat = $('#gc', m.el).value, n = rows.length;
              for (var i = 0; i < inp.files.length; i++) {
                try { var url = await uploadFile(inp.files[i]); await run(sb.from('gallery_items').insert({ image_url: url, caption: '', category: cat, sort_order: n + i })); } catch (e) { /* toast shown */ }
              }
              m.close(); load();
            };
            inp.click();
          };
        }
      },
      columns: [
        { label: 'Photo', render: function (r) { return '<img class="thumb" alt="" loading="lazy" src="' + esc(r.image_url) + '" onerror="this.style.visibility=\'hidden\'">'; } },
        { label: 'Caption', render: function (r) { return esc(r.caption || '-') + '<div class="muted">' + (r.category === 'achievement' ? 'Achievement' : 'Tour') + '</div>'; } },
        { label: 'Status', render: function (r) { return r.published ? '<span class="pill live">Live</span>' : '<span class="pill draft">Hidden</span>'; } }
      ],
      fields: [
        { name: 'image_url', label: 'Photo link', required: true, upload: true, preview: true },
        { name: 'caption', label: 'Caption (also used as the image description for SEO)' },
        { name: 'category', label: 'Type', type: 'select', options: [['tour', 'Tour'], ['achievement', 'Achievement']] },
        { name: 'published', label: 'Visible on the website', type: 'checkbox' },
        { name: 'sort_order', label: 'Order number (lower shows first)', type: 'number' }
      ]
    });
  }

  /* ---------------- boot ---------------- */
  async function boot() {
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || /YOUR_/.test(cfg.SUPABASE_URL + cfg.SUPABASE_ANON_KEY)) return renderSetup();
    if (!window.supabase) { app.innerHTML = '<div class="boot">Could not load the Supabase library. Check your internet connection.</div>'; return; }
    if (!sb) sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    var r = await sb.auth.getSession();
    session = r.data && r.data.session;
    if (!session) return renderLogin();
    var adm = await sb.from('admins').select('email').limit(1);
    if (adm.error || !adm.data || !adm.data.length) { await sb.auth.signOut(); session = null; return renderLogin('This account is not allowed to use the dashboard.'); }
    renderShell();
  }
  boot();
})();

/* Design projects manager loader */
(function () {
  var s = document.createElement('script');
  s.src = '/admin/design-projects.js?v=2';
  document.body.appendChild(s);
})();
