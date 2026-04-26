import { useEffect } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?';
const COLORS = [
  '#a855f7', // purple
  '#22d3ee', // cyan
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#10b981', // emerald
  '#818cf8', // indigo
  '#fb7185', // pink
  '#34d399', // mint
  '#fbbf24', // yellow
  '#60a5fa', // blue
];

export function useSkewEffect(ref: React.RefObject<HTMLHeadingElement | null>) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const name = ref.current;
    if (!name) return;

    const chars = Array.from(name.querySelectorAll<HTMLElement>('.char'));
    // Read from data-char — NOT textContent — so StrictMode double-invoke
    // (which mutates textContent during scramble) can't corrupt originals.
    const originals = chars.map(c => c.dataset.char ?? '');

    if (reduced) {
      gsap.set(chars, { y: '0%' });
      return;
    }

    gsap.set(name, { transformPerspective: 900, transformOrigin: 'center center' });

    let idleTimer = 0;
    let revealed  = false;

    // Scramble entrance — triggered on scroll-into-view via IntersectionObserver
    const startEntrance = () => {
      if (revealed) return;
      revealed = true;

      // Show random glyphs first, ghost-dim — opacity: 1 so they're no longer hidden by CSS
      chars.forEach(c => {
        c.textContent = SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
      });
      gsap.set(chars, { opacity: 1, y: '0%', color: 'rgba(255,255,255,0.1)', scale: 0.9 });

      // Rapid scramble interval per character
      const sids = chars.map(c =>
        window.setInterval(() => {
          c.textContent = SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
        }, 55)
      );

      // Lock each char in left → right with 100 ms stagger (slower = more dramatic)
      const lids = chars.map((c, i) =>
        window.setTimeout(() => {
          window.clearInterval(sids[i]);
          c.textContent = originals[i];         // restored from data-char ✓

          const color = COLORS[i % COLORS.length];
          gsap.timeline()
            .set(c, { scale: 1.25, y: '-8%', color })
            .to(c, {
              scale: 1, y: '0%', color: 'white',
              duration: 0.8, ease: 'power3.out',
            });

          // After the last lock-in, start idle flash cycle
          if (i === chars.length - 1) {
            window.setTimeout(() => { idleTimer = window.setTimeout(doFlash, 1500); }, 600);
          }
        }, 500 + i * 100)
      );

      // Cleanup fns returned so we can kill them on unmount
      return () => {
        sids.forEach(window.clearInterval);
        lids.forEach(window.clearTimeout);
      };
    };

    let entranceCleanup: (() => void) | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          entranceCleanup = startEntrance() ?? undefined;
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(name);

    // ── 3-D tilt + per-char colour spotlight ─────────────────────
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // 3-D tilt tracked across full screen
        const { left, top, width, height } = name.getBoundingClientRect();
        const rotY = gsap.utils.clamp(-8, 8,  ((e.clientX - left - width  / 2) / vw) * 16);
        const rotX = gsap.utils.clamp(-5, 5, -((e.clientY - top  - height / 2) / vh) * 10);
        gsap.to(name, { rotateY: rotY, rotateX: rotX, duration: 0.7, ease: 'power2.out', overwrite: 'auto' });

        if (!revealed) return;

        // Colour spotlight: chars nearest cursor X glow with a shifting hue
        const xFrac = e.clientX / vw;
        const hue   = 250 + xFrac * 130; // purple → indigo → cyan → teal

        chars.forEach(c => {
          const r      = c.getBoundingClientRect();
          const cxFrac = (r.left + r.width / 2) / vw;
          const dist   = Math.abs(xFrac - cxFrac);
          const str    = Math.max(0, 1 - dist * 4.5); // ~22 % viewport spotlight radius

          if (str > 0.02) {
            gsap.to(c, {
              color: `hsl(${hue}, 92%, ${62 + str * 28}%)`,
              textShadow: `0 0 ${str * 24}px hsl(${hue}, 92%, 68%)`,
              duration: 0.2, ease: 'power2.out', overwrite: 'auto',
            });
          } else {
            gsap.to(c, {
              color: 'white', textShadow: 'none',
              duration: 0.5, ease: 'power2.out', overwrite: 'auto',
            });
          }
        });
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(raf);
      gsap.to(name, { rotateY: 0, rotateX: 0, duration: 1.1, ease: 'elastic.out(1, 0.45)' });
      if (revealed) gsap.to(chars, { color: 'white', textShadow: 'none', duration: 0.6, ease: 'power2.out' });
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    // ── Idle: random letter scramble + colour burst ───────────────
    const doFlash = () => {
      const pool   = chars.filter((_, i) => originals[i].trim());
      const target = pool[Math.floor(Math.random() * pool.length)];
      const ti     = chars.indexOf(target);
      const color  = COLORS[Math.floor(Math.random() * COLORS.length)];
      const ticks  = 4 + Math.floor(Math.random() * 6);
      let   tick   = 0;

      // Sometimes burst 2 adjacent chars
      const doBurst = Math.random() < 0.3;
      const t2      = doBurst ? pool[(pool.indexOf(target) + 1) % pool.length] : null;
      const orig2   = t2 ? originals[chars.indexOf(t2)] : '';

      const sid = window.setInterval(() => {
        target.textContent = SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
        if (t2) t2.textContent = SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];

        if (++tick >= ticks) {
          window.clearInterval(sid);
          // Restore from data-char — correct even after scramble
          target.textContent = originals[ti];
          if (t2) t2.textContent = orig2;

          const col2 = COLORS[Math.floor(Math.random() * COLORS.length)];
          gsap.fromTo(target,
            { color, scale: 1.2, textShadow: `0 0 18px ${color}` },
            { color: 'white', scale: 1, textShadow: 'none', duration: 0.55, ease: 'power3.out' }
          );
          if (t2) {
            gsap.fromTo(t2,
              { color: col2, scale: 1.14 },
              { color: 'white', scale: 1, duration: 0.5, ease: 'power3.out' }
            );
          }
        }
      }, 55);

      idleTimer = window.setTimeout(doFlash, 900 + Math.random() * 2200);
    };

    return () => {
      entranceCleanup?.();
      window.clearTimeout(idleTimer);
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [ref, reduced]);
}
