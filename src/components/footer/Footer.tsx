import { FC, useRef } from 'react';
import { useGSAP } from "@gsap/react";
import gsap from 'gsap';

type FooterProps = { active: string };

const Footer: FC<FooterProps> = ({ active = "" }) => {
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const f = footerRef.current;
    if (!f) return;
    gsap.fromTo(f, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, delay: 0.8 });
  }, { scope: footerRef });

  useGSAP(() => {
    const f = footerRef.current;
    if (!f) return;
    // Only the about/home page has a dark bg — everything else is light
    gsap.to(f, { color: active === "/" ? "white" : "black", duration: 2 });
  }, [active]);

  useGSAP(() => {
    const f = footerRef.current;
    if (!f) return;
    let lastY = window.scrollY;
    let hidden = false;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY && y > 80 && !hidden) {
        hidden = true;
        gsap.to(f, { y: '110%', duration: 0.4, ease: 'power2.inOut' });
      } else if (y <= lastY && hidden) {
        hidden = false;
        gsap.to(f, { y: '0%', duration: 0.4, ease: 'power2.out' });
      }
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, { scope: footerRef });

  return (
    /* pointer-events-none on the container so the transparent middle area
       doesn't block clicks on underlying page content.
       pointer-events-auto restored on the actual link columns. */
    <footer
      ref={footerRef}
      role="contentinfo"
      aria-label="Contact and social links"
      className="fixed bottom-0 w-full flex justify-between items-end mono text-sm md:text-base px-6 py-4 md:px-20 xl:px-28 2xl:px-40 pointer-events-none"
    >
      <div className="flex flex-col gap-0.5 pointer-events-auto">
        <a href="https://www.linkedin.com/in/nishant-chorge/" target="_blank" rel="noreferrer noopener" className="py-2 hover:underline inline-block">
          LinkedIn
        </a>
        <a href="https://www.github.com/NishantJS" target="_blank" rel="noreferrer noopener" className="py-2 hover:underline inline-block">
          GitHub
        </a>
        <a href="/Nishant Chorge Software Developer.pdf" target="_blank" rel="noreferrer noopener" download className="py-2 hover:underline inline-block" aria-label="Resume — download PDF">
          Resume
        </a>
      </div>
      <div className="flex flex-col gap-0.5 text-right pointer-events-auto">
        <a href="mailto:itsnishantchorge@gmail.com" target="_blank" rel="noreferrer noopener" className="py-2 hover:underline inline-block">
          Email
        </a>
        <a href="tel:+916283925737" target="_blank" rel="noreferrer noopener" className="py-2 hover:underline inline-block">
          Phone
        </a>
      </div>
    </footer>
  );
};

export default Footer;
