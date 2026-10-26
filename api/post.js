// Server renders one blog article (good for SEO and social previews).
// Route: /blog/:slug  ->  /api/post?slug=:slug  (see vercel.json)
const template = require('../lib/template.js');
const { getCfg, getOrigin, sb } = require('../lib/cfg.js');

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const join = (html, key, val) => html.split(key).join(val);

function sanitize(html) {
  return String(html || '')
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form|base)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed|link|meta|form|base)\b[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');
}
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
const readTime = (p) => p.read_time || `${Math.max(1, Math.round(String(p.content || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length / 200))} min read`;

const ART = [
  '<rect width="100" height="100" fill="#2252ff"/><circle cx="68" cy="34" r="22" fill="#6a4bff"/><circle cx="68" cy="34" r="9" fill="#22c7ff"/><rect x="10" y="64" width="52" height="8" rx="4" fill="#fff"/><rect x="10" y="78" width="34" height="8" rx="4" fill="#081338"/>',
  '<rect width="100" height="100" fill="#e3ecff"/><circle cx="32" cy="68" r="34" fill="#2252ff"/><circle cx="72" cy="28" r="16" fill="none" stroke="#6a4bff" stroke-width="6"/>',
  '<rect width="100" height="100" fill="#081338"/><polygon points="20,80 50,20 80,80" fill="#2252ff"/><circle cx="74" cy="26" r="9" fill="#22c7ff"/><rect x="14" y="86" width="72" height="3" fill="#fff"/>',
];
const thumb = (p, i) => p.cover_url
  ? `<img src="${esc(p.cover_url)}" alt="${esc(p.cover_alt || p.title)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">`
  : `<svg class="art" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${ART[i % ART.length]}</svg>`;

function page404(res, msg) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Article not found | Tanvir.Studio</title><style>body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#f3f7ff;color:#0c1a45;text-align:center}a{display:inline-block;margin-top:18px;padding:14px 26px;border-radius:14px;background:#2252ff;color:#fff;text-decoration:none;font-weight:700}</style></head><body><div><h1>${esc(msg || 'Article not found')}</h1><p>The article may have been moved or unpublished.</p><a href="/blog.html">Back to the blog</a></div></body></html>`);
}

module.exports = async (req, res) => {
  const slug = String((req.query && req.query.slug) || '').trim();
  const cfg = getCfg();
  if (!slug) return page404(res);
  if (!cfg.url) return page404(res, 'Blog is not connected yet');
  try {
    const rows = await sb(cfg, `blog_posts?select=*&slug=eq.${encodeURIComponent(slug)}&published=eq.true&limit=1`);
    const post = rows[0];
    if (!post || new Date(post.published_at) > new Date()) return page404(res);
    let related = [];
    try {
      related = await sb(cfg, `blog_posts?select=slug,title,category,cover_url&published=eq.true&slug=neq.${encodeURIComponent(slug)}&order=published_at.desc&limit=2`);
    } catch (e) { /* related posts are optional */ }

    const origin = getOrigin(req);
    const pathName = `blog/${post.slug}`;
    const shareUrl = `${origin}/${pathName}`;
    const title = (post.seo_title || post.title).replace(/\s*\|\s*Tanvir\.Studio\s*$/i, '');
    const desc = post.seo_description || post.excerpt || '';
    const image = post.cover_url || `${origin}/assets/img/og-cover.png`;
    const coverAlt = post.cover_alt || post.title;
    const body = sanitize(post.content).replace(/<img\b(?![^>]*\bloading=)/gi, '<img loading="lazy" decoding="async"');
    const inlineImages = Array.from(body.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)).map((m) => (m[1].startsWith('/') ? origin + m[1] : m[1]));
    const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    const images = [image].concat(inlineImages).filter((u, i, a) => u && a.indexOf(u) === i).slice(0, 10);

    const ld = [
      { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: desc, datePublished: post.published_at,
        dateModified: post.updated_at || post.published_at, mainEntityOfPage: shareUrl, inLanguage: 'en', image: images,
        wordCount: words, articleSection: post.category,
        author: { '@type': 'Organization', name: 'Tanvir.Studio', url: origin + '/' },
        publisher: { '@id': origin + '/#organization' } },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: origin + '/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: origin + '/blog.html' },
        { '@type': 'ListItem', position: 3, name: post.title, item: shareUrl } ] },
    ].map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n');

    const relatedHtml = related.map((q, i) => `<a class="post-card" href="blog/${encodeURIComponent(q.slug)}"><div class="thumb">${thumb(q, i)}</div><span class="cat">${esc(q.category)}</span><h3>${esc(q.title)}</h3><span class="read">Read more <svg class="ic" aria-hidden="true" focusable="false"><use href="#i-arrow"/></svg></span></a>`).join('');
    const cover = post.cover_url ? `<div class="article-cover" data-reveal="wipe"><img src="${esc(post.cover_url)}" alt="${esc(coverAlt)}" width="1200" height="600" fetchpriority="high"></div>` : '';

    let html = template;
    html = join(html, '{{ORIGIN}}/assets/img/og-cover.png', image.startsWith(origin) ? '{{ORIGIN}}/assets/img/og-cover.png' : image);
    if (!related.length) html = html.replace(/<!--REL_START-->[\s\S]*?<!--REL_END-->/, '');
    html = html.replace(/(<meta content=")[^"]*(" property="og:image:alt")/, (m, a, b) => a + esc(post.cover_url ? coverAlt : post.title) + b);
    const map = {
      '{{ORIGIN}}': origin, '{{PATH}}': pathName, '{{TITLE_HTML}}': esc(post.title), '{{TITLE}}': esc(title), '{{DESC}}': esc(desc),
      '{{PUBLISHED}}': esc(post.published_at), '{{CATEGORY}}': esc(post.category), '{{DATE}}': fmtDate(post.published_at),
      '{{READ}}': esc(readTime(post)), '{{COVER}}': cover, '{{SHARE_URL}}': encodeURIComponent(shareUrl), '{{RELATED}}': relatedHtml,
      '{{LD}}': ld, '{{CONTENT}}': body,
    };
    // content last so that text inside an article can never be mistaken for a placeholder
    const content = map['{{CONTENT}}'];
    delete map['{{CONTENT}}'];
    for (const k of Object.keys(map)) html = join(html, k, map[k]);
    html = join(html, '{{CONTENT}}', content);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.end(html);
  } catch (e) {
    page404(res, 'Article could not be loaded');
  }
};
