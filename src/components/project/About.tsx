import { FC, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProjectData } from "../home/Home";

gsap.registerPlugin(ScrollTrigger);

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
}

type Props = { project: ProjectData; index: number; total: number };

const ArrowUpRight = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
    <path d="M1 10L10 1M10 1H4M10 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AboutSection: FC<Props> = ({ project, index, total }) => {
  const ref = useRef<HTMLElement>(null);
  const light = isLight(project.color);
  const ink = light ? "#111111" : "#ffffff";
  const inkLow = light ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.55)";
  const border = light ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.18)";

  const titleWords = (project.displayTitle ?? project.title).split(" ");
  const indexLabel = String(index + 1).padStart(2, "0");

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.querySelectorAll<HTMLElement>(".tw, .meta-line, .desc-col, .proj-watermark, .proj-scroll-cue")
        .forEach(e => { e.style.opacity = "1"; });
      return;
    }

    // Chars are positioned below their mask BEFORE the hidden words are
    // unhidden, so nothing flashes on first paint (useGSAP = pre-paint).
    gsap.set(el.querySelectorAll(".tc"), { yPercent: 115, rotate: 5 });
    gsap.set(el.querySelectorAll(".tw"), { opacity: 1 });

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.to(
      el.querySelectorAll<HTMLElement>(".tc"),
      { yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.022 },
      0.1,
    )
      .fromTo(
        el.querySelector(".proj-watermark"),
        { opacity: 0, scale: 1.12, yPercent: 6 },
        { opacity: 1, scale: 1, yPercent: 0, duration: 1.1, ease: "power3.out" },
        0.15,
      )
      .fromTo(
        el.querySelectorAll(".meta-line"),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.06 },
        0.25,
      )
      .fromTo(
        el.querySelector(".desc-col"),
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        0.4,
      )
      .fromTo(
        el.querySelector(".proj-scroll-cue"),
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power2.out" },
        0.8,
      );

    // Hero drifts apart as you scroll into the gallery — title and the giant
    // index part ways at different speeds for a light depth effect.
    gsap.to(el.querySelector(".proj-watermark"), {
      yPercent: 26,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(el.querySelector(".proj-hero-title"), {
      yPercent: -8,
      ease: "none",
      scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
    });
  }, { scope: ref, dependencies: [project.path] });

  return (
    <section ref={ref} className="relative flex flex-col overflow-hidden" style={{ minHeight: "100dvh", color: ink }}>

      {/* ── Giant outlined index, parallax-drifting behind the title ── */}
      <span
        className="proj-watermark mono select-none opacity-0"
        style={{ ["--wm-ink" as string]: ink } as React.CSSProperties}
        aria-hidden
      >
        {indexLabel}
      </span>

      {/* ── Top meta strip: index · contribution ────────────────────── */}
      <div
        className="relative z-10 flex items-center justify-between px-6 md:px-14 xl:px-20 pt-24 pb-5"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <span className="meta-line mono text-xs tracking-[0.18em] uppercase opacity-0" style={{ color: inkLow }}>
          {indexLabel}&nbsp;/&nbsp;{String(total).padStart(2, "0")}
        </span>
        <span className="meta-line mono text-xs tracking-[0.18em] uppercase opacity-0 text-end" style={{ color: inkLow }}>
          {project.contribution}
        </span>
      </div>

      {/* ── Center: giant title, char-level masked reveal ───────────── */}
      <div className="relative z-10 flex-1 flex items-center px-6 md:px-14 xl:px-20 py-12">
        <h1
          className="proj-hero-title font-bold leading-[0.88] tracking-tight"
          style={{ fontSize: "clamp(3.5rem, 10vw, 10rem)" }}
        >
          {titleWords.map((word, wi) => (
            <div key={wi} className="overflow-hidden pb-[0.06em] -mb-[0.06em]">
              <span className="tw inline-block whitespace-nowrap opacity-0">
                {Array.from(word).map((ch, ci) => (
                  <span key={ci} className="tc inline-block will-change-transform">{ch}</span>
                ))}
              </span>
            </div>
          ))}
        </h1>
      </div>

      {/* ── Bottom panel: description · CTA · scroll cue ────────────── */}
      <div
        className="desc-col relative z-10 opacity-0 px-6 md:px-14 xl:px-20 pt-8 md:pt-10 pb-36 md:pb-20"
        style={{ borderTop: `1px solid ${border}` }}
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <p className="text-sm xl:text-base leading-relaxed max-w-lg xl:max-w-xl" style={{ color: inkLow }}>
            {project.description}
          </p>

          <div className="flex flex-col items-start gap-5 shrink-0">
            {project.href ? (
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link proj-visit-btn mono text-xs font-semibold tracking-widest uppercase"
                style={{ ["--btn-ink" as string]: ink, ["--btn-border" as string]: border } as React.CSSProperties}
              >
                Visit Project
                <span className="proj-visit-arrow" aria-hidden><ArrowUpRight /></span>
              </a>
            ) : !project.images ? (
              <span className="mono text-xs tracking-widest uppercase" style={{ color: inkLow }}>
                Confidential — screenshots not available
              </span>
            ) : null}
          </div>
        </div>

        {(project.images > 0) && (
          <div className="proj-scroll-cue opacity-0 mt-10 flex items-center gap-3" style={{ color: inkLow }} aria-hidden>
            <span className="proj-scroll-line" style={{ ["--cue-ink" as string]: inkLow } as React.CSSProperties} />
            <span className="mono text-[0.62rem] tracking-[0.3em] uppercase">Scroll for screenshots</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default AboutSection;
