import { AppMeta, AppRoute } from "./apps.data";

/* One app is four routes, and each needs a <title> and a description in
   two places: the client-side `useSeo` that keeps the tab honest during
   SPA navigation, and the build-time prerender that writes the document
   a crawler or a store reviewer actually receives. Resolving both from
   here means the two can never disagree.

   An app that was submitted to a store supplies its own strings in
   `seo`; the fallbacks below cover one that has not. */
const fallback = (app: AppMeta): Record<AppRoute, { title: string; description: string }> => ({
  overview: {
    title: `${app.name} — ${app.tagline}`,
    description: app.blurb,
  },
  privacy: {
    title: `${app.name} privacy policy`,
    description: `How ${app.name} handles your data: what is collected, why, who it is shared with, how long it is kept, and how to have it deleted.`,
  },
  support: {
    title: `${app.name} support — help, FAQ and contact`,
    description: `Get help with ${app.name}: answers to common questions, the full feature list, and how to reach support directly.`,
  },
  changelog: {
    title: `${app.name} changelog — what's new`,
    description: `Release notes for ${app.name}, newest first — new features, improvements and fixes in every version up to ${app.release.version}.`,
  },
});

/** The path an app route lives at. */
export const appPath = (slug: string, route: AppRoute) =>
  route === "overview" ? `/apps/${slug}` : `/apps/${slug}/${route}`;

export const appSeo = (app: AppMeta, route: AppRoute) => {
  const base = fallback(app)[route];
  const own = app.seo?.[route];
  return {
    title: own?.title ?? base.title,
    description: own?.description ?? base.description,
    path: appPath(app.slug, route),
  };
};
