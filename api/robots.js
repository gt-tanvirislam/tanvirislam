const { getOrigin } = require('../lib/cfg.js');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600');
  res.statusCode = 200;
  res.end(`User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${getOrigin(req)}/sitemap.xml\n`);
};
