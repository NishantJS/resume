import { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { projects } from "../home/Home";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import AboutSection from "./About";
import Contents from "./Contents";

const PrevProject = ({ index = 0 }) => {
  const project = projects[index ? index - 1 : projects.length - 1];

  return <Link to={project.path}>{project.title}</Link>;
};

const NextProject = ({ index = 0 }) => {
  const project = projects[index < projects.length - 1 ? index + 1 : 0];

  return <Link to={project.path}>{project.title}</Link>;
};

const Project = () => {
  const { pathname } = useLocation();
  const project = projects.find((project) => project.path === pathname) || projects[0];
  const index = projects.indexOf(project);

  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!ref.current) return;

    const t1 = gsap.timeline({ defaults: { duration: 1, delay: 0.5, scaleY: 1, transformOrigin: "bottom" } });
    t1.fromTo(".color-sheet", { backgroundColor: project.color }, { scaleY: 0 })
    t1.fromTo(".black-sheet", { backgroundColor: "black" }, { scaleY: 0 }, "-=70%")

    t1.set(".color-sheet", { display: "none" });
    t1.set(".black-sheet", { display: "none" });

    return () => t1.kill();
  }, {
    scope: ref
  });

  if (!project) return <div>Project not found</div>;

  return (
    <main className="min-h-screen mono flex flex-col relative mix-blend-lighten" ref={ref} style={{ backgroundColor: project.color }}>
      <div className="absolute inset-0 black-sheet z-10"></div>
      <div className="absolute inset-0 color-sheet z-10"></div>

      <AboutSection project={project} />
      <Contents project={project} />

      <div className="px-5 md:px-20 py-16 pb-32 flex justify-between md:text-4xl bg-slate-800 mix-blend-difference text-white text-xl">
        <PrevProject index={index} />
        <NextProject index={index} />
      </div>
    </main>
  );
};

export default Project;
