import type { NavigateFunction } from "react-router-dom";

/* ── Page transitions ──────────────────────────────────────────────
   The site drives the View Transitions API itself.

   React Router's `viewTransition` prop only does anything under a data
   router (createBrowserRouter); this app is declarative <BrowserRouter>,
   so those props were inert and document.startViewTransition was never
   called once — the transition anyone saw was AnimatePresence fading
   the old page out and the new one in, and the ::view-transition CSS
   had never run at all.

   Driving it here means the DOM swap happens inside the transition
   callback, which is the only place the browser will capture it.

   The callback has to wait for that swap rather than force it.
   flushSync does nothing here: React Router 7 wraps its navigation
   state in startTransition, so the commit lands a tick later whatever
   we do — the callback returned, the browser photographed the page it
   already had, and both snapshots were the outgoing page. Returning a
   promise instead makes the browser hold the capture until the router
   has actually committed, which Routes reports through notifySwap. */

/** The shared name for the title that morphs from a listing row into
    the page it opens. Only ever on two elements — one per snapshot.

    /work and /apps hand their titles over this way. /games does not:
    each game is its own chunk behind a loading screen, so at the moment
    the snapshot is taken there is no title on the other side to morph
    into — and a source with no counterpart gets lifted out of the page
    and animated on its own, which looks like a bug. Games get the page
    transition alone, which is the right call until the shell renders
    before its game does. */
export const MORPH = "page-title";

let morphing = false;
let onSwap: (() => void) | null = null;

/** Called from the router once the new route has committed to the DOM. */
export function notifySwap() {
  onSwap?.();
  onSwap = null;
}

/** Resolves on the next committed route change — or after `ms`, so a
    navigation that never lands can't wedge the transition open. */
function committed(ms = 600): Promise<void> {
  return new Promise<void>(resolve => {
    const done = () => { window.clearTimeout(timer); resolve(); };
    const timer = window.setTimeout(() => { onSwap = null; resolve(); }, ms);
    onSwap = done;
  });
}

/** True while a title morph is mid-flight. The destination hero reads
    this to skip its own entrance: the title is already on screen,
    flying into place, and re-revealing it character by character on top
    of that reads as a stutter. */
export const isMorphing = () => morphing;

/** Which way this navigation goes, by path depth: opening a project
    from the list goes in, the prev/next cards and the header move
    across, and anything that lands shallower is coming back out. The
    page animates along that axis, so the site keeps a sense of where
    things are rather than crossfading identically in every direction. */
function directionOf(to: string): "in" | "out" | "across" {
  const depth = (p: string) => p.replace(/\/+$/, "").split("/").filter(Boolean).length;
  const from = depth(location.pathname);
  const next = depth(to);
  return next > from ? "in" : next < from ? "out" : "across";
}

export function startPageTransition(
  navigate: NavigateFunction,
  to: string,
  opts: { morphFrom?: HTMLElement | null } = {},
) {
  const start = document.startViewTransition?.bind(document);
  // Read at click time rather than from a hook: the value a hook closed
  // over can be one render behind a preference that changed since.
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!start || reduced) {
    navigate(to);
    return;
  }

  const from = opts.morphFrom ?? null;
  if (from) {
    from.style.viewTransitionName = MORPH;
    morphing = true;
  }

  const root = document.documentElement;
  root.dataset.nav = directionOf(to);

  const transition = start(async () => {
    const swapped = committed();
    navigate(to);
    await swapped;
    // The incoming page is in the DOM now but the "after" snapshot has
    // not been taken yet, so this is exactly the window in which to
    // hand the name over to whatever it should morph into.
    if (from) {
      const target = document.querySelector<HTMLElement>("[data-morph-target]");
      if (target) target.style.viewTransitionName = MORPH;
    }
  });

  transition.finished.finally(() => {
    delete root.dataset.nav;
    morphing = false;
    if (from) from.style.viewTransitionName = "";
    document.querySelectorAll<HTMLElement>("[data-morph-target]")
      .forEach(el => { el.style.viewTransitionName = ""; });
  });
}
