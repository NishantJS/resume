import { CSSProperties, FC, useRef } from "react";
import { AppMeta } from "./apps.data";
import { ArrowUpRight, MaskedTitle, inkFor, useHeroEntrance } from "./AppChrome";

type Props = {
  app: AppMeta;
  index: number;
  total: number;
  /** Overview shows the headline; sub-pages show their own title. */
  title: string;
  /** Right-hand text in the top meta strip. */
  meta: string;
  lead: string;
  /** Full-viewport on the overview, shorter on sub-pages. */
  compact?: boolean;
  /** Play Store CTA — overview only. */
  cta?: boolean;
  children?: React.ReactNode;
};

/** The app page hero. Same anatomy as project/About.tsx: giant outlined
    index behind a char-masked title, a meta strip above and a description
    panel below, all tinted by the app's pastel. */
const AppHero: FC<Props> = ({ app, index, total, title, meta, lead, compact, cta, children }) => {
  const ref = useRef<HTMLElement>(null);
  const { ink, inkLow, border } = inkFor(app.color);
  const indexLabel = String(index + 1).padStart(2, "0");

  useHeroEntrance(ref, [app.slug, title]);

  return (
    <section
      ref={ref}
      className="relative flex flex-col overflow-hidden"
      style={{ minHeight: compact ? undefined : "100dvh", color: ink }}
    >
      {/* Giant outlined index, parallax-drifting behind the title. */}
      <span
        className="proj-watermark mono select-none opacity-0"
        style={{ ["--wm-ink"]: ink } as CSSProperties}
        aria-hidden
      >
        {indexLabel}
      </span>

      {/* Top meta strip: index / total · role. */}
      <div
        className="relative z-10 flex items-center justify-between gap-4 px-6 md:px-14 xl:px-20 pt-24 pb-5"
        style={{ borderBottom: `1px solid ${border}` }}
      >
        <span className="meta-line mono text-xs tracking-[0.18em] uppercase opacity-0" style={{ color: inkLow }}>
          {indexLabel}&nbsp;/&nbsp;{String(total).padStart(2, "0")}
        </span>
        <span className="meta-line mono text-xs tracking-[0.18em] uppercase opacity-0 text-end" style={{ color: inkLow }}>
          {meta}
        </span>
      </div>

      {/* Title. */}
      <div className={`relative z-10 flex-1 flex items-center px-6 md:px-14 xl:px-20 ${compact ? "py-10 md:py-14" : "py-12"}`}>
        <MaskedTitle
          text={title}
          className="proj-hero-title font-bold leading-[0.88] tracking-tight"
          style={{ fontSize: compact ? "clamp(2.5rem, 7vw, 6rem)" : "clamp(3.5rem, 10vw, 10rem)" }}
        />
      </div>

      {/* Lead paragraph, CTA and scroll cue. */}
      <div
        className={`desc-col relative z-10 opacity-0 px-6 md:px-14 xl:px-20 pt-8 md:pt-10 ${compact ? "pb-8" : "pb-36 md:pb-20"}`}
        style={{ borderTop: `1px solid ${border}` }}
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <p className="text-base xl:text-lg leading-relaxed max-w-lg xl:max-w-xl" style={{ color: inkLow }}>
            {lead}
          </p>

          {cta && app.release.playUrl && (
            <div className="flex flex-col items-start gap-4 shrink-0">
              <a
                href={app.release.playUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link proj-visit-btn mono text-xs font-semibold tracking-widest uppercase"
                style={{ ["--btn-ink"]: ink, ["--btn-border"]: border, ["--proj"]: app.color } as CSSProperties}
              >
                Get it on Google Play
                <span className="proj-visit-arrow" aria-hidden><ArrowUpRight /></span>
              </a>
              <span className="mono text-[0.65rem] tracking-[0.2em] uppercase" style={{ color: inkLow }}>
                v{app.release.version} · {app.release.minAndroid}
              </span>
            </div>
          )}
        </div>

        {children}

        {!compact && (
          <div className="proj-scroll-cue opacity-0 mt-10 flex items-center gap-3" style={{ color: inkLow }} aria-hidden>
            <span className="proj-scroll-line" />
            <span className="mono text-[0.62rem] tracking-[0.3em] uppercase">Scroll to explore</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default AppHero;
