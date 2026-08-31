/**
 * Post-build script: writes a real document per route.
 *
 * The site is a client-rendered SPA, so every URL was served the same
 * index.html and `useSeo` corrected the tags once React had booted.
 * Anything that reads the response without running JS — a crawler, a
 * link unfurler, a store reviewer opening a privacy policy — therefore
 * saw the landing page's title and description on all thirty routes.
 *
 * This does not render the app. It writes dist/<route>/index.html for
 * every route with that route's own title, description, canonical, OG
 * and Twitter tags baked into the head. React still boots and renders
 * the page; a host that checks the filesystem before its SPA rewrite
 * (Vercel and Netlify both do) serves the right document first.
 *
 * The meta comes from scripts/seo-routes.ts, which the components read
 * too, so the tag in the file and the tag React sets cannot disagree.
 */
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import { build } from 'esbuild';
import { pathToFileURL } from 'url';

const SITE = 'https://www.nishant.click';
const DIST = 'dist';
const DEFAULT_IMAGE = '/og-image.png';
const DEFAULT_ROBOTS =
  'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

/* The route table is TypeScript and imports the data modules, so it is
   bundled to a throwaway ESM file rather than parsed with a regex. */
const TMP = join(DIST, '.seo-routes.mjs');
await build({
  entryPoints: ['scripts/seo-routes.ts'],
  outfile: TMP,
  bundle: true,
  format: 'esm',
  platform: 'node',
  logLevel: 'warning',
});
const { seoRoutes } = await import(pathToFileURL(TMP).href);
rmSync(TMP);

const routes = seoRoutes();

const html = readFileSync(join(DIST, 'index.html'), 'utf-8');

/** Escape for an HTML attribute value. */
const attr = s =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
           .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Escape for text between tags. */
const text = s =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Each tag is rewritten in place when index.html already carries it, so
   a route never ends up with two of anything — a duplicated description
   is a tag a crawler has to choose between. */
function setMeta(doc, kind, key, value) {
  const re = new RegExp(`(<meta\\s+${kind}=["']${key}["'][^>]*content=["'])[^"']*(["'][^>]*>)`, 'i');
  if (re.test(doc)) return doc.replace(re, `$1${attr(value)}$2`);
  return doc.replace('</head>', `  <meta ${kind}="${key}" content="${attr(value)}">\n</head>`);
}

function render(route) {
  const url = SITE + route.path;
  const image = route.image
    ? (route.image.startsWith('http') ? route.image : SITE + route.image)
    : SITE + DEFAULT_IMAGE;

  let doc = html;
  doc = doc.replace(/<title>[\s\S]*?<\/title>/i, `<title>${text(route.title)}</title>`);
  doc = setMeta(doc, 'name', 'description', route.description);
  doc = setMeta(doc, 'property', 'og:title', route.title);
  doc = setMeta(doc, 'property', 'og:description', route.description);
  doc = setMeta(doc, 'property', 'og:url', url);
  doc = setMeta(doc, 'property', 'og:image', image);
  doc = setMeta(doc, 'name', 'twitter:title', route.title);
  doc = setMeta(doc, 'name', 'twitter:description', route.description);
  doc = setMeta(doc, 'name', 'twitter:image', image);
  doc = setMeta(doc, 'name', 'robots', route.noindex ? 'noindex, follow' : DEFAULT_ROBOTS);

  const canon = /(<link\s+rel=["']canonical["'][^>]*href=["'])[^"']*(["'][^>]*>)/i;
  doc = canon.test(doc)
    ? doc.replace(canon, `$1${attr(url)}$2`)
    : doc.replace('</head>', `  <link rel="canonical" href="${attr(url)}">\n</head>`);

  return doc;
}

let written = 0;
for (const route of routes) {
  // "/" is dist/index.html itself; everything else gets a directory
  // index, which is the form both hosts resolve for a clean URL.
  const out = route.path === '/'
    ? join(DIST, 'index.html')
    : join(DIST, route.path.replace(/^\//, ''), 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, render(route));
  written++;
}

console.log(`Prerendered ${written} routes`);
