/* ============================================================
   ADMIN DASHBOARD — dashboard.js
   Handles: auth guard, navigation, all CRUD sections
   ============================================================ */

'use strict';

/* ── STATE ── */
let currentSection  = 'overview';
let allProjects     = [];
let allBlogs        = [];
let allMessages     = [];
let editingProject  = null;
let editingBlog     = null;
let editingTestimonial = null;

/* ════════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Auth guard — redirect to login if not admin
  const user = await requireAdmin();
  if (!user) return; // requireAdmin already redirected

  // 2. Populate user info in sidebar
  const initials = (user.email || 'TI').substring(0, 2).toUpperCase();
  el('user-avatar').textContent = initials;
  el('user-name').textContent   = user.email === '2023.tanvirislam@gmail.com'
    ? 'Tanvir Islam' : user.email;

  // 3. Topbar date
  el('topbar-date').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });

  // 4. Hamburger toggle
  el('hamburger').addEventListener('click', () => {
    el('sidebar').classList.toggle('open');
  });

  // 5. Logout
  el('logout-btn').addEventListener('click', async () => {
    if (confirm('Sign out?')) await authSignOut();
  });

  // 6. Nav item clicks
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      navigate(item.dataset.section);
      // Close sidebar on mobile
      if (window.innerWidth < 900) el('sidebar').classList.remove('open');
    });
  });

  // 7. Form submissions
  el('project-form').addEventListener('submit',    handleProjectSave);
  el('blog-form').addEventListener('submit',       handleBlogSave);
  el('homepage-form').addEventListener('submit',   handleHomepageSave);
  el('seo-form').addEventListener('submit',        handleSeoSave);
  el('tf-submit').addEventListener('click',        handleTestimonialSave);

  // 8. Auto-slug from title
  el('pf-title').addEventListener('input', () => {
    if (!editingProject) el('pf-slug').value = generateSlug(el('pf-title').value);
  });
  el('bf-title').addEventListener('input', () => {
    if (!editingBlog) el('bf-slug').value = generateSlug(el('bf-title').value);
  });

  // 9. Search live filter
  el('project-search').addEventListener('input', filterProjectsTable);
  el('blog-search').addEventListener('input',    filterBlogsTable);

  // 10. Message status filters
  document.querySelectorAll('.msg-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.msg-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderMessages(btn.dataset.status === 'all' ? null : btn.dataset.status);
    });
  });

  // 11. Load initial section
  await navigate('overview');
});

/* ════════════════════════════════════════════════════════════
   NAVIGATION
   ════════════════════════════════════════════════════════════ */
async function navigate(section) {
  // Hide all sections
  document.querySelectorAll('.dash-section').forEach(s => s.style.display = 'none');

  // Show target
  const target = el(`section-${section}`);
  if (target) target.style.display = 'block';

  // Update nav active state
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.classList.toggle('active', item.dataset.section === section);
  });

  // Update topbar
  const titles = {
    overview:      'Overview',
    projects:      'Portfolio Projects',
    'project-form':'Add / Edit Project',
    blogs:         'Blog Posts',
    'blog-form':   'New / Edit Post',
    messages:      'Messages',
    testimonials:  'Testimonials',
    homepage:      'Homepage Settings',
    seo:           'SEO Settings',
  };
  el('topbar-title').textContent   = titles[section] || section;
  el('topbar-section').textContent = titles[section] || section;
  currentSection = section;

  // Load section data
  if (section === 'overview')      await loadOverview();
  if (section === 'projects')      await loadProjects();
  if (section === 'blogs')         await loadBlogs();
  if (section === 'messages')      await loadMessages();
  if (section === 'testimonials')  await loadTestimonials();
  if (section === 'homepage')      await loadHomepageSettings();
  if (section === 'seo')           await loadSeoSettings();
}

/* ════════════════════════════════════════════════════════════
   OVERVIEW
   ════════════════════════════════════════════════════════════ */
