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
    blurb: "Fintech and enterprise systems shipped to production — real-time feeds, micro-frontends, the platforms behind them.",
    color: "#fbbf24",
  },
  {
    to: "/apps",
    label: "Apps",
    count: pad(__COUNT_APPS__),
    blurb: "Built in Flutter, offline by design. A guided car inspection for delivery day, and GST invoicing that never leaves the phone.",
    color: "#22d3ee",
  },
  {
    to: "/games",
    label: "Games",
    count: pad(__COUNT_GAMES__),
    blurb: "Browser games built for the fun of it, playable right here — no installs, no accounts.",
    color: "#a78bfa",
  },
];

export const Explore: FC = () => {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const rows = el.querySelectorAll<HTMLElement>(".xp-row");
    if (!rows.length) return;

    if (reduced) {
      gsap.set(rows, { clearProps: "all", opacity: 1 });
      return;
    }

    gsap.set(rows, { opacity: 0, y: 26 });
    gsap.to(rows, {
      opacity: 1,
      y: 0,
      duration: 0.65,
      stagger: 0.09,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  }, { scope: ref, dependencies: [reduced] });

  return (
    <section
      ref={ref}
      className="px-6 md:px-12 xl:px-16 pt-4 pb-8 max-w-5xl 2xl:max-w-screen-xl mx-auto w-full"
      aria-label="Explore the rest of the site"
    >
      <ul className="xp-list">
        {DESTINATIONS.map(d => (
          <li key={d.to}>
            <Link
              to={d.to}
              className="link xp-row"
              style={{ ["--xp" as string]: d.color } as React.CSSProperties}
            >
              <span className="xp-num mono" aria-hidden>{d.count}</span>
              <span className="xp-body">
                <span className="xp-label">{d.label}</span>
                <span className="xp-blurb">{d.blurb}</span>
              </span>
              <span className="xp-arrow mono" aria-hidden>→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Explore;
