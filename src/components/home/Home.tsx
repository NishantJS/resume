import { useRef } from 'react';
import { useGSAP } from "@gsap/react"
import gsap from 'gsap';
import { Link } from 'react-router-dom';

// Define interfaces for project data and modal state
interface ProjectData {
  title: string;
  color: string;
  contribution: string;
  path: string;
}

export const projects: ProjectData[] = [
  {
    title: "Qollabb",
    color: "#eebcff",
    contribution: "Backend & Frontend",
    path: "/project/qollabb/"
  },
  {
    title: "OneSociety",
    color: "#ffcab2",
    contribution: "Monolithic to Microservices",
    path: "/project/onesociety/"
  },
  {
    title: "Buddy",
    color: "#f2ee99",
    contribution: "Design & Development",
    path: "/project/buddy/",
  },
  {
    title: "ConsultmyAstro",
    color: "#EFE8D3",
    contribution: "Backend & DataBase",
    path: "/project/consultmyastro/",
  },
  {
    title: "OneDashboard",
    color: "#c2e9fb",
    contribution: "Backend & Frontend",
    path: "/project/onedashboard/",
  }
];

const Home = () => {
  const container = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP()

  useGSAP(() => {
    const li = container.current?.querySelectorAll("li");
    if (!li) return

    const t1 = gsap.timeline({ defaults: { duration: 0.5 } });
    t1.from(li, {
      opacity: 0,
      rotateX: 90,
      stagger: 0.1,
      ease: "sine.in",
      delay: 0.5
    });
  });

  const handleMouseEnter = contextSafe((color: string) => {
    gsap.to(container.current, {
      backgroundColor: color,
      duration: 0.5,
      ease: "power4"
    });
  });

  const handleMouseLeave = contextSafe(() => {
    gsap.to(container.current, {
      backgroundColor: "white",
      duration: 0.5,
      ease: "power4"
    });
  });

  return (
    <main className="min-h-screen bg-white flex justify-center items-center" ref={container}>
      <ul className="w-full max-w-screen-lg divide-y divide-white">
        {projects.map((project, index) => (
          <li
            key={index}
            onMouseEnter={() => handleMouseEnter(project.color)}
            onMouseLeave={handleMouseLeave}
            className="py-4 sm:py-6 md:py-8"
          >
            <Link to={project.path} className="block link" state={{ bg: "bg-gray-100" }} data-image={`/project/${project.title}/logo.webp`}>
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-semibold">{project.title}</h2>
                <p className="text-sm sm:text-base text-gray-600">{project.contribution}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default Home;
