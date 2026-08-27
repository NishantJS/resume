import { FC, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type CursorProps = { pathname?: string };

/* Properties the hover/route tweens own. Killing tweens by name matters
   now that the follow tweens live for the whole session: a blanket
   gsap.killTweensOf(cursor) would take the x/y quickTo down with the
   hover swell and the cursor would freeze mid-screen. */
const LOOK = 'scale,backgroundColor,mixBlendMode';

const Cursor: FC<CursorProps> = ({ pathname = "" }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);
  const reduced   = useReducedMotion();

  // Reset cursor appearance on every route change — prevents logo sticking
  // after programmatic navigation (no mouseleave fires during page transitions)
  useEffect(() => {
    const cursor = cursorRef.current;
    const ring   = ringRef.current;
    if (!cursor) return;
    gsap.killTweensOf(cursor, LOOK);
    gsap.to(cursor, { scale: 1, mixBlendMode: 'exclusion', backgroundColor: '', duration: 0.2 });
    cursor.style.backgroundImage = '';
    if (ring) gsap.to(ring, { scale: 1, duration: 0.2 });
  }, [pathname]);

  useGSAP(() => {
    const cursor = cursorRef.current;
    const ring   = ringRef.current;
    if (!cursor) return;

    /* ── Cursor movement ──────────────────────────────────────────
       `left` and `top` used to carry the follow. Both are layout
       properties: every frame of every mouse move put the cursor
       through layout → paint → composite, on an element that also
       blends against everything under it. Transforms skip straight to
       the compositor, so the same motion costs a matrix upload.

       The old 3 ms setTimeout debounce is gone too. It fired a fresh
       gsap.to() per mouse event — a new tween object, vars parse and
       all, hundreds of times a second — while adding a frame of lag
       for its trouble. quickTo keeps ONE tween per axis alive for the
       life of the component and just re-points it, which is what it
       exists for. Coalescing to the frame is rAF's job, and GSAP's
       ticker already does it. */
    const half = { c: cursor.clientWidth / 2, r: (ring?.clientWidth ?? 0) / 2 };
    let vw = window.innerWidth;
    let vh = window.innerHeight;

    // Measured on resize, not on every pointer frame: clientWidth and
    // innerWidth are both layout reads, and reading layout in a mouse
    // handler is what forces a synchronous reflow mid-scroll.
    const measure = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      half.c = cursor.clientWidth / 2;
      half.r = (ring?.clientWidth ?? 0) / 2;
    };
    window.addEventListener('resize', measure, { passive: true });

    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.2, ease: 'power4' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.2, ease: 'power4' });
    const rxTo = ring ? gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power4' }) : null;
    const ryTo = ring ? gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power4' }) : null;

    const moveCursor = (e: MouseEvent) => {
      // Self-heals if the setup measurement landed before layout.
      if (!half.c) measure();
      const x = e.clientX - half.c;
      const y = e.clientY - half.c;
      xTo(Math.max(0, Math.min(x, vw - half.c * 2)));
      yTo(Math.max(0, Math.min(y, vh - half.c * 2)));

      if (rxTo && ryTo && !reduced) {
        rxTo(Math.max(0, Math.min(e.clientX - half.r, vw - half.r * 2)));
        ryTo(Math.max(0, Math.min(e.clientY - half.r, vh - half.r * 2)));
      }
    };

    /* Logos already decoded and safe to paint straight onto the disc.
       Module-level would be better still, but per-mount is enough: the
       browser cache does the real work after the first hover. */
    const ready = new Set<string>();

    /** Paint (or clear) the thumbnail. Written to `style` directly, not
        tweened.

        `background-image` is not an interpolable value, so GSAP applies
        it at the END of the tween — a 400 ms wait before the logo
        appears, during which the disc is a flat white plate reading as
        a black hole under `difference` blend. The same delay applied to
        clearing it, so a logo lingered on the next link you moved to.
        Both symptoms, one cause: it was never a thing to animate. */
    const paintShot = (src: string | null) => {
      if (src) {
        cursor.style.backgroundImage = `url(${src})`;
        cursor.style.backgroundSize = 'cover';
        cursor.style.backgroundPosition = 'center';
      } else {
        cursor.style.backgroundImage = '';
      }
    };

    /* ── Link hover handlers ────────────────────────────────────────
       Every link gets the inverting disc — difference blend over white,
       which is the site's hover and what makes the nav, the logo, the
       body links and the accent words read as live.

       What changes is how big it gets. 3x is a frame: that size exists
       to hold a project thumbnail, and it only looks deliberate when
       there is one in it. Over a company name, a university, an Explore
       row — anything with no image behind it — it is a large empty
       plate. Those get 2x: the same invert, sized to the text it is
       passing over rather than to a picture that was never coming. */
    const handleEnter = (t: HTMLElement) => {
      // Home.tsx sets data-entering="true" on the work list during its
      // staggered entrance; until that clears, treat the rows as
      // imageless rather than flashing thumbnails at a moving target.
      const src = t.dataset.image && !document.querySelector('[data-entering]')
        ? t.dataset.image
        : null;

      gsap.to(cursor, {
        scale: src ? 3 : 2, duration: 0.4, ease: 'power3.out',
        mixBlendMode: 'difference', backgroundColor: 'white',
      });
      if (ring) gsap.to(ring, { scale: 0, duration: 0.3 });

      if (!src) { paintShot(null); return; }
      if (ready.has(src)) { paintShot(src); return; }

      /* First hover on a logo that isn't in the cache yet. Assigning it
         now shows nothing — the disc just sits there white until the
         bytes arrive, which is why it looked black and why coming back
         a second time "fixed" it. Decode first, then paint, and only if
         the pointer is still on the link that asked for it. */
      paintShot(null);
      const img = new Image();
      img.src = src;
      const show = () => {
        ready.add(src);
        if (hovered === t) paintShot(src);
      };
      if (img.decode) img.decode().then(show, () => {});
      else img.onload = show;
    };

    const handleLeave = () => {
      gsap.killTweensOf(cursor, LOOK);
      gsap.to(cursor, {
        scale: 1, duration: 0.35, ease: 'power3.out',
        mixBlendMode: 'exclusion', backgroundColor: '',
      });
      paintShot(null);
      if (ring) gsap.to(ring, { scale: 1, duration: 0.5 });
    };

    /* ── Link hover, by delegation ──────────────────────────────────
       Every `a, .link` used to get its own pair of listeners, re-scanned
       by a MutationObserver watching the whole body — and `attachAll`
       ran a full-document querySelectorAll on every single mutation.

       Splitting a heading into characters emits hundreds of childList
       records, and these pages now split seven headings apiece, so each
       one kicked off hundreds of whole-document queries. That is what
       made the site crawl.

       One pair of listeners on the document does the same job for any
       number of links, including ones that appear later, and costs a
       `closest` call per pointer move. */
    let hovered: Element | null = null;

    const onOver = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.('a, .link');
      if (!el || el === hovered) return;
      hovered = el;
      handleEnter(el as HTMLElement);
    };

    const onOut = (e: MouseEvent) => {
      if (!hovered) return;
      // Moving between children of the same link is not a leave.
      const to = e.relatedTarget as Node | null;
      if (to && hovered.contains(to)) return;
      hovered = null;
      handleLeave();
    };

    const onClick = () => { hovered = null; handleLeave(); };

    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    document.addEventListener('click', onClick);

    document.addEventListener('mousemove', moveCursor, { passive: true });

    /* Warm the thumbnails this page can ask for, so even the first hover
       has something to paint. Only where the cursor exists at all — it
       is display:none under 1024px, and there is no reason to spend a
       phone's bandwidth on images it will never show. */
    let warm = 0;
    if (window.matchMedia('(min-width: 1024px)').matches) {
      warm = window.requestIdleCallback?.(() => {
        document.querySelectorAll<HTMLElement>('[data-image]').forEach(el => {
          const src = el.dataset.image;
          if (!src || ready.has(src)) return;
          const img = new Image();
          img.src = src;
          const done = () => ready.add(src);
          if (img.decode) img.decode().then(done, () => {});
          else img.onload = done;
        });
      }, { timeout: 2000 }) ?? window.setTimeout(() => {}, 0);
    }

    return () => {
      window.cancelIdleCallback?.(warm);
      window.removeEventListener('resize', measure);
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('click', onClick);
    };
  }, {
    dependencies: [pathname],
    scope: cursorRef,
  });

  return (
    <>
      <div
        ref={ringRef}
        className="cursor-ring w-10 h-10 rounded-full fixed pointer-events-none z-40 border border-purple-400/30"
      />
      <div
        ref={cursorRef}
        className="w-6 h-6 rounded-full fixed pointer-events-none z-40 bg-gray-700 mix-blend-exclusion cursor"
      />
    </>
  );
};

export default Cursor;
