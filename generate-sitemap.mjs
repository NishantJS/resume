/**
 * Post-build script: writes dist/sitemap.xml from the route data itself.
 *
 * The checked-in sitemap had gone stale — it listed seven /work pages and
 * exactly one of the ten games, and had never heard of /apps at all. That
 * is the failure mode of a hand-maintained sitemap: nothing breaks when
 * you forget it, so you forget it.
 */
import { writeFileSync } from 'fs';
import { routes } from './scripts/route-data.mjs';

const SITE = 'https://www.nishant.click';
const { projects, apps, games } = routes();
const today = new Date().toISOString().slice(0, 10);

// priority is a hint about relative importance within this site only.
const urls = [
  { loc: '/', priority: '1.0', changefreq: 'monthly' },
  { loc: '/work', priority: '0.9', changefreq: 'monthly' },
  { loc: '/apps', priority: '0.9', changefreq: 'monthly' },
  { loc: '/games', priority: '0.9', changefreq: 'monthly' },
  ...projects.map(path => ({ loc: path, priority: '0.8', changefreq: 'monthly' })),
  ...apps.map(slug => ({ loc: `/apps/${slug}`, priority: '0.8', changefreq: 'monthly' })),
  ...games.map(slug => ({ loc: `/games/${slug}`, priority: '0.7', changefreq: 'monthly' })),
  // Store-required pages: real URLs, but not what anyone should land on.
  ...apps.flatMap(slug =>
    ['support', 'privacy', 'changelog'].map(sub => ({
      loc: `/apps/${slug}/${sub}`, priority: '0.4', changefreq: 'yearly',
    })),
  ),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${SITE}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

writeFileSync('dist/sitemap.xml', xml);
console.log(`Generated sitemap: ${urls.length} URLs`);
