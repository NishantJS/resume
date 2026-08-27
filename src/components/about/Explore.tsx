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

   Counts are written here rather than imported. Reading them from
   projects.data / apps.data / games.data would pull three data modules
   — 60 kB of them — into the landing page's chunk to render three
   numbers. Keep them in step by hand when a project ships.

   Accent per destination matches the nav underline for that section,
   so the colour is already familiar by the time you get here. */
const DESTINATIONS = [
  {
    to: "/work",
    label: "My Work",
    count: "07",
    blurb: "Fintech and enterprise systems shipped to production — real-time feeds, micro-frontends, the platforms behind them.",
    color: "#fbbf24",
  },
  {
    to: "/apps",
    label: "Apps",
    count: "03",
    blurb: "Built in Flutter, published on Google Play. Field inspections, GST invoicing, and an offline-first vault.",
    color: "#22d3ee",
  },
  {
    to: "/games",
    label: "Games",
    count: "10",
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
