import { CSSProperties, FC, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import { ProjectData } from "./projects.data";
import { Accordion, DetailSection, FlowSteps, Inks, OverviewBand, StackGroups } from "../shared/DetailChrome";
import { CountUp } from "../shared/reveal";

gsap.registerPlugin(ScrollTrigger);

type Props = { project: ProjectData; inks: Inks };

/* ── Overview ──────────────────────────────────────────────────────
   The lede and the context around it, on the shared overview band. */
export const Overview: FC<Props> = ({ project, inks }) => {
  if (!project.overview?.length) return null;
  const m = project.meta;

  const facts: [string, string][] = [
    ...(m?.type ? [["Engagement", m.type] as [string, string]] : []),
    ...(m?.period ? [["Period", m.period] as [string, string]] : []),
    ...(m?.client ? [["Client", m.client] as [string, string]] : []),
    ["Contribution", project.contribution],
  ];

  return (
    <DetailSection id="overview" kicker="Overview" title="What it is, and what I did." inks={inks}>
      <OverviewBand
        paragraphs={project.overview}
        facts={facts}
        inks={inks}
        link={project.href
          ? { href: project.href, label: new URL(project.href).hostname.replace(/^www\./, "") }
          : undefined}
      />
    </DetailSection>
  );
};

/* ── At a glance ───────────────────────────────────────────────────
   Numbers count up as the band arrives; anything that isn't a number
   ("SAML", "Ledger") just renders, which is what keeps the row honest
   on projects where the interesting facts aren't quantities.        */
export const Stats: FC<Props> = ({ project, inks }) => {
  const { border, ink, inkDim, accent, panel } = inks;
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // The numerals land lit and cool to the ink while they count — the
  // same move the headings make, at a whisper. Once only: it reads as
  // the figures arriving, and arriving twice would be a glitch.
  useGSAP(() => {
    const values = ref.current?.querySelectorAll<HTMLElement>(".dt-stat-value");
    if (!values?.length || reduced) return;
    gsap.fromTo(values,
      { color: accent },
      {
        color: ink, duration: 0.9, ease: "power2.out", stagger: 0.09,
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
      });
  }, { scope: ref, dependencies: [project.path, ink, accent, reduced] });

  if (!project.stats?.length) return null;

  return (
    <div ref={ref} className="dt-band dt-band--tight">
      <dl
        className="dt-stats dt-reveal"
        style={{
          ["--dt-border"]: border,
          ["--dt-accent"]: accent,
          ["--dt-panel"]: panel,
          ["--dt-stat-cols"]: Math.min(project.stats.length, 4),
        } as CSSProperties}
      >
        {project.stats.map(s => (
          <div key={s.label} className="dt-stat">
            <dt className="sr-only">{s.label}</dt>
            <dd>
              <CountUp value={s.value} className="dt-stat-value" />
              <span className="dt-stat-label mono" style={{ color: inkDim }}>{s.label}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

/* ── What I built ──────────────────────────────────────────────────
   A numbered editorial list rather than a card grid — the same row
   rhythm as the /work index, so the detail page feels like the list
   it came from.                                                     */
export const Highlights: FC<Props> = ({ project, inks }) => {
  const { border, inkLow, inkDim, accent } = inks;
  if (!project.highlights?.length) return null;

  return (
    <DetailSection
      id="build"
      kicker="What I built"
      title="The parts worth naming."
      inks={inks}
    >
      <ol style={{ ["--dt-border"]: border, ["--dt-accent"]: accent } as CSSProperties}>
        {project.highlights.map((h, i) => (
          <li key={h.title} className="dt-feature dt-reveal">
            <span className="dt-feature-num mono" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
            <h3 className="dt-feature-title">{h.title}</h3>
            <div>
              <p className="text-[0.97rem] leading-relaxed max-w-2xl" style={{ color: inkLow }}>{h.body}</p>
              {h.tags?.length && (
                <div className="dt-feature-tags">
                  {h.tags.map(t => (
                    <span key={t} className="dt-chip mono" style={{ color: inkDim }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </DetailSection>
  );
};

/* ── How it works ──────────────────────────────────────────────────
   The request or product path, on the shared connected-steps band. */
export const Flow: FC<Props> = ({ project, inks }) => {
  if (!project.flow?.length) return null;
  return (
    <DetailSection
      id="flow"
      kicker="How it works"
      title={project.flow.length === 4 ? "End to end, in four steps." : "End to end."}
      inks={inks}
    >
      <FlowSteps steps={project.flow} inks={inks} resetKey={project.path} />
    </DetailSection>
  );
};

/* ── Engineering notes ─────────────────────────────────────────────
   Problem as the summary, the approach behind it. An accordion keeps
   the band scannable — the headline problems read as a list, and the
   reasoning is one tap away for whoever wants it. */
export const Challenges: FC<Props> = ({ project, inks }) => {
  const { inkLow, inkDim, border, accent } = inks;
  if (!project.challenges?.length) return null;

  return (
    <DetailSection id="notes" kicker="Engineering notes" title="Where it got hard." inks={inks}>
      <div style={{ ["--dt-border"]: border, ["--dt-accent"]: accent } as CSSProperties}>
        {project.challenges.map((c, i) => (
          <Accordion
            key={c.problem}
            className="dt-faq dt-reveal"
            defaultOpen={i === 0}
            inkLow={inkLow}
            summary={<span className="dt-faq-q">{c.problem}</span>}
          >
            {c.solution}
          </Accordion>
        ))}
      </div>
      <p className="dt-kicker mt-8" style={{ color: inkDim }}>
        {project.challenges.length} notes
      </p>
    </DetailSection>
  );
};

/* ── Stack ─────────────────────────────────────────────────────────
   The flat skills list regrouped by what each thing is for. */
export const Stack: FC<Props> = ({ project, inks }) => (
  <DetailSection id="stack" kicker="Stack" title="What it runs on." inks={inks}>
    <StackGroups groups={project.stack ?? [{ group: "Stack", items: project.skills }]} inks={inks} />
  </DetailSection>
);
