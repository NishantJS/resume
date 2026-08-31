/* Every route the site has, with the meta its document should carry.
   Build-time only — the prerender script loads this through esbuild, so
   it may import the data modules freely. Nothing in the app bundle
   imports it, which is why pulling in all three catalogues here costs
   the client nothing. */
import { STATIC_SEO } from "../src/seo.static";
import { apps, AppRoute } from "../src/components/apps/apps.data";
import { appSeo } from "../src/components/apps/apps.seo";
import { projects } from "../src/components/project/projects.data";
import { projectSeo } from "../src/components/project/projects.seo";
import { games } from "../src/components/games/games.data";
import { gameSeo } from "../src/components/games/games.seo";

export interface RouteMeta {
  path: string;
  title: string;
  description: string;
  /** Site-relative preview image, when the route has one of its own. */
  image?: string;
  noindex?: boolean;
}

const APP_ROUTES: AppRoute[] = ["overview", "privacy", "support", "changelog"];

export function seoRoutes(): RouteMeta[] {
  return [
    STATIC_SEO.home,
    STATIC_SEO.work,
    STATIC_SEO.apps,
    STATIC_SEO.games,

    ...projects.map(projectSeo),

    ...apps.flatMap(app => APP_ROUTES.map(route => appSeo(app, route))),

    ...games.map(gameSeo),
  ];
}
