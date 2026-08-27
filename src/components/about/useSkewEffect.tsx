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
      gsap.set(chars, { opacity: 1, y: '0%', color: 'white' });
      return;
    }

    gsap.set(name, { transformPerspective: 900, transformOrigin: 'center center' });

    let idleTimer = 0;
    let settleTimer = 0;
    let revealed  = false;
    /* Assigned once the spotlight below is set up. The entrance owns
       the characters' colours while it runs, so the spotlight stays
       out of the way until the last letter has locked in — and the
       glyphs it locks in are wider than the scramble ones, so the
       cached character positions are re-read at the same moment. */
    let onEntranceDone: () => void = () => {};

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

          // After the last lock-in, hand the characters to the spotlight
          // and start the idle flash cycle.
          if (i === chars.length - 1) {
            settleTimer = window.setTimeout(() => {
              onEntranceDone();
              idleTimer = window.setTimeout(doFlash, 1500);
            }, 600);
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

    /* ── 3-D tilt + per-char colour spotlight ─────────────────────
       The effect is unchanged; what it costs per frame is not.

       It used to call getBoundingClientRect() on the heading AND on
       every single character on every mouse frame — a forced synchronous
       layout per character, roughly fifteen of them, before a single
       pixel was drawn — and then hand each character its own gsap.to().
       Fifteen tween objects built and thrown away sixty times a second,
       each one animating `text-shadow`, which repaints a blurred glyph.
       That is the stutter you feel when the cursor crosses the name.

       Now: geometry is measured once (and re-measured only when it can
       actually have changed), the spotlight strength for each character
       eases in a single loop, and the two properties are written
       straight to `style` only when the value they would take has
       actually changed. Same easing, same look, no per-frame layout and
       no per-frame allocation. */
    let raf = 0;
    let mx = 0, my = 0;
    let dirty: 'all' | 'name' | null = null;
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let nameRect = name.getBoundingClientRect();
    let charFrac = chars.map(() => 0);
    let spotlight = false;   // held off until the entrance has finished writing colours

    // The heading only moves vertically, and only with scroll, so a
    // scroll re-reads one rect. Character positions can only change on
    // a re-layout, so they are re-read on resize and once the entrance
    // has swapped the scramble glyphs back for the real letters.
    const measureName = () => { nameRect = name.getBoundingClientRect(); };
    const measureAll = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      measureName();
      charFrac = chars.map(c => {
        const r = c.getBoundingClientRect();
        return (r.left + r.width / 2) / vw;
      });
    };
    measureAll();

    /* quickTo keeps one tween per axis alive instead of building a new
       one on every pointer frame.

       The names have to be GSAP's own rotationX/rotationY, not the CSS
       rotateX/rotateY spellings. Those two are only aliases: CSSPlugin
       registers the PropTween under the canonical name, while quickTo's
       resetTo() looks it up by the exact string it was handed. The
       lookup misses, the tween is re-initialised to force the property
       into existence, and GSAP warns "rotateX not eligible for reset"
       -- once per pointer frame, forever. */
    const rotYTo = gsap.quickTo(name, 'rotationY', { duration: 0.7, ease: 'power2.out' });
    const rotXTo = gsap.quickTo(name, 'rotationX', { duration: 0.7, ease: 'power2.out' });

    const strength = chars.map(() => 0);   // eased, what is on screen
    const target   = chars.map(() => 0);   // where the cursor says it should go
    const lastCol  = chars.map(() => '');
    const lastShad = chars.map(() => '');
    let hue = 250;

    const paint = () => {
      raf = 0;
      if (dirty) {
        if (dirty === 'all') measureAll();
        else measureName();
        dirty = null;
      }

      rotYTo(gsap.utils.clamp(-8, 8,  ((mx - nameRect.left - nameRect.width  / 2) / vw) * 16));
      rotXTo(gsap.utils.clamp(-5, 5, -((my - nameRect.top  - nameRect.height / 2) / vh) * 10));

      if (!spotlight) return;

      let settling = false;
      const h = Math.round(hue);

      for (let i = 0; i < chars.length; i++) {
        const t = target[i];
        let v = strength[i];
        if (Math.abs(t - v) < 0.004) v = t;
        else { v += (t - v) * 0.28; settling = true; }
        strength[i] = v;

        const lit  = v > 0.02;
        const col  = lit ? `hsl(${h}, 92%, ${Math.round(62 + v * 28)}%)` : 'white';
        const shad = lit ? `0 0 ${(v * 24).toFixed(1)}px hsl(${h}, 92%, 68%)` : 'none';

        if (col !== lastCol[i])   { lastCol[i]  = col;  chars[i].style.color = col; }
        if (shad !== lastShad[i]) { lastShad[i] = shad; chars[i].style.textShadow = shad; }
      }

      // Keep ticking only while something is still easing.
      if (settling) raf = requestAnimationFrame(paint);
    };

    const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };

    onEntranceDone = () => {
      measureAll();
      spotlight = true;
      schedule();
    };

    /* The idle flash writes colour and text-shadow with its own tween,
       so the cached "what is already on this character" values go stale
       the moment it runs. Clearing them makes the next paint write
       unconditionally rather than assume the character still looks the
       way the spotlight last left it. */
    const invalidate = (el: HTMLElement) => {
      const i = chars.indexOf(el);
      if (i >= 0) { lastCol[i] = ''; lastShad[i] = ''; }
    };

    // The elastic settle and the quickTo tilt both drive the same two
    // rotation properties, so whichever is not wanted has to go. The
    // old code got this for free from `overwrite: 'auto'` on a tween it
    // rebuilt every frame; with one long-lived tween per axis the
    // handoff is explicit.
    let rest: gsap.core.Tween | null = null;

    const onMove = (e: MouseEvent) => {
      if (rest) { rest.kill(); rest = null; }
      mx = e.clientX;
      my = e.clientY;
      if (spotlight) {
        // Colour spotlight: chars nearest cursor X glow with a shifting hue.
        const xFrac = mx / vw;
        hue = 250 + xFrac * 130; // purple → indigo → cyan → teal
        for (let i = 0; i < chars.length; i++) {
          // ~22 % viewport spotlight radius
          target[i] = Math.max(0, 1 - Math.abs(xFrac - charFrac[i]) * 4.5);
        }
      }
      schedule();
    };

    const onLeave = () => {
      rest = gsap.to(name, { rotationY: 0, rotationX: 0, duration: 1.1, ease: 'elastic.out(1, 0.45)' });
      if (spotlight) {
        target.fill(0);
        schedule();
      }
    };

    const onScroll = () => { if (dirty !== 'all') dirty = 'name'; schedule(); };
    const onResize = () => { dirty = 'all'; schedule(); };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

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
          invalidate(target);
          gsap.fromTo(target,
            { color, scale: 1.2, textShadow: `0 0 18px ${color}` },
            { color: 'white', scale: 1, textShadow: 'none', duration: 0.55, ease: 'power3.out',
              onComplete: () => invalidate(target) }
          );
          if (t2) {
            invalidate(t2);
            gsap.fromTo(t2,
              { color: col2, scale: 1.14 },
              { color: 'white', scale: 1, duration: 0.5, ease: 'power3.out',
                onComplete: () => invalidate(t2) }
            );
          }
        }
      }, 55);

      idleTimer = window.setTimeout(doFlash, 900 + Math.random() * 2200);
    };

    return () => {
      entranceCleanup?.();
      window.clearTimeout(idleTimer);
      // Untracked before: this one fires 600 ms after the last letter
      // lands, and on a quick unmount it woke the spotlight back up
      // against detached nodes.
      window.clearTimeout(settleTimer);
      cancelAnimationFrame(raf);
      rest?.kill();
      observer.disconnect();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [ref, reduced]);
}
