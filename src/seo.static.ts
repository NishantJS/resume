/* Meta for the routes whose copy is not derived from a data module.
   Kept here rather than inline in each component so the build-time
   prerender and the client-side `useSeo` cannot drift: a page that
   says one thing to a crawler and another in the tab is worse than
   one that is merely wrong.

   Literals only — no data-module imports. This is pulled into the
   landing chunk, and importing the project, app and game copy to
   render a <title> is exactly what the counts in vite.config avoid. */
export interface StaticMeta {
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
}

export const STATIC_SEO = {
  home: {
    path: "/",
    title: "Nishant Chorge — Senior Software Developer",
    description:
      "Senior Software Developer in Mumbai building production-grade fintech and enterprise systems — SSE real-time feeds, micro-frontends, resilient APIs. Currently at BCT Consulting, on the automation team for BNP Paribas. Node.js · React · Next.js · Fastify · Redis.",
  },
  work: {
    path: "/work",
    title: "Work — Nishant Chorge",
    description:
      "Selected full-stack products by Nishant Chorge — real-time fintech platforms, multi-role portals, micro-frontend architectures and more, built with Node.js, React, Next.js and Fastify.",
  },
  apps: {
    path: "/apps",
    title: "Apps — Nishant Chorge",
    description:
      "Apps built in Flutter by Nishant Chorge — PDI Pro, a guided pre-delivery car inspection for Indian buyers, and InvoiceKaro, offline GST invoicing. Both work fully offline, with no account and no server.",
  },
  games: {
    path: "/games",
    title: "Games — Nishant Chorge",
    description:
      "Ten little browser games built from scratch by Nishant Chorge — Parking Escape, 2048, Snake, Block Breaker, Memory, Simon, Lights Out, Sliding Puzzle and more. No installs, plays instantly.",
  },
  notFound: {
    path: "/404",
    title: "Page not found — Nishant Chorge",
    description: "The page you're after has driven off. Head back home, or explore the work and games.",
    // Every unmatched URL renders this, so leaving it indexable invites
    // search engines to file an unbounded number of pages under it.
    noindex: true,
  },
} satisfies Record<string, StaticMeta>;
