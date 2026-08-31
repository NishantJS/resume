/**
 * The site's routes, read out of the data modules at build time.
 *
 * Two consumers need to know what exists: the sitemap generator, and
 * vite.config.ts, which bakes the counts into the bundle so the landing
 * page's Explore rows can say "07 / 03 / 10" without importing the data.
 * Importing them at runtime would pull ~60 kB of project, app and game
 * copy into the landing chunk to render three numbers.
 *
 * The slugs are matched with a regex rather than by importing the
 * modules, because they are TypeScript and this runs in plain node.
 */
import { readFileSync } from 'fs';

/** Every `<key>: "…"` literal at the top of a line in a data module. */
const literals = (file, key) =>
  [...readFileSync(file, 'utf-8').matchAll(new RegExp(`^\\s*${key}:\\s*"([^"]+)"`, 'gm'))]
    .map(m => m[1]);

export function routes() {
  const projects = literals('src/components/project/projects.data.ts', 'path');
  const apps     = literals('src/components/apps/apps.data.ts', 'slug');
  const games    = literals('src/components/games/games.data.ts', 'slug');

  /* Each app's card colour, in the same order as its slug — the two are
     read from the same objects, so position pairs them. The router uses
     these to paint the document canvas the tone of the page that is
     arriving, which is what stops a navigation flashing white. */
  const colors = literals('src/components/apps/apps.data.ts', 'color');
  const appColors = Object.fromEntries(apps.map((slug, i) => [slug, colors[i]]));

  // A data module that changed shape would silently yield an empty list,
  // which ships a sitemap missing whole sections and an Explore row
  // reading "00". Fail the build instead.
  if (!projects.length || !apps.length || !games.length) {
    throw new Error(
      `Route data: found ${projects.length} projects, ${apps.length} apps, ` +
      `${games.length} games — a data module changed shape.`,
    );
  }
  if (colors.length !== apps.length) {
    throw new Error(
      `Route data: ${apps.length} app slugs but ${colors.length} colours — ` +
      `an app entry is missing one, and the pairing above is by position.`,
    );
  }
  return { projects, apps, games, appColors };
}
