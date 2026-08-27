import { CSSProperties, FC, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type CursorProps = { pathname?: string };

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
    gsap.killTweensOf(cursor);
    gsap.to(cursor, { scale: 1, mixBlendMode: 'exclusion', backgroundColor: '', duration: 0.2 });
    cursor.style.backgroundImage = '';
    if (ring) gsap.to(ring, { scale: 1, duration: 0.2 });
  }, [pathname]);

  useGSAP(() => {
    const cursor = cursorRef.current;
    const ring   = ringRef.current;
    if (!cursor) return;

    // ── Cursor movement ──────────────────────────────────────────────
    let moveDebounce: number;
    const moveCursor = (e: MouseEvent) => {
      clearTimeout(moveDebounce);
      moveDebounce = window.setTimeout(() => {
        const x  = e.clientX - cursor.clientWidth  / 2;
        const y  = e.clientY - cursor.clientHeight / 2;
        const cx = Math.max(0, Math.min(x, window.innerWidth  - cursor.clientWidth));
        const cy = Math.max(0, Math.min(y, window.innerHeight - cursor.clientHeight));
        gsap.to(cursor, { left: cx, top: cy, duration: 0.2, ease: 'power4' });

        if (ring && !reduced) {
          const rx = e.clientX - ring.clientWidth  / 2;
          const ry = e.clientY - ring.clientHeight / 2;
          gsap.to(ring, {
            left: Math.max(0, Math.min(rx, window.innerWidth  - ring.clientWidth)),
            top:  Math.max(0, Math.min(ry, window.innerHeight - ring.clientHeight)),
            duration: 0.5, ease: 'power4',
          });
        }
      }, 3);
    };

    // ── Link hover handlers ──────────────────────────────────────────
    const handleEnter = (t: HTMLElement) => {

      // Skip data-image while the work list is still animating in.
      // Home.tsx sets data-entering="true" on the container during the
      // staggered entrance and removes it when the last row finishes.
      let styles: CSSProperties = {};
      if (t.dataset.image) {
        const entering = !!document.querySelector('[data-entering]');
        if (!entering) {
          styles = {
            backgroundImage:    `url(${t.dataset.image})`,
            backgroundSize:     'cover',
            backgroundPosition: 'center',
          };
        }
      }

      gsap.to(cursor, {
        scale: 3, duration: 0.4, ease: 'power3.out',
        mixBlendMode: 'difference', backgroundColor: 'white',
        ...styles,
      });
      if (ring) gsap.to(ring, { scale: 0, duration: 0.3 });
    };

    const handleLeave = () => {
      gsap.killTweensOf(cursor);
      gsap.to(cursor, {
        scale: 1, duration: 0.35, ease: 'power3.out',
        mixBlendMode: 'exclusion', backgroundColor: '',
      });
      cursor.style.backgroundImage = '';
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

    document.addEventListener('mousemove', moveCursor);

    return () => {
      clearTimeout(moveDebounce);
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