async function loadOverview() {
  const [projects, blogs, messages, testimonials] = await Promise.all([
    adminGetProjects(),
    adminGetPosts(),
    adminGetMessages(),
    adminGetTestimonials(),
  ]);

  allProjects  = projects;
  allBlogs     = blogs;
  allMessages  = messages;

  // Stats
  el('stat-projects').textContent    = projects.length;
  el('stat-blogs').textContent       = blogs.length;
  el('stat-messages').textContent    = messages.length;
  el('stat-testimonials').textContent = testimonials.length;

  // Unread badge
  const unread = messages.filter(m => m.status === 'unread').length;
  const badge  = el('unread-badge');
  if (unread > 0) { badge.textContent = unread; badge.style.display = ''; }
  else badge.style.display = 'none';

  // Recent messages (last 4)
  const msgList = el('recent-messages-list');
  msgList.innerHTML = messages.slice(0, 4).map(m => `
    <div style="display:flex;align-items:flex-start;gap:.8rem;padding:.7rem 0;border-bottom:1px solid var(--border)">
      <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--cyan));display:flex;align-items:center;justify-content:center;font-family:var(--font-head);font-weight:700;font-size:.8rem;flex-shrink:0">
        ${m.name.charAt(0).toUpperCase()}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:.85rem;display:flex;justify-content:space-between">
          <span>${escHtml(m.name)}</span>
          <span class="badge ${m.status === 'unread' ? 'badge-blue' : 'badge-gray'}">${m.status}</span>
        </div>
        <div style="font-size:.78rem;color:var(--text-muted);margin-top:.1rem">${escHtml(m.email)}</div>
        <div style="font-size:.82rem;color:var(--text-2);margin-top:.3rem;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">
          ${escHtml(m.message.substring(0, 80))}${m.message.length > 80 ? '…' : ''}
        </div>
      </div>
    </div>
  `).join('') || `<p style="color:var(--text-muted);font-size:.85rem">No messages yet.</p>`;

  // Recent projects (last 4)
  const projList = el('recent-projects-list');
  projList.innerHTML = projects.slice(0, 4).map(p => `
    <div style="display:flex;align-items:center;gap:.8rem;padding:.6rem 0;border-bottom:1px solid var(--border)">
      <div style="width:40px;height:30px;border-radius:6px;background:var(--bg-2);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0">
        ${categoryEmoji(p.category)}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(p.title)}</div>
        <div style="font-size:.75rem;color:var(--text-muted)">${categoryLabel(p.category)}</div>
      </div>
      <span class="badge ${p.published ? 'badge-green' : 'badge-gray'}">${p.published ? 'Live' : 'Draft'}</span>
    </div>
  `).join('') || `<p style="color:var(--text-muted);font-size:.85rem">No projects yet.</p>`;
}

/* ════════════════════════════════════════════════════════════
   PROJECTS
   ════════════════════════════════════════════════════════════ */
async function loadProjects() {
  const tbody = el('projects-tbody');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted)">
    <i class="fas fa-spinner fa-spin"></i> Loading…
  </td></tr>`;

  allProjects = await adminGetProjects();
  renderProjectsTable(allProjects);
}

function renderProjectsTable(projects) {
  const tbody = el('projects-tbody');
  if (!projects.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📁</div><p>No projects found.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = projects.map(p => `
    <tr>
      <td>
        <div class="td-thumb" style="${p.thumbnail_url ? `background-image:url(${p.thumbnail_url});background-size:cover;background-position:center` : ''}">
          ${!p.thumbnail_url ? categoryEmoji(p.category) : ''}
        </div>
      </td>
      <td>
        <div style="font-weight:600;font-size:.88rem">${escHtml(p.title)}</div>
        <div style="font-size:.72rem;color:var(--text-muted)">${escHtml(p.slug)}</div>
      </td>
      <td><span class="badge badge-blue">${categoryLabel(p.category)}</span></td>
      <td>${p.featured ? '<i class="fas fa-star" style="color:var(--yellow)"></i>' : '<i class="fas fa-star" style="color:var(--text-muted)"></i>'}</td>
      <td><span class="badge ${p.published ? 'badge-green' : 'badge-gray'}">${p.published ? 'Live' : 'Draft'}</span></td>
      <td>
        <div style="display:flex;gap:.4rem">
          <button class="btn btn-outline btn-sm btn-icon" title="Edit" onclick="editProject('${p.id}')">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete" onclick="deleteProject('${p.id}', '${escHtml(p.title)}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterProjectsTable() {
  const q = el('project-search').value.toLowerCase();
  const filtered = allProjects.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    (p.description || '').toLowerCase().includes(q)
  );
  renderProjectsTable(filtered);
}

