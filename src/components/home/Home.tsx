import Footer from '../footer/Footer';
import Header from '../header/Header';
import Cursor from '../router/Cursor';
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

const projects: ProjectData[] = [
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
    path: "/project/buddy/"
  },
  {
    title: "ConsultmyAstro",
    color: "#EFE8D3",
    contribution: "Backend & DataBase",
    path: "/project/consultmyastro/"
  },
  {
    title: "OneDashboard",
    color: "#c2e9fb",
    contribution: "Backend & Frontend",
    path: "/project/onedashboard/"
  }
];

const Home = () => {
  const container = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP()

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
    <>
      <Header active='/' />
      <div className="min-h-screen bg-gray-100 flex justify-center items-center" ref={container}>
        <ul className="w-full max-w-screen-lg divide-y divide-white">
          {projects.map((project, index) => (
            <li
              key={index}
              onMouseEnter={() => handleMouseEnter(project.color)}
              onMouseLeave={handleMouseLeave}
              className="py-4 sm:py-6 md:py-8"
            >
              <Link to={project.path} className="block" >
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-semibold link">{project.title}</h2>
                  <p className="text-sm sm:text-base text-gray-600">{project.contribution}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
      <Cursor classes='bg-gray-600' />
    </>
  );
};

export default Home;
