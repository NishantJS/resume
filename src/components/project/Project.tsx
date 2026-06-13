import { Link, useLocation } from "react-router-dom";
import { projects } from "../home/Home";
import { motion, useReducedMotion } from "motion/react";
import AboutSection from "./About";
import Contents from "./Contents";

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
}

const NavProject = ({ index = 0, direction = "next" }: { index: number; direction: "prev" | "next" }) => {
  const project = direction === "prev"
    ? projects[index ? index - 1 : projects.length - 1]
    : projects[index < projects.length - 1 ? index + 1 : 0];
  const isNext = direction === "next";
  return (
    <Link
      viewTransition
      to={project.path}
      className={`link proj-nav-card group ${isNext ? "proj-nav-card--next" : ""}`}
      style={{ ["--target" as string]: project.color } as React.CSSProperties}
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
  const project = projects.find(p => p.path === pathname) ?? projects[0];
  const index   = projects.indexOf(project);
  const reduced = useReducedMotion();

  const light  = isLight(project.color);
  const ink    = light ? "#111111" : "#ffffff";
  const border = light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.15)";

  return (
    <motion.main
      initial={reduced ? false : { opacity: 0 }}
      animate={reduced ? undefined : { opacity: 1, transition: { duration: 0.25 } }}
      exit={reduced ? undefined : { opacity: 0, transition: { duration: 0.25 } }}
      className="project-gradient min-h-screen flex flex-col relative"
      style={{ ["--proj" as string]: project.color, color: ink } as React.CSSProperties}
    >
      {/* Film grain over the whole page for texture. */}
      <div className="proj-grain" aria-hidden />

      <AboutSection project={project} index={index} total={projects.length} />

      <SkillsMarquee skills={project.skills} ink={ink} border={border} />

      <Contents project={project} />

      {/* Prev / Next navigation */}
      <nav
        className="proj-nav grid md:grid-cols-2 border-t"
        style={{ borderColor: border, ["--nav-border" as string]: border } as React.CSSProperties}
        aria-label="Project navigation"
      >
        <NavProject index={index} direction="prev" />
        <NavProject index={index} direction="next" />
      </nav>
    </motion.main>
  );
};

export default Project;