function clearProjectForm() {
  editingProject = null;
  el('project-form-title').innerHTML = '<i class="fas fa-plus-circle" style="color:var(--blue);margin-right:.5rem"></i>Add New Project';
  el('project-form').reset();
  el('pf-id').value       = '';
  el('pf-published').checked = true;
}

async function editProject(id) {
  const p = allProjects.find(x => x.id === id);
  if (!p) return;
  editingProject = p;
  el('project-form-title').innerHTML = '<i class="fas fa-pen" style="color:var(--blue);margin-right:.5rem"></i>Edit Project';
  el('pf-id').value         = p.id;
  el('pf-title').value      = p.title;
  el('pf-slug').value       = p.slug;
  el('pf-desc').value       = p.description  || '';
  el('pf-category').value   = p.category;
  el('pf-tags').value       = (p.tags || []).join(', ');
  el('pf-thumb').value      = p.thumbnail_url || '';
  el('pf-video').value      = p.video_url     || '';
  el('pf-url').value        = p.live_url      || '';
  el('pf-featured').checked = p.featured;
  el('pf-published').checked= p.published;
  navigate('project-form');
}

async function handleProjectSave(e) {
  e.preventDefault();
  const btn = el('pf-submit');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';

  const tagsRaw = el('pf-tags').value;
  const project = {
    title:         el('pf-title').value.trim(),
    slug:          el('pf-slug').value.trim() || generateSlug(el('pf-title').value),
    description:   el('pf-desc').value.trim(),
    category:      el('pf-category').value,
    tags:          tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [],
    thumbnail_url: el('pf-thumb').value.trim(),
    video_url:     el('pf-video').value.trim(),
    live_url:      el('pf-url').value.trim(),
    featured:      el('pf-featured').checked,
    published:     el('pf-published').checked,
  };
  if (editingProject) project.id = editingProject.id;

  const { error } = await adminSaveProject(project);
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-save"></i> Save Project';

  if (error) { showToast('❌ ' + error.message, 'error'); return; }

  showToast('✅ Project saved successfully!', 'success');
  clearProjectForm();
  navigate('projects');
}

async function deleteProject(id, title) {
  if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
  const { error } = await adminDeleteProject(id);
  if (error) { showToast('❌ ' + error.message, 'error'); return; }
  showToast('🗑️ Project deleted.', 'success');
  await loadProjects();
}

/* ════════════════════════════════════════════════════════════
   BLOG POSTS
   ════════════════════════════════════════════════════════════ */
async function loadBlogs() {
  const tbody = el('blogs-tbody');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted)">
    <i class="fas fa-spinner fa-spin"></i> Loading…
  </td></tr>`;
  allBlogs = await adminGetPosts();
  renderBlogsTable(allBlogs);
}

function renderBlogsTable(posts) {
  const tbody = el('blogs-tbody');
  if (!posts.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📝</div><p>No posts yet.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = posts.map(p => `
    <tr>
      <td>
        <div style="font-weight:600;font-size:.88rem;max-width:280px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${escHtml(p.title)}</div>
        <div style="font-size:.72rem;color:var(--text-muted)">${escHtml(p.slug)}</div>
      </td>
      <td><span class="badge badge-blue">${categoryLabel(p.category)}</span></td>
      <td style="color:var(--text-muted);font-size:.82rem">${(p.views||0).toLocaleString()}</td>
      <td style="font-size:.82rem;color:var(--text-muted)">${p.published_at ? formatDate(p.published_at) : '—'}</td>
      <td>
        <span class="badge ${p.published ? 'badge-green' : 'badge-yellow'}">
          ${p.published ? 'Published' : 'Draft'}
        </span>
      </td>
      <td>
        <div style="display:flex;gap:.4rem">
          <button class="btn btn-outline btn-sm btn-icon" title="Edit" onclick="editBlog('${p.id}')">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete" onclick="deleteBlog('${p.id}', '${escHtml(p.title)}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterBlogsTable() {
  const q = el('blog-search').value.toLowerCase();
  const filtered = allBlogs.filter(p =>
    p.title.toLowerCase().includes(q) ||
    (p.category || '').toLowerCase().includes(q)
  );
  renderBlogsTable(filtered);
}

