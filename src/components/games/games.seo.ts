import { GameMeta } from "./games.data";

/** A game page's meta, resolved once for both the client-side `useSeo`
    and the build-time prerender. See src/components/apps/apps.seo.ts. */
export const gameSeo = (game: GameMeta) => ({
  title: `Play ${game.title} — Nishant Chorge`,
  description: game.description,
  path: `/games/${game.slug}`,
});
