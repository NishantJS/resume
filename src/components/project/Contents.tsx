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

const Contents: FC<Props> = ({ project }) => {
  const total   = project.images || 0;
  const reduced = useReducedMotion();

  // outerRef wraps the tall scroll-space div.
  // trackRef is the flex strip of images whose width we measure.
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollDist, setScrollDist] = useState(0);

  useEffect(() => {
    if (!total) return;

    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      // How far the track extends past the viewport right edge
      const dist = Math.max(track.scrollWidth - window.innerWidth, 0);
      setScrollDist(dist);
    };

    measure();

    // Re-measure once every image loads (they arrive asynchronously)
    const imgs = trackRef.current?.querySelectorAll<HTMLImageElement>("img") ?? [];
    imgs.forEach(img => {
      if (!img.complete) img.addEventListener("load", measure, { once: true });
    });

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [project.title, total]);

  /*
   * How the scroll-to-X mapping works:
   *
   *  outerRef div height = 100dvh + scrollDist
   *
   *  useScroll target=outerRef, offset ["start start", "end end"]:
   *    progress 0 → outer top  hits viewport top   (track at x = 0)
   *    progress 1 → outer bottom hits viewport bottom (track at x = -scrollDist)
   *
   *  The sticky panel inside outerRef is always visible during this range
   *  because it is position:sticky top:0 height:100dvh.
   *
   *  No position:fixed is involved, so the will-change:transform wrapper
   *  in Routes.tsx does NOT interfere.
   */
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  // Direct 1-to-1 mapping — no spring so images track the finger exactly
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [0, reduced ? 0 : -scrollDist],
  );

  if (!total) return null;

  const title  = project.displayTitle ?? project.title;
  const light  = isLight(project.color);
  const inkLow = light ? "rgba(0,0,0,0.4)"  : "rgba(255,255,255,0.4)";
  const border = light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.15)";
  const images = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div>
      {/* Label — scrolls away normally before the sticky panel kicks in */}
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

      {/*
        Tall scroll-space div.
        Its height = one viewport + travel distance, so the document gains
        exactly the right amount of extra scroll to drive the full animation.
      */}
      <div ref={outerRef} style={{ height: `calc(100dvh + ${scrollDist}px)` }}>

        {/*
          Sticky panel.
          - position:sticky top:0 keeps it in view while the page scrolls
            through the tall outer div.
          - height:100dvh fills the screen.
          - overflow:hidden clips images at the viewport edges as they slide.
          - position:sticky is NOT broken by will-change:transform on
            ancestor elements (unlike position:fixed which is).
        */}
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
          {/* Track — motion translates it left as scroll progresses */}
          <motion.div
            ref={trackRef}
            style={{
              x,
              display: "flex",
              alignItems: "center",
              gap: "clamp(1rem, 2.5vw, 2.5rem)",
              paddingLeft:  "clamp(1.5rem, 5vw, 6rem)",
              paddingRight: "clamp(1.5rem, 5vw, 6rem)",
              flexShrink: 0,
            }}
          >
            {images.map((n) => (
              <div
                key={n}
                style={{
                  flexShrink: 0,
                  borderRadius: "1rem",
                  overflow: "hidden",
                  border: `1px solid ${border}`,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                }}
              >
                <img
                  src={`/project/${project.title}/img (${n}).png`}
                  alt={`${title} screenshot ${n}`}
                  loading={n <= 3 ? "eager" : "lazy"}
                  decoding="async"
                  style={{
                    display: "block",
                    height: "clamp(260px, 46vh, 500px)",
                    width: "auto",
                    maxWidth: "none",
                  }}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contents;
