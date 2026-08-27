import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { freezeScroll } from './scrollLock';

gsap.registerPlugin(ScrollTrigger);

/* ── Scroll position across route changes ──────────────────────────
   A route change puts you at the top of the new page; a hash takes you
   to that section instead.

   The reset is instant and runs in a layout effect, so the new page is
   composed at the top before anything paints or measures. A smooth
   scroll never arrived: pages here run to fifteen thousand pixels, and
   the document collapses to the new page's height mid-flight, which
   cancels the scroll and leaves you wherever the shorter page clamped
   you.

   Holding that position against a trackpad fling is scrollLock's job,
   started back on the click and released on a short fixed timer.

   The browser's own scroll restoration is turned off so back and
   forward behave like every other route change here.               */
function ScrollToAnchor() {
  const { pathname, hash } = useLocation();
  const lastPath = useRef(pathname);

  useLayoutEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    const changed = pathname !== lastPath.current;
    lastPath.current = pathname;

    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    document.scrollingElement?.scrollTo({ top: 0, behavior: 'instant' });
    if (!changed) return;

    // Back/forward never goes through the click interceptor, so this
    // is where those get their (brief) freeze.
    freezeScroll();

    // The incoming page's geometry only exists now, so every
    // scroll-driven section on it is still holding start/end values
    // measured against the page that just left.
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 520);
    return () => window.clearTimeout(t);
  }, [pathname, hash]);

  return null;
}

export default ScrollToAnchor;