function clearBlogForm() {
  editingBlog = null;
  el('blog-form-title').innerHTML = '<i class="fas fa-pen-to-square" style="color:var(--blue);margin-right:.5rem"></i>New Blog Post';
  el('blog-form').reset();
  el('bf-id').value = '';
  el('bf-readtime').value = '5';
}

async function editBlog(id) {
  const p = allBlogs.find(x => x.id === id);
  if (!p) return;
  editingBlog = p;
  el('blog-form-title').innerHTML = '<i class="fas fa-pen" style="color:var(--blue);margin-right:.5rem"></i>Edit Post';
  el('bf-id').value          = p.id;
  el('bf-title').value       = p.title;
  el('bf-slug').value        = p.slug;
  el('bf-category').value    = p.category || 'general';
  el('bf-excerpt').value     = p.excerpt       || '';
  el('bf-content').value     = p.content       || '';
  el('bf-image').value       = p.featured_image|| '';
  el('bf-tags').value        = (p.tags || []).join(', ');
  el('bf-seo-title').value   = p.seo_title     || '';
  el('bf-seo-desc').value    = p.seo_description|| '';
  el('bf-readtime').value    = p.read_time      || 5;
  el('bf-published').checked = p.published;
  el('bf-featured').checked  = p.featured;
  navigate('blog-form');
}

async function handleBlogSave(e) {
  e.preventDefault();
  const btn = el('bf-submit');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';

  const isPublished = el('bf-published').checked;
  const post = {
    title:           el('bf-title').value.trim(),
    slug:            el('bf-slug').value.trim() || generateSlug(el('bf-title').value),
    category:        el('bf-category').value,
    excerpt:         el('bf-excerpt').value.trim(),
    content:         el('bf-content').value.trim(),
    featured_image:  el('bf-image').value.trim(),
    tags:            el('bf-tags').value ? el('bf-tags').value.split(',').map(t=>t.trim()).filter(Boolean) : [],
    seo_title:       el('bf-seo-title').value.trim(),
    seo_description: el('bf-seo-desc').value.trim(),
    read_time:       parseInt(el('bf-readtime').value) || 5,
    published:       isPublished,
    featured:        el('bf-featured').checked,
    published_at:    isPublished ? (editingBlog?.published_at || new Date().toISOString()) : null,
  };
  if (editingBlog) post.id = editingBlog.id;

  const { error } = await adminSavePost(post);
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-save"></i> Save Post';

  if (error) { showToast('❌ ' + error.message, 'error'); return; }
  showToast('✅ Post saved!', 'success');
  clearBlogForm();
  navigate('blogs');
}

async function deleteBlog(id, title) {
  if (!confirm(`Delete "${title}"?`)) return;
  const { error } = await adminDeletePost(id);
  if (error) { showToast('❌ ' + error.message, 'error'); return; }
  showToast('🗑️ Post deleted.', 'success');
  await loadBlogs();
}

/* ════════════════════════════════════════════════════════════
   MESSAGES
   ════════════════════════════════════════════════════════════ */
