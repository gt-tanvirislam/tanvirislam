// Reads the Supabase URL and anon key from Vercel environment variables,
// or falls back to assets/js/config.js so only one file needs editing.
const fs = require('fs');
const path = require('path');

function getCfg() {
  let url = process.env.SUPABASE_URL;
  let key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    try {
      const s = fs.readFileSync(path.join(process.cwd(), 'assets/js/config.js'), 'utf8');
      url = url || (s.match(/SUPABASE_URL\s*:\s*["']([^"']+)["']/) || [])[1];
      key = key || (s.match(/SUPABASE_ANON_KEY\s*:\s*["']([^"']+)["']/) || [])[1];
    } catch (e) { /* ignore */ }
  }
  if (/YOUR_/.test(url || '') || /YOUR_/.test(key || '')) { url = ''; key = ''; }
  return { url: (url || '').replace(/\/$/, ''), key: key || '' };
}

function getOrigin(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  return `${proto}://${host}`;
}

async function sb(cfg, pathAndQuery) {
  const r = await fetch(`${cfg.url}/rest/v1/${pathAndQuery}`, { headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` } });
  if (!r.ok) throw new Error('Supabase ' + r.status);
  return r.json();
}

module.exports = { getCfg, getOrigin, sb };
