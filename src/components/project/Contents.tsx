import { FC, useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ProjectData } from "../home/Home";

type Props = { project: ProjectData };

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
}

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

const Contents: FC<Props> = ({ project }) => {
  const total = project.images || 0;
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  // outerRef wraps the tall scroll-space div.
  // trackRef is the flex strip of images whose width we measure.
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollDist, setScrollDist] = useState(0);

  useEffect(() => {
    if (!total || isMobile) return;

    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const dist = Math.max(track.scrollWidth - window.innerWidth, 0);
      setScrollDist(dist);
    };

    measure();

    // Re-measure once every image loads (they arrive asynchronously). Defer a
    // frame so the loaded image's natural aspect-ratio has been applied first.
    const imgs = trackRef.current?.querySelectorAll<HTMLImageElement>("img") ?? [];
    imgs.forEach(img => {
      if (!img.complete) img.addEventListener("load", () => requestAnimationFrame(measure), { once: true });
    });

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [project.title, total, isMobile]);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -scrollDist]);

  if (!total) return null;

  const title = project.displayTitle ?? project.title;
  const light = isLight(project.color);
  const inkLow = light ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";
  const border = light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.15)";
  const images = Array.from({ length: total }, (_, i) => i + 1);
  const src = (n: number) => `/project/${project.title}/img (${n}).png`;

  const Label = (
    <div
      className="px-6 md:px-14 xl:px-20 py-5 flex items-center gap-5"
      style={{ borderTop: `1px solid ${border}` }}
    >
      <span className="mono text-xs tracking-[0.22em] uppercase" style={{ color: inkLow }}>
        Screenshots
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: border }} />
      <span className="mono text-xs tabular-nums" style={{ color: inkLow }}>
        {String(total).padStart(2, "0")}
      </span>
    </div>
  );

  /* ── Mobile: simple vertical stack, one image per row ──────────── */
  if (isMobile) {
    return (
      <div>
        {Label}
        <div className="flex flex-col gap-4 px-5 pb-12">
          {images.map(n => (
            <figure
              key={n}
              className="proj-shot proj-shot--stacked"
              style={{ border: `1px solid ${border}` }}
            >
              <img
                src={src(n)}
                alt={`${title} screenshot ${n}`}
                loading={n <= 2 ? "eager" : "lazy"}
                decoding="async"
                onLoad={e => e.currentTarget.classList.add("is-loaded")}
              />
            </figure>
          ))}
        </div>
      </div>
    );
  }

  /* ── Desktop: scroll-driven horizontal gallery ─────────────────── */
  return (
    <div>
      {Label}
      <div ref={outerRef} style={{ height: `calc(100dvh + ${scrollDist}px)` }}>
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100dvh",
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
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
            {images.map(n => (
              <figure
                key={n}
                className="proj-shot proj-shot--rail"
                style={{ border: `1px solid ${border}` }}
              >
                <img
                  src={src(n)}
                  alt={`${title} screenshot ${n}`}
                  loading={n <= 3 ? "eager" : "lazy"}
                  decoding="async"
                  onLoad={e => e.currentTarget.classList.add("is-loaded")}
                />
              </figure>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contents;