async function loadMessages() {
  const tbody = el('messages-tbody');
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted)">
    <i class="fas fa-spinner fa-spin"></i> Loading…
  </td></tr>`;
  allMessages = await adminGetMessages();
  renderMessages(null);
}

function renderMessages(statusFilter) {
  const tbody   = el('messages-tbody');
  const filtered = statusFilter ? allMessages.filter(m => m.status === statusFilter) : allMessages;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📭</div><p>No messages found.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(m => `
    <tr style="${m.status === 'unread' ? 'background:rgba(26,111,255,.04)' : ''}">
      <td>
        <div style="font-weight:${m.status === 'unread' ? '700' : '500'};font-size:.88rem">${escHtml(m.name)}</div>
        <div style="font-size:.72rem;color:var(--text-muted)">${escHtml(m.email)}</div>
      </td>
      <td style="font-size:.82rem;color:var(--text-muted)">${escHtml(m.service || '—')}</td>
      <td style="font-size:.82rem;color:var(--text-muted)">${escHtml(m.budget  || '—')}</td>
      <td style="font-size:.82rem;max-width:200px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:var(--text-2)">
        ${escHtml((m.message||'').substring(0, 60))}${(m.message||'').length > 60 ? '…' : ''}
      </td>
      <td style="font-size:.75rem;color:var(--text-muted);white-space:nowrap">${formatDate(m.created_at)}</td>
      <td>
        <span class="badge ${statusBadgeClass(m.status)}">${m.status}</span>
      </td>
      <td>
        <div style="display:flex;gap:.4rem">
          <button class="btn btn-outline btn-sm btn-icon" title="View" onclick="viewMessage('${m.id}')">
            <i class="fas fa-eye"></i>
          </button>
          <a href="mailto:${escHtml(m.email)}?subject=Re: Your inquiry" class="btn btn-success btn-sm btn-icon" title="Reply"
             onclick="markRead('${m.id}')">
            <i class="fas fa-reply"></i>
          </a>
        </div>
      </td>
    </tr>
  `).join('');
}

async function viewMessage(id) {
  const m = allMessages.find(x => x.id === id);
  if (!m) return;

  el('msg-modal-body').innerHTML = `
    <div style="display:grid;gap:1rem">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.8rem">
        <div>
          <div style="font-size:.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:.2rem">From</div>
          <div style="font-weight:700">${escHtml(m.name)}</div>
          <div style="font-size:.82rem;color:var(--text-muted)">${escHtml(m.email)}</div>
        </div>
        <div>
          <div style="font-size:.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:.2rem">Details</div>
          <div style="font-size:.85rem">Service: ${escHtml(m.service || '—')}</div>
          <div style="font-size:.85rem">Budget: ${escHtml(m.budget || '—')}</div>
        </div>
      </div>
      <div>
        <div style="font-size:.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem">Message</div>
        <div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:8px;padding:1rem;font-size:.88rem;line-height:1.8;color:var(--text-2)">
          ${escHtml(m.message)}
        </div>
      </div>
      <div style="display:flex;gap:.5rem;align-items:center">
        <span style="font-size:.78rem;color:var(--text-muted)">Status:</span>
        <select id="msg-status-sel" class="form-control" style="width:auto;padding:.3rem .6rem;font-size:.82rem">
          <option value="unread"   ${m.status==='unread'   ? 'selected':''}> Unread</option>
          <option value="read"     ${m.status==='read'     ? 'selected':''}> Read</option>
          <option value="replied"  ${m.status==='replied'  ? 'selected':''}> Replied</option>
          <option value="archived" ${m.status==='archived' ? 'selected':''}> Archived</option>
        </select>
        <button class="btn btn-outline btn-sm" onclick="updateMsgStatus('${m.id}')">Update</button>
      </div>
      <div style="font-size:.75rem;color:var(--text-muted)">Received: ${formatDate(m.created_at)}</div>
    </div>
  `;
  el('msg-reply-btn').href = `mailto:${m.email}?subject=Re: Your project inquiry`;
  el('msg-modal').classList.add('open');

  // Mark as read automatically
  if (m.status === 'unread') {
    await adminUpdateMessageStatus(m.id, 'read');
    m.status = 'read';
    renderMessages(null);
  }
}

async function updateMsgStatus(id) {
  const status = el('msg-status-sel').value;
  const { error } = await adminUpdateMessageStatus(id, status);
  if (error) { showToast('❌ ' + error.message, 'error'); return; }
  const m = allMessages.find(x => x.id === id);
  if (m) m.status = status;
  showToast('✅ Status updated.', 'success');
  renderMessages(null);
}

async function markRead(id) {
  await adminUpdateMessageStatus(id, 'replied');
  const m = allMessages.find(x => x.id === id);
  if (m) m.status = 'replied';
  renderMessages(null);
}

function closeMsgModal() { el('msg-modal').classList.remove('open'); }

function statusBadgeClass(status) {
  return { unread:'badge-blue', read:'badge-gray', replied:'badge-green', archived:'badge-yellow' }[status] || 'badge-gray';
}

/* ════════════════════════════════════════════════════════════
   TESTIMONIALS
   ════════════════════════════════════════════════════════════ */
async function loadTestimonials() {
  const tbody = el('testimonials-tbody');
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted)">
    <i class="fas fa-spinner fa-spin"></i> Loading…
  </td></tr>`;
  const testimonials = await adminGetTestimonials();
  if (!testimonials.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">⭐</div><p>No testimonials yet.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = testimonials.map(t => `
    <tr>
      <td style="font-weight:600;font-size:.88rem">${escHtml(t.name)}</td>
      <td style="font-size:.82rem;color:var(--text-muted)">${escHtml(t.role||'—')}</td>
      <td style="font-size:.82rem;color:var(--text-muted)">${escHtml(t.country||'—')}</td>
      <td style="color:var(--yellow)">${'★'.repeat(t.rating||5)}</td>
      <td><span class="badge badge-blue">${categoryLabel(t.service||'general')}</span></td>
      <td>${t.featured ? '<i class="fas fa-star" style="color:var(--yellow)"></i>' : '<i class="fas fa-star" style="color:var(--text-muted)"></i>'}</td>
      <td>
        <div style="display:flex;gap:.4rem">
          <button class="btn btn-outline btn-sm btn-icon" onclick="editTestimonial('${t.id}')">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="deleteTestimonialItem('${t.id}','${escHtml(t.name)}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openTestimonialModal() {
  editingTestimonial = null;
  el('tm-title').textContent = 'Add Testimonial';
  el('testimonial-form').reset();
  el('tf-id').value = '';
  el('tf-rating').value = 5;
  el('testimonial-modal').classList.add('open');
}

