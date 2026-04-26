import { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { projects } from "../home/Home";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
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
  const label = direction === "prev" ? "← Prev" : "Next →";
  return (
    <Link viewTransition to={project.path} className="link group flex flex-col gap-1">
      <span className="mono text-xs uppercase tracking-widest opacity-40 group-hover:opacity-70 transition-opacity">
        {label}
      </span>
      <span className="text-lg md:text-2xl xl:text-3xl font-semibold group-hover:opacity-60 transition-opacity">
        {project.displayTitle ?? project.title}
      </span>
    </Link>
  );
};

/** Infinite horizontal scrolling marquee of skill tags */
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
  const ref     = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const light  = isLight(project.color);
  const ink    = light ? "#111111" : "#ffffff";
  const border = light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.15)";

  // Color-wipe entrance
  useGSAP(() => {
    if (!ref.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set([".color-sheet", ".black-sheet"], { display: "none" });
      return;
    }
    const tl = gsap.timeline({ defaults: { duration: 1, delay: 0.3, transformOrigin: "bottom" } });
    tl.fromTo(".color-sheet", { scaleY: 1, backgroundColor: project.color }, { scaleY: 0, ease: "power3.inOut" });
    tl.fromTo(".black-sheet", { scaleY: 1, backgroundColor: "#000" },        { scaleY: 0, ease: "power3.inOut" }, "-=65%");
    tl.set(".color-sheet", { display: "none" });
    tl.set(".black-sheet", { display: "none" });
    return () => tl.kill();
  }, { scope: ref, dependencies: [project.path] });

  return (
    <motion.main
      ref={ref}
      initial={reduced ? false : { opacity: 0 }}
      animate={reduced ? undefined : { opacity: 1, transition: { duration: 0.25 } }}
      exit={reduced ? undefined : { opacity: 0, transition: { duration: 0.25 } }}
      className="min-h-screen flex flex-col relative"
      style={{ backgroundColor: project.color, color: ink }}
    >
      {/* GSAP wipe sheets */}
      <div className="absolute inset-0 black-sheet z-10 pointer-events-none" />
      <div className="absolute inset-0 color-sheet z-10 pointer-events-none" />

      <AboutSection project={project} index={index} total={projects.length} />

      <SkillsMarquee skills={project.skills} ink={ink} border={border} />

      <Contents project={project} />

      {/* Prev / Next navigation */}
      <nav
        className="px-6 md:px-14 xl:px-20 py-14 pb-28 flex justify-between items-start border-t"
        style={{ borderColor: border }}
        aria-label="Project navigation"
      >
        <NavProject index={index} direction="prev" />
        <NavProject index={index} direction="next" />
      </nav>
    </motion.main>
  );
};

export default Project;
