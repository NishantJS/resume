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
        const rect = document.documentElement.getBoundingClientRect();
        const x = e.clientX - rect.left - cursor.clientWidth / 2;
        const y = e.clientY - rect.top - cursor.clientHeight / 2;
        const clampedX = Math.max(0, Math.min(x, rect.width));
        const clampedY = Math.max(0, Math.min(y, rect.height));

        gsap.to(cursor, {
          left: clampedX,
          top: clampedY,
          duration: 0.2,
          ease: 'power3.out'
        });
      }, 10); // Adjust debounce delay as needed
    };

    const handleLinkHover = () => {
      if (!cursor.classList.contains('hover')) {
        gsap.to(cursor, { scale: 3, duration: 0.5 });
        cursor.classList.add('hover');
        cursor.style.mixBlendMode = 'difference'; // Change mix-blend-mode on hover
        cursor.style.backgroundColor = 'white'; // Change background color on hover
      }
    };

    const handleLinkLeave = () => {
      gsap.to(cursor, { scale: 1, duration: 0.3 });
      cursor.classList.remove('hover');
      cursor.style.backgroundColor = ''; // Reset background color 
      cursor.style.mixBlendMode = 'exclusion'; // Reset mix-blend-mode
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

  return <div ref={cursorRef} className={`cursor w-6 h-6 rounded-full absolute pointer-events-none ${classes} mix-blend-exclusion z-40`}></div>;
};

export default Cursor;
