import { FC, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

type CursorProps = {
  classes?: string;
};

const Cursor: FC<CursorProps> = ({ classes = "" }) => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let debounceTimeout: number;

    const moveCursor = (e: MouseEvent) => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        const x = e.clientX - cursor.clientWidth / 2;
        const y = e.clientY - cursor.clientHeight / 2;
        const clampedX = Math.max(0, Math.min(x));
        const clampedY = Math.max(0, Math.min(y));

        gsap.to(cursor, {
          left: clampedX,
          top: clampedY,
          duration: 0.2,
          ease: 'power4',
        });
      }, 5); // Adjust debounce delay as needed
    };

    const handleLinkHover = () => {
      if (!cursor.classList.contains('hover')) {
        gsap.to(cursor, { scale: 3, duration: 0.5, mixBlendMode: 'difference', backgroundColor: 'white' });
      }
    };

    const handleLinkLeave = () => {
      gsap.killTweensOf(cursor);

      gsap.to(cursor, { scale: 1, duration: 0.3, mixBlendMode: 'exclusion', backgroundColor: '' });
      cursor.classList.remove('hover');
    };

    document.addEventListener('mousemove', moveCursor);

    const links = document.querySelectorAll('a, .link');
    links.forEach(link => {
      link.addEventListener('mouseenter', handleLinkHover);
      link.addEventListener('mouseleave', handleLinkLeave);
    });

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      links.forEach(link => {
        link.removeEventListener('mouseenter', handleLinkHover);
        link.removeEventListener('mouseleave', handleLinkLeave);
      });
    };
  }, []);

  return <div ref={cursorRef} className={`w-6 h-6 rounded-full fixed pointer-events-none ${classes} mix-blend-exclusion z-40`}>
  </div>;
};

export default Cursor;
