/**
 * Post-build script: injects <link rel="preload"> hints for the two critical
 * woff2 font files (Rubik latin-400 and Geologica latin-400) into dist/index.html.
 * Because Vite content-hashes the filenames, we find them at runtime.
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';

const assets = readdirSync('dist/assets');

const criticalFonts = [
  assets.find(f => f.startsWith('rubik-latin-400-normal') && f.endsWith('.woff2')),
  assets.find(f => f.startsWith('geologica-latin-400-normal') && f.endsWith('.woff2')),
].filter(Boolean);

let html = readFileSync('dist/index.html', 'utf-8');

const preloads = criticalFonts
  .map(f => `  <link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`)
  .join('\n');

html = html.replace('</head>', `${preloads}\n</head>`);
writeFileSync('dist/index.html', html);

console.log('Injected font preloads:', criticalFonts);
