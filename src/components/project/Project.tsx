import { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { projects } from "../home/Home";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

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

    return () => t1.kill();
  }, {
    scope: ref
  });

  if (!project) return <div>Project not found</div>;

  return (
    <main className="min-h-screen mono flex flex-col relative" ref={ref} style={{ backgroundColor: project.color }}>
      <div className="absolute inset-0 black-sheet"></div>
      <div className="absolute inset-0 color-sheet"></div>

      <div className="flex-grow flex items-center justify-center min-h-svh">
        <h1 className="text-5xl md:text-7xl font-bold text-white">{"Work In Progress, Page  50%" || project.title}</h1>
      </div>

      <figure className="flex-grow flex items-center justify-center w-full flex-col">
        <img src={`/project/${project.title}/header.png`} alt={project.title} className="w-1/2" />
        <caption>{project.description}</caption>
      </figure>

      <div className="flex-grow flex items-center justify-center">
        <h2 className="text-2xl md:text-4xl font-semibold text-white">{project.contribution}</h2>
      </div>

      <div className="flex-grow flex w-full">
        <div>
          <h2>{project.contribution}</h2>
        </div>
        <div>
          <h2>{project.title}</h2>
        </div>
      </div>

      {/* pagination */}
      <div className="px-5 md:px-20 py-16 pb-32 flex justify-between md:text-4xl bg-slate-800 mix-blend-difference text-white text-xl">
        <PrevProject index={index} />
        <NextProject index={index} />
      </div>
    </main>
  );
};

export default Project;
