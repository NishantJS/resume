import { CSSProperties, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { projects, getProject } from "./projects.data";
import AboutSection from "./About";
import Contents from "./Contents";
import { ProjFacts, ProjCloser } from "./ProjectChrome";
import { Inks, RailSection, SectionRail, Statement } from "../shared/DetailChrome";
import { Overview, Stats, Highlights, Flow, Challenges, Stack } from "./Details";
import { inkFor, isLight, useRevealBatch } from "../shared/reveal";
import { Grain } from "../shared/Grain";
import { useSeo } from "../../hooks/useSeo";
import { projectSeo } from "./projects.seo";

const NavProject = ({ index = 0, direction = "next" }: { index: number; direction: "prev" | "next" }) => {
  const project = direction === "prev"
    ? projects[index ? index - 1 : projects.length - 1]
    : projects[index < projects.length - 1 ? index + 1 : 0];
  const isNext = direction === "next";
  return (
    <Link
      to={project.path}
      className={`link proj-nav-card group ${isNext ? "proj-nav-card--next" : ""}`}
      style={{ ["--target"]: project.color } as CSSProperties}
    >
      <span className="mono text-[0.62rem] uppercase tracking-[0.28em] opacity-45 group-hover:opacity-80 transition-opacity">
        {isNext ? "Next project" : "Previous project"}
      </span>
      <span className="proj-nav-title">
        <span className="proj-nav-arrow" aria-hidden>{isNext ? "→" : "←"}</span>
        <span className="text-xl md:text-3xl xl:text-4xl font-semibold tracking-tight">
          {project.displayTitle ?? project.title}
        </span>
      </span>
      <span className="mono text-xs opacity-40 group-hover:opacity-70 transition-opacity">
        {project.contribution}
      </span>
    </Link>
  );
};

/** Infinite horizontal scrolling marquee of skill tags. */
const SkillsMarquee = ({ skills, ink, border }: { skills: string[]; ink: string; border: string }) => {
  const repeated = [...skills, ...skills, ...skills];
  return (
    <div className="overflow-hidden border-y py-3 md:py-4" style={{ borderColor: border }} aria-hidden>
      <div className="flex gap-8 md:gap-12 whitespace-nowrap skill-marquee" style={{ color: ink }}>
        {repeated.map((s, i) => (
          <span key={i} className="mono text-xs md:text-sm uppercase tracking-widest shrink-0 opacity-60">{s}</span>
        ))}
      </div>
    </div>
  );
};

const Project = () => {
  const { pathname } = useLocation();
  // Falls back to the first project so an unknown /work/* still renders
  // something rather than blanking.
  const project = getProject(pathname) ?? projects[0];
  const index   = projects.indexOf(project);
  const body    = useRef<HTMLDivElement>(null);

  const projTitle = project.displayTitle ?? project.title;
  useSeo(projectSeo(project));

  // Every `.dt-reveal` below the hero rises as it scrolls into view.
  useRevealBatch(body, ".dt-reveal", [project.path]);

  const { ink, inkLow, inkDim, border } = inkFor(project.color);
  const inks: Inks = {
    ink, inkLow, inkDim, border,
    accent:  project.accent  ?? ink,
    accent2: project.accent2 ?? project.accent ?? ink,
    panel:   isLight(project.color) ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.07)",
  };

  // Only bands with data get a marker, so a thin project doesn't get a
  // rail pointing at sections that aren't there. Memoised because the
  // rail rebuilds its IntersectionObserver whenever this list changes.
  const railSections: RailSection[] = useMemo(() => [
    ...(project.overview?.length   ? [{ id: "overview", label: "Overview" }] : []),
    ...(project.highlights?.length ? [{ id: "build",    label: "Build"    }] : []),
    ...(project.images             ? [{ id: "screens",  label: "Screens"  }] : []),
    ...(project.flow?.length       ? [{ id: "flow",     label: "Flow"     }] : []),
    ...(project.challenges?.length ? [{ id: "notes",    label: "Notes"    }] : []),
    { id: "stack", label: "Stack" },
  ], [project]);

  return (
    <motion.main
      className="project-gradient min-h-screen flex flex-col relative"
      style={{ ["--proj"]: project.color, color: ink } as CSSProperties}
    >
      <Grain />

      <AboutSection project={project} index={index} total={projects.length} />

      <ProjFacts project={project} inks={inks} />

      <SkillsMarquee skills={project.skills} ink={ink} border={border} />

      <div ref={body}>
        <Overview   project={project} inks={inks} />
        <Stats      project={project} inks={inks} />
        <Highlights project={project} inks={inks} />

        {project.statement && (
          <Statement
            text={project.statement}
            meta={`${projTitle} · ${project.contribution}`}
            inks={inks}
          />
        )}

        {project.images > 0 && (
          <div id="screens" className="scroll-mt-24">
            <Contents project={project} />
          </div>
        )}

        <Flow       project={project} inks={inks} />
        <Challenges project={project} inks={inks} />
        <Stack      project={project} inks={inks} />
      </div>

      <ProjCloser project={project} inks={inks} />

      {/* Prev / Next navigation */}
      <nav
        className="proj-nav grid md:grid-cols-2 border-t"
        style={{ borderColor: border, ["--nav-border"]: border } as CSSProperties}
        aria-label="Project navigation"
      >
        <NavProject index={index} direction="prev" />
        <NavProject index={index} direction="next" />
      </nav>

      <SectionRail sections={railSections} accent={inks.accent} ink={ink} />
    </motion.main>
  );
};

export default Project;