function closeTestimonialModal() { el('testimonial-modal').classList.remove('open'); }

async function editTestimonial(id) {
  const all = await adminGetTestimonials();
  const t   = all.find(x => x.id === id);
  if (!t) return;
  editingTestimonial = t;
  el('tm-title').textContent = 'Edit Testimonial';
  el('tf-id').value          = t.id;
  el('tf-name').value        = t.name;
  el('tf-role').value        = t.role     || '';
  el('tf-country').value     = t.country  || '';
  el('tf-rating').value      = t.rating   || 5;
  el('tf-content').value     = t.content;
  el('tf-service').value     = t.service  || '';
  el('tf-featured').checked  = t.featured;
  el('testimonial-modal').classList.add('open');
}

async function handleTestimonialSave() {
  const btn = el('tf-submit');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

  const t = {
    name:     el('tf-name').value.trim(),
    role:     el('tf-role').value.trim(),
    country:  el('tf-country').value.trim(),
    rating:   parseInt(el('tf-rating').value) || 5,
    content:  el('tf-content').value.trim(),
    service:  el('tf-service').value,
    featured: el('tf-featured').checked,
    approved: true,
  };
  if (!t.name || !t.content) { showToast('❌ Name and content required.', 'error'); btn.disabled=false; btn.innerHTML='<i class="fas fa-save"></i> Save'; return; }
  if (editingTestimonial) t.id = editingTestimonial.id;

  const { error } = await adminSaveTestimonial(t);
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-save"></i> Save';

  if (error) { showToast('❌ ' + error.message, 'error'); return; }
  showToast('✅ Testimonial saved!', 'success');
  closeTestimonialModal();
  await loadTestimonials();
}

