import { FC, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from "@gsap/react";
import gsap from 'gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const links = [
  { name: "My Work", path: "/work", match: (p: string) => p === "/work" || p.startsWith("/work/"), color: "border-amber-400" },
  { name: "Apps",    path: "/apps",  match: (p: string) => p === "/apps"  || p.startsWith("/apps/"),  color: "border-cyan-400"   },
  { name: "Games",   path: "/games", match: (p: string) => p === "/games" || p.startsWith("/games/"), color: "border-violet-400" },
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

  /* Magnetic NC logo.

     The rect used to be read inside the move handler, and a fresh
     gsap.to() built for each event — a pointer that reports at 1000 Hz
     turned that into a thousand layout reads and a thousand tween
     objects a second, all to move one small element. The measurement
     only changes when the page moves under the cursor, so it is taken
     on enter and re-taken if the page scrolls or resizes; quickTo keeps
     one tween per axis for the drift. */
  useEffect(() => {
    const nc = ncRef.current;
    if (!nc || reduced) return;

    const xTo = gsap.quickTo(nc, 'x', { duration: 0.3, ease: 'power2.out' });
    const yTo = gsap.quickTo(nc, 'y', { duration: 0.3, ease: 'power2.out' });

    let cx = 0, cy = 0, stale = true;
    let settle: gsap.core.Tween | null = null;

    // The rect already includes the drift GSAP has applied, so the
    // current x/y is subtracted back out to recover the resting centre.
    const measure = () => {
      const r = nc.getBoundingClientRect();
      cx = r.left + r.width  / 2 - (gsap.getProperty(nc, 'x') as number);
      cy = r.top  + r.height / 2 - (gsap.getProperty(nc, 'y') as number);
      stale = false;
    };
    const invalidate = () => { stale = true; };

    const onEnter = () => { settle?.kill(); settle = null; measure(); };
    const onMove = (e: MouseEvent) => {
      if (stale) measure();
      xTo((e.clientX - cx) * 0.3);
      yTo((e.clientY - cy) * 0.3);
    };
    const onLeave = () => {
      settle = gsap.to(nc, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    };

    nc.addEventListener('mouseenter', onEnter);
    nc.addEventListener('mousemove', onMove);
    nc.addEventListener('mouseleave', onLeave);
    window.addEventListener('scroll', invalidate, { passive: true });
    window.addEventListener('resize', invalidate, { passive: true });
    return () => {
      nc.removeEventListener('mouseenter', onEnter);
      nc.removeEventListener('mousemove', onMove);
      nc.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', invalidate);
      window.removeEventListener('resize', invalidate);
      settle?.kill();
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
        className="group font-bold text-3xl sm:text-4xl -rotate-90 inline-block pointer-events-auto shrink-0"
      >
        {/* Inner span scales independently of the magnetic x/y drift GSAP
            applies to the link itself. */}
        <span className="inline-block transition-transform duration-300 ease-out group-hover:scale-110">
          NC
        </span>
      </Link>

      <nav aria-label="Main navigation" className="pointer-events-auto">
        <ul className="flex space-x-3 sm:space-x-4 text-base sm:text-2xl mono" role="list">
          {links.map(link => {
            const isActive = link.match(active);
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
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
