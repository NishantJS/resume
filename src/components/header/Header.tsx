import { FC, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from "@gsap/react";
import gsap from 'gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const links = [
  { name: "My Work", path: "/work", match: (p: string) => p === "/work" || p.startsWith("/work/"), color: "border-purple-500" },
  { name: "Games",   path: "/games", match: (p: string) => p === "/games" || p.startsWith("/games/"), color: "border-amber-500"  },
];

type HeaderProps = { active: string };

const Header: FC<HeaderProps> = ({ active = "/" }) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const ncRef     = useRef<HTMLAnchorElement>(null);
  const reduced   = useReducedMotion();

  useGSAP(() => {
    const h = headerRef.current;
    if (!h) return;
    if (reduced) { gsap.set(h, { opacity: 1, y: 0 }); return; }
    gsap.fromTo(h, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1.2, delay: 0.6 });
  }, { scope: headerRef, revertOnUpdate: false, dependencies: [reduced] });

  useGSAP(() => {
    const h = headerRef.current;
    if (!h) return;
    // All pages use difference blend — white text inverts on light bg = readable black,
    // inverts on dark/colored bg = white. Works everywhere without special-casing.
    gsap.set(h, { color: 'white', mixBlendMode: 'difference' });
  }, [active]);

  // Hide on scroll-down, reveal on scroll-up
  useGSAP(() => {
    const h = headerRef.current;
    if (!h) return;
    let lastY = window.scrollY, hidden = false;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY && y > 80 && !hidden) {
        hidden = true;
        gsap.to(h, { y: '-110%', duration: 0.4, ease: 'power2.inOut' });
      } else if (y <= lastY && hidden) {
        hidden = false;
        gsap.to(h, { y: '0%', duration: 0.4, ease: 'power2.out' });
      }
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, { scope: headerRef });

  // Magnetic NC logo
  useEffect(() => {
    const nc = ncRef.current;
    if (!nc || reduced) return;
    const onMove = (e: MouseEvent) => {
      const r = nc.getBoundingClientRect();
      gsap.to(nc, {
        x: (e.clientX - r.left - r.width  / 2) * 0.3,
        y: (e.clientY - r.top  - r.height / 2) * 0.3,
        duration: 0.3, ease: 'power2.out',
      });
    };
    const onLeave = () => gsap.to(nc, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    nc.addEventListener('mousemove', onMove);
    nc.addEventListener('mouseleave', onLeave);
    return () => {
      nc.removeEventListener('mousemove', onMove);
      nc.removeEventListener('mouseleave', onLeave);
    };
  }, [reduced]);

  return (
    <header
      ref={headerRef}
      className="fixed w-full px-5 py-5 sm:p-8 flex justify-between items-center gap-3 md:px-20 xl:px-28 2xl:px-40 z-20 pointer-events-none"
      role="banner"
    >
      <Link
        ref={ncRef}
        to="/"
        aria-label="NC — go to home"
        className="font-bold text-3xl sm:text-4xl -rotate-90 inline-block pointer-events-auto shrink-0"
      >
        NC
      </Link>

      <nav aria-label="Main navigation" className="pointer-events-auto">
        <ul className="flex space-x-3 sm:space-x-4 text-base sm:text-2xl mono" role="list">
          {links.map(link => {
            const isActive = link.match(active);
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  viewTransition
                  className={`link nav-link border-b-2 py-1.5 px-0.5 sm:py-2 sm:px-1 whitespace-nowrap ${isActive ? link.color : 'border-transparent'}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
