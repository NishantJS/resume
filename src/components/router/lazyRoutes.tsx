import { ComponentType, createElement } from "react";

/* ── Route loading ─────────────────────────────────────────────────
   React.lazy cannot be used here. A view transition swaps the DOM
   inside a synchronous flush, and a lazy component suspends on that
   first render no matter how warm its module is — React only learns
   the promise resolved once it has tried to render and thrown. So the
   browser captured an empty page as the "after" snapshot: the old page
   dissolved into nothing and the real one appeared afterwards, outside
   the transition entirely.

   This cache resolves synchronously once a chunk has been fetched, so
   a preloaded route renders inside the flush and is there to be
   photographed. Cold, it suspends exactly like lazy did.           */

type Loader = () => Promise<{ default: ComponentType<never> }>;

const loaded = new Map<Loader, ComponentType<never>>();
const inflight = new Map<Loader, Promise<unknown>>();

export function preload(loader: Loader): Promise<unknown> {
  if (loaded.has(loader)) return Promise.resolve();
  let p = inflight.get(loader);
  if (!p) {
    p = loader().then(m => { loaded.set(loader, m.default); inflight.delete(loader); });
    inflight.set(loader, p);
  }
  return p;
}

function route(loader: Loader) {
  const Route = () => {
    const C = loaded.get(loader);
    if (C) return createElement(C);
    throw preload(loader);
  };
  Route.loader = loader;
  return Route;
}

export const About        = route(() => import("../about/About"));
export const Home         = route(() => import("../home/Home"));
export const Project      = route(() => import("../project/Project"));
export const Games        = route(() => import("../games/Games"));
export const GamePage     = route(() => import("../games/GamePage"));
export const Apps         = route(() => import("../apps/Apps"));
export const AppPage      = route(() => import("../apps/AppPage"));
export const AppSupport   = route(() => import("../apps/AppSupport"));
export const AppPrivacy   = route(() => import("../apps/AppPrivacy"));
export const AppChangelog = route(() => import("../apps/AppChangelog"));
export const NotFound     = route(() => import("../error/NotFound"));

/** Which chunk a path needs, so it can be fetched before the
    transition starts rather than during it. */
export function preloadPath(pathname: string): Promise<unknown> {
  const p = pathname.replace(/\/+$/, "") || "/";
  const seg = p.split("/").filter(Boolean);

  if (p === "/") return preload(About.loader);
  if (seg[0] === "work")  return preload(seg.length > 1 ? Project.loader : Home.loader);
  if (seg[0] === "games") return preload(seg.length > 1 ? GamePage.loader : Games.loader);
  if (seg[0] === "apps") {
    if (seg.length === 1) return preload(Apps.loader);
    if (seg[2] === "support")   return preload(AppSupport.loader);
    if (seg[2] === "privacy")   return preload(AppPrivacy.loader);
    if (seg[2] === "changelog") return preload(AppChangelog.loader);
    return preload(AppPage.loader);
  }
  return preload(NotFound.loader);
}
