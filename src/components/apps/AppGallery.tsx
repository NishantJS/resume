import { CSSProperties, FC, memo, useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValueEvent, useReducedMotion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AppMeta } from "./apps.data";
import { markLoaded, revealOnLoad } from "./AppChrome";

gsap.registerPlugin(ScrollTrigger);

/** Tracks a max-width media query (re-evaluates on resize). */
function useIsMobile(bp = 768): boolean {
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(`(max-width:${bp - 1}px)`).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${bp - 1}px)`);
    const fn = () => setMobile(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [bp]);
  return mobile;
}

/** One screenshot: framed image plus its caption.

    Declared at module scope on purpose. Inside the gallery it would be
    a new component type on every render, and the rail's scroll counter
    re-renders as it advances — which remounted every <img> mid-scroll
    and made the shots blink. The caption sits under the frame rather
    than over it, so it never covers a real screenshot's primary action. */
const Shot: FC<{
  app: AppMeta;
  n: number;
  variant: "rail" | "stacked";
  inkLow: string;
  inkDim: string;
  border: string;
}> = memo(({ app, n, variant, inkLow, inkDim, border }) => (
  <figure className={`app-shot-item app-shot-item--${variant}`}>
    <div className={`proj-shot app-shot app-shot--${variant}`} style={{ border: `1px solid ${border}` }}>
      <img
        src={`/apps/${app.slug}/shot-${n}.webp`}
        alt={`${app.name} screenshot ${n} — ${app.screenCaptions[n - 1] ?? ""}`}
        loading={n <= 3 ? "eager" : "lazy"}
        decoding="async"
        ref={markLoaded}
        onLoad={revealOnLoad}
      />
    </div>
    <figcaption className="app-shot-caption mono" style={{ color: inkLow }}>
      <span style={{ color: inkDim }}>{String(n).padStart(2, "0")}</span>
      {" "}{app.screenCaptions[n - 1] ?? ""}
    </figcaption>
  </figure>
));
Shot.displayName = "Shot";

type Props = { app: AppMeta; ink: string; inkLow: string; inkDim: string; border: string };

/** Phone screenshots for an app. Same scroll-driven rail as the project
    gallery, but portrait shots so more of them fit across the viewport.
    On mobile it degrades to the same vertical stack the project pages
    use, with each shot held to a share of the viewport height. */
const AppGallery: FC<Props> = ({ app, ink, inkLow, inkDim, border }) => {
  const total = app.screens || 0;
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollDist, setScrollDist] = useState(0);
  const [current, setCurrent] = useState(1);

  useEffect(() => {
    if (!total || isMobile) return;
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const next = Math.max(track.scrollWidth - window.innerWidth, 0);
      setScrollDist(prev => {
        if (prev === next) return prev;
        // This resizes the pinned section, which moves everything below
        // it. Without a refresh, those ScrollTriggers keep the start
        // positions they measured against the shorter page.
        requestAnimationFrame(() => ScrollTrigger.refresh());
        return next;
      });
    };
    measure();
    // Images arrive asynchronously; re-measure once each one lands.
    const imgs = trackRef.current?.querySelectorAll<HTMLImageElement>("img") ?? [];
    imgs.forEach(img => {
      if (!img.complete) img.addEventListener("load", () => requestAnimationFrame(measure), { once: true });
    });
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [app.slug, total, isMobile]);

  const { scrollYProgress } = useScroll({ target: outerRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -scrollDist]);
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });

  useMotionValueEvent(scrollYProgress, "change", v => {
    if (!total) return;
    setCurrent(Math.min(total, Math.max(1, Math.round(v * (total - 1)) + 1)));
  });

  if (!total) return null;

  const shots = Array.from({ length: total }, (_, i) => i + 1);

  const Label = (
    <div className="px-6 md:px-14 xl:px-20 py-5 flex items-center gap-5" style={{ borderTop: `1px solid ${border}` }}>
      <span className="mono text-xs tracking-[0.22em] uppercase font-medium" style={{ color: inkDim }}>
        Screenshots
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: border }} />
      <span className="mono text-xs tabular-nums" style={{ color: inkDim }}>
        {String(total).padStart(2, "0")}
      </span>
    </div>
  );

  /* ── Mobile: vertical stack, each shot rises in as it scrolls in ─
     The same shape the project pages use on mobile, so a phone reader
     meets one kind of gallery across the site rather than a swipe row
     here and a stack there. Portrait phone exports are tall, so each
     shot is held to a fraction of the viewport instead of running the
     full width — five full-bleed 9:19.5 shots would be five screens of
     scrolling on their own. */
  if (isMobile) {
    return (
      <div id="screens">
        {Label}
        <div className="app-shot-stack">
          {shots.map(n => (
            <motion.div
              key={n}
              initial={reduced ? false : { opacity: 0, y: 36 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Shot app={app} n={n} variant="stacked" inkLow={inkLow} inkDim={inkDim} border={border} />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Desktop: scroll-driven horizontal rail ──────────────────── */
  return (
    <div id="screens" className="scroll-mt-0">
      {Label}
      <div ref={outerRef} style={{ height: `calc(100dvh + ${scrollDist}px)` }}>
        <div style={{ position: "sticky", top: 0, height: "100dvh", display: "flex", alignItems: "center", overflow: "hidden" }}>
          <motion.div
            ref={trackRef}
            style={{
              x,
              display: "flex",
              alignItems: "center",
              gap: "clamp(1rem, 2.5vw, 2.5rem)",
              paddingLeft: "clamp(1.5rem, 5vw, 6rem)",
              paddingRight: "clamp(1.5rem, 5vw, 6rem)",
              flexShrink: 0,
            }}
          >
            {/* Run-up: the first shot enters from off-screen rather than
                being parked at the left edge when the pin begins. */}
            <div className="app-rail-lead" aria-hidden>
              <p className="app-rail-lead-num mono">{String(total).padStart(2, "0")}</p>
              <p className="app-rail-lead-label mono">Screens</p>
            </div>
            {shots.map(n => (
              <Shot key={n} app={app} n={n} variant="rail" inkLow={inkLow} inkDim={inkDim} border={border} />
            ))}
            <div className="app-rail-tail" aria-hidden />
          </motion.div>

          {/* Rail HUD: live counter + scroll progress. */}
          <div className="proj-rail-hud" aria-hidden>
            <span className="mono text-xs tabular-nums tracking-[0.2em]" style={{ color: inkLow }}>
              <b style={{ color: ink, fontWeight: 600 }}>{String(current).padStart(2, "0")}</b>
              &nbsp;/&nbsp;{String(total).padStart(2, "0")}
            </span>
            <div className="proj-rail-bar" style={{ backgroundColor: border }}>
              <motion.div className="proj-rail-bar-fill" style={{ scaleX: progress, backgroundColor: ink } as CSSProperties} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppGallery;
