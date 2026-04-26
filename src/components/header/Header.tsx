import { FC, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from "@gsap/react";
import gsap from 'gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// "/" is now the About/home page; "/work" is the projects list
const links = [
  { name: "Work", path: "/work" },
];

type HeaderProps = { active: string };

const Header: FC<HeaderProps> = ({ active = "/" }) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const ncRef     = useRef<HTMLAnchorElement>(null);
  const reduced   = useReducedMotion();

  useGSAP(() => {
    const h = headerRef.current;
    if (!h) return;
    gsap.fromTo(h, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1, delay: 0.5 });
  }, { scope: headerRef, revertOnUpdate: false });

  useGSAP(() => {
    const h = headerRef.current;
    if (!h) return;
    // "/" (about/home, black bg) and project pages → white blend; "/work" → dark
    const isDark = active === '/' || active.startsWith('/project');
    gsap.to(h, { color: isDark ? 'white' : 'black', mixBlendMode: isDark ? 'difference' : 'normal', duration: 2 });
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

  const isWork = active === '/work' || active.startsWith('/project');

  return (
    <header
      ref={headerRef}
      className="fixed w-full p-8 flex justify-between items-center md:px-20 xl:px-28 2xl:px-40 z-20"
      role="banner"
    >
      <Link
        ref={ncRef}
        to="/"
        aria-label="NC — go to home"
        className="font-bold text-4xl -rotate-90 inline-block"
      >
        NC
      </Link>

      <nav aria-label="Main navigation">
        <ul className="flex space-x-4 text-2xl mono" role="list">
          {links.map(link => (
            <li key={link.path}>
              <Link
                to={link.path}
                viewTransition
                className={`link border-b-2 py-2 px-1 ${isWork ? 'border-purple-500' : 'border-transparent'}`}
                aria-current={isWork ? 'page' : undefined}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