async function deleteTestimonialItem(id, name) {
  if (!confirm(`Delete testimonial from "${name}"?`)) return;
  const { error } = await adminDeleteTestimonial(id);
  if (error) { showToast('❌ ' + error.message, 'error'); return; }
  showToast('🗑️ Deleted.', 'success');
  await loadTestimonials();
}

/* ════════════════════════════════════════════════════════════
   SETTINGS
   ════════════════════════════════════════════════════════════ */
async function loadHomepageSettings() {
  const s = await getSettings();
  el('hs-title').value       = s.hero_title       || '';
  el('hs-subtitle').value    = s.hero_subtitle     || '';
  el('hs-description').value = s.hero_description  || '';
  el('hs-email').value       = s.email             || '';
  el('hs-whatsapp').value    = s.whatsapp          || '';
  el('hs-location').value    = s.location          || '';
  el('hs-years').value       = s.years_experience  || '';
  el('hs-projects').value    = s.projects_done     || '';
  el('hs-clients').value     = s.happy_clients     || '';
  el('hs-fb').value          = s.fb_url            || '';
  el('hs-ig').value          = s.instagram_url     || '';
  el('hs-li').value          = s.linkedin_url      || '';
  el('hs-yt').value          = s.youtube_url       || '';
}

async function handleHomepageSave(e) {
  e.preventDefault();
  const btn = e.submitter || e.target.querySelector('[type=submit]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';

  const pairs = [
    ['hero_title',        el('hs-title').value],
    ['hero_subtitle',     el('hs-subtitle').value],
    ['hero_description',  el('hs-description').value],
    ['email',             el('hs-email').value],
    ['whatsapp',          el('hs-whatsapp').value],
    ['location',          el('hs-location').value],
    ['years_experience',  el('hs-years').value],
    ['projects_done',     el('hs-projects').value],
    ['happy_clients',     el('hs-clients').value],
    ['fb_url',            el('hs-fb').value],
    ['instagram_url',     el('hs-ig').value],
    ['linkedin_url',      el('hs-li').value],
    ['youtube_url',       el('hs-yt').value],
  ];

  const results = await Promise.all(pairs.map(([k,v]) => updateSetting(k,v)));
  const failed  = results.filter(r => r.error);

  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-save"></i> Save Settings';

  if (failed.length) { showToast('❌ Some settings failed to save.', 'error'); return; }
  showToast('✅ Homepage settings saved!', 'success');
}

async function loadSeoSettings() {
  const s = await getSettings();
  el('seo-title').value = s.seo_title        || '';
  el('seo-desc').value  = s.seo_description  || '';
  el('seo-og').value    = s.og_image         || '';
}

async function handleSeoSave(e) {
  e.preventDefault();
  const btn = e.submitter || e.target.querySelector('[type=submit]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';

  const pairs = [
    ['seo_title',       el('seo-title').value],
    ['seo_description', el('seo-desc').value],
    ['og_image',        el('seo-og').value],
  ];
  await Promise.all(pairs.map(([k,v]) => updateSetting(k,v)));

  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-save"></i> Save SEO Settings';
  showToast('✅ SEO settings saved!', 'success');
}

/* ════════════════════════════════════════════════════════════
   UTILITIES
   ════════════════════════════════════════════════════════════ */

/** getElementById shorthand */
function el(id) { return document.getElementById(id); }

/** HTML escape to prevent XSS */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

/** Toast notification */
function showToast(msg, type = 'success') {
  const toast   = el('dash-toast');
  const icon    = el('toast-icon');
  const msgEl   = el('toast-msg');
  const isError = type === 'error';

  toast.className = `dash-toast ${type}`;
  icon.className  = `fas ${isError ? 'fa-circle-exclamation error' : 'fa-circle-check success'}`;
  msgEl.textContent = msg;

  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}
