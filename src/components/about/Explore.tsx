import { FC, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/* ── Where to go next ──────────────────────────────────────────────
   The résumé ends and the reader is at the bottom of a long page with
   the three actual bodies of work still only reachable from a nav bar
   they scrolled past several screens ago. This puts them at the end of
   the road instead.

   The counts are compile-time constants, substituted by Vite from the
   same reader that builds the sitemap (see `define` in vite.config.ts).
   Importing projects.data / apps.data / games.data to count them at
   runtime would pull ~60 kB of copy into the landing page's chunk to
   render three integers; hardcoding them means they go stale the first
   time something ships. This is neither.

   Accent per destination matches the nav underline for that section,
   so the colour is already familiar by the time you get here. */
const pad = (n: number) => String(n).padStart(2, "0");
const DESTINATIONS = [
  {
    to: "/work",
    label: "My Work",
    count: pad(__COUNT_WORK__),
    unit: "projects",
    blurb: "Fintech and enterprise systems shipped to production — real-time feeds, micro-frontends, the platforms behind them.",
    color: "#fbbf24",
  },
  {
    to: "/apps",
    label: "Apps",
    count: pad(__COUNT_APPS__),
    unit: "on the stores",
    blurb: "Built in Flutter, offline by design. A guided car inspection for delivery day, and GST invoicing that never leaves the phone.",
    color: "#22d3ee",
  },
  {
    to: "/games",
    label: "Games",
    count: pad(__COUNT_GAMES__),
    unit: "playable here",
    blurb: "Browser games built for the fun of it, playable right here — no installs, no accounts.",
    color: "#a78bfa",
  },
];

export const Explore: FC = () => {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  /* The accent bloom follows the pointer, but a mousemove handler that
     writes a style on every event is a layout thrash per pixel. The
     coordinates are parked on a ref and flushed once per frame, and the
     values are custom properties a compositor-only gradient reads —
     nothing here invalidates layout. */
  const raf = useRef(0);
  const point = useRef({ el: null as HTMLElement | null, x: 0, y: 0 });

  const track = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    point.current = { el, x: e.clientX - r.left, y: e.clientY - r.top };
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const { el: t, x, y } = point.current;
      if (!t) return;
      t.style.setProperty("--mx", `${x}px`);
      t.style.setProperty("--my", `${y}px`);
    });
  };

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const rows = gsap.utils.toArray<HTMLElement>(el.querySelectorAll(".xp-row"));
    if (!rows.length) return;

    if (reduced) {
      gsap.set(el.querySelectorAll(".xp-label, .xp-blurb, .xp-meta"), { yPercent: 0, opacity: 1 });
      gsap.set(el.querySelectorAll(".xp-rule"), { scaleX: 1 });
      return;
    }

    /* Each row builds itself in the order the eye reads it: the rule
       draws under it, the label rises out of its mask, then the
       supporting text and the count fade up behind it. */
    rows.forEach((row, i) => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: row, start: "top 88%", once: true },
        defaults: { ease: "power3.out" },
        delay: i * 0.06,
      });
      tl.fromTo(row.querySelector(".xp-rule"),
          { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power2.inOut" })
        .fromTo(row.querySelector(".xp-label"),
          { yPercent: 118 }, { yPercent: 0, duration: 0.85 }, 0.08)
        .fromTo(row.querySelectorAll(".xp-blurb, .xp-meta"),
          { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.3);
    });
  }, { scope: ref, dependencies: [reduced] });

  return (
    <section
      ref={ref}
      /* The same column every section above it uses. On its own
         measurements this ran 400px wider than the rest of the page,
         which is what made it read as a different site. */
      className="xp-section px-6 md:px-12 xl:px-16 pb-4 max-w-5xl 2xl:max-w-screen-xl mx-auto w-full"
      aria-label="Explore the rest of the site"
    >
      <ul className="xp-list">
        {DESTINATIONS.map(d => (
          <li key={d.to}>
            <Link
              to={d.to}
              className="link xp-row"
              style={{ ["--xp" as string]: d.color } as React.CSSProperties}
              onPointerMove={track}
            >
              <span className="xp-rule" aria-hidden />
              <span className="xp-bloom" aria-hidden />

              <span className="xp-body">
                {/* The mask is what the label rises out of, and what
                    keeps a descender from showing before its turn. */}
                <span className="xp-mask">
                  <span className="xp-label" data-text={d.label}>{d.label}</span>
                </span>
                <span className="xp-blurb">{d.blurb}</span>
              </span>

              <span className="xp-meta" aria-hidden>
                <span className="xp-nums">
                  <span className="xp-count mono">{d.count}</span>
                  <span className="xp-unit mono">{d.unit}</span>
                </span>
                <span className="xp-arrow">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
                    <path d="M6 18 18 6M18 6H9m9 0v9" stroke="currentColor" strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Explore;
