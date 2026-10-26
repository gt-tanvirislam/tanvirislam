// Dynamic sitemap: static pages plus every published blog article.
const { getCfg, getOrigin, sb } = require('../lib/cfg.js');

module.exports = async (req, res) => {
  const origin = getOrigin(req);
  const today = new Date().toISOString().slice(0, 10);
  const pages = [['', '1.0'], ['services.html', '0.9'], ['portfolio.html', '0.9'], ['pricing.html', '0.8'], ['contact.html', '0.8'], ['about.html', '0.7'], ['blog.html', '0.7']];
  let urls = pages.map(([p, pr]) => `  <url><loc>${origin}/${p}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${pr}</priority></url>`);
  const cfg = getCfg();
  if (cfg.url) {
    try {
      const posts = await sb(cfg, `blog_posts?select=slug,updated_at,published_at&published=eq.true&order=published_at.desc`);
      urls = urls.concat(posts.filter((p) => new Date(p.published_at) <= new Date()).map((p) =>
        `  <url><loc>${origin}/blog/${encodeURIComponent(p.slug)}</loc><lastmod>${String(p.updated_at || p.published_at).slice(0, 10)}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`));
    } catch (e) { /* sitemap still works without posts */ }
  }
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
  res.statusCode = 200;
  res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
};
