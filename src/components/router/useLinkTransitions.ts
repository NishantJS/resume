import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { startPageTransition } from "./transition";
import { preloadPath } from "./lazyRoutes";
import { freezeScroll, hasMomentum } from "./scrollLock";

/* ── One interceptor for every internal link ───────────────────────
   Catching clicks in the capture phase, before React Router's own Link
   handler runs, means every in-app navigation goes through the same
   transition — header, listing rows, prev/next cards, app tabs, the
   404, the back link out of a game. Tagging each of those call sites
   by hand would have meant a dozen edits and one forgotten link that
   jumps while the rest animate.

   Everything that should still behave like a normal link is left
   alone: modified clicks, new tabs, downloads, other origins, and
   anything a component has already handled itself.               */
export function useLinkTransitions() {
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || anchor.hasAttribute("download") || anchor.target) return;

      const url = new URL(anchor.href, location.href);
      if (url.origin !== location.origin) return;
      // In-page anchors keep the browser's own smooth scroll.
      if (url.pathname === location.pathname && url.hash) return;

      e.preventDefault();
      e.stopPropagation();

      // Freeze now, while the fling that carried you to this link is
      // still in flight — the route does not commit until the
      // transition callback runs, and the wheels in between are the
      // ones that used to land on the incoming page.
      //
      // Only when there is something to fight, though. Clicking a link
      // without having scrolled recently carries no momentum, and
      // locking the document then is felt as the new page refusing to
      // move for half a second.
      if (hasMomentum()) freezeScroll();

      const to = url.pathname + url.search + url.hash;
      // A listing row hands its title over to the hero it opens.
      const morphFrom = anchor.querySelector<HTMLElement>("[data-morph-source]");
      const go = () => startPageTransition(navigate, to, { morphFrom });

      /* Wait for the destination's chunk. It has to be in memory
         before the swap or the route suspends inside the transition,
         and it is usually already warm from the hover below.

         An earlier version gave up after 240ms and navigated anyway.
         That was worse than it sounds: React keeps the previous page
         on screen while a suspended route resolves, so the URL changed
         and then nothing happened — measured at 1,185ms of a dead-
         looking click on a cold chunk, which reads exactly like a page
         taking seconds to load.

         So the click is acknowledged instead. Past a beat, a progress
         bar says the site heard you, and the page still arrives with
         its transition intact. */
      const slow = window.setTimeout(() => document.documentElement.setAttribute("data-loading", ""), 180);
      preloadPath(url.pathname).finally(() => {
        window.clearTimeout(slow);
        document.documentElement.removeAttribute("data-loading");
        go();
      });
    };

    // Warm the chunk on approach, so by the time the click lands the
    // page can be rendered synchronously.
    const onEnter = (e: Event) => {
      const anchor = (e.target as Element | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!href || anchor!.target) return;
      const url = new URL(anchor!.href, location.href);
      if (url.origin === location.origin) preloadPath(url.pathname);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerenter", onEnter, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerenter", onEnter, true);
    };
  }, [navigate]);
}
