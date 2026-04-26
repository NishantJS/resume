import { CSSProperties, FC, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type CursorProps = { pathname?: string };

const Cursor: FC<CursorProps> = ({ pathname = "" }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);
  const reduced   = useReducedMotion();

  useGSAP(() => {
    const cursor = cursorRef.current;
    const ring   = ringRef.current;
    if (!cursor) return;

    let debounceTimeout: number;

    const moveCursor = (e: MouseEvent) => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        const x = e.clientX - cursor.clientWidth / 2;
        const y = e.clientY - cursor.clientHeight / 2;
        const cx = Math.max(0, Math.min(x, window.innerWidth  - cursor.clientWidth));
        const cy = Math.max(0, Math.min(y, window.innerHeight - cursor.clientHeight));
        gsap.to(cursor, { left: cx, top: cy, duration: 0.2, ease: 'power4' });

        if (ring && !reduced) {
          const rx = e.clientX - ring.clientWidth / 2;
          const ry = e.clientY - ring.clientHeight / 2;
          gsap.to(ring, {
            left: Math.max(0, Math.min(rx, window.innerWidth  - ring.clientWidth)),
            top:  Math.max(0, Math.min(ry, window.innerHeight - ring.clientHeight)),
            duration: 0.5, ease: 'power4',
          });
        }
      }, 3);
    };

    const handleLinkHover = (e: Event) => {
      if (cursor.classList.contains('hover')) return;
      let styles: CSSProperties = {};
      if (e.target instanceof HTMLElement && e.target.dataset.image) {
        styles = {
          backgroundImage: `url(${e.target.dataset.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      }
      gsap.to(cursor, { scale: 3, duration: 0.5, mixBlendMode: 'difference', backgroundColor: 'white', ...styles });
      if (ring) gsap.to(ring, { scale: 0, duration: 0.3 });
    };

    const handleLinkLeave = () => {
      gsap.killTweensOf(cursor);
      gsap.to(cursor, { scale: 1, duration: 0.3, mixBlendMode: 'exclusion', backgroundColor: '' });
      cursor.style.backgroundImage = '';
      cursor.classList.remove('hover');
      if (ring) gsap.to(ring, { scale: 1, duration: 0.5 });
    };

    document.addEventListener('mousemove', moveCursor);

    // Delay link registration to let the new page's DOM fully render
    // (especially important for project pages where links appear after animation)
    const linkTimeout = window.setTimeout(() => {
      const links = document.querySelectorAll('a, .link');
      links.forEach(link => {
        link.addEventListener('mouseenter', handleLinkHover);
        link.addEventListener('mouseleave', handleLinkLeave);
        link.addEventListener('click',      handleLinkLeave);
      });
    }, 150);

    return () => {
      clearTimeout(linkTimeout);
      document.removeEventListener('mousemove', moveCursor);
      document.querySelectorAll('a, .link').forEach(link => {
        link.removeEventListener('mouseenter', handleLinkHover);
        link.removeEventListener('mouseleave', handleLinkLeave);
        link.removeEventListener('click',      handleLinkLeave);
      });
    };
  }, {
    dependencies: [pathname],
    scope: cursorRef,
  });

  return (
    <>
      {/* Trailing ring */}
      <div
        ref={ringRef}
        className="cursor-ring w-10 h-10 rounded-full fixed pointer-events-none z-40 border border-purple-400/30"
      />
      {/* Primary dot */}
      <div
        ref={cursorRef}
        className="w-6 h-6 rounded-full fixed pointer-events-none z-40 bg-gray-700 mix-blend-exclusion cursor"
      />
    </>
  );
};

export default Cursor;
