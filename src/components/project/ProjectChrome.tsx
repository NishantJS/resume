import { FC, useRef } from "react";
import { CSSProperties } from "react";
import { ProjectData } from "./projects.data";
import { Closer, FactsBand, Inks } from "../shared/DetailChrome";
import { ArrowUpRight } from "../shared/reveal";
import { useMagnetic } from "../../hooks/useMagnetic";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/* ── Project-flavoured wrappers ────────────────────────────────────
   The bands themselves are shared with /apps; these two just know how
   to read a ProjectData. */

export const ProjFacts: FC<{ project: ProjectData; inks: Inks }> = ({ project, inks }) => {
  const m = project.meta;
  if (!m) return null;

  const facts: [string, string][] = [
    ["Role", m.role],
    ...(m.period ? [["Timeline", m.period] as [string, string]] : []),
    ["Built at", m.company],
    ...(m.client ? [["For", m.client] as [string, string]] : []),
    ...(m.status ? [["Status", m.status] as [string, string]] : []),
  ];

  return <FactsBand facts={facts} inks={inks} />;
};

export const ProjCloser: FC<{ project: ProjectData; inks: Inks }> = ({ project, inks }) => {
  const { ink, inkLow, border } = inks;
  const line = project.closer ?? (project.href ? "See it in production." : "");
  const visitRef = useRef<HTMLAnchorElement>(null);
  useMagnetic(visitRef, { reduced: useReducedMotion() });

  return (
    <Closer kicker={project.displayTitle ?? project.title} text={line} inks={inks}>
      {project.href ? (
        <a
          ref={visitRef}
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          className="link proj-visit-btn mono text-xs font-semibold tracking-widest uppercase"
          style={{ ["--btn-ink"]: ink, ["--btn-border"]: border } as CSSProperties}
        >
          Visit Project
          <span className="proj-visit-arrow" aria-hidden><ArrowUpRight /></span>
        </a>
      ) : (
        <span className="dt-kicker" style={{ color: inkLow }}>
          Internal platform — no public link
        </span>
      )}
    </Closer>
  );
};
