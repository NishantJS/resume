import { FC, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ProjectData } from "../home/Home";

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
}

type Props = { project: ProjectData; index: number; total: number };

const AboutSection: FC<Props> = ({ project, index, total }) => {
  const ref    = useRef<HTMLElement>(null);
  const light  = isLight(project.color);
  const ink    = light ? "#111111" : "#ffffff";
  const inkLow = light ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.55)";
  const border = light ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.18)";

  const titleWords = (project.displayTitle ?? project.title).split(" ");

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    gsap.fromTo(
      el.querySelectorAll<HTMLElement>(".tw"),
      { y: "110%", opacity: 0 },
      { y: "0%", opacity: 1, duration: 0.9, ease: "power4.out", stagger: 0.1, delay: 1.3 }
    );
    gsap.fromTo(
      el.querySelectorAll(".meta-line"),
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.06, delay: 1.5 }
    );
    gsap.fromTo(
      el.querySelectorAll(".desc-col"),
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.75, ease: "power3.out", delay: 1.75 }
    );
  }, { scope: ref, dependencies: [project.path] });

  return (
    <section ref={ref} className="flex flex-col" style={{ minHeight: "100dvh", color: ink }}>

      {/* ── Top meta strip: index · contribution ────────────────────── */}
      <div
        className="flex items-center justify-between px-6 md:px-14 xl:px-20 pt-24 pb-5"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <span className="meta-line mono text-xs tracking-[0.18em] uppercase opacity-0" style={{ color: inkLow }}>
          {String(index + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(total).padStart(2, "0")}
        </span>
        <span className="meta-line mono text-xs tracking-[0.18em] uppercase opacity-0 text-end" style={{ color: inkLow }}>
          {project.contribution}
        </span>
      </div>

      {/* ── Center: giant title ──────────────────────────────────────── */}
      <div className="flex-1 flex items-center px-6 md:px-14 xl:px-20 py-12">
        <h1
          className="font-bold leading-[0.88] tracking-tight"
          style={{ fontSize: "clamp(3.5rem, 10vw, 10rem)" }}
        >
          {titleWords.map((word, i) => (
            <div key={i} className="overflow-hidden">
              <span className="tw inline-block opacity-0">{word}</span>
            </div>
          ))}
        </h1>
      </div>

      {/* ── Bottom panel: description · skills · CTA ─────────────────── */}
      <div
        className="desc-col opacity-0 px-6 md:px-14 xl:px-20 pt-8 md:pt-10 pb-24"
        style={{ borderTop: `1px solid ${border}` }}
      >
        {/* Description + visit link side by side on desktop */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
          <p className="text-sm xl:text-base leading-relaxed max-w-lg xl:max-w-xl" style={{ color: inkLow }}>
            {project.description}
          </p>
          <a
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
            className="link inline-flex items-center gap-2 mono text-xs font-semibold tracking-widest uppercase border-b pb-1 self-start shrink-0 transition-opacity hover:opacity-50"
            style={{ borderColor: border }}
          >
            Visit Project
            <svg width="10" height="10" viewBox="0 0 11 11" fill="none" aria-hidden>
              <path d="M1 10L10 1M10 1H4M10 1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;
