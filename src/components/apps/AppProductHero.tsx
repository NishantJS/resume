import { CSSProperties, FC, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AppMeta } from "./apps.data";
import { MaskedTitle, PlayIcon, comingSoonLabel, inkFor, markLoaded, onlyPlay, revealOnLoad } from "./AppChrome";

gsap.registerPlugin(ScrollTrigger);

/* Which three shots make up the hero cluster, and how each is posed. */
const CLUSTER = [
  { n: 2, cls: "app-hero-phone--left" },
  { n: 1, cls: "app-hero-phone--front" },
  { n: 3, cls: "app-hero-phone--right" },
];

/** The landing hero. Unlike a project page — which leads with the
    project's name because the work *is* the subject — a product page
    has to answer "what is this and why do I want it" before the fold,
    so the pitch, the proof, the buttons and the product itself all sit
    in one screen. */
const AppProductHero: FC<{ app: AppMeta }> = ({ app }) => {
  const ref = useRef<HTMLElement>(null);
  const { ink, inkLow, inkDim, border } = inkFor(app.color);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const q = <T extends Element>(sel: string) => el.querySelectorAll<T>(sel);
    if (reduced) {
      q<HTMLElement>(".tw, .app-hero-line, .app-hero-phone").forEach(e => { e.style.opacity = "1"; });
      return;
    }

    gsap.set(q(".tc"), { yPercent: 115, rotate: 4 });
    gsap.set(q(".tw"), { opacity: 1 });

    gsap.timeline({ defaults: { ease: "power4.out" } })
      .to(q<HTMLElement>(".tc"), { yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.016 }, 0.1)
      .fromTo(q(".app-hero-line"), { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, 0.3)
      // Phones settle in from below, outer two trailing the front one.
      .fromTo(q(".app-hero-phone"),
        { opacity: 0, y: 60, rotate: 0 },
        { opacity: 1, y: 0, rotate: (i: number) => [-7, 0, 7][i] ?? 0,
          duration: 1.1, stagger: 0.09, ease: "power3.out" }, 0.2);

    // The cluster drifts up a touch as the page scrolls past it.
    gsap.to(el.querySelector(".app-hero-art"), {
      yPercent: -9, ease: "none",
      scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
    });
  }, { scope: ref, dependencies: [app.slug] });

  const btnVars = { ["--btn-ink"]: ink, ["--btn-fill"]: app.color, ["--btn-border"]: border } as CSSProperties;
  const live = Boolean(app.release.playUrl);

  return (
    <section
      ref={ref}
      className="app-hero relative overflow-hidden"
      style={{ color: ink } as CSSProperties}
    >
      <div className="app-hero-grid">
        {/* ── Pitch column ─────────────────────────────────── */}
        <div className="app-hero-copy">
          <p className="app-hero-line mono opacity-0 text-xs uppercase tracking-[0.22em]" style={{ color: inkDim }}>
            {app.name} · {app.role}
          </p>

          <MaskedTitle text={app.hero.headline} className="app-hero-title" flow />

          <p className="app-hero-line opacity-0 mt-6 text-base xl:text-lg leading-relaxed max-w-xl" style={{ color: inkLow }}>
            {app.hero.sub}
          </p>

          {/* Proof before the ask — or, before there is a listing to
              prove anything, the facts that do exist. */}
          <div className="app-hero-line opacity-0 mono mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            {app.release.rating ? (
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <span aria-hidden>★</span>
                {app.release.rating}
                <span className="font-normal" style={{ color: inkDim }}>on Google Play</span>
              </span>
            ) : (
              <span style={{ color: inkLow }}>
                v{app.release.version} · {app.release.minAndroid}
              </span>
            )}
            {app.release.installs && (
              <>
                <span style={{ color: border }} aria-hidden>|</span>
                <span style={{ color: inkLow }}>{app.release.installs} installs</span>
              </>
            )}
            {app.release.size && (
              <>
                <span style={{ color: border }} aria-hidden>|</span>
                <span style={{ color: inkLow }}>{app.release.size}</span>
              </>
            )}
          </div>

          <div className="app-hero-line opacity-0 mt-8 flex flex-wrap items-center gap-3">
            {live ? (
              <a
                href={app.release.playUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link app-cta app-cta--solid mono"
                style={btnVars}
              >
                <PlayIcon />
                Get it on Google Play
              </a>
            ) : (
              /* A button to a listing that does not exist is a dead link,
                 so it is disabled rather than hopeful. */
              <span className="app-cta app-cta--solid app-cta--inert mono" style={btnVars} aria-disabled="true">
                {onlyPlay(app) && <PlayIcon />}
                {comingSoonLabel(app)}
              </span>
            )}
            <a href="#screens" className="link app-cta app-cta--ghost mono" style={btnVars}>
              See it in action
              <span className="app-cta-arrow" aria-hidden>→</span>
            </a>
          </div>

          <ul className="app-hero-line opacity-0 mono mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs" style={{ color: inkLow }}>
            {app.hero.points.map(pt => (
              <li key={pt} className="flex items-center gap-2">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                  <path d="M1.5 6.5 4.5 9.5 10.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {pt}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Product cluster ──────────────────────────────── */}
        <div className="app-hero-art" aria-hidden>
          <span className="app-hero-glow" style={{ background: app.glow }} />
          {CLUSTER.map(({ n, cls }) => (
            <div key={n} className={`app-hero-phone ${cls}`} style={{ borderColor: border }}>
              <img
                src={`/apps/${app.slug}/shot-${n}.webp`}
                alt=""
                loading="eager"
                decoding="async"
                ref={markLoaded}
                onLoad={revealOnLoad}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AppProductHero;
